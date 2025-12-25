import { Router } from 'express'

const router = Router()

// 模拟通信记录
let communications = []
let interceptedData = []

// 模拟用户账户
const users = {
  alice: { password: 'alice123', balance: 10000 },
  bob: { password: 'bob456', balance: 5000 }
}

// 重置
router.post('/reset', (req, res) => {
  communications = []
  interceptedData = []
  users.alice.balance = 10000
  users.bob.balance = 5000
  res.json({ success: true })
})

// 获取通信记录
router.get('/communications', (req, res) => {
  res.json(communications)
})

// 获取截获的数据
router.get('/intercepted', (req, res) => {
  res.json(interceptedData)
})

// ❌ 不安全：HTTP 明文传输登录
router.post('/unsafe/login', (req, res) => {
  const { username, password } = req.body
  
  // 记录通信（模拟被截获）
  const comm = {
    id: Date.now(),
    type: 'login',
    protocol: 'HTTP',
    encrypted: false,
    data: { username, password },
    timestamp: new Date().toISOString()
  }
  communications.push(comm)
  interceptedData.push({
    ...comm,
    warning: '⚠️ 明文密码被截获！'
  })
  
  if (users[username] && users[username].password === password) {
    res.json({ success: true, message: '登录成功（不安全）' })
  } else {
    res.status(401).json({ success: false, error: '登录失败' })
  }
})


// ❌ 不安全：HTTP 明文传输转账
router.post('/unsafe/transfer', (req, res) => {
  const { from, to, amount } = req.body
  
  const comm = {
    id: Date.now(),
    type: 'transfer',
    protocol: 'HTTP',
    encrypted: false,
    data: { from, to, amount },
    timestamp: new Date().toISOString()
  }
  communications.push(comm)
  interceptedData.push({
    ...comm,
    warning: '⚠️ 转账信息被截获，可被篡改！'
  })
  
  if (users[from] && users[from].balance >= amount) {
    users[from].balance -= amount
    if (users[to]) users[to].balance += amount
    res.json({ success: true, message: `转账 ¥${amount} 成功` })
  } else {
    res.json({ success: false, error: '余额不足' })
  }
})

// 模拟中间人篡改请求
router.post('/attack/tamper', (req, res) => {
  const { originalTo, tamperedTo, amount } = req.body
  
  // 模拟攻击者篡改收款人
  const comm = {
    id: Date.now(),
    type: 'tampered_transfer',
    protocol: 'HTTP',
    encrypted: false,
    original: { to: originalTo, amount },
    tampered: { to: tamperedTo, amount },
    timestamp: new Date().toISOString()
  }
  communications.push(comm)
  interceptedData.push({
    ...comm,
    warning: '🔴 请求被篡改！收款人从 ' + originalTo + ' 改为 ' + tamperedTo
  })
  
  // 执行篡改后的转账
  if (users.alice && users.alice.balance >= amount) {
    users.alice.balance -= amount
    if (users[tamperedTo]) users[tamperedTo].balance += amount
    res.json({ 
      success: true, 
      message: `篡改成功！钱转给了 ${tamperedTo}`,
      tampered: true
    })
  } else {
    res.json({ success: false, error: '余额不足' })
  }
})

// ✅ 安全：HTTPS 加密传输（模拟）
router.post('/safe/login', (req, res) => {
  const { username, password } = req.body
  
  // 模拟加密后的数据
  const encryptedData = Buffer.from(JSON.stringify({ username, password })).toString('base64')
  
  const comm = {
    id: Date.now(),
    type: 'login',
    protocol: 'HTTPS',
    encrypted: true,
    data: encryptedData,
    displayData: '🔒 [加密数据，无法读取]',
    timestamp: new Date().toISOString()
  }
  communications.push(comm)
  
  if (users[username] && users[username].password === password) {
    res.json({ success: true, message: '登录成功（HTTPS 加密）' })
  } else {
    res.status(401).json({ success: false, error: '登录失败' })
  }
})

// ✅ 安全：带完整性校验的传输
router.post('/safe/transfer', (req, res) => {
  const { from, to, amount, signature } = req.body
  
  // 模拟签名验证
  const expectedSig = Buffer.from(`${from}:${to}:${amount}:secret`).toString('base64')
  
  const comm = {
    id: Date.now(),
    type: 'transfer',
    protocol: 'HTTPS',
    encrypted: true,
    signed: true,
    signatureValid: signature === expectedSig,
    timestamp: new Date().toISOString()
  }
  communications.push(comm)
  
  if (signature !== expectedSig) {
    return res.status(400).json({ 
      success: false, 
      error: '签名验证失败，请求可能被篡改' 
    })
  }
  
  if (users[from] && users[from].balance >= amount) {
    users[from].balance -= amount
    if (users[to]) users[to].balance += amount
    res.json({ success: true, message: `安全转账 ¥${amount} 成功` })
  } else {
    res.json({ success: false, error: '余额不足' })
  }
})

// 获取账户余额
router.get('/balance', (req, res) => {
  res.json({
    alice: users.alice.balance,
    bob: users.bob.balance
  })
})

export default router
