# JWT 安全漏洞

JWT (JSON Web Token) 是现代 Web 应用中广泛使用的身份认证方案，但错误的实现会导致严重的安全问题。

## 漏洞原理

JWT 由三部分组成：Header、Payload、Signature。常见漏洞包括：

1. **算法混淆** - 服务端未严格校验算法类型
2. **弱密钥** - 使用简单密钥，可被暴力破解
3. **敏感信息泄露** - 在 Payload 中存储敏感数据

## 实验一：算法混淆 (alg: none)

### 漏洞场景

服务端接受 `alg: none` 的 Token，攻击者可以伪造任意身份。

### 攻击步骤

1. 获取正常 JWT Token
2. 解码 Header，将 `alg` 改为 `none`
3. 修改 Payload 中的用户身份
4. 移除 Signature 部分
5. 使用伪造的 Token 访问接口

### 攻击 Payload

```javascript
// 原始 Token
eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiZ3Vlc3QifQ.xxx

// 伪造 Token (alg: none)
eyJhbGciOiJub25lIn0.eyJ1c2VyIjoiYWRtaW4ifQ.
```

### 防御方案

```javascript
// ❌ 错误：接受任意算法
jwt.verify(token, secret)

// ✅ 正确：强制指定算法
jwt.verify(token, secret, { algorithms: ['HS256'] })
```

## 实验二：弱密钥爆破

### 漏洞场景

使用简单密钥（如 `secret`、`123456`），攻击者可通过字典爆破获取密钥。

### 攻击步骤

1. 获取有效的 JWT Token
2. 使用常见密钥字典尝试验证
3. 找到正确密钥后可伪造任意 Token

### 常见弱密钥

```
secret
password
123456
jwt_secret
your-256-bit-secret
```

### 防御方案

```javascript
// ❌ 错误：弱密钥
const secret = 'secret'

// ✅ 正确：强随机密钥
const secret = crypto.randomBytes(32).toString('hex')
```

## 实验三：敏感信息泄露

### 漏洞场景

开发者误以为 JWT 是加密的，在 Payload 中存储敏感信息。

### 危险示例

```javascript
// ❌ 错误：存储敏感信息
{
  "user": "admin",
  "password": "admin123",
  "creditCard": "4111-1111-1111-1111"
}
```

### 攻击方式

JWT 的 Payload 只是 Base64 编码，任何人都可以解码：

```javascript
atob('eyJ1c2VyIjoiYWRtaW4iLCJwYXNzd29yZCI6ImFkbWluMTIzIn0')
// {"user":"admin","password":"admin123"}
```

### 防御方案

1. **永远不要**在 JWT 中存储敏感信息
2. JWT 只存储必要的身份标识（如 userId）
3. 敏感数据通过后端查询获取

## 安全最佳实践

| 措施 | 说明 |
|------|------|
| 强制算法 | 服务端明确指定允许的算法 |
| 强密钥 | 使用 256 位以上的随机密钥 |
| 短有效期 | Token 有效期不宜过长 |
| 最小信息 | Payload 只存必要信息 |
| HTTPS | 传输层加密防止窃取 |

## 开始实验

访问 [JWT 安全实验](/labs/jwt) 亲自体验这些漏洞。
