import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Fingerprint, Lock, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const modules = [
  {
    id: 'xss',
    title: 'XSS 跨站脚本攻击',
    description: '通过注入恶意脚本在用户浏览器中执行，窃取敏感信息。',
    icon: <Zap className="w-8 h-8 text-mozi-accent" />,
    path: '/xss',
    color: 'border-mozi-accent/30 hover:border-mozi-accent'
  },
  {
    id: 'csrf',
    title: 'CSRF 跨站请求伪造',
    description: '利用用户的登录状态，在用户不知情的情况下发起恶意请求。',
    icon: <Fingerprint className="w-8 h-8 text-mozi-safe" />,
    path: '/csrf',
    color: 'border-mozi-safe/30 hover:border-mozi-safe'
  },
  {
    id: 'sqli',
    title: 'SQL 注入 (即将上线)',
    description: '通过在数据库查询中注入恶意指令来窃取或破坏数据。',
    icon: <Lock className="w-8 h-8 text-mozi-danger" />,
    path: '#',
    color: 'border-mozi-danger/30 hover:border-mozi-danger opacity-60'
  }
];

const Home: React.FC = () => {
  return (
    <div className="space-y-20">
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
            className="text-5xl md:text-7xl font-bold tracking-tight"
          >
            可视化 <span className="mozi-gradient-text">Web 安全</span> 培训
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg text-mozi-text/60 max-w-2xl mx-auto"
          >
            通过动态演示与交互式实验，深入浅出地讲解核心安全漏洞。动画为主，文字为辅，助你掌握防御之道。
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <button className="px-8 py-4 rounded-full bg-mozi-accent text-mozi-black font-bold text-lg hover:scale-105 transition-all shadow-[0_0_30px_rgba(0,242,255,0.4)]">
            立即开始
          </button>
        </motion.div>
      </section>

      {/* Module Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
        {modules.map((module, index) => (
          <motion.div
            key={module.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 * index }}
          >
            <Link
              to={module.path}
              className={`block p-8 rounded-2xl bg-mozi-grey/30 border ${module.color} transition-all duration-300 group relative overflow-hidden h-full`}
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                {module.icon}
              </div>

              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-mozi-black w-fit border border-white/5">
                  {module.icon}
                </div>
                <h3 className="text-2xl font-bold">{module.title}</h3>
                <p className="text-mozi-text/50 leading-relaxed">
                  {module.description}
                </p>

                <div className="pt-4 flex items-center gap-2 text-sm font-medium text-mozi-accent">
                  进入实验 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </section>
    </div>
  );
};

export default Home;
