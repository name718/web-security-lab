import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  Activity,
  ShieldCheck,
  Globe,
  Database,
  Lock,
  ArrowRight,
  RefreshCcw,
  Server as ServerIcon,
  Laptop as LaptopIcon,
  Cookie as CookieIcon,
  AlertTriangle,
  Zap,
} from "lucide-react";

// --- Types ---
type StepId = "tcp" | "http" | "cookies" | "sop";

interface Step {
  id: StepId;
  title: string;
  subtitle: string;
}

interface TCPMessage {
  id: number;
  label: string;
  from: "client" | "server";
  to: "client" | "server";
  flags: string;
  seq: number;
  ack: number;
  len?: number;
  clientNext?: string;
  serverNext?: string;
  desc: string;
}

interface DNSNodeProps {
  label: string;
  sub?: string;
  icon: React.ReactNode;
  color: string;
}

const steps: Step[] = [
  {
    id: "tcp",
    title: "TCP 传输层",
    subtitle: "从握手到高可靠数据传输全生命周期",
  },
  {
    id: "http",
    title: "HTTP 应用层",
    subtitle: "从递归/迭代查询到数据封装",
  },
  {
    id: "cookies",
    title: "会话管理机制",
    subtitle: "Cookie 属性与状态持久化",
  },
  {
    id: "sop",
    title: "同源策略 (SOP)",
    subtitle: "Web 安全边界与 CORS 机制",
  },
];

