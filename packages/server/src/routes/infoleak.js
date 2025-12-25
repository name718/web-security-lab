import { Router } from 'express'

const router = Router()

// 模拟配置信息
const serverConfig = {
  database: {
    host: 'db.internal.company.com',
    port: 3306,
    username: 'admin',
    password: 'Super$ecret123!',
    database: 'production_db'
  },
  redis: {
    host: 'redis.internal.company.com',
    password: 'redis_pass_2024'
  },
  aws: {
    accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
    secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
    region: 'us-east-1'
  },
  jwt: {
    secret: 'my-super-secret-jwt-key-12345',
    expiresIn: '7d'
  },
  apiKeys: {
    stripe: 'sk_live_51ABC123DEF456',
    sendgrid: 'SG.xxxxxxxxxxxxx'
  }
}

// ❌ 不安全：暴露 debug 接口
router.get('/unsafe/debug', (req, res) => {
  res.json({
    env: process.env.NODE_ENV || 'development',
    config: serverConfig,
    memory: process.memoryUsage(),
    uptime: process.uptime(),
    versions: process.versions
  })
})

// ❌ 不安全：详细错误堆栈
router.get('/unsafe/error', (req, res) => {
  try {
    const obj = null
    obj.someMethod() // 故意触发错误
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack,
      file: __filename,
      config: serverConfig.database // 泄露配置
    })
  }
})

// ❌ 不安全：配置文件暴露
router.get('/unsafe/config', (req, res) => {
  res.json(serverConfig)
})


// ❌ 不安全：.env 文件暴露
router.get('/unsafe/env', (req, res) => {
  res.type('text/plain').send(`
# 生产环境配置 - 请勿泄露！
NODE_ENV=production
DB_HOST=db.internal.company.com
DB_USER=admin
DB_PASS=Super$ecret123!
AWS_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
JWT_SECRET=my-super-secret-jwt-key-12345
STRIPE_KEY=sk_live_51ABC123DEF456
  `.trim())
})

// ❌ 不安全：源码泄露
router.get('/unsafe/source', (req, res) => {
  res.type('text/plain').send(`
// server.js - 主服务器文件
const express = require('express')
const jwt = require('jsonwebtoken')

const JWT_SECRET = 'my-super-secret-jwt-key-12345'
const DB_PASSWORD = 'Super$ecret123!'

app.post('/login', (req, res) => {
  // TODO: 修复 SQL 注入漏洞
  const query = \`SELECT * FROM users WHERE username='\${req.body.username}'\`
  // ...
})
  `.trim())
})

// ✅ 安全：生产环境错误处理
router.get('/safe/error', (req, res) => {
  try {
    const obj = null
    obj.someMethod()
  } catch (error) {
    console.error('[ERROR]', error) // 只在服务端记录
    res.status(500).json({
      error: 'Internal Server Error',
      message: '服务器内部错误，请稍后重试',
      requestId: 'req_' + Date.now() // 用于追踪
    })
  }
})

// ✅ 安全：健康检查（不暴露敏感信息）
router.get('/safe/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  })
})

export default router
