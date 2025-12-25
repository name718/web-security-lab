import { Router } from 'express'

const router = Router()

// 反射型 XSS - 有漏洞版本
router.get('/unsafe', (req, res) => {
  const q = req.query.q || ''
  
  // ❌ 直接拼接用户输入，没有任何过滤
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>搜索结果</title>
      <style>
        body { font-family: sans-serif; padding: 2rem; background: #1a1a2e; color: #eee; }
        .result { background: #16213e; padding: 1rem; border-radius: 8px; margin-top: 1rem; }
        .warning { background: #ff6b6b22; border: 1px solid #ff6b6b; padding: 1rem; border-radius: 4px; margin-top: 1rem; }
        a { color: #e94560; }
      </style>
    </head>
    <body>
      <h1>🔍 搜索结果</h1>
      <div class="result">
        <p>你搜索的是：${q}</p>
      </div>
      <div class="warning">
        ⚠️ 这是有漏洞的版本，用户输入被直接渲染到 HTML 中
      </div>
      <p style="margin-top: 1rem;">
        <a href="/xss/search.html">返回搜索页</a>
      </p>
    </body>
    </html>
  `)
})

// 反射型 XSS - 安全版本
router.get('/safe', (req, res) => {
  const q = req.query.q || ''
  
  // ✅ HTML 实体转义
  const safeQ = escapeHtml(q)
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>搜索结果</title>
      <style>
        body { font-family: sans-serif; padding: 2rem; background: #1a1a2e; color: #eee; }
        .result { background: #16213e; padding: 1rem; border-radius: 8px; margin-top: 1rem; }
        .success { background: #51cf6622; border: 1px solid #51cf66; padding: 1rem; border-radius: 4px; margin-top: 1rem; }
        a { color: #e94560; }
      </style>
    </head>
    <body>
      <h1>🔍 搜索结果 (安全版)</h1>
      <div class="result">
        <p>你搜索的是：${safeQ}</p>
      </div>
      <div class="success">
        ✅ 输入已转义，XSS 攻击无效
      </div>
      <p style="margin-top: 1rem;">
        <a href="/xss/search.html">返回搜索页</a>
      </p>
    </body>
    </html>
  `)
})

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export default router
