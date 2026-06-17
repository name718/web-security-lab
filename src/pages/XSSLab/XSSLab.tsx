import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  ShieldCheck,
  Zap,
  Play,
  Settings,
  Database,
  Globe,
  Ghost,
  Cookie,
  AlertCircle,
  RefreshCcw,
  Code2,
  Search,
  Hash,
} from "lucide-react";

type XSSMode = "none" | "blacklist" | "escape";
type XSSScenario = "reflected" | "stored" | "dom";
type XSSContext = "body" | "attribute" | "script" | "url";
type CSPLevel = "none" | "default-src 'self'" | "nonce-based";

// --- XSS 注入器：强制执行脚本 ---
const XSSInjector: React.FC<{
  payload: string;
  defenseMode: XSSMode;
  className?: string;
}> = ({ payload, defenseMode, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 清理容器
    containerRef.current.innerHTML = "";

    if (defenseMode === "escape") {
      // 转义模式：直接作为文本渲染，不执行
      containerRef.current.textContent = payload;
      return;
    }

    let processed = payload;
    if (defenseMode === "blacklist") {
      // 模拟 WAF 黑名单：过滤 script 标签（但不完整，可绕过）
      processed = payload.replace(
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        "[BLOCKED_BY_WAF]",
      );
    }

    try {
      // 使用 createContextualFragment 确保 <script> 标签在注入后能被浏览器解析并执行
      const fragment = document
        .createRange()
        .createContextualFragment(processed);
      containerRef.current.appendChild(fragment);
    } catch (e) {
      console.error("Injection failed:", e);
      containerRef.current.textContent = processed;
    }
  }, [payload, defenseMode]);

  return <div ref={containerRef} className={className} />;
};

