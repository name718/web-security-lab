import { Router } from 'express'

const router = Router()

// 内存存储评论
const comments = []

// 获取评论列表 - 有漏洞版本 (返回原始 HTML)
router.get('/list/unsafe', (req, res) => {
  res.json({ 
    comments,
    warning: '这些评论未经转义，前端使用 innerHTML 渲染会触发 XSS'
  })
})

// 获取评论列表 - 安全版本 (返回转义后的内容)
router.get('/list/safe', (req, res) => {
  const safeComments = comments.map(c => ({
    ...c,
    content: escapeHtml(c.content)
  }))
  res.json({ comments: safeComments })
})

// 发表评论
router.post('/', (req, res) => {
  const { author, content } = req.body
  
  if (!content) {
    return res.status(400).json({ error: '评论内容不能为空' })
  }
  
  const comment = {
    id: Date.now(),
    author: author || '匿名用户',
    content, // ❌ 直接存储，不做任何过滤
    time: new Date().toLocaleString('zh-CN')
  }
  
  comments.push(comment)
  console.log('[存储型XSS] 新评论:', content)
  
  res.json({ success: true, comment })
})

// 清空评论
router.delete('/clear', (req, res) => {
  comments.length = 0
  res.json({ success: true, message: '评论已清空' })
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
