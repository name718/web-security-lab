import { Router } from 'express'

const router = Router()

// 模拟用户数据库（用户在多个网站使用相同密码）
const users = {
  'alice@example.com': { password: 'alice123', name: 'Alice' },
  'bob@example.com': { password: 'bob456', name: 'Bob' },
  'charlie@example.com': { password: 'qwerty', name: 'Charlie' },
  'david@example.com': { password: '123456', name: 'David' },
  'eve@example.com': { password: 'password', name: 'Eve' }
}

// 模拟泄露的凭证库（从其他网站泄露）
const leakedCredentials = [
  { email: 'alice@example.com', password: 'alice123', source: 'SiteA 数据泄露' },
  { email: 'bob@example.com', password: 'bob456', source: 'SiteB 数据泄露' },
  { email: 'charlie@example.com', password: 'qwerty', source: 'SiteC 数据泄露' },
  { email: 'david@example.com', password: '123456', source: '常见密码字典' },
  { email: 'eve@example.com', password: 'password', source: '常见密码字典' },
  { email: 'frank@example.com', password: 'frank789', source: 'SiteA 数据泄露' },
  { email: 'grace@example.com', password: 'grace000', source: 'SiteB 数据泄露' }
]

// 攻击统计
let attackStats = {
  attempts: 0,
  successes: 0,
  blocked: 0,
  results: []
}

// IP 登录记录（用于限流）
const ipAttempts = {}

// 重置
router.post('/reset', (req, res) => {
  attackStats = { attempts: 0, successes: 0, blocked: 0, results: [] }
  Object.keys(ipAttempts).forEach(k => delete ipAttempts[k])
  res.json({ success: true })
})

// 获取泄露凭证库
router.get('/leaked', (req, res) => {
  res.json(leakedCredentials)
})

// 获取攻击统计
router.get('/stats', (req, res) => {
  res.json(attackStats)
})


// ❌ 不安全：无任何防护的登录
router.post('/unsafe/login', (req, res) => {
  const { email, password } = req.body
  
  attackStats.attempts++
  
  const user = users[email]
  if (user && user.password === password) {
    attackStats.successes++
    attackStats.results.push({
      email,
      status: 'success',
      time: new Date().toISOString()
    })
    res.json({ success: true, message: `登录成功！欢迎 ${user.name}` })
  } else {
    attackStats.results.push({
      email,
      status: 'failed',
      time: new Date().toISOString()
    })
    res.status(401).json({ success: false, error: '用户名或密码错误' })
  }
})

// ❌ 批量撞库攻击
router.post('/attack/batch', (req, res) => {
  const results = []
  
  for (const cred of leakedCredentials) {
    attackStats.attempts++
    const user = users[cred.email]
    
    if (user && user.password === cred.password) {
      attackStats.successes++
      results.push({
        email: cred.email,
        status: '✅ 撞库成功',
        source: cred.source
      })
    } else {
      results.push({
        email: cred.email,
        status: '❌ 失败',
        source: cred.source
      })
    }
  }
  
  res.json({
    total: leakedCredentials.length,
    success: results.filter(r => r.status.includes('成功')).length,
    results
  })
})

// ✅ 安全：带限流的登录
router.post('/safe/login', (req, res) => {
  const { email, password } = req.body
  const ip = req.ip || 'unknown'
  
  // 初始化 IP 记录
  if (!ipAttempts[ip]) {
    ipAttempts[ip] = { count: 0, lastAttempt: Date.now(), blocked: false }
  }
  
  const record = ipAttempts[ip]
  
  // 检查是否被封禁
  if (record.blocked) {
    const blockTime = 60000 // 1分钟
    if (Date.now() - record.lastAttempt < blockTime) {
      attackStats.blocked++
      return res.status(429).json({
        success: false,
        error: '请求过于频繁，请稍后再试',
        retryAfter: Math.ceil((blockTime - (Date.now() - record.lastAttempt)) / 1000)
      })
    }
    record.blocked = false
    record.count = 0
  }
  
  // 更新尝试次数
  record.count++
  record.lastAttempt = Date.now()
  
  // 超过5次尝试则封禁
  if (record.count > 5) {
    record.blocked = true
    attackStats.blocked++
    return res.status(429).json({
      success: false,
      error: '登录尝试次数过多，账户已被临时锁定',
      retryAfter: 60
    })
  }
  
  attackStats.attempts++
  
  const user = users[email]
  if (user && user.password === password) {
    record.count = 0 // 成功后重置
    attackStats.successes++
    res.json({ success: true, message: `登录成功！欢迎 ${user.name}` })
  } else {
    res.status(401).json({
      success: false,
      error: '用户名或密码错误',
      remainingAttempts: 5 - record.count
    })
  }
})

// ✅ 安全：带验证码的登录（模拟）
router.post('/safe/login-captcha', (req, res) => {
  const { email, password, captcha } = req.body
  
  // 模拟验证码验证
  if (!captcha || captcha !== 'VALID') {
    return res.status(400).json({
      success: false,
      error: '验证码错误或已过期',
      requireCaptcha: true
    })
  }
  
  const user = users[email]
  if (user && user.password === password) {
    res.json({ success: true, message: `登录成功！欢迎 ${user.name}` })
  } else {
    res.status(401).json({ success: false, error: '用户名或密码错误' })
  }
})

export default router
