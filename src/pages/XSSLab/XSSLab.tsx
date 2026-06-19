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
  Cookie,
  AlertCircle,
  RefreshCcw,
  Code2,
  CheckCircle2,
} from "lucide-react";

type XSSMode = "none" | "blacklist" | "escape";
type XSSScenario = "reflected" | "stored" | "dom";
type XSSContext = "body" | "attribute" | "script" | "url";
type CSPLevel = "none" | "default-src 'self'" | "nonce-based";

const CodeComment = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[#6A9955]">{children}</span>
);

const CodeKeyword = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[#569cd6]">{children}</span>
);

const CodeString = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[#ce9178]">{children}</span>
);

const CodeTag = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[#569cd6]">{children}</span>
);

const CodeDanger = ({ children }: { children: React.ReactNode }) => (
  <span className="text-red-400 bg-red-400/10 px-1 rounded">{children}</span>
);

const CodeSafe = ({ children }: { children: React.ReactNode }) => (
  <span className="text-green-400 bg-green-400/10 px-1 rounded">
    {children}
  </span>
);

const contextHints: Record<XSSContext, string> = {
  body: "HTML 正文上下文，风险来自把用户输入当作标签解析。",
  attribute: "属性上下文，关键风险是闭合引号后插入事件处理器。",
  script: "脚本上下文，攻击者会尝试逃逸字符串或代码块。",
  url: "URL 上下文，重点关注 javascript:、data: 等危险协议。",
};

const defenseHints: Record<XSSMode, string> = {
  none: "无防护：输入会进入危险 sink，适合观察漏洞原始形态。",
  blacklist: "黑名单：只能拦截部分特征，容易被事件属性或协议绕过。",
  escape: "上下文编码：根据 HTML/属性/JS/URL 场景做差异化处理。",
};

const xssTeachingCards = [
  {
    title: "漏洞成立条件",
    items: [
      "不可信输入进入 HTML、属性、脚本或 URL 等可执行上下文",
      "浏览器把输入当作代码或标签解析，而不是普通文本",
      "攻击者能借此读取 Cookie、发起请求或改写页面行为",
    ],
  },
  {
    title: "常见误区",
    items: [
      "只过滤 <script> 标签并不能防住事件属性、SVG、URL 协议等绕过",
      "CSP 是纵深防御，不应替代输出编码和安全 DOM API",
      "不同上下文必须使用不同编码，不能一套 escape 走天下",
    ],
  },
];

