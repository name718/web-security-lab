import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, FlaskConical, Route } from "lucide-react";
import { Link } from "react-router-dom";
import { moduleStats, platformSummary, visibleModules } from "../content/modules";

const toneClasses = {
  accent: {
    icon: "text-mozi-accent",
    card: "border-mozi-accent/20 bg-mozi-dark hover:border-mozi-accent/50",
    cta: "text-mozi-accent",
  },
  safe: {
    icon: "text-mozi-safe",
    card: "border-mozi-safe/20 bg-mozi-dark hover:border-mozi-safe/50",
    cta: "text-mozi-safe",
  },
  danger: {
    icon: "text-mozi-danger",
    card: "border-mozi-danger/20 bg-mozi-dark hover:border-mozi-danger/50",
    cta: "text-mozi-danger",
  },
};

const Home: React.FC = () => {
  const HeroIcon = platformSummary.icon;
  const learningPath = [
    "先建立 HTTP、Cookie、SOP 的共同语言",
    "再进入漏洞沙箱观察攻击链路",
    "最后切换防御策略验证修复效果",
  ];
  const learningOutcomes = [
    "能判断用户输入进入了哪类浏览器上下文",
    "能解释 Cookie、SameSite、同源策略在攻击链中的作用",
    "能区分黑名单过滤、上下文编码、CSP、Token 校验的边界",
    "能把漏洞现象映射回具体源码 sink 和修复策略",
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="text-center space-y-8 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative inline-block"
        >
          <div className="absolute -inset-1 bg-mozi-accent/20 blur-2xl rounded-full"></div>
          <HeroIcon className="w-24 h-24 text-mozi-accent relative" />
        </motion.div>

        <div className="space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-mozi-text"
          >
            {platformSummary.title.split("Web")[0]}
            <span className="mozi-gradient-text">Web 安全</span> 培训
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg text-mozi-text-muted max-w-2xl mx-auto"
          >
            {platformSummary.subtitle}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mx-auto grid max-w-4xl grid-cols-1 gap-3 md:grid-cols-3"
        >
          {[
            [moduleStats.total.toString(), "核心课程模块"],
            [moduleStats.labs.toString(), "可交互漏洞实验"],
            [moduleStats.safeExecution.toString(), "默认真实脚本执行"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="rounded-2xl border border-mozi-border bg-mozi-dark/70 px-6 py-4"
            >
              <div className="text-3xl font-black text-mozi-text">{value}</div>
              <div className="text-xs font-mono uppercase tracking-widest text-mozi-text-muted">
                {label}
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      <section className="mx-auto max-w-6xl rounded-[2rem] border border-mozi-border bg-mozi-black p-6">
        <div className="mb-5">
          <p className="font-mono text-xs uppercase tracking-widest text-mozi-accent">
            Learning Outcomes
          </p>
          <h2 className="mt-2 text-2xl font-black text-mozi-text">
            学完后你应该能做到
          </h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {learningOutcomes.map((outcome) => (
            <div
              key={outcome}
              className="flex gap-3 rounded-2xl border border-mozi-border bg-mozi-dark p-4"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-mozi-safe" />
              <span className="text-sm leading-6 text-mozi-text-muted">
                {outcome}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl rounded-[2rem] border border-mozi-border bg-mozi-dark p-6 shadow-xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl border border-mozi-accent/30 bg-mozi-accent/10 p-3">
            <Route className="h-6 w-6 text-mozi-accent" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-mozi-text">推荐学习路径</h2>
            <p className="text-sm text-mozi-text-muted">
              每个实验都按“观察现象 → 审计代码 → 切换防御”设计。
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {learningPath.map((item, index) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="relative overflow-hidden rounded-2xl border border-mozi-border bg-mozi-black p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="font-mono text-xs text-mozi-text-muted">
                  STEP 0{index + 1}
                </span>
                <CheckCircle2 className="h-5 w-5 text-mozi-safe" />
              </div>
              <p className="text-sm leading-6 text-mozi-text">{item}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Module Grid */}
      <section className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center gap-3">
          <FlaskConical className="h-5 w-5 text-mozi-accent" />
          <h2 className="text-2xl font-black text-mozi-text">实验模块</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {visibleModules.map((module, index) => {
            const Icon = module.icon;
            const classes = toneClasses[module.tone];
            const featured = module.status === "recommended";

            return (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 * index }}
              className={featured ? "md:col-span-12" : "md:col-span-6"}
            >
              <Link
                to={module.path}
                className={`block p-8 rounded-3xl border ${classes.card} transition-all duration-300 group relative overflow-hidden h-full shadow-lg hover:shadow-xl`}
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Icon className={`w-8 h-8 ${classes.icon}`} />
                </div>

                <div
                  className={`flex flex-col md:flex-row gap-8 ${featured ? "items-center" : ""}`}
                >
                  <div
                    className={`p-4 rounded-2xl bg-mozi-black border border-mozi-border w-fit h-fit transition-colors duration-300`}
                  >
                    <Icon className={`w-8 h-8 ${classes.icon}`} />
                  </div>

                  <div className="space-y-4 flex-grow text-mozi-text">
                    <div className="flex items-center gap-3">
                      <h3
                        className={`${featured ? "text-3xl" : "text-2xl"} font-bold`}
                      >
                        {module.title}
                      </h3>
                      {featured && (
                        <span className="px-3 py-1 rounded-full bg-mozi-accent/20 text-mozi-accent text-xs font-bold border border-mozi-accent/30">
                          推荐首选
                        </span>
                      )}
                      {!featured && (
                        <span className="px-3 py-1 rounded-full bg-mozi-black text-mozi-text-muted text-xs font-bold border border-mozi-border">
                          可实验
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-mozi-text-muted leading-relaxed ${featured ? "text-lg max-w-2xl" : ""}`}
                    >
                      {module.description}
                    </p>

                    <div
                      className={`pt-2 flex items-center gap-2 text-sm font-medium ${classes.cta}`}
                    >
                      进入学习{" "}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
          })}
        </div>
      </section>
    </div>
  );
};

export default Home;
