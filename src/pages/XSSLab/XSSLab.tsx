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
  const [inputValue, setInputValue] = useState("");
  const [activePayload, setActivePayload] = useState("");

  // Specific for DOM XSS
  const [urlHash, setUrlHash] = useState("#welcome");

  const [isAttacking, setIsAttacking] = useState(false);
  const [attackResult, setAttackResult] = useState<
    "success" | "blocked" | "bypassed" | null
  >(null);
  const [logs, setLogs] = useState<string[]>(["[SYSTEM] 漏洞分析沙箱已启动。"]);

  const addLog = (msg: string) => setLogs((prev) => [...prev.slice(-4), msg]);

  const handleAttack = () => {
    const payload = scenario === "dom" ? urlHash.replace("#", "") : inputValue;
    if (!payload) return;

    setIsAttacking(true);
    setAttackResult(null);
    setActivePayload(""); // 先清空，确保触发重新注入
    addLog(`[ATTACK] 注入 Payload: ${payload.substring(0, 20)}...`);

    // --- Alert Hijacking ---
    // 劫持 window.alert，当脚本执行 alert() 时触发实验室内的动画
    const originalAlert = window.alert;
    window.alert = (msg: any) => {
      console.log("[LAB INTERCEPT] Alert called:", msg);
      addLog(`[EXPLOIT] 检测到脚本执行！捕获 Alert: "${msg}"`);

      // 根据防御模式确定攻击结果状态
      if (defenseMode === "none") setAttackResult("success");
      if (defenseMode === "blacklist") setAttackResult("bypassed");
    };

    setTimeout(() => {
      setIsAttacking(false);
      setActivePayload(payload);

      // --- Heuristic Exploit Detection (启发式漏洞检测) ---
      // 除了劫持 alert，我们也通过正则预判一些敏感操作，以触发实验室动画
      const isSensitiveAccess =
        /document\.cookie|localStorage|sessionStorage|fetch|location|XMLHttpRequest/i.test(
          payload,
        );
      const containsHTML =
        /<[a-z][\s\S]*>/i.test(payload) || /on\w+\s*=/i.test(payload);

      // 核心安全逻辑模拟 (用于日志输出和非 alert 类型的攻击判定)
      if (defenseMode === "none") {
        if (containsHTML) {
          addLog("[VULN] 原始数据直接被渲染，Payload 已送达浏览器。");
          if (isSensitiveAccess) {
            setAttackResult("success");
            addLog("[EXPLOIT] 检测到敏感信息 (Cookie/Storage) 访问尝试！");
          }
        } else {
          setAttackResult("blocked");
          addLog("[INFO] 输入不包含可执行的 HTML/JS 代码。");
        }
      } else if (defenseMode === "blacklist") {
        const isBypass =
          /on\w+\s*=/i.test(payload) || /javascript:/i.test(payload);

        if (/<script/i.test(payload)) {
          addLog("[FILTER] 检测到 <script> 标签，已被后端 WAF 拦截/替换。");
        }

        if (isBypass) {
          addLog(
            "[CRITICAL] WAF 被绕过！事件处理器 (如 onerror/onload) 逃逸成功。",
          );
          if (isSensitiveAccess) {
            setAttackResult("bypassed");
            addLog("[EXPLOIT] 绕过 WAF 后成功访问敏感数据！");
          }
        } else if (!/<script/i.test(payload)) {
          setAttackResult("blocked");
          addLog("[SAFE] 攻击被黑名单阻断或无危害。");
        }
      } else if (defenseMode === "escape") {
        setAttackResult("blocked");
        addLog("[SAFE] 特殊字符已被安全转义为 HTML 实体，无法执行。");
      }

      // 5秒后恢复 alert
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
    setLogs(["[SYSTEM] 切换场景，环境已重置。"]);
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
              LAB_01 / Code_Injection
            </span>
          </div>
          <h1 className="text-5xl font-black tracking-tight text-mozi-text">
            XSS 深度剖析实验室
          </h1>
          <p className="text-mozi-text-muted max-w-3xl">
            跨站脚本攻击 (Cross-Site
            Scripting)。在这里，你不仅可以尝试攻击，还能通过**“白盒源码分析”**透视底层漏洞成因，并学习如何利用
            WAF 缺陷实现**“黑名单绕过 (Filter Bypass)”**。
          </p>
        </div>

        <div className="flex bg-mozi-dark p-1 rounded-2xl border border-mozi-border">
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
              {s === "reflected" && "反射型 (Reflected)"}
              {s === "stored" && "存储型 (Stored)"}
              {s === "dom" && "DOM 型 (DOM-based)"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
        {/* 左侧控制台 */}
        <div className="lg:col-span-4 space-y-6">
          {/* 配置面板 */}
          <div className="bg-mozi-dark border border-mozi-border rounded-[2.5rem] p-8 space-y-8 shadow-xl">
            <div className="flex items-center gap-3 border-b border-mozi-border pb-4">
              <Settings className="w-5 h-5 text-mozi-accent" />
              <h3 className="font-bold uppercase text-sm tracking-tighter">
                WAF 防御策略配置
              </h3>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-3">
                {[
                  {
                    id: "none",
                    label: "无防御 (Level: 0)",
                    color: "text-mozi-danger",
                    desc: "Data -> Sink 无任何过滤",
                  },
                  {
                    id: "blacklist",
                    label: "黑名单过滤 (Level: 1)",
                    color: "text-amber-500",
                    desc: "过滤 <script> 标签",
                  },
                  {
                    id: "escape",
                    label: "HTML 转义 (Level: 9)",
                    color: "text-mozi-safe",
                    desc: "上下文安全的转义编码",
                  },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => handleDefenseChange(mode.id as XSSMode)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      defenseMode === mode.id
                        ? `bg-mozi-black border-mozi-accent/50 ring-1 ring-mozi-accent`
                        : "border-transparent bg-mozi-black/20 opacity-50 grayscale hover:grayscale-0 hover:bg-mozi-black/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`font-bold font-mono ${defenseMode === mode.id ? mode.color : ""}`}
                      >
                        {mode.label}
                      </span>
                      {defenseMode === mode.id && (
                        <ShieldCheck className="w-4 h-4 text-mozi-accent" />
                      )}
                    </div>
                    <p className="text-[10px] text-mozi-text-muted font-mono">
                      {mode.desc}
                    </p>
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <label className="text-xs font-mono text-mozi-text-muted uppercase tracking-widest flex justify-between">
                  <span>攻击载荷 (Payload)</span>
                  <span className="text-mozi-accent">Attacker Input</span>
                </label>
                {scenario === "dom" ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center bg-mozi-black border border-mozi-border rounded-xl px-4 py-3 font-mono text-sm focus-within:border-mozi-accent">
                      <span className="text-mozi-text-muted mr-1">#</span>
                      <input
                        value={urlHash.replace("#", "")}
                        onChange={(e) => setUrlHash("#" + e.target.value)}
                        className="bg-transparent border-none outline-none w-full text-mozi-text"
                      />
                    </div>
                    <p className="text-[10px] text-mozi-text-muted italic">
                      DOM 型 XSS 不经过服务端，请直接修改 URL Hash (Fragment)
                      触发漏洞。
                    </p>
                  </div>
                ) : (
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="<a href=&quot;javascript:alert('XSS')&quot;>点击这里有惊喜</a>"
                    className="w-full h-24 bg-mozi-black border border-mozi-border rounded-2xl p-4 font-mono text-sm focus:outline-none focus:border-mozi-accent transition-colors text-mozi-text resize-none shadow-inner"
                  />
                )}

                <div className="flex flex-wrap gap-2 pt-2">
                  {scenario !== "dom" && (
                    <button
                      onClick={() =>
                        setInputValue(
                          '<a href="javascript:alert(&apos;XSS&apos;)">点击这里有惊喜</a>',
                        )
                      }
                      className="text-[10px] px-2 py-1 bg-mozi-black border border-mozi-border rounded hover:border-mozi-accent font-mono"
                    >
                      Basic Script
                    </button>
                  )}
                  <button
                    onClick={() => {
                      const p = "<img src=x onerror=alert('Bypass!')>";
                      if (scenario === "dom") {
                        setUrlHash("#" + p);
                      } else {
                        setInputValue(p);
                      }
                    }}
                    className="text-[10px] px-2 py-1 bg-mozi-black border border-mozi-border rounded hover:border-amber-500 text-amber-500 font-mono"
                    title="黑名单绕过专用"
                  >
                    Img OnError (Bypass)
                  </button>
                </div>
              </div>

              <button
                onClick={handleAttack}
                disabled={isAttacking || (scenario !== "dom" && !inputValue)}
                className="w-full py-5 rounded-2xl bg-mozi-danger text-white font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(239,68,68,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 flex items-center justify-center gap-3"
              >
                {isAttacking ? (
                  <RefreshCcw className="w-5 h-5 animate-spin" />
                ) : (
                  <Play className="w-5 h-5 fill-current" />
                )}
                {scenario === "dom" ? "触发 DOM 解析" : "发射 Payload"}
              </button>
            </div>
          </div>

          {/* 实时分析日志 */}
          <div className="bg-mozi-black border border-mozi-border rounded-3xl p-8 shadow-xl">
            <div className="flex items-center gap-3 border-b border-mozi-border pb-4 mb-4">
              <Terminal className="w-5 h-5 text-mozi-safe" />
              <h3 className="font-bold uppercase text-sm">
                漏洞分析仪 (Analysis Log)
              </h3>
            </div>
            <div className="space-y-2 font-mono text-[10px] leading-relaxed flex flex-col justify-end min-h-[120px]">
              {logs.map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={
                    log.includes("[CRITICAL]") ||
                    log.includes("[VULN]") ||
                    log.includes("[EXPLOIT]")
                      ? "text-mozi-danger font-bold"
                      : log.includes("[SAFE]")
                        ? "text-mozi-safe"
                        : log.includes("[FILTER]")
                          ? "text-amber-500"
                          : "text-mozi-text-muted"
                  }
                >
                  {log}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧主舞台：浏览器模拟 + 源码分析 */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* 浏览器沙箱 */}
          <div className="flex-1 bg-mozi-black border border-mozi-border rounded-[3rem] overflow-hidden flex flex-col shadow-2xl relative">
            <div className="bg-mozi-dark border-b border-mozi-border px-6 py-4 flex items-center gap-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>
              <div className="flex-grow bg-mozi-black rounded-lg px-4 py-2 border border-mozi-border flex items-center gap-3 font-mono text-xs overflow-hidden">
                <Globe className="w-4 h-4 text-mozi-text-muted flex-shrink-0" />
                <span className="text-mozi-text-muted truncate">
                  https://vulnerable-site.com/{scenario}
                  {scenario === "reflected" &&
                    inputValue &&
                    `?q=${encodeURIComponent(inputValue)}`}
                  {scenario === "dom" && (
                    <span className="text-mozi-danger">{urlHash}</span>
                  )}
                </span>
              </div>
            </div>

            <div className="flex-grow p-12 relative bg-white dark:bg-[#0d1117] transition-colors overflow-auto">
              {/* 模拟浏览器敏感数据展示 (Visualizing "Stealable" data) */}
              <div className="absolute top-4 right-4 z-20 opacity-40 hover:opacity-100 transition-opacity">
                <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-[10px] font-mono shadow-sm">
                  <div className="flex items-center gap-2 mb-1 border-b border-slate-200 dark:border-slate-700 pb-1">
                    <Cookie className="w-3 h-3 text-amber-500" />
                    <span className="font-bold">Browser Storage</span>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-blue-500">
                      cookie: session_id=mozi_9527
                    </div>
                    <div className="text-purple-500">
                      localStorage: user_pref=dark
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
              </AnimatePresence>

              <div className="text-[#0f172a] dark:text-[#e6edf3] h-full relative z-10">
                {scenario === "reflected" && (
                  <ReflectedXSSDisplay
                    activePayload={activePayload}
                    isAttacking={isAttacking}
                    defenseMode={defenseMode}
                  />
                )}
                {scenario === "stored" && (
                  <StoredXSSDisplay
                    activePayload={activePayload}
                    isAttacking={isAttacking}
                    defenseMode={defenseMode}
                  />
                )}
                {scenario === "dom" && (
                  <DOMXSSDisplay
                    activePayload={activePayload}
                    isAttacking={isAttacking}
                    defenseMode={defenseMode}
                  />
                )}
              </div>
            </div>
          </div>

          {/* 源码白盒分析 (Vulnerable Code Viewer) */}
          <div className="h-64 bg-[#1e1e1e] border border-mozi-border rounded-[2rem] p-8 shadow-xl flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <Code2 className="w-5 h-5 text-mozi-accent" />
              <h3 className="font-bold text-sm text-[#d4d4d4]">
                白盒审计 (Source Code)
              </h3>
              <span className="ml-auto text-[10px] px-2 py-1 bg-[#252526] rounded border border-[#3c3c3c] text-[#858585] font-mono">
                {scenario.toUpperCase()} SINK
              </span>
            </div>
            <div className="flex-grow bg-[#1e1e1e] rounded-xl overflow-y-auto font-mono text-xs leading-loose text-[#d4d4d4]">
              <VulnerableCodeViewer
                scenario={scenario}
                defenseMode={defenseMode}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 白盒源码展示组件 (Syntax Highlight Simulation) ---
const VulnerableCodeViewer = ({
  scenario,
  defenseMode,
}: {
  scenario: XSSScenario;
  defenseMode: XSSMode;
}) => {
  const codeGen = () => {
    const Comment = ({ children }: { children: React.ReactNode }) => (
      <span className="text-[#6A9955]">{children}</span>
    );
    const Keyword = ({ children }: { children: React.ReactNode }) => (
      <span className="text-[#569cd6]">{children}</span>
    );
    const Func = ({ children }: { children: React.ReactNode }) => (
      <span className="text-[#DCDCAA]">{children}</span>
    );
    const StringDef = ({ children }: { children: React.ReactNode }) => (
      <span className="text-[#ce9178]">{children}</span>
    );
    const Tag = ({ children }: { children: React.ReactNode }) => (
      <span className="text-[#569cd6]">{children}</span>
    );
    const Danger = ({ children }: { children: React.ReactNode }) => (
      <span className="text-red-400 bg-red-400/10 px-1 rounded">
        {children}
      </span>
    );
    const Safe = ({ children }: { children: React.ReactNode }) => (
      <span className="text-green-400 bg-green-400/10 px-1 rounded">
        {children}
      </span>
    );

    if (scenario === "reflected") {
      return (
        <div>
          <Comment>// 后端控制器 Node.js / Express 示例</Comment>
          <br />
          <Keyword>app</Keyword>.<Func>get</Func>(
          <StringDef>'/search'</StringDef>, (<Keyword>req</Keyword>,{" "}
          <Keyword>res</Keyword>) ={">"} {"{"}
          <br />
          &nbsp;&nbsp;<Keyword>const</Keyword> query = req.query.
          <Keyword>q</Keyword>;<br />
          {defenseMode === "none" && (
            <>
              &nbsp;&nbsp;
              <Comment>// ❌ 危险：未经过滤直接拼接到 HTML (SINK)</Comment>
              <br />
              &nbsp;&nbsp;<Keyword>res</Keyword>.<Func>send</Func>(
              <Danger>{`\`<h1>搜索结果: \${query}</h1>\``}</Danger>);
            </>
          )}
          {defenseMode === "blacklist" && (
            <>
              &nbsp;&nbsp;
              <Comment>// ⚠️ 警告：黑名单过滤，易被 onerror 等事件绕过</Comment>
              <br />
              &nbsp;&nbsp;<Keyword>const</Keyword> filtered = query.
              <Func>replace</Func>(
              <StringDef>/&lt;script.*?&gt;.*?&lt;\/script&gt;/gi</StringDef>,{" "}
              <StringDef>''</StringDef>);
              <br />
              &nbsp;&nbsp;<Keyword>res</Keyword>.<Func>send</Func>(
              <Danger>{`\`<h1>搜索结果: \${filtered}</h1>\``}</Danger>);
            </>
          )}
          {defenseMode === "escape" && (
            <>
              &nbsp;&nbsp;
              <Comment>
                // ✅ 安全：使用转义函数处理输出 (如 ejs/pug 默认行为)
              </Comment>
              <br />
              &nbsp;&nbsp;<Keyword>const</Keyword> safeStr ={" "}
              <Func>escapeHtml</Func>(query);
              <br />
              &nbsp;&nbsp;<Keyword>res</Keyword>.<Func>send</Func>(
              <Safe>{`\`<h1>搜索结果: \${safeStr}</h1>\``}</Safe>);
            </>
          )}
          <br />
          {"}"});
        </div>
      );
    }
    if (scenario === "stored") {
      return (
        <div>
          <Comment>{`// 前端 React 组件示例 (留言板渲染)`}</Comment>
          <br />
          <Keyword>function</Keyword> <Func>CommentItem</Func>({"{"} comment{" "}
          {"}"}) {"{"}
          <br />
          {defenseMode === "none" && (
            <>
              &nbsp;&nbsp;
              <Comment>
                // ❌ 危险：使用了 dangerouslySetInnerHTML，直接执行 DB
                中的恶意脚本
              </Comment>
              <br />
              &nbsp;&nbsp;<Keyword>return</Keyword> &lt;<Tag>div</Tag>{" "}
              <Danger>dangerouslySetInnerHTML</Danger>={"{{"} __html:
              comment.content {"}}"} /&gt;;
            </>
          )}
          {defenseMode === "blacklist" && (
            <>
              &nbsp;&nbsp;
              <Comment>
                // ⚠️ 警告：后端仅清除了 script 标签，前端仍使用危险渲染
              </Comment>
              <br />
              &nbsp;&nbsp;<Keyword>return</Keyword> &lt;<Tag>div</Tag>{" "}
              <Danger>dangerouslySetInnerHTML</Danger>={"{{"} __html:
              comment.content {"}}"} /&gt;;
            </>
          )}
          {defenseMode === "escape" && (
            <>
              &nbsp;&nbsp;
              <Comment>
                // ✅ 安全：React 默认会对文本内容进行 HTML 实体转义
              </Comment>
              <br />
              &nbsp;&nbsp;<Keyword>return</Keyword> &lt;<Tag>div</Tag>&gt;
              <Safe>
                {"{"}comment.content{"}"}
              </Safe>
              &lt;/<Tag>div</Tag>&gt;;
            </>
          )}
          <br />
          {"}"}
        </div>
      );
    }
    if (scenario === "dom") {
      return (
        <div>
          <Comment>{`// 前端 Vanilla JS (客户端直接处理不可信数据)`}</Comment>
          <br />
          <Keyword>const</Keyword> hash = window.location.
          <Keyword>hash</Keyword>.<Func>slice</Func>(1);{" "}
          <Comment>// Source</Comment>
          <br />
          <Keyword>const</Keyword> msgBox = document.<Func>getElementById</Func>
          (<StringDef>'message'</StringDef>);
          <br />
          {defenseMode === "none" && (
            <>
              &nbsp;&nbsp;<Comment>// ❌ 危险 SINK：直接修改 DOM 结构</Comment>
              <br />
              &nbsp;&nbsp;msgBox.<Danger>innerHTML</Danger> ={" "}
              <StringDef>`欢迎回来: `</StringDef> +{" "}
              <Func>decodeURIComponent</Func>(hash);
            </>
          )}
          {defenseMode === "blacklist" && (
            <>
              &nbsp;&nbsp;
              <Comment>
                // ⚠️ 警告：只清除了特定标签，DOM
                依然可能解析图片等其它元素的事件
              </Comment>
              <br />
              &nbsp;&nbsp;<Keyword>const</Keyword> clean ={" "}
              <Func>decodeURIComponent</Func>(hash).<Func>replace</Func>(
              <StringDef>/&lt;script&gt;/g</StringDef>,{" "}
              <StringDef>""</StringDef>);
              <br />
              &nbsp;&nbsp;msgBox.<Danger>innerHTML</Danger> ={" "}
              <StringDef>`欢迎回来: `</StringDef> + clean;
            </>
          )}
          {defenseMode === "escape" && (
            <>
              &nbsp;&nbsp;
              <Comment>
                // ✅ 安全 SINK：使用 textContent 或
                innerText，将其作为纯文本对待
              </Comment>
              <br />
              &nbsp;&nbsp;msgBox.<Safe>textContent</Safe> ={" "}
              <StringDef>`欢迎回来: `</StringDef> +{" "}
              <Func>decodeURIComponent</Func>(hash);
            </>
          )}
        </div>
      );
    }
  };
  return codeGen();
};

// --- 子场景 UI 组件 ---

const ReflectedXSSDisplay = ({
  activePayload,
  isAttacking,
  defenseMode,
}: {
  activePayload: string;
  isAttacking: boolean;
  defenseMode: XSSMode;
}) => {
  return (
    <div className="space-y-8 max-w-2xl mx-auto pt-10">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mx-auto mb-6 flex items-center justify-center">
          <Search className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-3xl font-black mb-6">全网图书检索引擎</h2>
      </div>

      {isAttacking ? (
        <div className="flex flex-col items-center gap-6 py-20">
          <div className="w-12 h-12 border-4 border-mozi-accent border-t-transparent rounded-full animate-spin" />
          <p className="font-mono text-mozi-accent font-bold uppercase tracking-widest text-xs">
            Querying Backend...
          </p>
        </div>
      ) : activePayload ? (
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-[2rem] p-10 shadow-inner">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 font-bold uppercase tracking-wider">
            检索结果返回
          </p>
          <div className="text-xl font-medium leading-relaxed">
            抱歉，未能找到包含 "
            <XSSInjector
              payload={activePayload}
              defenseMode={defenseMode}
              className="inline font-mono text-mozi-danger bg-mozi-danger/10 px-2 py-1 rounded break-all"
            />
            " 的任何书籍记录。
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-[2rem] p-10 flex items-center justify-center opacity-50 border-dashed">
          <p className="font-mono">请在左侧输入搜索 Payload 以触发反射。</p>
        </div>
      )}
    </div>
  );
};

const StoredXSSDisplay = ({
  activePayload,
  isAttacking,
  defenseMode,
}: {
  activePayload: string;
  isAttacking: boolean;
  defenseMode: XSSMode;
}) => (
  <div className="pt-6 max-w-3xl mx-auto space-y-8">
    <div className="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
      <Database className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
      <div>
        <h2 className="text-2xl font-black">系统公共留言板</h2>
        <p className="text-xs text-slate-500 font-mono mt-1">
          Data fetched from DB: comments_table
        </p>
      </div>
    </div>
    <div className="space-y-6">
      {[
        { user: "Alice_99", msg: "站长，页面好像有点卡？" },
        {
          user: "System_Admin",
          msg: "收到反馈，我们正在排查前端渲染性能问题。",
        },
      ].map((c, i) => (
        <div key={i} className="flex gap-4 items-start">
          <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
          <div className="flex-grow bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl rounded-tl-none">
            <p className="font-bold text-xs mb-1 text-slate-500 dark:text-slate-400">
              {c.user}
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {c.msg}
            </p>
          </div>
        </div>
      ))}
      {/* The malicious comment loaded from DB */}
      {activePayload && !isAttacking && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-4 items-start"
        >
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0 border border-red-200 dark:border-red-800">
            <Ghost className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-grow bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 p-4 rounded-2xl rounded-tl-none relative shadow-sm">
            <p className="font-bold text-xs mb-2 text-red-600 dark:text-red-400 flex items-center justify-between">
              Hacker_0x01
              <span className="text-[9px] bg-red-100 dark:bg-red-900 px-2 py-0.5 rounded text-red-500">
                LATEST_DB_ENTRY
              </span>
            </p>
            <XSSInjector
              payload={activePayload}
              defenseMode={defenseMode}
              className="text-sm text-slate-700 dark:text-slate-300 font-mono bg-white dark:bg-slate-900 p-3 rounded-lg border border-red-100 dark:border-red-900/50 break-all"
            />
          </div>
        </motion.div>
      )}
      {isAttacking && (
        <div className="text-center font-mono text-xs text-mozi-text-muted animate-pulse py-8">
          写入数据库中... INSERT INTO comments ...
        </div>
      )}
    </div>
  </div>
);

const DOMXSSDisplay = ({
  activePayload,
  isAttacking,
  defenseMode,
}: {
  activePayload: string;
  isAttacking: boolean;
  defenseMode: XSSMode;
}) => {
  return (
    <div className="pt-20 text-center space-y-8">
      <div className="inline-block p-10 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-[3rem] shadow-inner max-w-xl">
        <Hash className="w-16 h-16 text-indigo-600 dark:text-indigo-400 mx-auto mb-6" />
        <h2 className="text-3xl font-black mb-4">用户中心解析器</h2>

        <div className="text-left mt-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl">
          <p className="text-xs font-mono text-slate-400 mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            DOM 渲染结果 (Client-Side Only)
          </p>
          <div className="text-xl font-medium pt-2">
            欢迎回来，
            <span className="font-bold text-indigo-600 dark:text-indigo-400 break-all">
              {isAttacking ? (
                <span className="animate-pulse">Parsing DOM...</span>
              ) : (
                <XSSInjector
                  payload={decodeURIComponent(activePayload)}
                  defenseMode={defenseMode}
                  className="inline"
                />
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
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
