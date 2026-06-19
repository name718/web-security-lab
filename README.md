# Web Security Lab

一个面向教学的可视化 Web 安全实验室，使用 React、TypeScript、Vite、Tailwind CSS 和 Framer Motion 构建。

项目目标不是提供真实攻击工具，而是通过可控的沙箱模拟、源码审计视角和交互式状态反馈，帮助学习者理解 Web 安全漏洞的成因与防御方式。

## 当前模块

- Web 核心原理：TCP、HTTP、Cookie、同源策略等基础概念可视化。
- XSS 实验室：覆盖反射型、存储型、DOM 型场景，以及上下文注入、防御策略和 CSP 模拟。
- CSRF 实验室：展示跨站请求、Cookie 自动携带、SameSite 策略的影响。

## 运行

```bash
pnpm install
pnpm dev
```

## 验证

```bash
pnpm build
pnpm lint
```

## 业务结构

```text
src/
  components/       通用布局和展示组件
  content/          课程模块与平台文案配置
  hooks/            可复用交互逻辑
  pages/            页面级实验室
```

课程入口统一维护在 `src/content/modules.ts`。新增漏洞实验时，应优先添加模块配置，再实现对应页面和实验状态逻辑，避免在首页、导航和页面中重复维护业务数据。

## 新增安全目录

在 `src/content/modules.ts` 中新增一条 `learningModules` 配置即可同步更新首页统计、首页模块卡片和顶部课程目录。

关键字段：

- `kind`: `foundation` 或 `lab`，用于首页统计。
- `category`: 模块所属目录，例如 `client`、`auth`。
- `status`: `recommended`、`available`、`planned`。`planned` 默认不进入导航和首页。
- `order`: 控制展示顺序。

如果需要新增一个全新的目录分组，同时在 `moduleCategories` 中添加分组元数据。

## 安全边界

实验应默认使用模拟执行，不直接运行用户输入的脚本或请求。需要展示危险行为时，优先用解析结果、动画和日志表达攻击路径；只有在明确隔离的沙箱中才考虑真实执行。

## 下一步重构方向

- 将 XSS/CSRF 的状态机从页面组件中抽出为独立 hook。
- 将 payload 示例、防御策略、审计代码片段配置化。
- 增加实验判定函数的单元测试。
- 为每个实验补齐学习目标、复盘问题和防御检查清单。
