import { Router } from 'express'

const router = Router()

// 模拟用户账户
let userAccount = {
  balance: 10000,
  actions: []
}

// 重置账户
router.post('/reset', (req, res) => {
  userAccount = {
    balance: 10000,
    actions: []
  }
  res.json({ success: true, account: userAccount })
})

// 获取账户信息
router.get('/account', (req, res) => {
  res.json(userAccount)
})

// ❌ 不安全：无 X-Frame-Options 保护的转账页面
router.get('/unsafe/transfer-page', (req, res) => {
  // 没有设置任何防护头
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>银行转账</title>
      <style>
        body { font-family: Arial; padding: 20px; background: #f5f5f5; }
        .container { max-width: 400px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h2 { color: #1a73e8; }
        .btn { background: #1a73e8; color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer; font-size: 16px; width: 100%; }
        .btn:hover { background: #1557b0; }
        .balance { background: #e8f5e9; padding: 10px; border-radius: 4px; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>🏦 安全银行</h2>
        <div class="balance">当前余额: ¥${userAccount.balance}</div>
        <p>点击下方按钮领取 ¥1000 红包奖励</p>
        <button class="btn" onclick="transfer()">🎁 领取红包</button>
      </div>
      <script>
        function transfer() {
          fetch('/api/clickjacking/unsafe/transfer', { method: 'POST' })
            .then(r => r.json())
            .then(data => {
              if (data.success) {
                alert('转账成功！已转出 ¥1000')
                location.reload()
              }
            })
        }
      </script>
    </body>
    </html>
  `)
})

// ❌ 不安全：执行转账
router.post('/unsafe/transfer', (req, res) => {
  if (userAccount.balance >= 1000) {
    userAccount.balance -= 1000
    userAccount.actions.push({
      type: 'transfer',
      amount: 1000,
      time: new Date().toISOString(),
      protected: false
    })
    res.json({ success: true, balance: userAccount.balance })
  } else {
    res.json({ success: false, error: '余额不足' })
  }
})

// ✅ 安全：X-Frame-Options 保护
router.get('/safe/xframe/transfer-page', (req, res) => {
  res.setHeader('X-Frame-Options', 'DENY')
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>银行转账 (X-Frame-Options 保护)</title>
      <style>
        body { font-family: Arial; padding: 20px; background: #f5f5f5; }
        .container { max-width: 400px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h2 { color: #4caf50; }
        .btn { background: #4caf50; color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer; font-size: 16px; width: 100%; }
        .protected { background: #e8f5e9; padding: 10px; border-radius: 4px; margin-bottom: 20px; border-left: 4px solid #4caf50; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>🔒 安全银行</h2>
        <div class="protected">
          <strong>✅ X-Frame-Options: DENY</strong><br>
          此页面无法被嵌入 iframe
        </div>
        <button class="btn" onclick="transfer()">确认转账</button>
      </div>
      <script>
        function transfer() {
          fetch('/api/clickjacking/safe/transfer', { method: 'POST' })
            .then(r => r.json())
            .then(data => alert(data.success ? '转账成功' : '转账失败'))
        }
      </script>
    </body>
    </html>
  `)
})

// ✅ 安全：CSP frame-ancestors 保护
router.get('/safe/csp/transfer-page', (req, res) => {
  res.setHeader('Content-Security-Policy', "frame-ancestors 'none'")
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>银行转账 (CSP 保护)</title>
      <style>
        body { font-family: Arial; padding: 20px; background: #f5f5f5; }
        .container { max-width: 400px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h2 { color: #2196f3; }
        .btn { background: #2196f3; color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer; font-size: 16px; width: 100%; }
        .protected { background: #e3f2fd; padding: 10px; border-radius: 4px; margin-bottom: 20px; border-left: 4px solid #2196f3; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>🛡️ 安全银行</h2>
        <div class="protected">
          <strong>✅ CSP: frame-ancestors 'none'</strong><br>
          此页面无法被嵌入 iframe
        </div>
        <button class="btn" onclick="transfer()">确认转账</button>
      </div>
      <script>
        function transfer() {
          fetch('/api/clickjacking/safe/transfer', { method: 'POST' })
            .then(r => r.json())
            .then(data => alert(data.success ? '转账成功' : '转账失败'))
        }
      </script>
    </body>
    </html>
  `)
})

// ✅ 安全转账
router.post('/safe/transfer', (req, res) => {
  if (userAccount.balance >= 1000) {
    userAccount.balance -= 1000
    userAccount.actions.push({
      type: 'transfer',
      amount: 1000,
      time: new Date().toISOString(),
      protected: true
    })
    res.json({ success: true, balance: userAccount.balance })
  } else {
    res.json({ success: false, error: '余额不足' })
  }
})

export default router
