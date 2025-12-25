# DDoS 拒绝服务攻击

DDoS (Distributed Denial of Service) 通过大量请求耗尽服务器资源，使正常用户无法访问服务。

## 攻击原理

```
攻击者
  ↓
大量请求 ──→ 目标服务器
  ↓
服务器资源耗尽
  ↓
正常用户无法访问
```

## 常见攻击类型

| 类型 | 目标 | 特点 |
|------|------|------|
| HTTP Flood | 应用层 | 大量 HTTP 请求 |
| SYN Flood | 传输层 | 耗尽 TCP 连接 |
| UDP Flood | 网络层 | 带宽消耗 |
| Slowloris | 应用层 | 慢速连接占用 |

## 实验：HTTP Flood

### 攻击场景

攻击者向服务器发送大量 HTTP 请求，耗尽服务器处理能力。

### 攻击代码示例

```javascript
// ⚠️ 仅供学习，请勿用于非法用途
async function httpFlood(url, count) {
  const promises = []
  for (let i = 0; i < count; i++) {
    promises.push(fetch(url))
  }
  await Promise.all(promises)
}

// 每秒发送 100 个请求
setInterval(() => httpFlood('/api/target', 100), 1000)
```

### 服务器影响

- CPU 使用率飙升
- 内存占用增加
- 响应时间变长
- 连接数达到上限
- 正常请求被拒绝

## 防御方案

### 1. 速率限制 (Rate Limiting)

```javascript
const rateLimit = require('express-rate-limit')

const limiter = rateLimit({
  windowMs: 1000,      // 1 秒
  max: 10,             // 最多 10 个请求
  message: { error: '请求过于频繁' }
})

app.use('/api/', limiter)
```

### 2. 连接数限制

```javascript
const server = app.listen(4000)
server.maxConnections = 100
```

### 3. 请求队列

```javascript
const queue = []
const MAX_CONCURRENT = 50

async function processRequest(req, res) {
  if (queue.length >= MAX_CONCURRENT) {
    return res.status(503).json({ error: '服务繁忙' })
  }
  queue.push(req)
  try {
    await handleRequest(req, res)
  } finally {
    queue.shift()
  }
}
```

### 4. CDN 和 WAF

```
用户请求 → CDN → WAF → 源服务器
              ↓
         过滤恶意流量
```

## 实验仪表盘

本实验提供实时监控面板：

| 指标 | 说明 |
|------|------|
| 请求/秒 | 当前 QPS |
| 活跃连接 | 并发连接数 |
| 服务器负载 | CPU/内存使用 |
| 被拦截请求 | 限流生效次数 |

## 防御配置

### 无防护模式

```javascript
// 所有请求都被处理
app.get('/api/unsafe', (req, res) => {
  res.json({ data: 'ok' })
})
```

### 限流防护模式

```javascript
// 超过阈值的请求被拒绝
app.get('/api/safe', limiter, (req, res) => {
  res.json({ data: 'ok' })
})
```

## 最佳实践

| 措施 | 层级 | 效果 |
|------|------|------|
| 速率限制 | 应用层 | 限制单 IP 请求频率 |
| 连接超时 | 传输层 | 释放空闲连接 |
| CDN | 网络层 | 分散流量 |
| WAF | 应用层 | 识别恶意模式 |
| 弹性扩容 | 基础设施 | 动态增加资源 |

## 注意事项

::: warning 法律警告
DDoS 攻击是违法行为。本实验仅供学习目的，只能在自己的测试环境中进行。
:::

## 开始实验

访问 [DDoS 实验](/labs/ddos) 了解攻击原理和防御方法。
