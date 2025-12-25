# 项目结构

## 技术栈

- **后端**: Express + Node.js
- **前端**: 原生 HTML/CSS/JS
- **数据库**: SQLite (sql.js)
- **文档**: VitePress
- **包管理**: pnpm (monorepo)

## 目录说明

```
packages/
├── server/
│   ├── src/
│   │   ├── index.js           # 服务入口
│   │   └── routes/
│   │       ├── search.js      # XSS - 反射型
│   │       ├── comment.js     # XSS - 存储型
│   │       ├── steal.js       # XSS - Token窃取
│   │       ├── sql.js         # SQL注入
│   │       ├── csrf.js        # CSRF
│   │       ├── jwt.js         # JWT漏洞
│   │       ├── phishing.js    # 钓鱼攻击
│   │       ├── idor.js        # IDOR越权
│   │       ├── rbac.js        # RBAC权限
│   │       └── ddos.js        # DDoS攻击
│   └── client/
│       ├── index.html         # 实验首页
│       ├── xss/               # XSS实验页面
│       ├── sql/               # SQL注入页面
│       ├── csrf/              # CSRF页面
│       ├── jwt/               # JWT页面
│       ├── phishing/          # 钓鱼页面
│       ├── idor/              # IDOR页面
│       ├── rbac/              # RBAC页面
│       └── ddos/              # DDoS页面
└── docs/                      # 文档站点
```

## API 接口

### XSS
- `GET /api/search/unsafe?q=xxx` - 有漏洞的搜索
- `GET /api/search/safe?q=xxx` - 安全的搜索
- `POST /api/comment` - 发表评论
- `GET /api/comment/list/unsafe` - 获取评论(不转义)

### SQL注入
- `POST /api/sql/login/unsafe` - 有漏洞的登录
- `POST /api/sql/login/safe` - 安全的登录
- `GET /api/sql/user/unsafe?id=xxx` - UNION注入

### CSRF
- `POST /api/csrf/login` - 登录
- `POST /api/csrf/transfer/unsafe` - 无防护转账
- `POST /api/csrf/transfer/safe` - 有Token防护

### JWT
- `POST /api/jwt/login/weak` - 弱密钥签发
- `POST /api/jwt/verify/unsafe` - 有漏洞验证
- `POST /api/jwt/decode` - 解码Token

### IDOR
- `GET /api/idor/order/unsafe/:id` - 越权查看订单
- `PUT /api/idor/profile/unsafe` - 越权修改资料
- `DELETE /api/idor/file/unsafe/:id` - 越权删除文件

### RBAC
- `GET /api/rbac/admin/logs/unsafe` - 无权限校验
- `POST /api/rbac/action/unsafe` - 角色可伪造
