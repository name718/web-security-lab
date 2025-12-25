# 快速开始

## 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0

## 安装

```bash
# 克隆项目
git clone <repo-url>
cd security-lab

# 安装依赖
pnpm install

# 启动实验服务器
pnpm dev

# 启动文档站点（可选）
pnpm dev:docs
```

## 访问

- 实验平台: [http://localhost:4000](http://localhost:4000)
- 文档站点: [http://localhost:5173](http://localhost:5173)

## 项目结构

```
security-lab/
├── packages/
│   ├── server/          # 实验服务器
│   │   ├── src/
│   │   │   ├── routes/  # API 路由
│   │   │   └── index.js
│   │   └── client/      # 实验页面
│   │       ├── xss/
│   │       ├── sql/
│   │       ├── csrf/
│   │       └── ...
│   └── docs/            # 文档站点
├── package.json
└── pnpm-workspace.yaml
```

## 实验列表

| 实验 | 描述 | 难度 |
|------|------|------|
| XSS | 跨站脚本攻击 | ⭐⭐ |
| SQL注入 | 数据库注入攻击 | ⭐⭐⭐ |
| CSRF | 跨站请求伪造 | ⭐⭐ |
| JWT | Token 安全漏洞 | ⭐⭐⭐ |
| 钓鱼 | 仿冒网站攻击 | ⭐⭐ |
| IDOR | 对象级越权 | ⭐⭐⭐⭐ |
| RBAC | 权限模型缺陷 | ⭐⭐⭐⭐ |
| DDoS | 拒绝服务攻击 | ⭐⭐ |
