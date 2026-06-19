import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  ShieldCheck,
  Zap,
  Play,
  Settings,
  Globe,
  
  AlertCircle,
  RefreshCcw,
  Code2,
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

// XSS 注入器
const XSSInjector: React.FC<{
  payload: string;
  defenseMode: XSSMode;
  className?: string;
}> = ({ payload, defenseMode, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    if (defenseMode === "escape") {
      containerRef.current.textContent = payload;
      return;
    }

    let processed = payload;
    if (defenseMode === "blacklist") {
      processed = payload.replace(
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        "[BLOCKED_BY_WAF]",
      );
    }

    try {
      const fragment = document.createRange().createContextualFragment(processed);
      containerRef.current.appendChild(fragment);
    } catch (e) {
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
  const [urlHash, setUrlHash] = useState("#welcome");
  const [isAttacking, setIsAttacking] = useState(false);
  const [attackResult, setAttackResult] = useState<
    "success" | "blocked" | "bypassed" | "csp_blocked" | null
  >(null);
  const [logs, setLogs] = useState<string[]>(["[SYSTEM] 沙箱已启动"]);

  const addLog = (msg: string) => setLogs((prev) => [...prev.slice(-4), msg]);

  const handleAttack = () => {
    const payload = scenario === "dom" ? urlHash.replace("#", "") : inputValue;
    if (!payload) return;

    setIsAttacking(true);
    setAttackResult(null);
    setActivePayload("");
    addLog(`[ATTACK] 注入到 ${context.toUpperCase()}`);

    if (csp !== "none") {
      const isInlineBlocked =
        csp === "default-src 'self'" &&
        (payload.includes("<script") || /on\w+\s*=/i.test(payload));
      if (isInlineBlocked) {
        setTimeout(() => {
          setIsAttacking(false);
          setAttackResult("csp_blocked");
          addLog("[CSP] 拦截成功");
        }, 800);
        return;
      }
    }

    const originalAlert = window.alert;
    window.alert = (msg?: unknown) => {
      addLog(`[EXPLOIT] Alert: "${msg}"`);
      if (defenseMode === "none") setAttackResult("success");
      if (defenseMode === "blacklist") setAttackResult("bypassed");
    };

    setTimeout(() => {
      setIsAttacking(false);
      setActivePayload(payload);

      const containsExploit =
        /<[a-z][\s\S]*>/i.test(payload) ||
        /on\w+\s*=/i.test(payload) ||
        /javascript:/i.test(payload) ||
        payload.includes("';");

      if (defenseMode === "none") {
        if (containsExploit) {
          addLog("[VULN] Payload 触发");
          setAttackResult("success");
        } else {
          setAttackResult("blocked");
        }
      } else if (defenseMode === "blacklist") {
        const isBypass = /on\w+\s*=/i.test(payload) || /javascript:/i.test(payload);
        if (isBypass) {
          addLog("[CRITICAL] WAF 绕过");
          setAttackResult("bypassed");
        } else {
          setAttackResult("blocked");
        }
      } else {
        setAttackResult("blocked");
        addLog("[SAFE] 已转义");
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
    setLogs([`[SYSTEM] 场景: ${s.toUpperCase()}`]);
  };

  const handleDefenseChange = (m: XSSMode) => {
    setDefenseMode(m);
    setInputValue("");
    setActivePayload("");
    setAttackResult(null);
    setLogs(["[SYSTEM] 防御已切换"]);
  };

  return (
    <div className="flex h-full flex-col space-y-3">
      {/* 顶部紧凑工具栏 */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-mozi-border bg-mozi-dark p-3">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-mozi-danger" />
          <span className="text-sm font-black text-mozi-text">XSS 实验室</span>
        </div>

        <div className="h-4 w-px bg-mozi-border" />

        {/* 场景 */}
        <div className="flex gap-1">
          {(["reflected", "stored", "dom"] as const).map((s) => (
            <button
              key={s}
              onClick={() => handleScenarioChange(s)}
              className={`rounded px-3 py-1 text-xs font-bold transition ${
                scenario === s
                  ? "bg-mozi-danger text-white"
                  : "text-mozi-text-muted hover:text-mozi-text"
              }`}
            >
              {s === "reflected" && "反射"}
              {s === "stored" && "存储"}
              {s === "dom" && "DOM"}
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-mozi-border" />

        {/* Context */}
        <div className="flex gap-1">
          {(["body", "attribute", "script", "url"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setContext(c)}
              className={`rounded border px-2 py-1 text-xs font-mono transition ${
                context === c
                  ? "border-mozi-accent bg-mozi-accent/10 text-mozi-accent"
                  : "border-mozi-border text-mozi-text-muted"
              }`}
            >
              {c.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3 text-xs">
          <span className="text-mozi-text-muted">CSP:</span>
          <span className={csp === "none" ? "text-mozi-danger" : "text-mozi-safe"}>
            {csp === "none" ? "OFF" : "ON"}
          </span>
          <span className="text-mozi-border">|</span>
          <span className="text-mozi-text-muted">WAF:</span>
          <span
            className={
              defenseMode === "none"
                ? "text-mozi-danger"
                : defenseMode === "blacklist"
                  ? "text-amber-500"
                  : "text-mozi-safe"
            }
          >
            {defenseMode.toUpperCase()}
          </span>
        </div>
      </div>

      {/* 主区：三栏 */}
      <div className="grid flex-1 grid-cols-12 gap-3 overflow-hidden">
        {/* 左栏：操作区 */}
        <div className="col-span-12 flex flex-col gap-3 lg:col-span-3">
          <div className="flex-1 space-y-3 rounded-xl border border-mozi-border bg-mozi-dark p-3">
            <div className="text-xs font-bold text-mozi-text">攻击载荷</div>

            {scenario === "dom" ? (
              <input
                value={urlHash}
                onChange={(e) => setUrlHash(e.target.value)}
                placeholder="#welcome"
                className="w-full rounded border border-mozi-border bg-mozi-black p-2 font-mono text-sm text-mozi-text focus:border-mozi-accent focus:outline-none"
              />
            ) : (
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="输入 payload..."
                className="h-24 w-full resize-none rounded border border-mozi-border bg-mozi-black p-2 font-mono text-sm text-mozi-text focus:border-mozi-accent focus:outline-none"
              />
            )}

            <button
              onClick={() => {
                if (context === "attribute") setInputValue('"><script>alert(1)</script>');
                else if (context === "script") setInputValue("'; alert(1); //");
                else if (context === "url") setInputValue("javascript:alert(1)");
                else setInputValue("<script>alert(1)</script>");
              }}
              className="w-full rounded border border-mozi-border py-1.5 text-xs text-mozi-accent hover:bg-mozi-accent/10"
            >
              智能填充
            </button>

            <button
              onClick={handleAttack}
              disabled={isAttacking || (scenario === "dom" ? !urlHash : !inputValue)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-mozi-danger py-3 font-black uppercase tracking-wider text-white transition hover:brightness-110 disabled:opacity-30"
            >
              {isAttacking ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              攻击
            </button>
          </div>

          {/* CSP */}
          <div className="space-y-2 rounded-xl border border-mozi-border bg-mozi-dark p-3">
            <div className="flex items-center gap-2 text-xs font-bold text-mozi-text">
              <ShieldCheck className="h-3.5 w-3.5" />
              CSP
            </div>
            {(["none", "default-src 'self'", "nonce-based"] as const).map((level) => (
              <button
                key={level}
                onClick={() => setCsp(level)}
                className={`w-full rounded border px-2 py-1.5 text-left text-xs transition ${
                  csp === level
                    ? "border-mozi-safe bg-mozi-safe/10 text-mozi-safe"
                    : "border-mozi-border text-mozi-text-muted"
                }`}
              >
                {level === "none" ? "OFF" : level}
              </button>
            ))}
          </div>

          {/* WAF */}
          <div className="space-y-2 rounded-xl border border-mozi-border bg-mozi-dark p-3">
            <div className="flex items-center gap-2 text-xs font-bold text-mozi-text">
              <Settings className="h-3.5 w-3.5" />
              WAF
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: "none", label: "None", color: "text-mozi-danger" },
                { id: "blacklist", label: "Blacklist", color: "text-amber-500" },
                { id: "escape", label: "Escape", color: "text-mozi-safe" },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => handleDefenseChange(mode.id as XSSMode)}
                  className={`rounded border py-1.5 text-xs font-bold transition ${
                    defenseMode === mode.id
                      ? `border-mozi-accent ${mode.color}`
                      : "border-mozi-border text-mozi-text-muted opacity-60"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 中栏：浏览器预览 */}
        <div className="col-span-12 lg:col-span-6">
          <div className="flex h-full flex-col overflow-hidden rounded-xl border border-mozi-border bg-white shadow-xl dark:bg-[#0d1117]">
            <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-100 px-3 py-2 dark:border-slate-800 dark:bg-mozi-dark">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
              </div>
              <div className="flex-1 rounded-full border border-slate-200 bg-white px-3 py-1 font-mono text-[9px] text-slate-500 dark:border-mozi-border dark:bg-mozi-black dark:text-mozi-text-muted">
                <Globe className="mr-2 inline h-3 w-3" />
                vuln-app.com/{scenario}?ctx={context}
              </div>
            </div>

            <div className="relative flex flex-1 items-center justify-center p-6 text-[#0f172a] dark:text-[#e6edf3]">
              <AnimatePresence>
                {(attackResult === "success" || attackResult === "bypassed") && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 flex items-center justify-center bg-red-600/20 backdrop-blur-sm"
                  >
                    <div className="rounded-2xl border-2 border-mozi-danger bg-mozi-black p-8 text-center">
                      <AlertCircle className="mx-auto mb-4 h-16 w-16 text-mozi-danger" />
                      <h3 className="mb-2 text-2xl font-black text-white">XSS 成功！</h3>
                      <p className="text-sm text-mozi-text-muted">脚本已执行</p>
                    </div>
                  </motion.div>
                )}
                {attackResult === "csp_blocked" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 flex items-center justify-center bg-mozi-safe/20 backdrop-blur-sm"
                  >
                    <div className="rounded-2xl border-2 border-mozi-safe bg-mozi-black p-8 text-center">
                      <ShieldCheck className="mx-auto mb-4 h-16 w-16 text-mozi-safe" />
                      <h3 className="mb-2 text-2xl font-black text-white">CSP 拦截</h3>
                      <p className="text-sm text-mozi-text-muted">内联脚本被阻止</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {isAttacking ? (
                <div className="text-center">
                  <RefreshCcw className="mx-auto mb-2 h-8 w-8 animate-spin text-mozi-accent" />
                  <p className="text-sm text-mozi-text-muted">处理中...</p>
                </div>
              ) : context === "body" ? (
                <div className="w-full max-w-md rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/50">
                  <p className="mb-2 text-xs uppercase text-slate-400">搜索结果</p>
                  <div className="text-lg">
                    结果：
                    <XSSInjector payload={activePayload} defenseMode={defenseMode} className="inline text-red-600" />
                  </div>
                </div>
              ) : (
                <div className="text-center text-mozi-text-muted">
                  <p className="text-sm">上下文: {context.toUpperCase()}</p>
                  <p className="mt-2 text-xs">执行攻击查看效果</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右栏：审计+日志 */}
        <div className="col-span-12 flex flex-col gap-3 lg:col-span-3">
          {/* 源码 */}
          <div className="flex-1 overflow-hidden rounded-xl border border-mozi-border bg-[#1e1e1e]">
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-mozi-accent" />
                <span className="text-xs font-black text-[#d4d4d4]">源码</span>
              </div>
              <span className="rounded bg-mozi-danger/20 px-2 py-0.5 font-mono text-[9px] text-mozi-danger">
                {context}
              </span>
            </div>
            <div className="h-[calc(100%-40px)] overflow-auto p-3 font-mono text-[10px] text-[#d4d4d4]">
              {context === "body" && (
                <>
                  <CodeComment>// HTML 正文</CodeComment>
                  <br />
                  <CodeTag>&lt;div&gt;</CodeTag>
                  结果:
                  {defenseMode === "none" ? (
                    <CodeDanger>{"${input}"}</CodeDanger>
                  ) : defenseMode === "escape" ? (
                    <CodeSafe>{"escape(input)"}</CodeSafe>
                  ) : (
                    <CodeDanger>{"filter(input)"}</CodeDanger>
                  )}
                  <CodeTag>&lt;/div&gt;</CodeTag>
                </>
              )}
              {context === "attribute" && (
                <>
                  <CodeComment>// 属性上下文</CodeComment>
                  <br />
                  <CodeTag>&lt;div</CodeTag> title=
                  {defenseMode === "none" ? (
                    <CodeDanger>{'"${input}"'}</CodeDanger>
                  ) : (
                    <CodeSafe>{'"${encodeAttr(input)}"'}</CodeSafe>
                  )}
                  <CodeTag>&gt;&lt;/div&gt;</CodeTag>
                </>
              )}
              {context === "script" && (
                <>
                  <CodeComment>// JS 上下文</CodeComment>
                  <br />
                  <CodeTag>&lt;script&gt;</CodeTag>
                  <br />
                  <CodeKeyword>var</CodeKeyword> x =
                  {defenseMode === "none" ? (
                    <CodeDanger>{"'${input}'"}</CodeDanger>
                  ) : (
                    <CodeSafe>{"'${encodeJS(input)}'"}</CodeSafe>
                  )}
                  ;
                  <br />
                  <CodeTag>&lt;/script&gt;</CodeTag>
                </>
              )}
              {context === "url" && (
                <>
                  <CodeComment>// URL 上下文</CodeComment>
                  <br />
                  <CodeTag>&lt;a</CodeTag> href=
                  {defenseMode === "none" ? (
                    <CodeDanger>{'"${input}"'}</CodeDanger>
                  ) : (
                    <CodeSafe>{'"${validateURL(input)}"'}</CodeSafe>
                  )}
                  <CodeTag>&gt;&lt;/a&gt;</CodeTag>
                </>
              )}
            </div>
          </div>

          {/* 日志 */}
          <div className="h-32 overflow-hidden rounded-xl border border-mozi-border bg-mozi-black">
            <div className="flex items-center gap-2 border-b border-mozi-border px-3 py-2">
              <Terminal className="h-4 w-4 text-mozi-safe" />
              <span className="text-xs font-black text-mozi-text">日志</span>
              <span className="ml-auto font-mono text-[9px] text-mozi-safe">LIVE</span>
            </div>
            <div className="h-[calc(100%-40px)] overflow-y-auto p-2 font-mono text-[10px]">
              {logs.map((log, i) => (
                <div
                  key={i}
                  className={
                    log.includes("EXPLOIT") || log.includes("CRITICAL")
                      ? "text-mozi-danger"
                      : log.includes("CSP")
                        ? "text-mozi-accent"
                        : log.includes("SAFE")
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
      </div>

      {/* 底部教学 */}
      <details className="rounded-xl border border-mozi-border bg-mozi-dark">
        <summary className="cursor-pointer p-3 text-sm font-bold text-mozi-text">
          教学要点 / 复盘问题
        </summary>
        <div className="space-y-4 p-4">
          {xssTeachingCards.map((card) => (
            <div key={card.title}>
              <h4 className="mb-2 text-xs font-bold text-mozi-text">{card.title}</h4>
              <div className="space-y-1">
                {card.items.map((item) => (
                  <p key={item} className="text-xs leading-relaxed text-mozi-text-muted">
                    • {item}
                  </p>
                ))}
              </div>
            </div>
          ))}
          <div className="rounded-xl border border-mozi-accent/30 bg-mozi-accent/10 p-3">
            <h4 className="mb-2 text-xs font-bold text-mozi-accent">复盘问题</h4>
            {xssReviewQuestions.map((q, i) => (
              <p key={i} className="text-xs leading-relaxed text-mozi-text-muted">
                {i + 1}. {q}
              </p>
            ))}
          </div>
        </div>
      </details>
    </div>
  );
};

export default XSSLab;
