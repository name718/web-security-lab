# Token 重放攻击

重放攻击是指攻击者截获合法的认证凭证后，在其他设备或时间重复使用。

## 攻击原理

```
1. 用户在设备 A 登录，获得 Token
2. 攻击者通过 XSS/嗅探获取 Token
3. 攻击者在设备 B 使用相同 Token
4. 服务器无法区分，攻击成功
```

## 实验一：Token 重放攻击

### 漏洞代码

```javascript
// ❌ 只验证 Token 有效性
router.get('/profile', (req, res) => {
  const token = req.headers.authorization
  if (sessions[token]) {
    res.json(userData)  // 任何设备都能访问
  }
})
```

## 实验二：防重放机制

### 设备绑定

```javascript
// ✅ Token 与设备绑定
router.post('/login', (req, res) => {
  const deviceId = req.headers['x-device-id']
  sessions[token] = { userId, deviceId }
})

router.get('/profile', (req, res) => {
  if (session.deviceId !== req.headers['x-device-id']) {
    return res.status(403).json({ error: '设备不匹配' })
  }
})
```

### Nonce 防重放

```javascript
// ✅ 一次性 Nonce
router.post('/transfer', (req, res) => {
  const { nonce } = req.body
  if (usedNonces.has(nonce)) {
    return res.status(400).json({ error: '请求已过期' })
  }
  usedNonces.add(nonce)
  // 执行操作...
})
```

## 防御方案

| 方案 | 原理 | 适用场景 |
|---|---|---|
| 设备绑定 | Token 与设备 ID 关联 | 移动端 |
| IP 绑定 | Token 与 IP 关联 | 固定网络 |
| Nonce | 每次请求唯一标识 | 敏感操作 |
| 短有效期 | Token 快速过期 | 高安全场景 |

## 开始实验

访问 [Token 重放攻击实验](/labs/replay) 体验攻击与防护。