const Fundamentals: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const currentStep = steps[currentIdx];

  return (
    <div className="min-h-screen bg-mozi-black text-mozi-text font-sans selection:bg-cyan-500/30 pb-20 transition-colors duration-300">
      {/* Top Professional Navigation */}
      <nav className="border-b border-mozi-border bg-mozi-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-mozi-accent/10 rounded-lg border border-mozi-accent/30">
              <Activity className="w-6 h-6 text-mozi-accent" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tighter uppercase">
                协议分析仪 v2.0
              </h1>
              <p className="text-[10px] font-mono text-mozi-text-muted tracking-widest uppercase">
                System Core / Fundamentals
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-mozi-dark p-1 rounded-xl border border-mozi-border">
            {steps.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentIdx(idx)}
                className={`px-6 py-2 rounded-lg text-xs font-mono transition-all ${
                  idx === currentIdx
                    ? "bg-mozi-accent text-black font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                    : "hover:bg-mozi-black/10 text-mozi-text-muted"
                }`}
              >
                {s.title.split(" ")[0]}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-6 text-[10px] font-mono text-mozi-text-muted tracking-widest">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-mozi-safe animate-pulse" />
              系统就绪
            </div>
            <div>运行时间: 12:44:02</div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto px-8 py-12 text-mozi-text">
        <div className="mb-12">
          <h2 className="text-4xl font-black tracking-tight mb-2 uppercase">
            {currentStep.title}
          </h2>
          <p className="text-mozi-text-muted font-mono text-sm tracking-widest">
            {currentStep.subtitle}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {currentStep.id === "tcp" && <TCPProModule />}
            {currentStep.id === "http" && <HTTPProModule />}
            {currentStep.id === "cookies" && <CookieProModule />}
            {currentStep.id === "sop" && <SOPProModule />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

// --- Professional TCP Module ---

const TCPProModule = () => {
  const [messages, setMessages] = useState<TCPMessage[]>([]);
  const [clientState, setClientState] = useState("CLOSED");
  const [serverState, setServerState] = useState("LISTEN");
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<"handshake" | "data" | "teardown">(
    "handshake",
  );

  const handshakeSteps: TCPMessage[] = [
    {
      id: 1,
      label: "SYN",
      from: "client",
      to: "server",
      flags: "SYN",
      seq: 0,
      ack: 0,
      clientNext: "SYN_SENT",
      serverNext: "SYN_RECEIVED",
      desc: "客户端发送 SYN 包，请求同步。Seq=0。",
    },
    {
      id: 2,
      label: "SYN, ACK",
      from: "server",
      to: "client",
      flags: "SYN, ACK",
      seq: 0,
      ack: 1,
      clientNext: "ESTABLISHED",
      serverNext: "SYN_RECEIVED",
      desc: "服务端确认 SYN 并发送自己的同步信号。Ack=1, Seq=0。",
    },
    {
      id: 3,
      label: "ACK",
      from: "client",
      to: "server",
      flags: "ACK",
      seq: 1,
      ack: 1,
      clientNext: "ESTABLISHED",
      serverNext: "ESTABLISHED",
      desc: "客户端确认。连接已建立 (ESTABLISHED休)。",
    },
  ];

  const dataSteps: TCPMessage[] = [
    {
      id: 4,
      label: "DATA",
      from: "client",
      to: "server",
      flags: "PSH, ACK",
      seq: 1,
      ack: 1,
      len: 512,
      desc: "客户端通过建立好的通道发送 512 字节的数据内容。",
    },
    {
      id: 5,
      label: "ACK",
      from: "server",
      to: "client",
      flags: "ACK",
      seq: 1,
      ack: 513,
      desc: "服务端确认收到。期望下一包 Seq=513。",
    },
    {
      id: 6,
      label: "DATA",
      from: "server",
      to: "client",
      flags: "PSH, ACK",
      seq: 1,
      ack: 513,
      len: 1024,
      desc: "服务端返回 1024 字节的响应数据。",
    },
    {
      id: 7,
      label: "ACK",
      from: "client",
      to: "server",
      flags: "ACK",
      seq: 513,
      ack: 1025,
      desc: "客户端确认收到服务端数据。",
    },
  ];

  const teardownSteps: TCPMessage[] = [
    {
      id: 8,
      label: "FIN",
      from: "client",
      to: "server",
      flags: "FIN, ACK",
      seq: 513,
      ack: 1025,
      clientNext: "FIN_WAIT_1",
      serverNext: "CLOSE_WAIT",
      desc: "客户端任务完成，申请关闭连接。",
    },
    {
      id: 9,
      label: "ACK",
      from: "server",
      to: "client",
      flags: "ACK",
      seq: 1025,
      ack: 514,
      clientNext: "FIN_WAIT_2",
      serverNext: "CLOSE_WAIT",
      desc: "服务端收到关闭申请，回复 ACK。",
    },
    {
      id: 10,
      label: "FIN",
      from: "server",
      to: "client",
      flags: "FIN, ACK",
      seq: 1025,
      ack: 514,
      clientNext: "TIME_WAIT",
      serverNext: "LAST_ACK",
      desc: "服务端处理完剩余数据，也申请关闭连接。",
    },
    {
      id: 11,
      label: "ACK",
      from: "client",
      to: "server",
      flags: "ACK",
      seq: 514,
      ack: 1026,
      clientNext: "CLOSED",
      serverNext: "CLOSED",
      desc: "客户端最后确认。四次挥手结束，连接彻底关闭。",
    },
  ];

  const currentSteps =
    phase === "handshake"
      ? handshakeSteps
      : phase === "data"
        ? dataSteps
        : teardownSteps;

  const triggerNext = () => {
    if (step >= currentSteps.length) return;
    const s = currentSteps[step];
    setMessages([...messages, s]);
    if (s.clientNext) setClientState(s.clientNext);
    if (s.serverNext) setServerState(s.serverNext);
    setStep(step + 1);
  };

  const switchPhase = (p: "handshake" | "data" | "teardown") => {
    setPhase(p);
    setStep(0);
    setMessages([]);
    if (p === "handshake") {
      setClientState("CLOSED");
      setServerState("LISTEN");
    }
    if (p === "data") {
      setClientState("ESTABLISHED");
      setServerState("ESTABLISHED");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8 bg-mozi-black border border-mozi-border rounded-[2rem] p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-mozi-accent/50 to-transparent"></div>

        {/* Phase Tabs */}
        <div className="flex gap-2 mb-12 bg-mozi-dark/50 p-1 rounded-xl border border-mozi-border w-fit mx-auto">
          {(["handshake", "data", "teardown"] as const).map((p) => (
            <button
              key={p}
              onClick={() => switchPhase(p)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-mono transition-all ${phase === p ? "bg-mozi-accent text-black font-bold" : "text-mozi-text-muted hover:text-mozi-text"}`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center mb-16 px-12 relative z-10">
          <div className="text-center">
            <div className="p-4 bg-mozi-accent/10 rounded-2xl border border-mozi-accent/30 mb-3">
              <LaptopIcon className="w-10 h-10 text-mozi-accent" />
            </div>
            <p className="font-mono text-[10px] tracking-widest text-mozi-accent/50 uppercase">
              本地端点
            </p>
            <p className="text-xl font-bold">192.168.1.5</p>
            <div className="mt-2 inline-block px-3 py-1 bg-mozi-accent/20 rounded border border-mozi-accent/30 font-mono text-[10px] text-mozi-accent uppercase">
              {clientState}
            </div>
          </div>
          <div className="flex-grow mx-12 flex flex-col items-center">
            <div className="w-full h-[1px] bg-mozi-border relative">
              <div className="absolute inset-0 bg-gradient-to-r from-mozi-accent/0 via-mozi-accent/20 to-mozi-accent/0 animate-pulse"></div>
            </div>
          </div>
          <div className="text-center">
            <div className="p-4 bg-mozi-safe/10 rounded-2xl border border-mozi-safe/30 mb-3">
              <ServerIcon className="w-10 h-10 text-mozi-safe" />
            </div>
            <p className="font-mono text-[10px] tracking-widest text-mozi-safe/50 uppercase">
              远程目标
            </p>
            <p className="text-xl font-bold">104.22.12.8</p>
            <div className="mt-2 inline-block px-3 py-1 bg-mozi-safe/20 rounded border border-mozi-safe/30 font-mono text-[10px] text-mozi-safe uppercase">
              {serverState}
            </div>
          </div>
        </div>

        <div className="relative min-h-[450px] border-x border-mozi-border mx-16 md:mx-32 py-8 overflow-y-auto max-h-[500px]">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative mb-8 flex ${m.from === "client" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`w-full h-[1px] absolute top-1/2 -translate-y-1/2 ${m.from === "client" ? "bg-gradient-to-r" : "bg-gradient-to-l"} from-white/0 via-mozi-text/20 to-white/0`}
                ></div>
                <div
                  className={`relative z-10 px-6 py-3 rounded-xl border bg-mozi-black/80 backdrop-blur-md ${m.from === "client" ? "border-mozi-accent/30" : "border-mozi-safe/30"}`}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <span
                      className={`font-mono text-xs font-black ${m.from === "client" ? "text-mozi-accent" : "text-mozi-safe"}`}
                    >
                      [{m.flags}]
                    </span>
                    {m.len && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded">
                        LEN:{m.len}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-4 text-[10px] font-mono opacity-60">
                    <span>Seq={m.seq}</span>
                    <span>Ack={m.ack}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="lg:col-span-4 space-y-6">
        <div className="bg-mozi-dark border border-mozi-border rounded-3xl p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-mozi-border pb-4">
            <Terminal className="w-5 h-5 text-mozi-accent" />
            <h3 className="font-bold uppercase text-sm">协议栈控制</h3>
          </div>
          <div className="space-y-4">
            <div className="bg-mozi-black rounded-2xl p-6 border border-mozi-border">
              <h4 className="text-xs font-mono text-mozi-text-muted uppercase tracking-widest mb-2">
                流描述
              </h4>
              <p className="text-sm leading-relaxed min-h-[60px]">
                {step === 0
                  ? `当前处于 ${phase.toUpperCase()} 阶段。点击下方按钮开始模拟数据流。`
                  : currentSteps[step - 1].desc}
              </p>
            </div>
            <button
              onClick={triggerNext}
              disabled={step >= currentSteps.length}
              className="w-full py-4 rounded-xl bg-mozi-accent text-black font-black uppercase tracking-widest text-xs hover:scale-[1.02] disabled:opacity-20 transition-all"
            >
              {step === 0
                ? "开始传输"
                : step === currentSteps.length
                  ? "传输完成"
                  : "发送下一包"}
            </button>
          </div>
        </div>

        <div className="bg-mozi-dark border border-mozi-border rounded-3xl p-8">
          <h4 className="text-xs font-mono text-mozi-text-muted uppercase tracking-widest mb-4">
            TCP 核心原理笔记
          </h4>
          <div className="space-y-4 text-xs leading-relaxed text-mozi-text-muted">
            <p>
              <strong className="text-mozi-accent">确认机制：</strong> TCP 通过
              Seq 和 Ack 保证不丢包。收到数据必须回复 ACK，否则会重传。
            </p>
            <p>
              <strong className="text-mozi-accent">流量控制：</strong> 通过
              Window Size 告知对方自己的处理能力，防止被数据淹没。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Professional HTTP Module (Improved DNS) ---

const HTTPProModule = () => {
  const [subStep, setSubStep] = useState(0);

  return (
    <div className="space-y-8">
      <div className="flex gap-4 mb-8">
        {["DNS 查询 (递归+迭代)", "协议封装", "HTTP 报文"].map((t, idx) => (
          <button
            key={t}
            onClick={() => setSubStep(idx)}
            className={`px-4 py-2 rounded-lg font-mono text-xs border transition-all ${subStep === idx ? "bg-mozi-accent/10 border-mozi-accent text-mozi-accent font-bold" : "border-mozi-border text-mozi-text-muted hover:bg-mozi-dark"}`}
          >
            STEP_0{idx + 1}: {t}
          </button>
        ))}
      </div>

      <div className="min-h-[650px] bg-mozi-black border border-mozi-border rounded-[2.5rem] p-12 relative">
        <AnimatePresence mode="wait">
          {subStep === 0 && <DNSAnimation key="dns" />}
          {subStep === 1 && <EncapAnimation key="encap" />}
          {subStep === 2 && <TransactionAnimation key="tx" />}
        </AnimatePresence>
      </div>
    </div>
  );
};

const DNSAnimation = () => {
  const [step, setStep] = useState(0);

  const dnsActions = [
    {
      title: "递归查询: 客户端 -> Local DNS",
      from: "client",
      to: "local",
      type: "recursive",
      desc: "客户端把重任交给运营商 DNS：'请帮我查出这个域名，我只要最终结果。'",
    },
    {
      title: "迭代查询: 问询根服务器",
      from: "local",
      to: "root",
      type: "iterative",
      desc: "Local DNS 开启漫漫寻址路。问根服务器：'.com 服务器在哪里？'",
    },
    {
      title: "迭代响应: 根服务器返回 TLD 地址",
      from: "root",
      to: "local",
      type: "iterative",
      desc: "根：'我不知道 IP，但我知道 .com 域名的管理者地址。'",
    },
    {
      title: "迭代查询: 问询 TLD 服务器",
      from: "local",
      to: "tld",
      type: "iterative",
      desc: "Local DNS 转向顶级域服务器：'请问 secure-bank.com 的权威服务器在哪里？'",
    },
    {
      title: "迭代响应: TLD 返回权威服务器地址",
      from: "tld",
      to: "local",
      type: "iterative",
      desc: "TLD：'你要找的域名由这组权威服务器负责解析。'",
    },
    {
      title: "迭代查询: 问询权威服务器",
      from: "local",
      to: "auth",
      type: "iterative",
      desc: "Local DNS 问最后一家：'确认一下，这个域名的真正 IP 是多少？'",
    },
    {
      title: "最后答案: 权威返回最终 IP",
      from: "auth",
      to: "local",
      type: "iterative",
      desc: "权威：'它的 IP 是 104.22.12.8，拿去吧。'",
    },
    {
      title: "结果返回: Local DNS -> 客户端",
      from: "local",
      to: "client",
      type: "recursive",
      desc: "Local DNS 功成身退，将最终结果告诉客户端，整个解析结束。",
    },
  ];

  const getPos = (id: string) => {
    const map: Record<string, string> = {
      client: "0%",
      local: "25%",
      root: "50%",
      tld: "75%",
      auth: "100%",
    };
    return map[id];
  };

  return (
    <div className="h-full flex flex-col">
      <div className="grid grid-cols-5 gap-4 mb-20 px-8 relative">
        <DNSNode
          label="客户端"
          sub="浏览器"
          icon={<LaptopIcon className="w-8 h-8" />}
          color="text-mozi-accent"
        />
        <DNSNode
          label="递归服务器"
          sub="Local DNS"
          icon={<ServerIcon className="w-8 h-8" />}
          color="text-amber-500"
        />
        <DNSNode
          label="根服务器"
          sub="."
          icon={<Globe className="w-6 h-6" />}
          color="text-white/20"
        />
        <DNSNode
          label="TLD 服务器"
          sub=".com"
          icon={<Globe className="w-6 h-6" />}
          color="text-white/20"
        />
        <DNSNode
          label="权威服务器"
          sub="bank.com"
          icon={<Database className="w-8 h-8" />}
          color="text-mozi-safe"
        />

        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-mozi-border -z-10" />

        <AnimatePresence>
          {step > 0 && (
            <motion.div
              key={step}
              initial={{ left: getPos(dnsActions[step - 1].from), opacity: 0 }}
              animate={{ left: getPos(dnsActions[step - 1].to), opacity: 1 }}
              className="absolute top-1/2 -translate-y-1/2 z-20"
              transition={{ duration: 0.8 }}
            >
              <div
                className={`p-2 rounded-full ${dnsActions[step - 1].type === "recursive" ? "bg-mozi-accent" : "bg-amber-500"} text-black shadow-xl`}
              >
                <Zap className="w-4 h-4 fill-current" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-12 gap-8 items-center">
        <div className="col-span-8 bg-mozi-dark border border-mozi-border p-10 rounded-[2.5rem] min-h-[220px] flex flex-col justify-center">
          {step === 0 ? (
            <div className="text-center italic text-mozi-text-muted">
              请点击“下一步”观察递归与迭代的区别
            </div>
          ) : (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold ${dnsActions[step - 1].type === "recursive" ? "bg-mozi-accent/20 text-mozi-accent" : "bg-amber-500/20 text-amber-500"}`}
                >
                  {dnsActions[step - 1].type === "recursive"
                    ? "递归 RECURSIVE"
                    : "迭代 ITERATIVE"}
                </span>
                <h4 className="text-2xl font-bold">
                  {dnsActions[step - 1].title}
                </h4>
              </div>
              <p className="text-mozi-text-muted text-lg">
                {dnsActions[step - 1].desc}
              </p>
            </motion.div>
          )}
        </div>
        <div className="col-span-4 flex flex-col gap-4">
          <button
            onClick={() => setStep((s) => Math.min(s + 1, 8))}
            disabled={step === 8}
            className="py-6 bg-mozi-accent text-black font-black uppercase rounded-3xl hover:scale-105 disabled:opacity-20 transition-all flex items-center justify-center gap-2"
          >
            下一步 <ArrowRight className="w-6 h-6" />
          </button>
          <button
            onClick={() => setStep(0)}
            className="py-4 border border-mozi-border rounded-2xl text-xs font-mono text-mozi-text-muted hover:bg-mozi-dark"
          >
            重置 DNS 链路
          </button>
        </div>
      </div>
    </div>
  );
};

const DNSNode = ({ label, sub, icon, color }: DNSNodeProps) => (
  <div className="flex flex-col items-center gap-3">
    <div
      className={`p-5 rounded-2xl bg-mozi-dark border border-mozi-border ${color} shadow-lg`}
    >
      {icon}
    </div>
    <div className="text-center">
      <p className="text-xs font-black uppercase tracking-tight">{label}</p>
      {sub && (
        <p className="text-[10px] font-mono text-mozi-text-muted">{sub}</p>
      )}
    </div>
  </div>
);

// --- Rest remains same or minor updates ---

const EncapAnimation = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="h-full flex flex-col items-center justify-center space-y-12"
  >
    <div className="text-center">
      <h3 className="text-2xl font-bold mb-4 text-mozi-text">
        OSI 七层模型封装过程 (Encapsulation)
      </h3>
      <p className="text-mozi-text-muted max-w-xl mx-auto">
        数据在发出前，会被协议栈逐层包裹。每一层都增加了必要的控制信息（Headers）。
      </p>
    </div>
    <div className="relative p-12 border-2 border-dashed border-mozi-border rounded-[3rem]">
      <div className="space-y-4">
        {[
          {
            l: "应用层 (Layer 7)",
            d: "HTTP Payload (GET /index.html...)",
            c: "bg-mozi-accent/20 border-mozi-accent/40",
          },
          {
            l: "传输层 (Layer 4)",
            d: "TCP Header (Source Port, Dest Port, Seq, Ack...)",
            c: "bg-mozi-safe/20 border-mozi-safe/40",
          },
          {
            l: "网络层 (Layer 3)",
            d: "IP Header (Source IP, Dest IP...)",
            c: "bg-amber-500/20 border-amber-500/40",
          },
          {
            l: "链路层 (Layer 2)",
            d: "Ethernet Frame (MAC Address, CRC...)",
            c: "bg-mozi-dark border-mozi-border",
          },
        ].map((layer, i) => (
          <motion.div
            key={layer.l}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.2 }}
            className={`p-6 rounded-2xl border ${layer.c} flex justify-between items-center w-[650px]`}
          >
            <span className="font-black text-sm">{layer.l}</span>
            <span className="font-mono text-[10px] opacity-60 italic">
              {layer.d}
            </span>
          </motion.div>
        ))}
      </div>
      <div className="mt-8 flex items-center justify-center gap-4 text-[10px] font-mono text-mozi-text-muted animate-pulse uppercase tracking-[0.2em]">
        <Zap className="w-4 h-4 text-mozi-accent" /> BIT_STREAM_TRANSMITTING...
      </div>
    </div>
  </motion.div>
);

const TransactionAnimation = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="h-full grid grid-cols-2 gap-12"
  >
    <div className="space-y-6">
      <h3 className="text-xl font-black border-l-4 border-mozi-accent pl-4">
        HTTP 请求报文 (REQUEST)
      </h3>
      <div className="bg-mozi-dark border border-mozi-border rounded-2xl p-8 font-mono text-xs leading-relaxed text-mozi-accent/80">
        <p className="font-black text-mozi-text text-sm mb-4">
          GET /api/user/profile HTTP/1.1
        </p>
        <p>Host: secure-bank.com</p>
        <p>User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...</p>
        <p>Accept: application/json, text/plain, */*</p>
        <p>
          Cookie:{" "}
          <span className="text-amber-500">
            session_id=m0zi_security_lab_token_99
          </span>
        </p>
        <p>Connection: keep-alive</p>
      </div>
    </div>
    <div className="space-y-6">
      <h3 className="text-xl font-black border-l-4 border-mozi-safe pl-4">
        HTTP 响应报文 (RESPONSE)
      </h3>
      <div className="bg-mozi-dark border border-mozi-border rounded-2xl p-8 font-mono text-xs leading-relaxed text-mozi-safe/80">
        <p className="font-black text-mozi-text text-sm mb-4">
          HTTP/1.1 200 OK
        </p>
        <p>Server: nginx/1.21.6</p>
        <p>Content-Type: application/json; charset=utf-8</p>
        <p>
          Set-Cookie:{" "}
          <span className="text-amber-500">
            last_visit=2026-06-17; HttpOnly; Secure
          </span>
        </p>
        <p className="mt-6 opacity-40">{"{"}</p>
        <p className="pl-4 text-mozi-text">"status": "success",</p>
        <p className="pl-4 text-mozi-text">
          "data": {"{"} "user": "墨子", "balance": "99,999" {"}"}
        </p>
        <p className="opacity-40">{"}"}</p>
      </div>
    </div>
  </motion.div>
);

const CookieProModule = () => {
  const [activeAttr, setActiveAttr] = useState<string | null>(null);
  const attributes = [
    {
      name: "HttpOnly",
      desc: "禁止 JavaScript 通过 document.cookie 访问。这是防御 XSS 窃取会话令牌的绝对死命令。",
      icon: <Lock className="w-5 h-5" />,
    },
    {
      name: "Secure",
      desc: "强制 Cookie 仅在 HTTPS 安全加密通道下传输，拒绝明文嗅探。",
      icon: <ShieldCheck className="w-5 h-5" />,
    },
    {
      name: "SameSite",
      desc: "控制跨站请求是否携带 Cookie（Strict / Lax / None）。这是防御 CSRF 攻击的核心防线。",
      icon: <Globe className="w-5 h-5" />,
    },
  ];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full min-h-[700px]">
      <div className="lg:col-span-7 bg-mozi-black border border-mozi-border rounded-[2.5rem] p-12 flex flex-col justify-center">
        <div className="flex justify-between items-center mb-24 px-12 relative">
          <div className="text-center relative">
            <div className="p-10 bg-mozi-dark border border-mozi-border rounded-3xl relative z-10 shadow-2xl">
              <LaptopIcon className="w-20 h-20 text-mozi-accent" />
            </div>
            <div className="mt-6 font-black text-mozi-text">
              浏览器 Cookie Jar
            </div>
            <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl font-mono text-[10px] text-amber-500">
              STORE: [session_id=99x]
            </div>
          </div>
          <div className="flex-grow mx-12 flex flex-col items-center gap-8">
            <motion.div
              animate={{ x: [0, 50, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="p-4 bg-amber-500 text-black rounded-full shadow-[0_0_30px_rgba(245,158,11,0.6)]"
            >
              <CookieIcon className="w-10 h-10" />
            </motion.div>
            <span className="text-[10px] font-mono text-mozi-text-muted uppercase tracking-[0.3em]">
              Payload Exchanging
            </span>
          </div>
          <div className="text-center">
            <div className="p-10 bg-mozi-dark border border-mozi-border rounded-3xl shadow-2xl">
              <ServerIcon className="w-20 h-20 text-mozi-safe" />
            </div>
            <div className="mt-6 font-black text-mozi-text">
              应用服务端 (AUTH)
            </div>
            <div className="mt-4 p-4 bg-mozi-dark border border-mozi-border rounded-xl font-mono text-[10px] text-mozi-text-muted italic">
              ID_VERIFICATION_CENTER
            </div>
          </div>
        </div>
        <div className="bg-mozi-dark/50 rounded-3xl p-8 border border-mozi-border border-l-4 border-l-amber-500">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            <h4 className="text-xl font-black text-mozi-text">安全加固建议</h4>
          </div>
          <p className="text-mozi-text-muted leading-relaxed text-sm italic">
            "未设置 HttpOnly 的 Cookie 就是递给黑客的钥匙。通过 XSS 漏洞，一行
            `document.cookie` 就能接管用户的一切。"
          </p>
        </div>
      </div>
      <div className="lg:col-span-5 flex flex-col gap-6">
        {attributes.map((attr) => (
          <div
            key={attr.name}
            onMouseEnter={() => setActiveAttr(attr.name)}
            className={`p-8 rounded-[2rem] border transition-all cursor-help ${activeAttr === attr.name ? "bg-mozi-accent/10 border-mozi-accent shadow-xl" : "bg-mozi-dark border-mozi-border"}`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div
                className={`p-3 rounded-xl ${activeAttr === attr.name ? "bg-mozi-accent text-black" : "bg-mozi-black/20 text-mozi-text-muted"}`}
              >
                {attr.icon}
              </div>
              <h4 className="text-2xl font-black font-mono text-mozi-text">
                {attr.name}
              </h4>
            </div>
            <p
              className={`text-sm leading-relaxed transition-opacity ${activeAttr === attr.name ? "text-mozi-text" : "text-mozi-text-muted"}`}
            >
              {attr.desc}
            </p>
          </div>
        ))}
        <div className="flex-grow bg-mozi-accent/5 border border-mozi-accent/10 rounded-[2.5rem] p-10 flex flex-col justify-end">
          <div className="font-mono text-[10px] text-mozi-accent/50 uppercase mb-4 tracking-[0.4em] font-bold">
            Protocol Best Practice
          </div>
          <p className="text-xs text-mozi-text-muted leading-loose">
            生产环境 Session Cookie 强制标准：
            <br />
            <code className="text-mozi-accent font-bold bg-mozi-black/50 px-2 py-1 rounded">
              HttpOnly; Secure; SameSite=Lax
            </code>
          </p>
        </div>
      </div>
    </div>
  );
};

const SOPProModule = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-[600px]">
      <div className="bg-mozi-black border border-mozi-border rounded-[3rem] p-12 space-y-12 transition-colors duration-300">
        <div className="flex items-center gap-4">
          <ShieldCheck className="w-12 h-12 text-mozi-accent" />
          <h3 className="text-3xl font-black text-mozi-text">
            同源判定算法 (SOP)
          </h3>
        </div>
        <div className="space-y-6">
          <p className="text-mozi-text-muted text-lg">
            当且仅当两个 URL 的以下三要素
            <strong className="text-mozi-text mx-1">完全一致</strong>
            时，浏览器才视为同源：
          </p>
          <div className="flex flex-col gap-4">
            {[
              { l: "协议 (Protocol)", v: "https://", c: "text-mozi-accent" },
              { l: "域名 (Domain)", v: "secure-bank.com", c: "text-mozi-safe" },
              { l: "端口 (Port)", v: ":443", c: "text-amber-500" },
            ].map((p) => (
              <div
                key={p.l}
                className="flex items-center justify-between p-8 bg-mozi-dark border border-mozi-border rounded-3xl shadow-sm hover:border-mozi-accent/30 transition-colors"
              >
                <span className="text-[10px] font-mono text-mozi-text-muted uppercase font-bold tracking-widest">
                  {p.l}
                </span>
                <span className={`text-3xl font-mono font-black ${p.c}`}>
                  {p.v}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-mozi-black border border-mozi-border rounded-[3rem] p-12 flex flex-col justify-center items-center relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-mozi-danger/50 to-transparent"></div>
        <div className="text-center mb-16">
          <h3 className="text-2xl font-black mb-4 text-mozi-text uppercase tracking-tight">
            CORS 预检请求机制
          </h3>
          <p className="text-mozi-text-muted text-sm max-w-md">
            当你要跨过边界时，浏览器会先派出一名“侦察兵”进行探测。
          </p>
        </div>
        <div className="w-full space-y-8 relative z-10">
          <div className="p-8 bg-mozi-dark border border-mozi-border rounded-3xl shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <RefreshCcw className="w-5 h-5 text-amber-500 animate-spin" />
              <span className="text-xs font-mono font-black text-amber-500 uppercase tracking-widest">
                OPTIONS PREFLIGHT
              </span>
            </div>
            <p className="font-mono text-xs text-mozi-text-muted italic leading-relaxed">
              "请求源: evil.com。服务端，你是否允许我发起跨域数据读取？"
            </p>
          </div>
          <div className="flex justify-center">
            <ArrowRight className="w-10 h-10 text-mozi-border rotate-90" />
          </div>
          <div className="p-8 bg-mozi-safe/10 border border-mozi-safe/30 rounded-3xl shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-5 h-5 text-mozi-safe" />
              <span className="text-xs font-mono font-black text-mozi-safe uppercase tracking-widest">
                SERVER RESPONSE
              </span>
            </div>
            <div className="font-mono text-xs space-y-2">
              <p className="text-mozi-safe font-black">
                Access-Control-Allow-Origin: bank.com
              </p>
              <p className="text-mozi-text/60">
                Access-Control-Allow-Methods: GET, POST
              </p>
              <p className="text-mozi-danger font-black italic mt-4 p-2 bg-mozi-danger/10 border border-mozi-danger/20 rounded">
                ! 拦截：evil.com 不在白名单内，浏览器抛出跨域错误。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fundamentals;
