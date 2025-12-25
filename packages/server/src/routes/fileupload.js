import { Router } from 'express'

const router = Router()

// 模拟已上传的文件
let uploadedFiles = []

// 允许的扩展名（白名单）
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.pdf']
// 允许的 MIME 类型
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']

// 重置
router.post('/reset', (req, res) => {
  uploadedFiles = []
  res.json({ success: true })
})

// 获取文件列表
router.get('/files', (req, res) => {
  res.json(uploadedFiles)
})

// ❌ 不安全：只检查扩展名（可被绕过）
router.post('/unsafe/extension', (req, res) => {
  const { filename, content, mime } = req.body
  
  // 只检查最后的扩展名
  const ext = filename.substring(filename.lastIndexOf('.'))
  
  if (!ALLOWED_EXTENSIONS.includes(ext.toLowerCase())) {
    return res.status(400).json({ 
      error: '不允许的文件类型',
      allowed: ALLOWED_EXTENSIONS 
    })
  }
  
  // 漏洞：没有检查双扩展名如 shell.php.jpg
  const file = {
    id: Date.now(),
    filename,
    mime,
    content: content.substring(0, 100),
    uploadTime: new Date().toISOString(),
    vulnerability: 'extension-only'
  }
  uploadedFiles.push(file)
  
  res.json({ 
    success: true, 
    message: '文件上传成功（仅扩展名检查）',
    file 
  })
})

// ❌ 不安全：只检查 MIME 类型（可被伪造）
router.post('/unsafe/mime', (req, res) => {
  const { filename, content, mime } = req.body
  
  // 只检查 Content-Type
  if (!ALLOWED_MIMES.includes(mime)) {
    return res.status(400).json({ 
      error: '不允许的 MIME 类型',
      allowed: ALLOWED_MIMES 
    })
  }

  // 漏洞：MIME 类型可以被客户端伪造
  const file = {
    id: Date.now(),
    filename,
    mime,
    content: content.substring(0, 100),
    uploadTime: new Date().toISOString(),
    vulnerability: 'mime-only'
  }
  uploadedFiles.push(file)
  
  res.json({ 
    success: true, 
    message: '文件上传成功（仅 MIME 检查）',
    file 
  })
})

// ❌ 不安全：黑名单检查（容易遗漏）
router.post('/unsafe/blacklist', (req, res) => {
  const { filename, content, mime } = req.body
  
  const BLACKLIST = ['.php', '.jsp', '.asp', '.exe']
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase()
  
  if (BLACKLIST.includes(ext)) {
    return res.status(400).json({ 
      error: '危险文件类型',
      blocked: BLACKLIST 
    })
  }
  
  // 漏洞：遗漏了 .phtml, .php5, .aspx 等
  const file = {
    id: Date.now(),
    filename,
    mime,
    content: content.substring(0, 100),
    uploadTime: new Date().toISOString(),
    vulnerability: 'blacklist'
  }
  uploadedFiles.push(file)
  
  res.json({ 
    success: true, 
    message: '文件上传成功（黑名单检查）',
    file 
  })
})

// ✅ 安全：多重验证
router.post('/safe/upload', (req, res) => {
  const { filename, content, mime } = req.body
  
  // 1. 检查扩展名（白名单）
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return res.status(400).json({ error: '不允许的扩展名' })
  }
  
  // 2. 检查是否有双扩展名
  const parts = filename.split('.')
  if (parts.length > 2) {
    const suspiciousExts = ['.php', '.jsp', '.asp', '.exe', '.sh', '.py']
    for (const part of parts.slice(0, -1)) {
      if (suspiciousExts.some(e => e.includes(part.toLowerCase()))) {
        return res.status(400).json({ error: '检测到可疑的双扩展名' })
      }
    }
  }
  
  // 3. 检查 MIME 类型
  if (!ALLOWED_MIMES.includes(mime)) {
    return res.status(400).json({ error: '不允许的 MIME 类型' })
  }
  
  // 4. 检查文件内容魔数（模拟）
  const magicNumbers = {
    'image/jpeg': 'FFD8FF',
    'image/png': '89504E47',
    'image/gif': '47494638',
    'application/pdf': '25504446'
  }
  
  // 5. 重命名文件（移除原始文件名）
  const safeFilename = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}${ext}`
  
  const file = {
    id: Date.now(),
    originalName: filename,
    filename: safeFilename,
    mime,
    content: content.substring(0, 100),
    uploadTime: new Date().toISOString(),
    vulnerability: 'none'
  }
  uploadedFiles.push(file)
  
  res.json({ 
    success: true, 
    message: '文件上传成功（多重验证）',
    file 
  })
})

export default router
