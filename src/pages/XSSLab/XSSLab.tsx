import React, { useState } from "react";
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
} from "lucide-react";

type XSSMode = "none" | "blacklist" | "escape";
type XSSScenario = "reflected" | "stored" | "dom";

const XSSLab: React.FC = () => {
  const [scenario, setScenario] = useState<XSSScenario>("reflected");
  const [defenseMode, setDefenseMode] = useState<XSSMode>("none");
  const [inputValue, setInputValue] = useState("");
  const [isAttacking, setIsAttacking] = useState(false);
  const [showCookieSteal, setShowCookieSteal] = useState(false);

  const handleAttack = () => {
    setIsAttacking(true);
    // 模拟攻击序列动画
    setTimeout(() => {
      if (
        defenseMode === "none" &&
        (inputValue.includes("<script>") ||
          inputValue.includes("onload") ||
          inputValue.includes("onerror"))
      ) {
        setShowCookieSteal(true);
      }
      setIsAttacking(false);
    }, 2000);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 transition-colors duration-300">
      {/* 实验室头部 */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-mozi-border pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-mozi-danger text-glow">
            <Zap className="w-6 h-6" />
            <span className="font-mono text-sm tracking-widest uppercase">
              LAB_01 / 攻击向量分析
            </span>
          </div>
          <h1 className="text-5xl font-black tracking-tight text-mozi-text">
            XSS 跨站脚本实验室
          </h1>
          <p className="text-mozi-text-muted max-w-2xl">
            跨站脚本攻击 (XSS) 是 Web
            安全中最常见的漏洞之一。在本实验室，你可以尝试各种注入手段，并观察不同防御策略的效果。
          </p>
        </div>

        <div className="flex bg-mozi-dark p-1 rounded-2xl border border-mozi-border">
          {(["reflected", "stored", "dom"] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                setScenario(s);
                setInputValue("");
                setShowCookieSteal(false);
              }}
              className={`px-6 py-3 rounded-xl text-xs font-bold transition-all ${
                scenario === s
                  ? "bg-mozi-danger text-white shadow-lg"
                  : "text-mozi-text-muted hover:text-mozi-text"
              }`}
            >
              {s === "reflected" && "反射型 XSS"}
              {s === "stored" && "存储型 XSS"}
              {s === "dom" && "DOM 型 XSS"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 左侧：控制面板 */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-mozi-dark border border-mozi-border rounded-[2.5rem] p-8 space-y-8">
            <div className="flex items-center gap-3 border-b border-mozi-border pb-4">
              <Settings className="w-5 h-5 text-mozi-accent" />
              <h3 className="font-bold uppercase text-sm tracking-tighter">
                实验配置
              </h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-mono text-mozi-text-muted uppercase tracking-widest">
                  防御策略配置
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    {
                      id: "none",
                      label: "无防御 (NONE)",
                      color: "text-mozi-danger",
                      desc: "原始数据直接渲染，最危险。",
                    },
                    {
                      id: "blacklist",
                      label: "黑名单过滤 (FILTER)",
                      color: "text-amber-500",
                      desc: "过滤 <script> 等关键字，易被绕过。",
                    },
                    {
                      id: "escape",
                      label: "HTML 转义 (ESCAPE)",
                      color: "text-mozi-safe",
                      desc: "将特殊字符转换为实体，最安全。",
                    },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setDefenseMode(mode.id as XSSMode)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        defenseMode === mode.id
                          ? `bg-mozi-black border-mozi-accent/50 ring-1 ring-offset-2 ring-offset-mozi-black ring-mozi-accent`
                          : "border-transparent bg-mozi-black/20 opacity-50 grayscale"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`font-bold ${defenseMode === mode.id ? mode.color : ""}`}
                        >
                          {mode.label}
                        </span>
                        {defenseMode === mode.id && (
                          <ShieldCheck className="w-4 h-4 text-mozi-accent" />
                        )}
                      </div>
                      <p className="text-[10px] text-mozi-text-muted">
                        {mode.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-mono text-mozi-text-muted uppercase tracking-widest">
                  攻击载荷 (Payload)
                </label>
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="<script>alert('Cookie:'+document.cookie)</script>"
                  className="w-full h-32 bg-mozi-black border border-mozi-border rounded-2xl p-4 font-mono text-sm focus:outline-none focus:border-mozi-accent transition-colors text-mozi-text"
                />
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => setInputValue("<script>alert(1)</script>")}
                    className="text-[10px] px-2 py-1 bg-mozi-black border border-mozi-border rounded hover:border-mozi-accent"
                  >
                    基础 Script
                  </button>
                  <button
                    onClick={() =>
                      setInputValue("<img src=x onerror=alert(1)>")
                    }
                    className="text-[10px] px-2 py-1 bg-mozi-black border border-mozi-border rounded hover:border-mozi-accent"
                  >
                    Img Error
                  </button>
                </div>
              </div>

              <button
                onClick={handleAttack}
                disabled={isAttacking || !inputValue}
                className="w-full py-5 rounded-2xl bg-mozi-danger text-white font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(239,68,68,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 flex items-center justify-center gap-3"
              >
                {isAttacking ? (
                  <RefreshCcw className="w-5 h-5 animate-spin" />
                ) : (
                  <Play className="w-5 h-5 fill-current" />
                )}
                执行攻击攻击
              </button>
            </div>
          </div>

          <div className="bg-mozi-dark border border-mozi-border rounded-3xl p-8 transition-colors duration-300">
            <div className="flex items-center gap-3 border-b border-mozi-border pb-4 mb-4">
              <Terminal className="w-5 h-5 text-mozi-safe" />
              <h3 className="font-bold uppercase text-sm">
                攻击日志 (Payload History)
              </h3>
            </div>
            <div className="space-y-2 font-mono text-[10px] min-h-[100px]">
              <p className="text-mozi-text-muted">[SYSTEM] 实验室环境就绪...</p>
              {isAttacking && (
                <p className="text-mozi-accent animate-pulse">
                  [ATTACK] 正在向 {scenario} 接口提交载荷...
                </p>
              )}
              <AnimatePresence>
                {showCookieSteal && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <p className="text-mozi-danger font-bold">
                      [ALERT] 恶意脚本在用户浏览器中被触发！
                    </p>
                    <p className="text-amber-500">
                      [EXFILTRATED] 已将 Cookie 数据回传至黑客服务器。
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* 右侧：模拟舞台 */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-mozi-black border border-mozi-border rounded-[3rem] overflow-hidden flex flex-col h-full min-h-[800px] shadow-2xl relative transition-colors duration-300">
            {/* 浏览器模拟 UI */}
            <div className="bg-mozi-dark border-b border-mozi-border px-6 py-4 flex items-center gap-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>
              <div className="flex-grow bg-mozi-black rounded-lg px-4 py-2 border border-mozi-border flex items-center gap-3">
                <Globe className="w-4 h-4 text-mozi-text-muted" />
                <span className="text-xs font-mono text-mozi-text-muted">
                  https://vulnerable-site.com/{scenario}
                </span>
              </div>
            </div>

            <div className="flex-grow p-12 relative overflow-hidden bg-white">
              <AnimatePresence>
                {showCookieSteal && (
                  <CookieStealAnimation
                    onComplete={() => setShowCookieSteal(false)}
                  />
                )}
              </AnimatePresence>

              {/* 场景渲染组件 */}
              <div className="text-[#0f172a] h-full">
                {scenario === "reflected" && (
                  <ReflectedXSSDisplay
                    inputValue={inputValue}
                    isAttacking={isAttacking}
                    defenseMode={defenseMode}
                  />
                )}
                {scenario === "stored" && (
                  <StoredXSSDisplay
                    inputValue={inputValue}
                    defenseMode={defenseMode}
                  />
                )}
                {scenario === "dom" && <DOMXSSDisplay />}
              </div>
            </div>

            {/* 底部浮层说明 */}
            <div className="absolute bottom-0 left-0 w-full bg-mozi-dark/95 backdrop-blur-xl border-t border-mozi-border p-10 flex items-start gap-8">
              <div className="p-4 bg-mozi-danger/10 border border-mozi-danger/30 rounded-2xl">
                <Ghost className="w-10 h-10 text-mozi-danger" />
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2 text-mozi-text">
                  黑客笔记 / Hacker's Note
                </h4>
                <p className="text-mozi-text-muted text-sm leading-relaxed max-w-3xl">
                  {scenario === "reflected" &&
                    "反射型 XSS 通常隐藏在 URL 参数中。恶意脚本‘反射’到响应页面，浏览器会直接执行该脚本。尝试输入 <script>alert(1)</script> 看看效果。"}
                  {scenario === "stored" &&
                    "存储型 XSS 最为致命。脚本被持久化在数据库中（如留言板）。所有访问该页面的用户都会触发攻击。"}
                  {scenario === "dom" &&
                    "DOM 型 XSS 发生在前端代码直接处理 URL 片段（如 #）时。恶意数据完全在客户端运行，绕过了传统的服务端过滤。"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 子场景组件 ---

const ReflectedXSSDisplay = ({
  inputValue,
  isAttacking,
  defenseMode,
}: {
  inputValue: string;
  isAttacking: boolean;
  defenseMode: XSSMode;
}) => {
  return (
    <div className="space-y-8 max-w-2xl mx-auto pt-20">
      <div className="text-center">
        <h2 className="text-4xl font-black mb-4">电子图书搜索</h2>
        <div className="flex gap-4">
          <div className="flex-grow p-4 bg-slate-100 rounded-xl border border-slate-200 font-sans italic text-slate-400">
            输入书名...
          </div>
          <button className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg">
            搜索
          </button>
        </div>
      </div>

      {isAttacking ? (
        <div className="flex flex-col items-center gap-6 py-20">
          <div className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="font-mono text-indigo-600 font-bold uppercase tracking-widest">
            正在检索数据库...
          </p>
        </div>
      ) : inputValue ? (
        <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-10 shadow-sm">
          <p className="text-lg text-slate-500 mb-6 italic">搜索结果：</p>
          <div className="text-2xl font-bold">
            找不到关于 "
            {defenseMode === "none" ? (
              <span dangerouslySetInnerHTML={{ __html: inputValue }} />
            ) : defenseMode === "escape" ? (
              <span>{inputValue}</span>
            ) : (
              <span
                dangerouslySetInnerHTML={{
                  __html: inputValue.replace(
                    /<script>/gi,
                    "[BLOCKED_BY_FILTER]",
                  ),
                }}
              />
            )}
            " 的任何书籍。
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 opacity-30 pointer-events-none">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-slate-100 rounded-2xl" />
          ))}
        </div>
      )}
    </div>
  );
};

const StoredXSSDisplay = ({
  inputValue,
  defenseMode,
}: {
  inputValue: string;
  defenseMode: XSSMode;
}) => (
  <div className="pt-20 max-w-3xl mx-auto space-y-8">
    <h2 className="text-3xl font-black flex items-center gap-3">
      <Database className="w-8 h-8 text-indigo-600" /> 用户留言板
    </h2>
    <div className="space-y-6">
      {[
        { user: "Alice", msg: "这本书真的太棒了！" },
        { user: "Bob", msg: "什么时候出第二卷？" },
      ].map((c, i) => (
        <div key={i} className="flex gap-6 items-start">
          <div className="w-12 h-12 rounded-full bg-slate-200" />
          <div className="flex-grow bg-slate-50 border border-slate-100 p-6 rounded-2xl">
            <p className="font-bold text-sm mb-2 text-slate-400">{c.user}</p>
            <p className="text-slate-600">{c.msg}</p>
          </div>
        </div>
      ))}
      {/* 恶意留言 */}
      {inputValue && (
        <div className="flex gap-6 items-start">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <Ghost className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-grow bg-red-50 border border-red-100 p-6 rounded-2xl relative shadow-md">
            <p className="font-bold text-sm mb-2 text-red-600">
              匿名黑客 (Attacker)
            </p>
            <div className="text-slate-600">
              {defenseMode === "none" ? (
                <span dangerouslySetInnerHTML={{ __html: inputValue }} />
              ) : (
                <span>{inputValue}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);

const DOMXSSDisplay = () => (
  <div className="pt-40 text-center space-y-8">
    <div className="inline-block p-10 bg-slate-50 border border-slate-200 rounded-[3rem]">
      <AlertCircle className="w-16 h-16 text-indigo-600 mx-auto mb-6" />
      <h2 className="text-2xl font-bold mb-4">404 - 路径未找到</h2>
      <p className="text-slate-500">
        资源路径{" "}
        <code className="bg-slate-200 px-2 py-1 rounded text-indigo-600">
          /vulnerable-site.com/dom#attack
        </code>{" "}
        异常。
      </p>
      <p className="text-xs text-slate-400 mt-4 italic">
        提示：检查 URL 中的 # 片段，脚本可能在此被执行。
      </p>
    </div>
  </div>
);

// --- 动画组件 ---

const CookieStealAnimation = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* 红色警示层 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-red-600"
      />

      <div className="relative w-full max-w-2xl h-96">
        {/* 受害者电脑 */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4">
          <div className="p-8 bg-white border-4 border-red-500 rounded-3xl shadow-2xl">
            <LaptopIcon className="w-20 h-20 text-red-600" />
          </div>
          <span className="text-white font-black uppercase text-sm bg-red-600 px-3 py-1 rounded-full">
            受害者浏览器
          </span>
        </div>

        {/* 黑客服务器 */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4">
          <div className="p-8 bg-[#0d1117] border-4 border-mozi-danger rounded-3xl shadow-2xl">
            <ServerIcon className="w-20 h-20 text-mozi-danger" />
          </div>
          <span className="text-white font-black uppercase text-sm bg-mozi-danger px-3 py-1 rounded-full">
            黑客接收端
          </span>
        </div>

        {/* 飞行的 Cookie */}
        <motion.div
          initial={{ left: "15%", opacity: 0, scale: 0.5 }}
          animate={{
            left: ["15%", "85%"],
            opacity: [0, 1, 1, 0],
            scale: [1, 2, 1],
            y: [0, -100, 0],
          }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
          onAnimationComplete={onComplete}
          className="absolute top-1/2 -translate-y-1/2 z-20"
        >
          <div className="p-5 bg-amber-500 rounded-full shadow-[0_0_50px_rgba(245,158,11,1)]">
            <Cookie className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -top-14 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black text-white px-4 py-2 rounded-xl text-xs font-mono font-bold border border-amber-500">
            AUTH_TOKEN_STOLEN!
          </div>
        </motion.div>

        {/* 激光束 */}
        <motion.div
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: [0, 1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="absolute top-1/2 left-[20%] right-[20%] h-1 bg-gradient-to-r from-red-500 via-amber-500 to-transparent blur-sm"
        />
      </div>
    </div>
  );
};

// --- 补全 Icon ---

const ServerIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
    <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
    <line x1="6" x2="6.01" y1="6" y2="6" />
    <line x1="6" x2="6.01" y1="18" y2="18" />
  </svg>
);

const LaptopIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="12" x="3" y="4" rx="2" ry="2" />
    <line x1="2" x2="22" y1="20" y2="20" />
  </svg>
);

export default XSSLab;
