import React from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  Fingerprint,
  Zap,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { Link } from "react-router-dom";

const modules = [
  {
    id: "fundamentals",
    title: "Web 核心原理",
    description:
      "在深入安全之前，先理解 HTTP、Cookie 以及浏览器同源策略的工作方式。",
    icon: <BookOpen className="w-8 h-8 text-mozi-accent" />,
    path: "/fundamentals",
    color: "border-mozi-accent/20 bg-mozi-dark hover:border-mozi-accent/50",
    featured: true,
  },
  {
    id: "xss",
    title: "XSS 跨站脚本攻击",
    description: "通过注入恶意脚本在用户浏览器中执行，窃取敏感信息。",
    icon: <Zap className="w-8 h-8 text-mozi-accent" />,
    path: "/xss",
    color: "border-mozi-accent/20 bg-mozi-dark hover:border-mozi-accent/50",
    featured: false,
  },
  {
    id: "csrf",
    title: "CSRF 跨站请求伪造",
    description: "利用用户的登录状态，在用户不知情的情况下发起恶意请求。",
    icon: <Fingerprint className="w-8 h-8 text-mozi-safe" />,
    path: "/csrf",
    color: "border-mozi-safe/20 bg-mozi-dark hover:border-mozi-safe/50",
    featured: false,
  },
];

const Home: React.FC = () => {
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
          <ShieldAlert className="w-24 h-24 text-mozi-accent relative" />
        </motion.div>

        <div className="space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-mozi-text"
          >
            可视化 <span className="mozi-gradient-text">Web 安全</span> 培训
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg text-mozi-text-muted max-w-2xl mx-auto"
          >
            通过动态演示与交互式实验，深入浅出地讲解核心安全漏洞。动画为主，文字为辅，助你掌握防御之道。
          </motion.p>
        </div>
      </section>

      {/* Module Grid */}
      <section className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {modules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 * index }}
              className={module.featured ? "md:col-span-12" : "md:col-span-6"}
            >
              <Link
                to={module.path}
                className={`block p-8 rounded-3xl border ${module.color} transition-all duration-300 group relative overflow-hidden h-full shadow-lg hover:shadow-xl`}
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  {module.icon}
                </div>

                <div
                  className={`flex flex-col md:flex-row gap-8 ${module.featured ? "items-center" : ""}`}
                >
                  <div
                    className={`p-4 rounded-2xl bg-mozi-black border border-mozi-border w-fit h-fit transition-colors duration-300`}
                  >
                    {module.icon}
                  </div>

                  <div className="space-y-4 flex-grow text-mozi-text">
                    <div className="flex items-center gap-3">
                      <h3
                        className={`${module.featured ? "text-3xl" : "text-2xl"} font-bold`}
                      >
                        {module.title}
                      </h3>
                      {module.featured && (
                        <span className="px-3 py-1 rounded-full bg-mozi-accent/20 text-mozi-accent text-xs font-bold border border-mozi-accent/30">
                          推荐首选
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-mozi-text-muted leading-relaxed ${module.featured ? "text-lg max-w-2xl" : ""}`}
                    >
                      {module.description}
                    </p>

                    <div className="pt-2 flex items-center gap-2 text-sm font-medium text-mozi-accent">
                      进入学习{" "}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
