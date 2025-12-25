# CSRF 跨站请求伪造

## 什么是 CSRF？

CSRF (Cross-Site Request Forgery) 是一种攻击方式，攻击者诱导已登录用户访问恶意页面，利用用户的身份执行非预期操作。

## 攻击原理

```
1. 用户登录银行网站，获得 Session
2. 用户访问攻击者的钓鱼页面
3. 钓鱼页面自动发送转账请求
4. 浏览器自动携带 Cookie
5. 银行服务器认为是用户本人操作
6. 转账成功，用户损失资金！
```

## 攻击类型

### GET 型 CSRF

```html
<img src="https://bank.com/transfer?to=hacker&amount=1000">
```

### POST 型 CSRF

```html
<form action="https://bank.com/transfer" method="POST">
  <input type="hidden" name="to" value="hacker">
  <input type="hidden" name="amount" value="1000">
</form>
<script>document.forms[0].submit()</script>
```

## 实验演示

访问 [CSRF 实验](/labs/csrf) 进行实践：

1. **银行系统** - 登录并进行正常转账
2. **攻击页面** - 模拟钓鱼页面发起攻击
3. **防护机制** - 学习 Token 防护

## 防御方法

### 1. CSRF Token

```javascript
// 服务端
app.post('/transfer', (req, res) => {
  if (req.body.csrfToken !== req.session.csrfToken) {
    return res.status(403).json({ error: 'CSRF Token 验证失败' })
  }
  // 执行转账...
})

// 前端
fetch('/transfer', {
  headers: { 'X-CSRF-Token': csrfToken },
  body: JSON.stringify({ to, amount })
})
```

### 2. SameSite Cookie

```javascript
res.cookie('session', sessionId, {
  httpOnly: true,
  secure: true,
  sameSite: 'Lax'  // 或 'Strict'
})
```

### 3. 验证 Referer

```javascript
const origin = req.headers.origin
if (!allowedOrigins.includes(origin)) {
  return res.status(403).json({ error: '非法来源' })
}
```

### 4. 二次确认

敏感操作要求输入密码或验证码。
