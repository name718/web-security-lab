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

const CSRFLab: React.FC = () => {
  const [sameSiteMode, setSameSiteMode] = useState<SameSiteMode>("none");
  const [balance, setBalance] = useState(10000);
  const [isAttacking, setIsAttacking] = useState(false);
  const [attackSuccess, setAttackSuccess] = useState<boolean | null>(null);

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
    <div className="max-w-[1600px] mx-auto space-y-8 transition-colors duration-300 pb-20">
      {/* 头部信息 */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-mozi-border pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-mozi-safe text-glow">
            <Fingerprint className="w-6 h-6" />
            <span className="font-mono text-sm tracking-widest uppercase">
              LAB_02 / AUTH_EXPLOITATION
            </span>
          </div>
          <h1 className="text-5xl font-black tracking-tight text-mozi-text">
            CSRF 跨站请求伪造
          </h1>
          <p className="text-mozi-text-muted max-w-2xl">
            CSRF 攻击利用了浏览器“自动携带 Cookie”的特性。当用户在 A
            网站保持登录状态时，访问恶意网站 B，B 网站会在后台偷偷向 A
            网站发送请求。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 控制面板 */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-mozi-dark border border-mozi-border rounded-[2.5rem] p-8 space-y-8 shadow-lg">
            <div className="flex items-center gap-3 border-b border-mozi-border pb-4">
              <Settings className="w-5 h-5 text-mozi-safe" />
              <h3 className="font-bold uppercase text-sm tracking-tighter">
                防御配置 (Cookie 属性)
              </h3>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-mono text-mozi-text-muted uppercase tracking-widest">
                SameSite 策略
              </label>
              <div className="grid gap-3">
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
                    className={`p-4 rounded-2xl border text-left transition-all ${
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
              className="w-full py-5 rounded-2xl bg-mozi-safe text-black font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 flex items-center justify-center gap-3"
            >
              {isAttacking ? (
                <RefreshCcw className="w-5 h-5 animate-spin" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              模拟诱导点击
            </button>
          </div>

          <div className="bg-mozi-dark border border-mozi-border rounded-3xl p-8 shadow-lg">
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
            </div>
          </div>
        </div>

        {/* 模拟舞台：双屏视图 */}
        <div className="lg:col-span-8 bg-mozi-black border border-mozi-border rounded-[3rem] p-8 shadow-2xl relative overflow-hidden flex flex-col gap-8 min-h-[800px]">
          <AnimatePresence>
            {isAttacking && <AttackAnimation mode={sameSiteMode} />}
          </AnimatePresence>

          {/* 目标网站 (银行) */}
          <div className="flex-1 bg-[#f8fafc] dark:bg-[#0d1117] rounded-3xl border border-mozi-border overflow-hidden flex flex-col relative z-10">
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

            <div className="flex-1 p-8 flex flex-col items-center justify-center">
              <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-blue-200 dark:border-blue-800">
                  <Database className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-slate-200">
                  我的账户
                </h2>
                <div className="p-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm min-w-[300px]">
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-2 uppercase tracking-widest font-mono">
                    可用余额
                  </p>
                  <p
                    className={`text-5xl font-mono font-black ${balance === 0 ? "text-mozi-danger" : "text-slate-800 dark:text-slate-100"}`}
                  >
                    ${balance.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 恶意网站 (诱导页) */}
          <div className="flex-1 bg-[#fff1f2] dark:bg-[#1a0f14] rounded-3xl border border-mozi-border overflow-hidden flex flex-col relative z-10">
            <div className="bg-mozi-danger/10 border-b border-mozi-danger/20 px-6 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-mozi-danger" />
                <span className="font-mono text-sm font-bold text-mozi-danger">
                  https://evil-site.com
                </span>
              </div>
              <Ghost className="w-4 h-4 text-mozi-danger opacity-50" />
            </div>

            <div className="flex-1 p-8 flex flex-col items-center justify-center relative">
              <div className="max-w-md text-center space-y-6 relative z-10">
                <h2 className="text-3xl font-black text-rose-600 dark:text-rose-400">
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
