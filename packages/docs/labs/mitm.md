# 中间人攻击 (MITM)

中间人攻击是指攻击者插入通信双方之间，窃听或篡改传输的数据。

## 攻击原理

```
客户端 ←──→ 攻击者 ←──→ 服务器
           ↓
    窃听 / 篡改数据
```

## 实验一：流量嗅探

### 攻击场景

HTTP 明文传输时，攻击者可截获所有数据：

```
POST /login HTTP/1.1
Content-Type: application/json

{"username":"alice","password":"secret123"}
← 明文密码被截获！
```

### 常用工具

- Wireshark - 网络协议分析器
- tcpdump - 命令行抓包
- mitmproxy - HTTP/HTTPS 代理

## 实验二：数据篡改

### 攻击场景

攻击者修改传输中的数据：

```
原始请求: { "to": "bob", "amount": 1000 }
    ↓ 攻击者篡改
篡改后:   { "to": "attacker", "amount": 1000 }
```

## 防护方案

### HTTPS 加密

```
TLS 1.3 Encrypted Application Data
17 03 03 00 45 8a 2f 9c 3b ...
← 加密数据，无法读取
```

### HSTS

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

强制使用 HTTPS，防止 SSL 剥离攻击。

### 数字签名

```javascript
const signature = HMAC(JSON.stringify(data), secretKey)

// 服务端验证
if (signature !== expectedSig) {
  throw new Error('数据可能被篡改')
}
```

### 证书固定

客户端预置证书指纹，防止伪造证书。

## 防护检查清单

| 措施 | 防护目标 |
|---|---|
| HTTPS | 数据加密 |
| HSTS | 防 SSL 剥离 |
| 证书固定 | 防伪造证书 |
| 数字签名 | 数据完整性 |

## 开始实验

访问 [中间人攻击实验](/labs/mitm) 体验攻击与防护。
