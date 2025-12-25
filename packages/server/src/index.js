import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

import searchRouter from './routes/search.js'
import commentRouter from './routes/comment.js'
import stealRouter from './routes/steal.js'
import sqlRouter from './routes/sql.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = 4000

// 中间件
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 静态文件
app.use('/xss', express.static(join(__dirname, '../client/xss')))
app.use('/sql', express.static(join(__dirname, '../client/sql')))

// API 路由
app.use('/api/search', searchRouter)
app.use('/api/comment', commentRouter)
app.use('/api/steal', stealRouter)
app.use('/api/sql', sqlRouter)

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
   Security Lab Server 启动成功
   http://localhost:${PORT}
========================================

📚 XSS Lab:
   /xss/index.html     - XSS 实验首页
   /xss/search.html    - 反射型 XSS
   /xss/comment.html   - 存储型 XSS
   /xss/steal.html     - Token 窃取

📚 SQL注入 Lab:
   /sql/index.html     - SQL注入实验首页
   /sql/login.html     - 登录绕过
   /sql/union.html     - UNION注入
   /sql/search.html    - 搜索注入
  `)
})