const XSSLab: React.FC = () => {
  const [scenario, setScenario] = useState<XSSScenario>("reflected");
  const [defenseMode, setDefenseMode] = useState<XSSMode>("none");
  const [context, setContext] = useState<XSSContext>("body");
  const [csp, setCsp] = useState<CSPLevel>("none");
  const [inputValue, setInputValue] = useState("");
  const [activePayload, setActivePayload] = useState("");

  // Specific for DOM XSS
  const [urlHash, setUrlHash] = useState("#welcome");

  const [isAttacking, setIsAttacking] = useState(false);
  const [attackResult, setAttackResult] = useState<
    "success" | "blocked" | "bypassed" | "csp_blocked" | null
  >(null);
  const [logs, setLogs] = useState<string[]>(["[SYSTEM] 漏洞分析沙箱已启动。"]);

  const addLog = (msg: string) => setLogs((prev) => [...prev.slice(-4), msg]);

  const handleAttack = () => {
    const payload = scenario === "dom" ? urlHash.replace("#", "") : inputValue;
    if (!payload) return;

    setIsAttacking(true);
    setAttackResult(null);
    setActivePayload(""); // 先清空，确保触发重新注入
    addLog(`[ATTACK] 注入 Payload 到 [${context.toUpperCase()}] 上下文...`);

    // --- CSP Simulation ---
    if (csp !== "none") {
      // 简化模拟 CSP 拦截
      const isInlineBlocked =
        csp === "default-src 'self'" &&
        (payload.includes("<script") || /on\w+\s*=/i.test(payload));
      if (isInlineBlocked) {
        setTimeout(() => {
          setIsAttacking(false);
          setAttackResult("csp_blocked");
          addLog(
            `[CSP] 策略拦截: 检测到内联脚本或事件处理器，已被浏览器拒收。`,
          );
        }, 800);
        return;
      }
    }

    // --- Alert Hijacking ---
    const originalAlert = window.alert;
    window.alert = (msg: any) => {
      console.log("[LAB INTERCEPT] Alert called:", msg);
      addLog(`[EXPLOIT] 检测到脚本执行！捕获 Alert: "${msg}"`);
      if (defenseMode === "none") setAttackResult("success");
      if (defenseMode === "blacklist") setAttackResult("bypassed");
    };

    setTimeout(() => {
      setIsAttacking(false);
      setActivePayload(payload);

      // --- Heuristic Exploit Detection ---
      const isSensitiveAccess =
        /document\.cookie|localStorage|sessionStorage|fetch|location|XMLHttpRequest/i.test(
          payload,
        );
      const containsExploit =
        /<[a-z][\s\S]*>/i.test(payload) ||
        /on\w+\s*=/i.test(payload) ||
        /javascript:/i.test(payload) ||
        payload.includes("';");

      if (defenseMode === "none") {
        if (containsExploit) {
          addLog("[VULN] 数据已按原样渲染到对应上下文，Payload 触发。");
          if (isSensitiveAccess) {
            setAttackResult("success");
            addLog("[EXPLOIT] 攻击成功！已获取当前域下的敏感控制权。");
          }
        } else {
          setAttackResult("blocked");
          addLog("[INFO] 输入未触发明显的解析异常。");
        }
      } else if (defenseMode === "blacklist") {
        const isScriptTag = /<script/i.test(payload);
        const isBypass =
          /on\w+\s*=/i.test(payload) || /javascript:/i.test(payload);

        if (isScriptTag) addLog("[FILTER] 检测到 <script>，已被 WAF 移除。");
        if (isBypass) {
          addLog("[CRITICAL] WAF 绕过成功！使用非标准标签/事件逃逸。");
          setAttackResult("bypassed");
        } else if (!isScriptTag) {
          setAttackResult("blocked");
          addLog("[SAFE] 攻击被黑名单阻断。");
        }
      } else if (defenseMode === "escape") {
        setAttackResult("blocked");
        addLog("[SAFE] 针对当前上下文进行了严格转义。");
      }

      setTimeout(() => {
        window.alert = originalAlert;
      }, 5000);
    }, 1200);
  };

  const handleScenarioChange = (s: XSSScenario) => {
    setScenario(s);
    setInputValue("");
    setActivePayload("");
    setAttackResult(null);
    setLogs([`[SYSTEM] 场景重置: ${s.toUpperCase()}`]);
  };

  const handleDefenseChange = (m: XSSMode) => {
    setDefenseMode(m);
    setInputValue("");
    setActivePayload("");
    setAttackResult(null);
    setLogs(["[SYSTEM] 切换防御策略，环境已重置。"]);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 transition-colors duration-300">
      {/* 头部信息 */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-mozi-border pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-mozi-danger text-glow">
            <Zap className="w-6 h-6" />
            <span className="font-mono text-sm tracking-widest uppercase">
              LAB_01 / Professional_XSS_Sandbox
            </span>
          </div>
          <h1 className="text-5xl font-black tracking-tight text-mozi-text">
            XSS 深度剖析实验室{" "}
            <span className="text-mozi-accent italic text-2xl">PRO</span>
          </h1>
          <p className="text-mozi-text-muted max-w-3xl">
            跨站脚本攻击深度演练。支持**多上下文注入**、**CSP 策略模拟**、**WAF
            绕过**及**实战利用载荷**。
          </p>
        </div>

        <div className="flex bg-mozi-dark p-1 rounded-2xl border border-mozi-border shadow-inner">
          {(["reflected", "stored", "dom"] as const).map((s) => (
            <button
              key={s}
              onClick={() => handleScenarioChange(s)}
              className={`px-6 py-3 rounded-xl text-xs font-bold transition-all ${
                scenario === s
                  ? "bg-mozi-danger text-white shadow-lg"
                  : "text-mozi-text-muted hover:text-mozi-text"
              }`}
            >
              {s === "reflected" && "反射型"}
              {s === "stored" && "存储型"}
              {s === "dom" && "DOM 型"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
        {/* 左侧控制台 */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-mozi-dark border border-mozi-border rounded-[2.5rem] p-8 space-y-6 shadow-xl">
            {/* 注入点上下文 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-mozi-text-muted uppercase tracking-tighter">
                <Globe className="w-4 h-4" /> 注入点上下文 (Context)
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(["body", "attribute", "script", "url"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setContext(c)}
                    className={`px-3 py-2 rounded-lg border text-[10px] font-mono transition-all ${
                      context === c
                        ? "bg-mozi-accent/10 border-mozi-accent text-mozi-accent"
                        : "bg-mozi-black/40 border-mozi-border text-mozi-text-muted hover:border-mozi-text"
                    }`}
                  >
                    {c.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* CSP 设置 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-mozi-text-muted uppercase tracking-tighter">
                <ShieldCheck className="w-4 h-4" /> CSP 策略配置 (Simulator)
              </div>
              <div className="flex flex-col gap-2">
                {(["none", "default-src 'self'", "nonce-based"] as const).map(
                  (level) => (
                    <button
                      key={level}
                      onClick={() => setCsp(level)}
                      className={`px-4 py-2 rounded-xl border text-left text-[10px] font-mono transition-all ${
                        csp === level
                          ? "bg-mozi-safe/10 border-mozi-safe text-mozi-safe"
                          : "bg-mozi-black/40 border-mozi-border text-mozi-text-muted hover:border-mozi-text"
                      }`}
                    >
                      {level === "none" ? "OFF (无限制)" : level}
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* WAF 防御 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-mozi-text-muted uppercase tracking-tighter">
                <Settings className="w-4 h-4" /> WAF 防御策略
              </div>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: "none", label: "None", color: "text-mozi-danger" },
                  {
                    id: "blacklist",
                    label: "Blacklist",
                    color: "text-amber-500",
                  },
                  { id: "escape", label: "Encoding", color: "text-mozi-safe" },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setDefenseMode(mode.id as XSSMode)}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                      defenseMode === mode.id
                        ? `bg-mozi-black border-mozi-accent`
                        : "border-mozi-border/50 bg-mozi-black/20 opacity-60"
                    }`}
                  >
                    <span
                      className={`text-xs font-bold font-mono ${defenseMode === mode.id ? mode.color : ""}`}
                    >
                      {mode.label}
                    </span>
                    {defenseMode === mode.id && (
                      <div className="w-1.5 h-1.5 rounded-full bg-mozi-accent animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Payload 输入 */}
            <div className="space-y-3 pt-4 border-t border-mozi-border/30">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono text-mozi-text-muted uppercase">
                  Attack Payload
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (context === "attribute")
                        setInputValue('"><script>alert(1)</script>');
                      else if (context === "script")
                        setInputValue("'; alert(1); //");
                      else if (context === "url")
                        setInputValue("javascript:alert(1)");
                      else setInputValue("<script>alert(1)</script>");
                    }}
                    className="text-[9px] text-mozi-accent underline"
                  >
                    智能填充
                  </button>
                </div>
              </div>

              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="在此输入攻击载荷..."
                className="w-full h-32 bg-mozi-black border border-mozi-border rounded-2xl p-4 font-mono text-sm focus:outline-none focus:border-mozi-accent transition-colors text-mozi-text resize-none"
              />

              <button
                onClick={handleAttack}
                disabled={isAttacking || !inputValue}
                className="w-full py-4 rounded-2xl bg-mozi-danger text-white font-black uppercase tracking-widest shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
              >
                {isAttacking ? (
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                EXECUTE ATTACK
              </button>
            </div>
          </div>

          {/* 实时分析日志 */}
          <div className="bg-mozi-black border border-mozi-border rounded-3xl p-6 shadow-xl h-[240px] flex flex-col">
            <div className="flex items-center gap-3 border-b border-mozi-border pb-3 mb-3">
              <Terminal className="w-4 h-4 text-mozi-safe" />
              <h3 className="font-bold uppercase text-[10px] tracking-widest text-mozi-text-muted">
                Analysis Console
              </h3>
            </div>
            <div className="flex-grow overflow-y-auto font-mono text-[10px] space-y-2">
              {logs.map((log, i) => (
                <div
                  key={i}
                  className={
                    log.includes("[CRITICAL]") || log.includes("[EXPLOIT]")
                      ? "text-mozi-danger"
                      : log.includes("[CSP]")
                        ? "text-mozi-accent"
                        : log.includes("[SAFE]")
                          ? "text-mozi-safe"
                          : "text-mozi-text-muted"
                  }
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧主舞台：浏览器模拟 + 源码分析 */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex-1 bg-mozi-black border border-mozi-border rounded-[3rem] overflow-hidden flex flex-col shadow-2xl relative min-h-[500px]">
            <div className="bg-mozi-dark border-b border-mozi-border px-6 py-3 flex items-center justify-between">
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
              </div>
              <div className="flex-grow max-xl mx-4 bg-mozi-black rounded-full px-4 py-1.5 border border-mozi-border flex items-center gap-3 font-mono text-[10px]">
                <Globe className="w-3 h-3 text-mozi-text-muted" />
                <span className="text-mozi-text-muted truncate">
                  https://vulnerable-app.com/{scenario}?ctx={context}&csp=
                  {csp.split(" ")[0]}
                </span>
              </div>
              <div className="flex gap-2">
                {csp !== "none" && (
                  <div className="bg-mozi-safe/20 text-mozi-safe border border-mozi-safe/30 px-2 py-0.5 rounded text-[8px] font-bold">
                    CSP ACTIVE
                  </div>
                )}
              </div>
            </div>

            <div className="flex-grow p-12 relative bg-white dark:bg-[#0d1117] transition-colors overflow-auto">
              {/* Browser Environment Metadata */}
              <div className="absolute top-4 right-4 z-20 space-y-2 pointer-events-none">
                <div className="bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-[10px] font-mono shadow-sm">
                  <div className="flex items-center gap-2 mb-2 border-b border-slate-200 dark:border-slate-700 pb-1">
                    <Database className="w-3 h-3 text-mozi-accent" />
                    <span className="font-bold">DOM / Storage</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-blue-500">
                      Cookie: session=moz_pro_99
                    </div>
                    <div className="text-mozi-text-muted">
                      Origin: https://vulnerable-app.com
                    </div>
                    <div className="text-mozi-text-muted">
                      UA: MoziSandbox/1.0
                    </div>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {(attackResult === "success" ||
                  attackResult === "bypassed") && (
                  <CookieStealAnimation
                    onComplete={() => setAttackResult(null)}
                  />
                )}
                {attackResult === "csp_blocked" && (
                  <CSPBlockAnimation onComplete={() => setAttackResult(null)} />
                )}
              </AnimatePresence>

              <div className="text-[#0f172a] dark:text-[#e6edf3] h-full relative z-10 flex flex-col justify-center items-center">
                <ScenarioRenderer
                  scenario={scenario}
                  context={context}
                  activePayload={activePayload}
                  isAttacking={isAttacking}
                  defenseMode={defenseMode}
                />
              </div>
            </div>
          </div>

          {/* 源码白盒分析 */}
          <div className="bg-[#1e1e1e] border border-mozi-border rounded-[2.5rem] p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <Code2 className="w-5 h-5 text-mozi-accent" />
              <h3 className="font-bold text-sm text-[#d4d4d4]">
                白盒审计 (Source Code Audit)
              </h3>
              <div className="ml-auto flex gap-2">
                <span className="text-[9px] px-2 py-0.5 bg-mozi-danger/20 text-mozi-danger rounded border border-mozi-danger/30 font-mono uppercase font-bold">
                  SINK: {context}
                </span>
              </div>
            </div>
            <div className="bg-[#1e1e1e] rounded-xl overflow-x-auto font-mono text-[11px] leading-relaxed text-[#d4d4d4]">
              <VulnerableCodeViewerPro
                scenario={scenario}
                context={context}
                defenseMode={defenseMode}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 新增：场景渲染器 (支持多上下文) ---
const ScenarioRenderer = ({
  scenario,
  context,
  activePayload,
  isAttacking,
  defenseMode,
}: {
  scenario: XSSScenario;
  context: XSSContext;
  activePayload: string;
  isAttacking: boolean;
  defenseMode: XSSMode;
}) => {
  if (isAttacking) {
    return (
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <div className="w-10 h-10 border-2 border-mozi-accent border-t-transparent rounded-full animate-spin" />
        <span className="font-mono text-[10px] text-mozi-accent uppercase tracking-widest">
          Processing Request...
        </span>
      </div>
    );
  }

  // 渲染逻辑分支：根据 context 改变显示方式
  if (context === "body") {
    return (
      <div className="text-center space-y-6 w-full max-w-lg">
        <div className="p-8 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-inner">
          <h4 className="text-xs font-bold text-slate-400 mb-4 uppercase">
            Server Response
          </h4>
          <div className="text-2xl font-medium">
            搜索结果:{" "}
            <XSSInjector
              payload={activePayload}
              defenseMode={defenseMode}
              className="inline text-mozi-danger"
            />
          </div>
        </div>
      </div>
    );
  }

  if (context === "attribute") {
    return (
      <div className="text-center space-y-6 w-full max-w-lg">
        <div className="p-8 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-inner">
          <h4 className="text-xs font-bold text-slate-400 mb-4 uppercase">
            Profile Avatar (Injected in Title)
          </h4>
          <div className="flex justify-center">
            {/* 模拟注入到 title 属性 */}
            <div
              className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg cursor-help group relative"
              title={activePayload}
            >
              M
              {/* 真实的 XSS 注入点：我们在这里放置一个隐藏的注入器，因为 title 属性本身不执行脚本 */}
              <XSSInjector
                payload={activePayload}
                defenseMode={defenseMode}
                className="hidden"
              />
              <div className="absolute top-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] p-2 rounded whitespace-nowrap z-50 pointer-events-none">
                HTML: &lt;div title="{activePayload}"&gt;
              </div>
            </div>
          </div>
          <p className="mt-6 text-sm text-slate-500">
            将鼠标悬停在头像上查看 Title 属性注入效果
          </p>
        </div>
      </div>
    );
  }

  if (context === "script") {
    return (
      <div className="text-center space-y-6 w-full max-w-lg">
        <div className="p-8 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-inner">
          <h4 className="text-xs font-bold text-slate-400 mb-4 uppercase">
            Analytics Initialization
          </h4>
          <div className="font-mono text-[11px] text-left bg-black text-green-400 p-4 rounded-xl border border-green-900/30">
            <span className="text-slate-500 italic">
              // Data injected into JS variable
            </span>
            <br />
            var config = &#123;
            <br />
            &nbsp;&nbsp;username:{" "}
            <span className="text-amber-300">'{activePayload}'</span>
            <br />
            &#125;;
            <br />
            initAnalytics(config);
          </div>
          {/* 模拟 JS 注入执行 */}
          <XSSInjector
            payload={`<script>try{ var x = '${activePayload}'; }catch(e){}</script>`}
            defenseMode={defenseMode}
            className="hidden"
          />
          <p className="mt-6 text-sm text-slate-500">
            输入 Payload 尝试破坏 JS 结构并执行代码
          </p>
        </div>
      </div>
    );
  }

  if (context === "url") {
    return (
      <div className="text-center space-y-6 w-full max-w-lg">
        <div className="p-8 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-inner">
          <h4 className="text-xs font-bold text-slate-400 mb-4 uppercase">
            Redirect Button
          </h4>
          <a
            href={activePayload || "#"}
            onClick={(e) => {
              if (activePayload.startsWith("javascript:")) {
                // 模拟浏览器点击 javascript: 协议
                try {
                  eval(activePayload.replace("javascript:", ""));
                } catch (err) {}
              }
            }}
            className="inline-flex items-center gap-2 bg-mozi-accent text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:brightness-110"
          >
            返回主页 (Go Home)
          </a>
          <div className="mt-6 font-mono text-[10px] text-slate-500 break-all">
            Link: &lt;a href="{activePayload}"&gt;
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// --- CSP 拦截动画 ---
const CSPBlockAnimation = ({ onComplete }: { onComplete: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 z-50 flex items-center justify-center bg-mozi-accent/10 backdrop-blur-sm pointer-events-none"
  >
    <motion.div
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      className="bg-mozi-black border-2 border-mozi-accent p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center"
    >
      <ShieldCheck className="w-16 h-16 text-mozi-accent mb-4 animate-bounce" />
      <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
        CSP 拦截成功
      </h3>
      <p className="text-mozi-accent font-mono text-xs mt-2">
        Content Security Policy: Violated
      </p>
      <div className="mt-6 text-[10px] text-slate-500 font-mono bg-mozi-black/50 p-4 rounded-xl border border-mozi-border">
        Refused to execute inline script because it violates
        <br />
        the following Content Security Policy directive:
        <br />
        <span className="text-mozi-safe">"script-src 'self'"</span>
      </div>
    </motion.div>
    <motion.div
      animate={{ opacity: 0 }}
      transition={{ duration: 0 }}
      onAnimationComplete={() => setTimeout(onComplete, 3000)}
    />
  </motion.div>
);

// --- 专业版源码查看器 ---
const VulnerableCodeViewerPro = ({
  scenario,
  context,
  defenseMode,
}: {
  scenario: XSSScenario;
  context: XSSContext;
  defenseMode: XSSMode;
}) => {
  const Comment = ({ children }: { children: React.ReactNode }) => (
    <span className="text-[#6A9955]">{children}</span>
  );
  const Keyword = ({ children }: { children: React.ReactNode }) => (
    <span className="text-[#569cd6]">{children}</span>
  );
  const Func = ({ children }: { children: React.ReactNode }) => (
    <span className="text-[#DCDCAA]">{children}</span>
  );
  const Str = ({ children }: { children: React.ReactNode }) => (
    <span className="text-[#ce9178]">{children}</span>
  );
  const Tag = ({ children }: { children: React.ReactNode }) => (
    <span className="text-[#569cd6]">{children}</span>
  );
  const Danger = ({ children }: { children: React.ReactNode }) => (
    <span className="text-red-400 bg-red-400/10 px-1 rounded">{children}</span>
  );
  const Safe = ({ children }: { children: React.ReactNode }) => (
    <span className="text-green-400 bg-green-400/10 px-1 rounded">
      {children}
    </span>
  );

  if (context === "body") {
    return (
      <div>
        <Comment>// HTML 上下文注入 (最常见)</Comment>
        <br />
        <Tag>&lt;div&gt;</Tag>
        <br />
        &nbsp;&nbsp;搜索结果:
        {defenseMode === "none" ? (
          <Danger>{"${userInput}"}</Danger>
        ) : defenseMode === "escape" ? (
          <Safe>{"escapeHtml(userInput)"}</Safe>
        ) : (
          <Danger>{"filter(userInput)"}</Danger>
        )}
        <br />
        <Tag>&lt;/div&gt;</Tag>
      </div>
    );
  }
  if (context === "attribute") {
    return (
      <div>
        <Comment>// 属性上下文注入 (需要闭合引号)</Comment>
        <br />
        <Tag>&lt;div</Tag> class=<Str>"avatar"</Str> title=
        {defenseMode === "none" ? (
          <Danger>{'"${userInput}"'}</Danger>
        ) : defenseMode === "escape" ? (
          <Safe>{'"${encodeAttr(userInput)}"'}</Safe>
        ) : (
          <Danger>{'"${userInput}"'}</Danger>
        )}
        <Tag>&gt;</Tag>
        <Tag>&lt;/div&gt;</Tag>
      </div>
    );
  }
  if (context === "script") {
    return (
      <div>
        <Comment>// JS 上下文注入 (需要闭合代码块)</Comment>
        <br />
        <Tag>&lt;script&gt;</Tag>
        <br />
        &nbsp;&nbsp;<Keyword>var</Keyword> config = &#123; name:
        {defenseMode === "none" ? (
          <Danger>{"'${userInput}'"}</Danger>
        ) : defenseMode === "escape" ? (
          <Safe>{"'${encodeJS(userInput)}'"}</Safe>
        ) : (
          <Danger>{"'${userInput}'"}</Danger>
        )}
        &#125;;
        <br />
        <Tag>&lt;/script&gt;</Tag>
      </div>
    );
  }
  if (context === "url") {
    return (
      <div>
        <Comment>// URL 上下文注入 (利用 javascript: 协议)</Comment>
        <br />
        <Tag>&lt;a</Tag> href=
        {defenseMode === "none" ? (
          <Danger>{'"${userInput}"'}</Danger>
        ) : defenseMode === "escape" ? (
          <Safe>{'"${validateURL(userInput)}"'}</Safe>
        ) : (
          <Danger>{'"${userInput}"'}</Danger>
        )}
        <Tag>&gt;</Tag>Home<Tag>&lt;/a&gt;</Tag>
      </div>
    );
  }
  return null;
};

// --- 弹窗动画组件 (Cookie 窃取) ---
const CookieStealAnimation = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none overflow-hidden">
      {/* 全屏震动红色警示 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-red-600/50 backdrop-blur-[2px]"
      />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 1.1, opacity: 0 }}
        className="relative z-10 p-8 bg-mozi-black border-2 border-mozi-danger rounded-[2rem] shadow-[0_0_100px_rgba(239,68,68,0.5)] flex flex-col items-center"
      >
        <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <AlertCircle className="w-12 h-12 text-mozi-danger" />
        </div>
        <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-widest">
          恶意代码执行
        </h2>
        <p className="text-red-400 font-mono text-sm">
          浏览器沙箱已被攻破 (Script Execution Detected)
        </p>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1, delay: 0.5 }}
          className="h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent my-6"
        />

        <div className="flex items-center gap-4 text-amber-500 bg-amber-500/10 px-6 py-3 rounded-xl border border-amber-500/30">
          <Cookie className="w-6 h-6 animate-spin-slow" />
          <span className="font-mono text-xs font-bold">
            document.cookie.session_id - 数据已泄露
          </span>
        </div>
      </motion.div>

      <motion.div
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 0.1, repeat: 10 }}
        className="absolute inset-0 border-[8px] border-mozi-danger/30"
      />

      {/* 自动消失 */}
      <motion.div
        animate={{ opacity: 0 }}
        transition={{ duration: 0 }}
        onAnimationComplete={() => setTimeout(onComplete, 2500)}
      />
    </div>
  );
};

export default XSSLab;