const xssReviewQuestions = [
  "当前 payload 进入了哪个 sink？是 HTML、属性、JS 还是 URL？",
  "如果把防御从 Blacklist 切到 Encoding，攻击结果为什么变化？",
  "这类漏洞在真实项目里应该在输入、存储、输出哪个阶段处理？",
];

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
    window.alert = (msg?: unknown) => {
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
    <div className="max-w-[1600px] mx-auto space-y-4 transition-colors duration-300">
      {/* 头部信息 */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-mozi-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3 text-mozi-danger text-glow">
            <Zap className="w-5 h-5" />
            <span className="font-mono text-xs tracking-widest uppercase">
              LAB_01 / Professional_XSS_Sandbox
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-mozi-text">
            XSS 深度剖析实验室{" "}
            <span className="text-mozi-accent italic text-xl">PRO</span>
          </h1>
          <p className="text-sm text-mozi-text-muted max-w-3xl">
            跨站脚本攻击深度演练。支持**多上下文注入**、**CSP 策略模拟**、**WAF
            绕过**及**实战利用载荷**。
          </p>
          <div className="grid gap-2 pt-2 text-[10px] md:grid-cols-3">
            {["选择场景和注入上下文", "执行 payload 观察浏览器行为", "切换防御并复盘源码"].map(
              (step, index) => (
                <div
                  key={step}
                  className="flex items-center gap-2 rounded-xl border border-mozi-border bg-mozi-dark px-3 py-2"
                >
                  <CheckCircle2 className="h-4 w-4 text-mozi-safe" />
                  <span className="text-mozi-text-muted">
                    0{index + 1}. {step}
                  </span>
                </div>
              ),
            )}
          </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pb-6">
        {/* 左侧控制台 */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-mozi-dark border border-mozi-border rounded-3xl p-4 space-y-4 shadow-xl">
            <div className="rounded-2xl border border-mozi-accent/20 bg-mozi-accent/10 p-3">
              <div className="mb-2 text-xs font-bold uppercase tracking-widest text-mozi-accent">
                当前实验焦点
              </div>
              <p className="text-sm leading-6 text-mozi-text">
                {contextHints[context]}
              </p>
              <p className="mt-2 text-xs leading-5 text-mozi-text-muted">
                {defenseHints[defenseMode]}
              </p>
            </div>

            {/* 注入点上下文 */}
            <div className="space-y-2">
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
            <div className="space-y-2">
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
            <div className="space-y-2">
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
                    onClick={() => handleDefenseChange(mode.id as XSSMode)}
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
            <div className="space-y-2 pt-3 border-t border-mozi-border/30">
              <div className="flex justify-between items-center">
                <div>
                  <label className="text-[10px] font-mono text-mozi-text-muted uppercase">
                    Attack Payload
                  </label>
                  <p className="mt-1 text-[10px] text-mozi-text-muted">
                    这里展示的是教学沙箱判定，不会执行 URL payload 中的真实脚本。
                  </p>
                </div>
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

              {scenario === "dom" ? (
                <input
                  value={urlHash}
                  onChange={(event) => setUrlHash(event.target.value)}
                  placeholder="#welcome"
                  className="w-full bg-mozi-black border border-mozi-border rounded-2xl p-3 font-mono text-sm focus:outline-none focus:border-mozi-accent transition-colors text-mozi-text"
                />
              ) : (
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="在此输入攻击载荷..."
                  className="w-full h-24 bg-mozi-black border border-mozi-border rounded-2xl p-3 font-mono text-sm focus:outline-none focus:border-mozi-accent transition-colors text-mozi-text resize-none"
                />
              )}

              <button
                onClick={handleAttack}
                disabled={isAttacking || (scenario === "dom" ? !urlHash : !inputValue)}
                className="w-full py-3 rounded-2xl bg-mozi-danger text-white font-black uppercase tracking-widest shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
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
          <div className="bg-mozi-black border border-mozi-border rounded-3xl p-4 shadow-xl h-[160px] flex flex-col">
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

          <details className="rounded-3xl border border-mozi-border bg-mozi-dark p-4">
            <summary className="cursor-pointer text-sm font-black text-mozi-text">
              教学要点 / 防御清单 / 复盘问题
            </summary>
            <div className="mt-4 grid gap-4">
              {xssTeachingCards.map((card) => (
                <div key={card.title}>
                  <h3 className="mb-3 text-xs font-black text-mozi-text">
                    {card.title}
                  </h3>
                  <div className="space-y-2">
                    {card.items.map((item) => (
                      <div key={item} className="flex gap-2 text-xs leading-5">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-mozi-safe" />
                        <span className="text-mozi-text-muted">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="rounded-2xl border border-mozi-accent/30 bg-mozi-accent/10 p-3">
                <h3 className="mb-3 text-xs font-black text-mozi-accent">
                  复盘问题
                </h3>
                <div className="space-y-2">
                  {xssReviewQuestions.map((question, index) => (
                    <div
                      key={question}
                      className="rounded-xl border border-mozi-border bg-mozi-black/60 p-2 text-xs leading-5 text-mozi-text-muted"
                    >
                      Q{index + 1}. {question}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </details>
        </div>

        {/* 右侧主舞台：浏览器模拟 + 源码分析 */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex-1 bg-mozi-black border border-mozi-border rounded-3xl overflow-hidden flex flex-col shadow-2xl relative min-h-[360px]">
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

            <div className="flex-grow p-6 relative bg-white dark:bg-[#0d1117] transition-colors overflow-auto">
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
                  context={context}
                  activePayload={activePayload}
                  isAttacking={isAttacking}
                  defenseMode={defenseMode}
                />
              </div>
            </div>
          </div>

          {/* 源码白盒分析 */}
          <div className="bg-[#1e1e1e] border border-mozi-border rounded-3xl p-4 shadow-xl">
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
  context,
  activePayload,
  isAttacking,
  defenseMode,
}: {
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
      <div className="text-center space-y-3 w-full max-w-lg">
        <div className="p-5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-inner">
          <h4 className="text-xs font-bold text-slate-400 mb-4 uppercase">
            Server Response
          </h4>
          <div className="text-xl font-medium">
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
      <div className="text-center space-y-3 w-full max-w-lg">
        <div className="p-5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-inner">
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
          <p className="mt-4 text-sm text-slate-500">
            将鼠标悬停在头像上查看 Title 属性注入效果
          </p>
        </div>
      </div>
    );
  }

  if (context === "script") {
    return (
      <div className="text-center space-y-3 w-full max-w-lg">
        <div className="p-5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-inner">
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
          <p className="mt-4 text-sm text-slate-500">
            输入 Payload 尝试破坏 JS 结构并执行代码
          </p>
        </div>
      </div>
    );
  }

  if (context === "url") {
    return (
      <div className="text-center space-y-3 w-full max-w-lg">
        <div className="p-5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-inner">
          <h4 className="text-xs font-bold text-slate-400 mb-4 uppercase">
            Redirect Button
          </h4>
          <a
            href={activePayload || "#"}
            onClick={(event) => {
              if (activePayload.startsWith("javascript:")) {
                event.preventDefault();
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
  context,
  defenseMode,
}: {
  context: XSSContext;
  defenseMode: XSSMode;
}) => {
  if (context === "body") {
    return (
      <div>
        <CodeComment>// HTML 上下文注入 (最常见)</CodeComment>
        <br />
        <CodeTag>&lt;div&gt;</CodeTag>
        <br />
        &nbsp;&nbsp;搜索结果:
        {defenseMode === "none" ? (
          <CodeDanger>{"${userInput}"}</CodeDanger>
        ) : defenseMode === "escape" ? (
          <CodeSafe>{"escapeHtml(userInput)"}</CodeSafe>
        ) : (
          <CodeDanger>{"filter(userInput)"}</CodeDanger>
        )}
        <br />
        <CodeTag>&lt;/div&gt;</CodeTag>
      </div>
    );
  }
  if (context === "attribute") {
    return (
      <div>
        <CodeComment>// 属性上下文注入 (需要闭合引号)</CodeComment>
        <br />
        <CodeTag>&lt;div</CodeTag> class=<CodeString>"avatar"</CodeString> title=
        {defenseMode === "none" ? (
          <CodeDanger>{'"${userInput}"'}</CodeDanger>
        ) : defenseMode === "escape" ? (
          <CodeSafe>{'"${encodeAttr(userInput)}"'}</CodeSafe>
        ) : (
          <CodeDanger>{'"${userInput}"'}</CodeDanger>
        )}
        <CodeTag>&gt;</CodeTag>
        <CodeTag>&lt;/div&gt;</CodeTag>
      </div>
    );
  }
  if (context === "script") {
    return (
      <div>
        <CodeComment>// JS 上下文注入 (需要闭合代码块)</CodeComment>
        <br />
        <CodeTag>&lt;script&gt;</CodeTag>
        <br />
        &nbsp;&nbsp;<CodeKeyword>var</CodeKeyword> config = &#123; name:
        {defenseMode === "none" ? (
          <CodeDanger>{"'${userInput}'"}</CodeDanger>
        ) : defenseMode === "escape" ? (
          <CodeSafe>{"'${encodeJS(userInput)}'"}</CodeSafe>
        ) : (
          <CodeDanger>{"'${userInput}'"}</CodeDanger>
        )}
        &#125;;
        <br />
        <CodeTag>&lt;/script&gt;</CodeTag>
      </div>
    );
  }
  if (context === "url") {
    return (
      <div>
        <CodeComment>// URL 上下文注入 (利用 javascript: 协议)</CodeComment>
        <br />
        <CodeTag>&lt;a</CodeTag> href=
        {defenseMode === "none" ? (
          <CodeDanger>{'"${userInput}"'}</CodeDanger>
        ) : defenseMode === "escape" ? (
          <CodeSafe>{'"${validateURL(userInput)}"'}</CodeSafe>
        ) : (
          <CodeDanger>{'"${userInput}"'}</CodeDanger>
        )}
        <CodeTag>&gt;</CodeTag>Home<CodeTag>&lt;/a&gt;</CodeTag>
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
