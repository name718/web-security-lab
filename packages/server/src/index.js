import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

import searchRouter from './routes/search.js'
import commentRouter from './routes/comment.js'
import stealRouter from './routes/steal.js'
import sqlRouter from './routes/sql.js'
import csrfRouter from './routes/csrf.js'

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
app.use('/csrf', express.static(join(__dirname, '../client/csrf')))
app.use('/', express.static(join(__dirname, '../client')))

// API 路由
app.use('/api/search', searchRouter)
app.use('/api/comment', commentRouter)
app.use('/api/steal', stealRouter)
app.use('/api/sql', sqlRouter)
app.use('/api/csrf', csrfRouter)

// 首页
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, '../client/index.html'))
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

📚 XSS Lab:        /xss/index.html
📚 SQL注入 Lab:    /sql/index.html
📚 CSRF Lab:       /csrf/index.html
  `)
})
