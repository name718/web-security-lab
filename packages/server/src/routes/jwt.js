import { Router } from 'express'
import crypto from 'crypto'

const router = Router()

// 模拟密钥配置
const secrets = {
  weak: 'secret',           // 弱密钥，容易被爆破
  strong: crypto.randomBytes(32).toString('hex'),  // 强密钥
  public: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0Z3VS5JJcds3xfn/ygWyF8PbnGy
-----END PUBLIC KEY-----`  // 模拟 RSA 公钥
}

// 用户数据
const users = {
  admin: { id: 1, username: 'admin', role: 'admin', password: 'admin123' },
  user: { id: 2, username: 'user', role: 'user', password: '123456' }
}

// ==================== JWT 工具函数 ====================

function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) str += '='
  return Buffer.from(str, 'base64').toString()
}

function createHmacSignature(data, secret) {
  return crypto.createHmac('sha256', secret).update(data).digest('base64url')
}

// 生成 JWT
function createJwt(payload, secret, algorithm = 'HS256') {
  const header = { alg: algorithm, typ: 'JWT' }
  const headerB64 = base64UrlEncode(JSON.stringify(header))
  const payloadB64 = base64UrlEncode(JSON.stringify(payload))
  
  let signature = ''
  if (algorithm === 'HS256') {
    signature = createHmacSignature(`${headerB64}.${payloadB64}`, secret)
  } else if (algorithm === 'none') {
    signature = ''
  }
  
  return `${headerB64}.${payloadB64}.${signature}`
}

// 解析 JWT（不验证）
function parseJwt(token) {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  
  try {
    return {
      header: JSON.parse(base64UrlDecode(parts[0])),
      payload: JSON.parse(base64UrlDecode(parts[1])),
      signature: parts[2]
    }
  } catch {
    return null
  }
}

// ==================== 漏洞1: 算法混淆 (alg: none) ====================

// 有漏洞的验证（接受 alg: none）
router.post('/verify/unsafe', (req, res) => {
  const { token } = req.body
  const parsed = parseJwt(token)
  
  if (!parsed) {
    return res.json({ success: false, message: 'Token 格式错误' })
  }
  
  console.log('\n[JWT] 解析的 Header:', parsed.header)
  console.log('[JWT] 解析的 Payload:', parsed.payload)
  
  // ❌ 漏洞：接受 alg: none
  if (parsed.header.alg === 'none' || parsed.header.alg === 'None') {
    console.log('[JWT] ⚠️ 接受了 alg: none，跳过签名验证！')
    return res.json({
      success: true,
      message: '验证通过（alg: none）',
      user: parsed.payload,
      vulnerability: '算法混淆攻击成功！服务器接受了无签名的 Token'
    })
  }
  
  // 正常验证
  const expectedSig = createHmacSignature(
    `${token.split('.')[0]}.${token.split('.')[1]}`,
    secrets.weak
  )
  
  if (parsed.signature === expectedSig) {
    return res.json({ success: true, message: '验证通过', user: parsed.payload })
  }
  
  res.json({ success: false, message: '签名验证失败' })
})

// 安全的验证（拒绝 alg: none）
router.post('/verify/safe', (req, res) => {
  const { token } = req.body
  const parsed = parseJwt(token)
  
  if (!parsed) {
    return res.json({ success: false, message: 'Token 格式错误' })
  }
  
  // ✅ 安全：只接受指定算法
  if (parsed.header.alg !== 'HS256') {
    return res.json({ 
      success: false, 
      message: `不支持的算法: ${parsed.header.alg}，只接受 HS256` 
    })
  }
  
  const expectedSig = createHmacSignature(
    `${token.split('.')[0]}.${token.split('.')[1]}`,
    secrets.strong
  )
  
  if (parsed.signature === expectedSig) {
    return res.json({ success: true, message: '验证通过', user: parsed.payload })
  }
  
  res.json({ success: false, message: '签名验证失败' })
})

// ==================== 漏洞2: 弱密钥 ====================

// 使用弱密钥签发 Token
router.post('/login/weak', (req, res) => {
  const { username, password } = req.body
  const user = users[username]
  
  if (!user || user.password !== password) {
    return res.json({ success: false, message: '用户名或密码错误' })
  }
  
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600
  }
  
  // ❌ 使用弱密钥
  const token = createJwt(payload, secrets.weak)
  
  res.json({
    success: true,
    token,
    secret: secrets.weak,  // 故意暴露，实际不会这样
    hint: '密钥是常见弱密钥，可以被字典爆破'
  })
})

// 使用强密钥签发 Token
router.post('/login/strong', (req, res) => {
  const { username, password } = req.body
  const user = users[username]
  
  if (!user || user.password !== password) {
    return res.json({ success: false, message: '用户名或密码错误' })
  }
  
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600
  }
  
  // ✅ 使用强密钥
  const token = createJwt(payload, secrets.strong)
  
  res.json({ success: true, token })
})

// ==================== 漏洞3: 敏感信息泄露 ====================

// 签发包含敏感信息的 Token
router.post('/login/sensitive', (req, res) => {
  const { username, password } = req.body
  const user = users[username]
  
  if (!user || user.password !== password) {
    return res.json({ success: false, message: '用户名或密码错误' })
  }
  
  // ❌ Payload 中包含敏感信息
  const payload = {
    id: user.id,
    username: user.username,
    password: user.password,  // 不应该放密码！
    role: user.role,
    creditCard: '4111-1111-1111-1111',  // 不应该放信用卡！
    ssn: '123-45-6789',  // 不应该放身份证！
    iat: Math.floor(Date.now() / 1000)
  }
  
  const token = createJwt(payload, secrets.weak)
  
  res.json({
    success: true,
    token,
    warning: 'Token 中包含敏感信息，Base64 解码即可看到！'
  })
})

// ==================== 工具接口 ====================

// 解码 Token（不验证签名）
router.post('/decode', (req, res) => {
  const { token } = req.body
  const parsed = parseJwt(token)
  
  if (!parsed) {
    return res.json({ success: false, message: 'Token 格式错误' })
  }
  
  res.json({
    success: true,
    header: parsed.header,
    payload: parsed.payload,
    signature: parsed.signature,
    warning: 'JWT 的 Header 和 Payload 只是 Base64 编码，任何人都可以解码查看！'
  })
})

// 伪造 Token（用于演示）
router.post('/forge', (req, res) => {
  const { payload, algorithm, secret } = req.body
  
  try {
    const token = createJwt(payload, secret || '', algorithm || 'none')
    res.json({ success: true, token })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
})

// 常见弱密钥列表（用于爆破演示）
router.get('/wordlist', (req, res) => {
  res.json([
    'secret', 'password', '123456', 'admin', 'key',
    'jwt', 'token', 'test', 'dev', 'production',
    'mysecret', 'supersecret', 'changeme', 'default'
  ])
})

// 爆破验证
router.post('/bruteforce', (req, res) => {
  const { token, wordlist } = req.body
  const parsed = parseJwt(token)
  
  if (!parsed) {
    return res.json({ success: false, message: 'Token 格式错误' })
  }
  
  const headerPayload = `${token.split('.')[0]}.${token.split('.')[1]}`
  
  for (const secret of wordlist) {
    const sig = createHmacSignature(headerPayload, secret)
    if (sig === parsed.signature) {
      return res.json({
        success: true,
        message: '密钥爆破成功！',
        secret,
        payload: parsed.payload
      })
    }
  }
  
  res.json({ success: false, message: '未找到匹配的密钥' })
})

export default router
