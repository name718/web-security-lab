import { Router } from 'express'

const router = Router()

// 服务器状态
const serverState = {
  totalRequests: 0,
  requestsPerSecond: 0,
  activeConnections: 0,
  maxConnections: 100,
  isOverloaded: false,
  requestLog: [],
  startTime: Date.now()
}

// 限流配置
const rateLimitConfig = {
  enabled: false,
  maxRequestsPerSecond: 10,
  windowMs: 1000,
  blockDurationMs: 5000
}

// IP 请求记录
const ipRequests = new Map()
const blockedIPs = new Map()

// 每秒重置计数器
setInterval(() => {
  serverState.requestsPerSecond = 0
  
  // 清理过期的 IP 记录
  const now = Date.now()
  for (const [ip, data] of ipRequests) {
    if (now - data.windowStart > rateLimitConfig.windowMs) {
      ipRequests.delete(ip)
    }
  }
  
  // 清理过期的封禁
  for (const [ip, expireTime] of blockedIPs) {
    if (now > expireTime) {
      blockedIPs.delete(ip)
    }
  }
}, 1000)

// 限流中间件
function rateLimitMiddleware(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown'
  const now = Date.now()
  
  // 检查是否被封禁
  if (blockedIPs.has(ip)) {
    const expireTime = blockedIPs.get(ip)
    if (now < expireTime) {
      return res.status(429).json({
        error: 'IP 已被封禁',
        retryAfter: Math.ceil((expireTime - now) / 1000)
      })
    }
    blockedIPs.delete(ip)
  }
  
  if (!rateLimitConfig.enabled) {
    return next()
  }
  
  // 获取或创建 IP 记录
  if (!ipRequests.has(ip)) {
    ipRequests.set(ip, { count: 0, windowStart: now })
  }
  
  const ipData = ipRequests.get(ip)
  
  // 重置窗口
  if (now - ipData.windowStart > rateLimitConfig.windowMs) {
    ipData.count = 0
    ipData.windowStart = now
  }
  
  ipData.count++
  
  // 检查是否超限
  if (ipData.count > rateLimitConfig.maxRequestsPerSecond) {
    blockedIPs.set(ip, now + rateLimitConfig.blockDurationMs)
    return res.status(429).json({
      error: '请求过于频繁，IP 已被临时封禁',
      retryAfter: rateLimitConfig.blockDurationMs / 1000
    })
  }
  
  next()
}

// ==================== 目标服务 ====================

// 模拟正常业务接口（有延迟）
router.get('/api', rateLimitMiddleware, (req, res) => {
  serverState.totalRequests++
  serverState.requestsPerSecond++
  serverState.activeConnections++
  
  // 记录请求
  const logEntry = {
    time: new Date().toLocaleTimeString('zh-CN'),
    ip: req.ip || 'unknown',
    path: req.path
  }
  serverState.requestLog.push(logEntry)
  if (serverState.requestLog.length > 100) {
    serverState.requestLog.shift()
  }
  
  // 检查是否过载
  if (serverState.activeConnections > serverState.maxConnections) {
    serverState.isOverloaded = true
    serverState.activeConnections--
    return res.status(503).json({ error: '服务器过载' })
  }
  
  // 模拟处理延迟
  const delay = serverState.isOverloaded ? 2000 : 100
  
  setTimeout(() => {
    serverState.activeConnections--
    if (serverState.activeConnections < serverState.maxConnections * 0.8) {
      serverState.isOverloaded = false
    }
    res.json({ 
      message: 'OK',
      processTime: delay,
      serverLoad: Math.round(serverState.activeConnections / serverState.maxConnections * 100)
    })
  }, delay)
})

// 模拟慢速接口（用于 Slowloris 演示）
router.get('/slow', rateLimitMiddleware, (req, res) => {
  serverState.totalRequests++
  serverState.activeConnections++
  
  // 慢速响应，每秒发送一点数据
  res.setHeader('Content-Type', 'text/plain')
  res.setHeader('Transfer-Encoding', 'chunked')
  
  let count = 0
  const interval = setInterval(() => {
    if (count >= 10) {
      clearInterval(interval)
      serverState.activeConnections--
      res.end('\nDone')
      return
    }
    res.write(`Data chunk ${count++}\n`)
  }, 1000)
  
  req.on('close', () => {
    clearInterval(interval)
    serverState.activeConnections--
  })
})

// ==================== 状态接口 ====================

// 获取服务器状态
router.get('/status', (req, res) => {
  res.json({
    ...serverState,
    uptime: Math.round((Date.now() - serverState.startTime) / 1000),
    rateLimitEnabled: rateLimitConfig.enabled,
    blockedIPs: blockedIPs.size
  })
})

// 获取请求日志
router.get('/logs', (req, res) => {
  res.json(serverState.requestLog.slice(-50).reverse())
})

// ==================== 控制接口 ====================

// 开启/关闭限流
router.post('/ratelimit', (req, res) => {
  const { enabled, maxRps } = req.body
  
  if (typeof enabled === 'boolean') {
    rateLimitConfig.enabled = enabled
  }
  if (typeof maxRps === 'number') {
    rateLimitConfig.maxRequestsPerSecond = maxRps
  }
  
  console.log(`[DDoS Lab] 限流 ${rateLimitConfig.enabled ? '已开启' : '已关闭'}，最大 ${rateLimitConfig.maxRequestsPerSecond} RPS`)
  
  res.json({
    success: true,
    config: rateLimitConfig
  })
})

// 重置服务器状态
router.post('/reset', (req, res) => {
  serverState.totalRequests = 0
  serverState.requestsPerSecond = 0
  serverState.activeConnections = 0
  serverState.isOverloaded = false
  serverState.requestLog = []
  ipRequests.clear()
  blockedIPs.clear()
  
  res.json({ success: true, message: '服务器状态已重置' })
})

export default router
