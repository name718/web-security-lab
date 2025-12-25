import express from 'express'
import cors from 'cors'

const app = express()
const PORT = 4000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 模拟用户数据
const users = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin', balance: 10000 },
  { id: 2, username: 'user1', password: '123456', role: 'user', balance: 500 },
  { id: 3, username: 'test', password: 'test', role: 'user', balance: 100 },
  { id: 4, username: 'hacker', password: 'hack', role: 'user', balance: 0 }
]

// 不安全的登录接口 (SQL注入演示)
app.post('/api/unsafe-login', (req, res) => {
  const { username, password } = req.body
  
  // 模拟不安全的SQL查询
  const query = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`
  console.log('执行SQL:', query)
  
  // 模拟SQL注入漏洞
  if (username.includes("' OR '1'='1") || username.includes("' OR 1=1--")) {
    return res.json({ success: true, user: users[0], query })
  }
  
  const user = users.find(u => u.username === username && u.password === password)
  if (user) {
    res.json({ success: true, user, query })
  } else {
    res.json({ success: false, message: '登录失败', query })
  }
})

// 安全的登录接口
app.post('/api/safe-login', (req, res) => {
  const { username, password } = req.body
  const user = users.find(u => u.username === username && u.password === password)
  
  if (user) {
    res.json({ success: true, user })
  } else {
    res.json({ success: false, message: '用户名或密码错误' })
  }
})

// 不安全的搜索接口 (XSS演示)
app.get('/api/search', (req, res) => {
  const { q } = req.query
  // 直接返回用户输入，存在反射型XSS风险
  res.json({ 
    result: `搜索结果: ${q}`,
    warning: '此接口未对输入进行转义'
  })
})

// 转账接口 (CSRF演示)
app.post('/api/transfer', (req, res) => {
  const { from, to, amount, csrfToken } = req.body
  
  // 如果启用了CSRF保护，验证token
  if (req.headers['x-csrf-protection'] === 'true') {
    if (!csrfToken) {
      return res.json({ success: false, message: 'CSRF Token缺失' })
    }
  }
  
  const fromUser = users.find(u => u.username === from)
  const toUser = users.find(u => u.username === to)
  
  if (!fromUser || !toUser) {
    return res.json({ success: false, message: '用户不存在' })
  }
  
  if (fromUser.balance < amount) {
    return res.json({ success: false, message: '余额不足' })
  }
  
  fromUser.balance -= amount
  toUser.balance += amount
  
  res.json({ 
    success: true, 
    message: `成功从 ${from} 转账 ${amount} 到 ${to}`,
    fromBalance: fromUser.balance,
    toBalance: toUser.balance
  })
})

// 获取用户列表
app.get('/api/users', (req, res) => {
  res.json(users)
})

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`🚀 Security Lab Server running at http://localhost:${PORT}`)
  console.log('可用接口:')
  console.log('  POST /api/unsafe-login - 不安全登录(SQL注入演示)')
  console.log('  POST /api/safe-login   - 安全登录')
  console.log('  GET  /api/search       - 搜索(XSS演示)')
  console.log('  POST /api/transfer     - 转账(CSRF演示)')
  console.log('  GET  /api/users        - 用户列表')
})
