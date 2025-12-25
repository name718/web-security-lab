import { Router } from 'express'
import crypto from 'crypto'

const router = Router()

// 模拟用户数据
const users = {
  victim: { id: 1, username: 'victim', password: '123456', balance: 10000 },
  hacker: { id: 2, username: 'hacker', password: 'hack', balance: 0 }
}

// 模拟 Session 存储
const sessions = {}

// 转账记录
const transferLogs = []

// 生成 CSRF Token
function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex')
}

// ==================== 登录/登出 ====================

router.post('/login', (req, res) => {
  const { username, password } = req.body
  const user = users[username]
  
  if (user && user.password === password) {
    // 创建 session
    const sessionId = crypto.randomBytes(16).toString('hex')
    const csrfToken = generateCsrfToken()
    
    sessions[sessionId] = {
      userId: user.id,
      username: user.username,
      csrfToken,
      createdAt: Date.now()
    }
    
    console.log(`\n[CSRF Lab] 用户 ${username} 登录成功`)
    console.log(`Session ID: ${sessionId}`)
    console.log(`CSRF Token: ${csrfToken}\n`)
    
    res.json({
      success: true,
      sessionId,
      csrfToken,
      user: { username: user.username, balance: user.balance }
    })
  } else {
    res.json({ success: false, message: '用户名或密码错误' })
  }
})

router.post('/logout', (req, res) => {
  const sessionId = req.headers['x-session-id']
  if (sessionId && sessions[sessionId]) {
    delete sessions[sessionId]
  }
  res.json({ success: true })
})

// 获取当前用户信息
router.get('/me', (req, res) => {
  const sessionId = req.headers['x-session-id']
  const session = sessions[sessionId]
  
  if (!session) {
    return res.json({ success: false, message: '未登录' })
  }
  
  const user = Object.values(users).find(u => u.id === session.userId)
  res.json({
    success: true,
    user: { username: user.username, balance: user.balance },
    csrfToken: session.csrfToken
  })
})

// ==================== 转账接口 ====================

// 有漏洞的转账（无 CSRF 防护）
router.post('/transfer/unsafe', (req, res) => {
  const sessionId = req.headers['x-session-id']
  const session = sessions[sessionId]
  
  if (!session) {
    return res.json({ success: false, message: '未登录' })
  }
  
  const { to, amount } = req.body
  const fromUser = Object.values(users).find(u => u.id === session.userId)
  const toUser = users[to]
  
  if (!toUser) {
    return res.json({ success: false, message: '收款人不存在' })
  }
  
  const transferAmount = parseInt(amount)
  if (isNaN(transferAmount) || transferAmount <= 0) {
    return res.json({ success: false, message: '金额无效' })
  }
  
  if (fromUser.balance < transferAmount) {
    return res.json({ success: false, message: '余额不足' })
  }
  
  // 执行转账
  fromUser.balance -= transferAmount
  toUser.balance += transferAmount
  
  const log = {
    id: Date.now(),
    from: fromUser.username,
    to: toUser.username,
    amount: transferAmount,
    time: new Date().toLocaleString('zh-CN'),
    protected: false
  }
  transferLogs.push(log)
  
  console.log(`\n🚨 [CSRF攻击成功] ${fromUser.username} -> ${toUser.username}: ¥${transferAmount}`)
  console.log(`   无 CSRF Token 验证！\n`)
  
  res.json({
    success: true,
    message: `成功转账 ¥${transferAmount} 给 ${to}`,
    balance: fromUser.balance
  })
})

// 安全的转账（有 CSRF Token 验证）
router.post('/transfer/safe', (req, res) => {
  const sessionId = req.headers['x-session-id']
  const csrfToken = req.headers['x-csrf-token']
  const session = sessions[sessionId]
  
  if (!session) {
    return res.json({ success: false, message: '未登录' })
  }
  
  // ✅ 验证 CSRF Token
  if (!csrfToken || csrfToken !== session.csrfToken) {
    console.log(`\n✅ [CSRF攻击被拦截] Token 验证失败`)
    console.log(`   期望: ${session.csrfToken}`)
    console.log(`   收到: ${csrfToken}\n`)
    
    return res.json({ success: false, message: 'CSRF Token 验证失败，请求被拒绝' })
  }
  
  const { to, amount } = req.body
  const fromUser = Object.values(users).find(u => u.id === session.userId)
  const toUser = users[to]
  
  if (!toUser) {
    return res.json({ success: false, message: '收款人不存在' })
  }
  
  const transferAmount = parseInt(amount)
  if (isNaN(transferAmount) || transferAmount <= 0) {
    return res.json({ success: false, message: '金额无效' })
  }
  
  if (fromUser.balance < transferAmount) {
    return res.json({ success: false, message: '余额不足' })
  }
  
  // 执行转账
  fromUser.balance -= transferAmount
  toUser.balance += transferAmount
  
  // 刷新 CSRF Token（一次性使用）
  session.csrfToken = generateCsrfToken()
  
  const log = {
    id: Date.now(),
    from: fromUser.username,
    to: toUser.username,
    amount: transferAmount,
    time: new Date().toLocaleString('zh-CN'),
    protected: true
  }
  transferLogs.push(log)
  
  res.json({
    success: true,
    message: `成功转账 ¥${transferAmount} 给 ${to}`,
    balance: fromUser.balance,
    newCsrfToken: session.csrfToken
  })
})

// ==================== 辅助接口 ====================

// 获取转账记录
router.get('/logs', (req, res) => {
  res.json(transferLogs.slice(-20).reverse())
})

// 重置数据
router.post('/reset', (req, res) => {
  users.victim.balance = 10000
  users.hacker.balance = 0
  transferLogs.length = 0
  res.json({ success: true, message: '数据已重置' })
})

// 获取所有用户余额（用于展示）
router.get('/balances', (req, res) => {
  res.json({
    victim: users.victim.balance,
    hacker: users.hacker.balance
  })
})

export default router
