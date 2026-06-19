import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Fingerprint,
  ShieldCheck,
  ShieldAlert,
  Play,
  Settings,
  RefreshCcw,
  Globe,
  Database,
  Lock,
  ExternalLink,
  Ghost,
  Cookie,
} from "lucide-react";

type SameSiteMode = "none" | "lax" | "strict";

const sameSiteExplanations: Record<
  SameSiteMode,
  {
    risk: string;
    summary: string;
    cookieDecision: string;
    serverDecision: string;
    badgeClass: string;
  }
> = {
  none: {
    risk: "高危",
    summary: "跨站 POST 请求会携带登录 Cookie，目标站点可能误判为本人操作。",
    cookieDecision: "Cookie 将被附加到跨站请求",
    serverDecision: "服务端看到有效会话，转账请求会被接受",
    badgeClass: "border-mozi-danger/40 bg-mozi-danger/10 text-mozi-danger",
  },
  lax: {
    risk: "中低风险",
    summary: "常规跨站表单 POST 不携带 Cookie，但顶级 GET 导航仍可能携带。",
    cookieDecision: "跨站 POST 不携带 Cookie",
    serverDecision: "服务端无法确认登录态，拒绝敏感操作",
    badgeClass: "border-amber-500/40 bg-amber-500/10 text-amber-500",
  },
  strict: {
    risk: "低风险",
    summary: "任何跨站请求都不携带 Cookie，安全性高但可能影响部分跳转体验。",
    cookieDecision: "跨站请求完全不携带 Cookie",
    serverDecision: "服务端收到未认证请求，直接拒绝",
    badgeClass: "border-mozi-safe/40 bg-mozi-safe/10 text-mozi-safe",
  },
};

const csrfTeachingCards = [
  {
    title: "漏洞成立条件",
    items: [
      "用户已在目标站点登录，浏览器保存了有效会话 Cookie",
      "目标接口只依赖 Cookie 识别身份，没有验证用户操作意图",
      "攻击者能诱导浏览器向目标站点发起跨站请求",
    ],
  },
  {
    title: "防御检查清单",
    items: [
      "敏感操作使用不可预测的 CSRF Token，并在服务端校验",
      "Cookie 设置 SameSite=Lax 或 Strict，生产环境 None 必须配合 Secure",
      "服务端校验 Origin/Referer，作为辅助防线而不是唯一防线",
      "转账、改密等高风险操作增加二次确认或重新认证",
    ],
  },
  {
    title: "常见误区",
    items: [
      "CORS 不是 CSRF 防御，简单表单请求不依赖读取响应也能造成影响",
      "只使用 POST 不等于安全，恶意站点同样可以提交表单",
      "SameSite 能降低风险，但复杂业务仍需要 Token 和服务端校验",
    ],
  },
];

const csrfReviewQuestions = [
  "这次攻击成功或失败，决定点发生在浏览器还是服务端？",
  "如果 SameSite=None，但接口要求 CSRF Token，结果会如何变化？",
  "为什么攻击者即使读不到响应，也可能造成资金或配置变更？",
];

