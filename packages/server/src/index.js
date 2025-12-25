import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

import searchRouter from './routes/search.js'
import commentRouter from './routes/comment.js'
import stealRouter from './routes/steal.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = 4000

// 中间件
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 静态文件 - XSS Lab 页面
app.use('/xss', express.static(join(__dirname, '../client/xss')))

// API 路由
app.use('/api/search', searchRouter)
app.use('/api/comment', commentRouter)
app.use('/api/steal', stealRouter)

// 首页重定向
app.get('/', (req, res) => {
  res.redirect('/xss/index.html')
})

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`
🔐 ========================================
   XSS Lab Server 启动成功
   http://localhost:${PORT}
========================================

📚 实验页面:
   /xss/index.html     - 实验首页
   /xss/search.html    - 反射型 XSS
   /xss/comment.html   - 存储型 XSS
   /xss/steal.html     - Token 窃取演示

🔌 API 接口:
   GET  /api/search/unsafe?q=xxx  - 有漏洞的搜索
   GET  /api/search/safe?q=xxx    - 安全的搜索
   POST /api/comment              - 发表评论
   GET  /api/comment/list/unsafe  - 获取评论(不转义)
   GET  /api/comment/list/safe    - 获取评论(转义)
   GET  /api/steal?token=xxx      - 模拟攻击者服务器
   GET  /api/steal/list           - 查看窃取的 token
  `)
})
