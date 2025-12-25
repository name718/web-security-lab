import { Router } from 'express'

const router = Router()

// 模拟用户数据
const users = {
  alice: { password: 'alice123', balance: 10000 },
  bob: { password: 'bob456', balance: 5000 }
}

// 存储 session（不安全版本不做任何限制）
let sessions = {}
let usedTokens = new Set() // 用于防重放

// 生成简单 token
function generateToken(username, timestamp) {
  return Buffer.from(`${username}:${timestamp}:${Math.random().toString(36)}`).toString('base64')
}

// 重置
router.post('/reset', (req, res) => {
  sessions = {}
  usedTokens.clear()
  users.alice.balance = 10000
  users.bob.balance = 5000
  res.json({ success: true })
})

// ❌ 不安全：登录（token 可重放）
router.post('/unsafe/login', (req, res) => {
  const { username, password } = req.body
  if (users[username] && users[username].password === password) {
    const token = generateToken(username, Date.now())
    sessions[token] = { username, createdAt: Date.now(), device: req.headers['user-agent'] }
    res.json({ success: true, token, message: '登录成功' })
  } else {
    res.status(401).json({ success: false, error: '用户名或密码错误' })
  }
})

// ❌ 不安全：验证 token（无任何防护）
router.get('/unsafe/profile', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token || !sessions[token]) {
    return res.status(401).json({ error: '未授权' })
  }
  const session = sessions[token]
  res.json({
    username: session.username,
    balance: users[session.username].balance,
    loginTime: new Date(session.createdAt).toISOString(),
    originalDevice: session.device,
    currentDevice: req.headers['user-agent']
  })
})


// ❌ 不安全：转账（token 可重放）
router.post('/unsafe/transfer', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  const { amount } = req.body
  
  if (!token || !sessions[token]) {
    return res.status(401).json({ error: '未授权' })
  }
  
  const session = sessions[token]
  const user = users[session.username]
  
  if (user.balance >= amount) {
    user.balance -= amount
    res.json({ 
      success: true, 
      message: `转账 ¥${amount} 成功`,
      balance: user.balance 
    })
  } else {
    res.json({ success: false, error: '余额不足' })
  }
})

// ✅ 安全：登录（带设备绑定和一次性 token）
router.post('/safe/login', (req, res) => {
  const { username, password } = req.body
  const deviceId = req.headers['x-device-id'] || 'unknown'
  
  if (users[username] && users[username].password === password) {
    const token = generateToken(username, Date.now())
    sessions[token] = { 
      username, 
      createdAt: Date.now(), 
      deviceId,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    }
    res.json({ success: true, token, message: '登录成功（设备绑定）' })
  } else {
    res.status(401).json({ success: false, error: '用户名或密码错误' })
  }
})

// ✅ 安全：验证 token（设备绑定检查）
router.get('/safe/profile', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  const deviceId = req.headers['x-device-id'] || 'unknown'
  
  if (!token || !sessions[token]) {
    return res.status(401).json({ error: '未授权' })
  }
  
  const session = sessions[token]
  
  // 检查设备是否匹配
  if (session.deviceId !== deviceId) {
    return res.status(403).json({ 
      error: '设备不匹配',
      message: '检测到 Token 在不同设备使用，已拒绝访问'
    })
  }
  
  res.json({
    username: session.username,
    balance: users[session.username].balance,
    deviceBound: true
  })
})

// ✅ 安全：一次性 token 转账
router.post('/safe/transfer', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  const { amount, nonce } = req.body
  
  if (!token || !sessions[token]) {
    return res.status(401).json({ error: '未授权' })
  }
  
  // 检查 nonce 是否已使用（防重放）
  if (!nonce || usedTokens.has(nonce)) {
    return res.status(400).json({ 
      error: '请求已过期或重复',
      message: '检测到重放攻击，请求被拒绝'
    })
  }
  
  usedTokens.add(nonce)
  
  const session = sessions[token]
  const user = users[session.username]
  
  if (user.balance >= amount) {
    user.balance -= amount
    res.json({ 
      success: true, 
      message: `转账 ¥${amount} 成功（防重放保护）`,
      balance: user.balance 
    })
  } else {
    res.json({ success: false, error: '余额不足' })
  }
})

// 获取所有活跃 session
router.get('/sessions', (req, res) => {
  const list = Object.entries(sessions).map(([token, data]) => ({
    token: token.substring(0, 20) + '...',
    fullToken: token,
    ...data,
    createdAt: new Date(data.createdAt).toISOString()
  }))
  res.json(list)
})

export default router