const CSRFLab: React.FC = () => {
  const [sameSiteMode, setSameSiteMode] = useState<SameSiteMode>("none");
  const [balance, setBalance] = useState(10000);
  const [isAttacking, setIsAttacking] = useState(false);
  const [attackSuccess, setAttackSuccess] = useState<boolean | null>(null);
  const activeExplanation = sameSiteExplanations[sameSiteMode];

  const resetLab = () => {
    setBalance(10000);
    setAttackSuccess(null);
    setIsAttacking(false);
  };

  const handleAttack = () => {
    setIsAttacking(true);
    setAttackSuccess(null);

    // Simulate network delay and browser logic
    setTimeout(() => {
      setIsAttacking(false);
      if (sameSiteMode === "none") {
        setBalance(0);
        setAttackSuccess(true);
      } else {
        setAttackSuccess(false);
      }
    }, 2500);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-4 transition-colors duration-300 pb-6">
      {/* 头部信息 */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-mozi-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3 text-mozi-safe text-glow">
            <Fingerprint className="w-5 h-5" />
            <span className="font-mono text-xs tracking-widest uppercase">
              LAB_02 / AUTH_EXPLOITATION
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-mozi-text">
            CSRF 跨站请求伪造
          </h1>
          <p className="text-sm text-mozi-text-muted max-w-2xl">
            CSRF 攻击利用了浏览器“自动携带 Cookie”的特性。当用户在 A
            网站保持登录状态时，访问恶意网站 B，B 网站会在后台偷偷向 A
            网站发送请求。
          </p>
          <div
            className={`mt-4 inline-flex rounded-full border px-4 py-2 text-xs font-bold ${activeExplanation.badgeClass}`}
          >
            当前风险：{activeExplanation.risk} · {activeExplanation.summary}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 控制面板 */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-mozi-dark border border-mozi-border rounded-3xl p-4 space-y-4 shadow-lg">
            <div className="flex items-center gap-3 border-b border-mozi-border pb-3">
              <Settings className="w-5 h-5 text-mozi-safe" />
              <h3 className="font-bold uppercase text-sm tracking-tighter">
                防御配置 (Cookie 属性)
              </h3>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-mono text-mozi-text-muted uppercase tracking-widest">
                SameSite 策略
              </label>
              <div className="grid gap-2">
                {[
                  {
                    id: "none",
                    label: "SameSite=None",
                    desc: "允许所有跨站请求携带 Cookie。最危险，现代浏览器需配合 Secure 使用。",
                    color: "text-mozi-danger",
                  },
                  {
                    id: "lax",
                    label: "SameSite=Lax",
                    desc: "默认策略。仅在顶级导航（如点击链接）时允许携带。防御大部分 CSRF。",
                    color: "text-amber-500",
                  },
                  {
                    id: "strict",
                    label: "SameSite=Strict",
                    desc: "任何跨站请求（包括点击链接）都不携带 Cookie。最严格，可能影响体验。",
                    color: "text-mozi-safe",
                  },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setSameSiteMode(mode.id as SameSiteMode);
                      resetLab();
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      sameSiteMode === mode.id
                        ? "bg-mozi-black border-mozi-safe/50 ring-1 ring-offset-2 ring-offset-mozi-black ring-mozi-safe"
                        : "border-transparent bg-mozi-black/20 opacity-60 hover:opacity-100 hover:bg-mozi-black/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`font-bold font-mono ${sameSiteMode === mode.id ? mode.color : ""}`}
                      >
                        {mode.label}
                      </span>
                      {sameSiteMode === mode.id && (
                        <ShieldCheck className={`w-4 h-4 ${mode.color}`} />
                      )}
                    </div>
                    <p className="text-[10px] text-mozi-text-muted">
                      {mode.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAttack}
              disabled={isAttacking}
              className="w-full py-3 rounded-2xl bg-mozi-safe text-black font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 flex items-center justify-center gap-3"
            >
              {isAttacking ? (
                <RefreshCcw className="w-5 h-5 animate-spin" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              模拟诱导点击
            </button>
          </div>

          <div className="bg-mozi-dark border border-mozi-border rounded-3xl p-4 shadow-lg">
            <h4 className="text-xs font-mono text-mozi-text-muted uppercase tracking-widest mb-4">
              执行状态分析
            </h4>
            <div className="space-y-4 font-mono text-xs">
              <div className="flex justify-between items-center p-3 bg-mozi-black rounded-xl border border-mozi-border">
                <span className="text-mozi-text-muted">Target Origin</span>
                <span className="text-mozi-safe">bank.com</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-mozi-black rounded-xl border border-mozi-border">
                <span className="text-mozi-text-muted">Attacker Origin</span>
                <span className="text-mozi-danger">evil.com</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-mozi-black rounded-xl border border-mozi-border">
                <span className="text-mozi-text-muted">Cookie Policy</span>
                <span
                  className={`font-bold ${sameSiteMode === "none" ? "text-mozi-danger" : "text-mozi-safe"}`}
                >
                  SameSite={sameSiteMode.toUpperCase()}
                </span>
              </div>
              <div className="rounded-xl border border-mozi-border bg-mozi-black p-4">
                <div className="mb-3 text-[10px] uppercase tracking-widest text-mozi-text-muted">
                  Browser Decision Chain
                </div>
                <div className="space-y-3">
                  {[
                    ["1", "跨站请求来源", "evil-site.com -> secure-bank.com"],
                    ["2", "Cookie 判定", activeExplanation.cookieDecision],
                    ["3", "服务端结果", activeExplanation.serverDecision],
                  ].map(([step, label, value]) => (
                    <div key={step} className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mozi-dark text-[10px] text-mozi-safe">
                        {step}
                      </span>
                      <div>
                        <div className="text-mozi-text">{label}</div>
                        <div className="text-[10px] leading-5 text-mozi-text-muted">
                          {value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <details className="rounded-3xl border border-mozi-border bg-mozi-dark p-4">
            <summary className="cursor-pointer text-sm font-black text-mozi-text">
              教学要点 / 防御清单 / 复盘问题
            </summary>
            <div className="mt-4 space-y-4">
              {csrfTeachingCards.map((card) => (
                <div key={card.title}>
                  <h4 className="mb-3 text-xs font-black text-mozi-text">
                    {card.title}
                  </h4>
                  <div className="space-y-2">
                    {card.items.map((item) => (
                      <div key={item} className="flex gap-2 text-xs leading-5">
                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-mozi-safe" />
                        <span className="text-mozi-text-muted">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="rounded-2xl border border-mozi-safe/30 bg-mozi-safe/10 p-3">
                <h4 className="mb-3 text-xs font-black text-mozi-safe">
                  复盘问题
                </h4>
                <div className="space-y-2">
                  {csrfReviewQuestions.map((question, index) => (
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

        {/* 模拟舞台：双屏视图 */}
        <div className="lg:col-span-8 bg-mozi-black border border-mozi-border rounded-3xl p-4 shadow-2xl relative overflow-hidden grid gap-4 lg:grid-cols-2 min-h-[420px]">
          <AnimatePresence>
            {isAttacking && <AttackAnimation mode={sameSiteMode} />}
          </AnimatePresence>

          {/* 目标网站 (银行) */}
          <div className="bg-[#f8fafc] dark:bg-[#0d1117] rounded-3xl border border-mozi-border overflow-hidden flex flex-col relative z-10 min-h-[360px]">
            <div className="bg-mozi-safe/10 border-b border-mozi-safe/20 px-6 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-mozi-safe" />
                <span className="font-mono text-sm font-bold text-mozi-safe">
                  https://secure-bank.com
                </span>
              </div>
              <div className="flex gap-2">
                <div className="px-3 py-1 bg-mozi-safe text-white text-[10px] font-bold rounded-full">
                  登录状态：有效
                </div>
              </div>
            </div>

            <div className="flex-1 p-5 flex flex-col items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-2 border-4 border-blue-200 dark:border-blue-800">
                  <Database className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-200">
                  我的账户
                </h2>
                <div className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm min-w-[260px]">
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-2 uppercase tracking-widest font-mono">
                    可用余额
                  </p>
                  <p
                    className={`text-4xl font-mono font-black ${balance === 0 ? "text-mozi-danger" : "text-slate-800 dark:text-slate-100"}`}
                  >
                    ${balance.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 恶意网站 (诱导页) */}
          <div className="bg-[#fff1f2] dark:bg-[#1a0f14] rounded-3xl border border-mozi-border overflow-hidden flex flex-col relative z-10 min-h-[360px]">
            <div className="bg-mozi-danger/10 border-b border-mozi-danger/20 px-6 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-mozi-danger" />
                <span className="font-mono text-sm font-bold text-mozi-danger">
                  https://evil-site.com
                </span>
              </div>
              <Ghost className="w-4 h-4 text-mozi-danger opacity-50" />
            </div>

            <div className="flex-1 p-5 flex flex-col items-center justify-center relative">
              <div className="max-w-md text-center space-y-4 relative z-10">
                <h2 className="text-2xl font-black text-rose-600 dark:text-rose-400">
                  🎉 恭喜您中奖了！
                </h2>
                <p className="text-rose-500/80 dark:text-rose-300/80">
                  点击下方按钮即可领取最新款智能手机一台。数量有限，先到先得！
                </p>

                <div className="relative group inline-block">
                  <button className="px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl shadow-xl transition-all scale-105 animate-pulse">
                    立即领取奖品
                  </button>
                  <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-mozi-black text-mozi-text font-mono text-[10px] p-3 rounded-lg border border-mozi-border shadow-2xl">
                      <span className="text-mozi-text-muted">
                        隐藏的恶意表单提交:
                      </span>
                      <br />
                      <code className="text-mozi-danger">
                        POST https://secure-bank.com/transfer
                      </code>
                      <br />
                      <code>
                        {"{"} to: 'hacker', amount: 10000 {"}"}
                      </code>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Overlay after attack attempt */}
              <AnimatePresence>
                {attackSuccess !== null && !isAttacking && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 bg-white/90 dark:bg-black/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-8 text-center"
                  >
                    {attackSuccess ? (
                      <>
                        <ShieldAlert className="w-20 h-20 text-mozi-danger mb-6 animate-bounce" />
                        <h3 className="text-3xl font-black text-mozi-danger mb-4">
                          CSRF 攻击成功！
                        </h3>
                        <p className="text-mozi-text max-w-md">
                          因为 SameSite 设置为 None，浏览器在处理 evil.com 发往
                          bank.com 的转账请求时，
                          <strong className="text-amber-500">
                            自动带上了银行的 Cookie
                          </strong>
                          。银行服务器认为这是用户的合法操作，执行了转账。
                        </p>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-20 h-20 text-mozi-safe mb-6" />
                        <h3 className="text-3xl font-black text-mozi-safe mb-4">
                          攻击被拦截！
                        </h3>
                        <p className="text-mozi-text max-w-md">
                          由于 SameSite 设置为{" "}
                          <strong>{sameSiteMode.toUpperCase()}</strong>
                          ，浏览器识别到这是跨站请求，
                          <strong className="text-mozi-safe">
                            拒绝携带 Cookie
                          </strong>
                          。银行服务器因验证失败（未登录）拒绝了转账请求。
                        </p>
                      </>
                    )}
                    <button
                      onClick={resetLab}
                      className="mt-8 px-6 py-3 border border-mozi-border rounded-xl text-mozi-text hover:bg-mozi-dark transition-colors"
                    >
                      重置实验
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AttackAnimation = ({ mode }: { mode: SameSiteMode }) => {
  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      {/* 动画中心连接线 */}
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: "100%" }}
        className="absolute left-1/2 -translate-x-1/2 top-0 border-l-2 border-dashed border-mozi-danger/50"
      />

      {/* 请求包从下方（Evil）飞向 上方（Bank） */}
      <motion.div
        initial={{ top: "80%", left: "50%", x: "-50%", opacity: 0 }}
        animate={{ top: "20%", opacity: [0, 1, 1, 0] }}
        transition={{ duration: 2, ease: "easeInOut" }}
        className="absolute flex flex-col items-center gap-2"
      >
        <div className="p-3 bg-mozi-danger text-white rounded-xl shadow-xl flex items-center gap-2">
          <ExternalLink className="w-4 h-4" />
          <span className="font-mono text-xs font-bold">POST /transfer</span>
        </div>
        <div className="flex gap-2">
          <div className="px-2 py-1 bg-mozi-black border border-mozi-danger/50 rounded font-mono text-[10px] text-mozi-danger">
            [Payload: $10000]
          </div>
          {/* Cookie 携带状态演示 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className={`px-2 py-1 bg-mozi-black border rounded font-mono text-[10px] flex items-center gap-1 ${
              mode === "none"
                ? "border-amber-500 text-amber-500"
                : "border-mozi-border text-mozi-text-muted line-through"
            }`}
          >
            <Cookie className="w-3 h-3" />
            {mode === "none" ? "Cookie: session=ok" : "Blocked by SameSite"}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default CSRFLab;
