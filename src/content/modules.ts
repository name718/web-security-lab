import {
  BookOpen,
  Fingerprint,
  ShieldAlert,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type ModuleStatus = "recommended" | "available" | "planned";
export type ModuleTone = "accent" | "safe" | "danger";
export type ModuleKind = "foundation" | "lab";
export type ModuleCategory = "foundation" | "client" | "auth";

export interface ModuleCategoryMeta {
  id: ModuleCategory;
  title: string;
  description: string;
}

export interface LearningModule {
  id: string;
  title: string;
  navLabel: string;
  description: string;
  path: string;
  icon: LucideIcon;
  tone: ModuleTone;
  status: ModuleStatus;
  kind: ModuleKind;
  category: ModuleCategory;
  order: number;
}

export const moduleCategories: ModuleCategoryMeta[] = [
  {
    id: "foundation",
    title: "基础原理",
    description: "协议、浏览器边界和 Web 安全共同语言。",
  },
  {
    id: "client",
    title: "客户端安全",
    description: "浏览器解析、脚本执行、DOM 和前端安全边界。",
  },
  {
    id: "auth",
    title: "认证与会话",
    description: "Cookie、会话、跨站请求和身份状态滥用。",
  },
];

const moduleDefinitions: LearningModule[] = [
  {
    id: "fundamentals",
    title: "Web 核心原理",
    navLabel: "核心原理",
    description:
      "先理解 HTTP、Cookie、同源策略与浏览器安全边界，再进入漏洞实验。",
    path: "/fundamentals",
    icon: BookOpen,
    tone: "accent",
    status: "recommended",
    kind: "foundation",
    category: "foundation",
    order: 10,
  },
  {
    id: "xss",
    title: "XSS 跨站脚本攻击",
    navLabel: "XSS 实验室",
    description:
      "学习不同上下文中的脚本注入风险，比较黑名单、编码与 CSP 的防护差异。",
    path: "/xss",
    icon: Zap,
    tone: "danger",
    status: "available",
    kind: "lab",
    category: "client",
    order: 20,
  },
  {
    id: "csrf",
    title: "CSRF 跨站请求伪造",
    navLabel: "CSRF 实验室",
    description:
      "可视化浏览器自动携带 Cookie 的风险，并验证 SameSite 等防御策略。",
    path: "/csrf",
    icon: Fingerprint,
    tone: "safe",
    status: "available",
    kind: "lab",
    category: "auth",
    order: 30,
  },
];

export const learningModules = [...moduleDefinitions].sort(
  (a, b) => a.order - b.order,
);

export const visibleModules = learningModules.filter(
  (module) => module.status !== "planned",
);

export const navigationModules = visibleModules;

export const moduleGroups = moduleCategories
  .map((category) => ({
    ...category,
    modules: visibleModules.filter((module) => module.category === category.id),
  }))
  .filter((category) => category.modules.length > 0);

export const moduleStats = {
  total: visibleModules.length,
  labs: visibleModules.filter((module) => module.kind === "lab").length,
  foundations: visibleModules.filter((module) => module.kind === "foundation")
    .length,
  safeExecution: 0,
};

export const platformSummary = {
  title: "可视化 Web 安全培训",
  subtitle:
    "通过动态演示、交互式实验和源码审计视角，建立可验证的 Web 安全认知。",
  icon: ShieldAlert,
};
