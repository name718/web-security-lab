import { Router } from 'express'

const router = Router()

// 模拟数据库
const users = {
  1: { id: 1, username: 'zhangsan', email: 'zhangsan@test.com', phone: '138****1234', role: 'user' },
  2: { id: 2, username: 'lisi', email: 'lisi@test.com', phone: '139****5678', role: 'user' },
  3: { id: 3, username: 'admin', email: 'admin@test.com', phone: '137****0000', role: 'admin' }
}

const orders = {
  1001: { id: 1001, userId: 1, product: 'iPhone 15 Pro', amount: 9999, status: '已发货', address: '北京市朝阳区xxx' },
  1002: { id: 1002, userId: 1, product: 'AirPods Pro', amount: 1999, status: '待付款', address: '北京市朝阳区xxx' },
  1003: { id: 1003, userId: 2, product: 'MacBook Pro', amount: 19999, status: '已完成', address: '上海市浦东新区xxx' },
  1004: { id: 1004, userId: 2, product: 'iPad Air', amount: 4999, status: '已发货', address: '上海市浦东新区xxx' }
}

const files = {
  'doc_001': { id: 'doc_001', userId: 1, name: '工资单_202401.pdf', content: '张三 2024年1月工资: ¥25,000' },
  'doc_002': { id: 'doc_002', userId: 1, name: '合同.pdf', content: '机密合同内容...' },
  'doc_003': { id: 'doc_003', userId: 2, name: '工资单_202401.pdf', content: '李四 2024年1月工资: ¥30,000' },
  'doc_004': { id: 'doc_004', userId: 3, name: '公司财务报表.xlsx', content: '公司机密财务数据...' }
}

// 当前登录用户（模拟 session）
let currentUser = null

// ==================== 登录 ====================

router.post('/login', (req, res) => {
  const { userId } = req.body
  currentUser = users[userId]
  
  if (currentUser) {
    res.json({ success: true, user: currentUser })
  } else {
    res.json({ success: false, message: '用户不存在' })
  }
})

router.get('/me', (req, res) => {
  if (currentUser) {
    res.json({ success: true, user: currentUser })
  } else {
    res.json({ success: false, message: '未登录' })
  }
})

router.post('/logout', (req, res) => {
  currentUser = null
  res.json({ success: true })
})

// ==================== IDOR 漏洞1: 查看他人订单 ====================

// 有漏洞：只校验订单是否存在，不校验是否属于当前用户
router.get('/order/unsafe/:orderId', (req, res) => {
  const order = orders[req.params.orderId]
  
  if (!order) {
    return res.json({ success: false, message: '订单不存在' })
  }
  
  // ❌ 没有校验 order.userId === currentUser.id
  console.log(`[IDOR] 用户 ${currentUser?.id} 访问了订单 ${order.id}（属于用户 ${order.userId}）`)
  
  res.json({ 
    success: true, 
    order,
    vulnerability: currentUser && order.userId !== currentUser.id 
      ? `⚠️ 越权访问！你(用户${currentUser.id})查看了用户${order.userId}的订单` 
      : null
  })
})

// 安全版本：校验订单归属
router.get('/order/safe/:orderId', (req, res) => {
  if (!currentUser) {
    return res.json({ success: false, message: '请先登录' })
  }
  
  const order = orders[req.params.orderId]
  
  if (!order) {
    return res.json({ success: false, message: '订单不存在' })
  }
  
  // ✅ 校验订单是否属于当前用户
  if (order.userId !== currentUser.id && currentUser.role !== 'admin') {
    return res.json({ success: false, message: '无权访问此订单' })
  }
  
  res.json({ success: true, order })
})

// ==================== IDOR 漏洞2: 修改他人资料 ====================

// 有漏洞：根据传入的 userId 修改，不校验是否是自己
router.put('/profile/unsafe', (req, res) => {
  const { userId, email, phone } = req.body
  
  if (!users[userId]) {
    return res.json({ success: false, message: '用户不存在' })
  }
  
  // ❌ 没有校验 userId === currentUser.id
  const oldData = { ...users[userId] }
  users[userId].email = email || users[userId].email
  users[userId].phone = phone || users[userId].phone
  
  console.log(`[IDOR] 用户 ${currentUser?.id} 修改了用户 ${userId} 的资料`)
  
  res.json({ 
    success: true, 
    message: '修改成功',
    oldData,
    newData: users[userId],
    vulnerability: currentUser && userId !== currentUser.id 
      ? `⚠️ 越权修改！你(用户${currentUser.id})修改了用户${userId}的资料` 
      : null
  })
})

// 安全版本：只能修改自己的资料
router.put('/profile/safe', (req, res) => {
  if (!currentUser) {
    return res.json({ success: false, message: '请先登录' })
  }
  
  const { email, phone } = req.body
  
  // ✅ 只修改当前登录用户的资料
  users[currentUser.id].email = email || users[currentUser.id].email
  users[currentUser.id].phone = phone || users[currentUser.id].phone
  currentUser = users[currentUser.id]
  
  res.json({ success: true, message: '修改成功', user: currentUser })
})

// ==================== IDOR 漏洞3: 删除他人文件 ====================

// 有漏洞：根据传入的 fileId 删除，不校验归属
router.delete('/file/unsafe/:fileId', (req, res) => {
  const file = files[req.params.fileId]
  
  if (!file) {
    return res.json({ success: false, message: '文件不存在' })
  }
  
  const fileOwner = file.userId
  
  // ❌ 没有校验文件归属
  console.log(`[IDOR] 用户 ${currentUser?.id} 删除了用户 ${fileOwner} 的文件: ${file.name}`)
  
  const deletedFile = { ...file }
  delete files[req.params.fileId]
  
  res.json({ 
    success: true, 
    message: '删除成功',
    deletedFile,
    vulnerability: currentUser && fileOwner !== currentUser.id 
      ? `⚠️ 越权删除！你(用户${currentUser.id})删除了用户${fileOwner}的文件` 
      : null
  })
})

// 安全版本
router.delete('/file/safe/:fileId', (req, res) => {
  if (!currentUser) {
    return res.json({ success: false, message: '请先登录' })
  }
  
  const file = files[req.params.fileId]
  
  if (!file) {
    return res.json({ success: false, message: '文件不存在' })
  }
  
  // ✅ 校验文件归属
  if (file.userId !== currentUser.id && currentUser.role !== 'admin') {
    return res.json({ success: false, message: '无权删除此文件' })
  }
  
  delete files[req.params.fileId]
  res.json({ success: true, message: '删除成功' })
})

// ==================== 辅助接口 ====================

// 获取所有订单（用于展示）
router.get('/orders', (req, res) => {
  res.json(Object.values(orders))
})

// 获取所有文件（用于展示）
router.get('/files', (req, res) => {
  res.json(Object.values(files))
})

// 获取所有用户（用于展示）
router.get('/users', (req, res) => {
  res.json(Object.values(users))
})

// 重置数据
router.post('/reset', (req, res) => {
  // 重置订单
  orders[1001] = { id: 1001, userId: 1, product: 'iPhone 15 Pro', amount: 9999, status: '已发货', address: '北京市朝阳区xxx' }
  orders[1002] = { id: 1002, userId: 1, product: 'AirPods Pro', amount: 1999, status: '待付款', address: '北京市朝阳区xxx' }
  orders[1003] = { id: 1003, userId: 2, product: 'MacBook Pro', amount: 19999, status: '已完成', address: '上海市浦东新区xxx' }
  orders[1004] = { id: 1004, userId: 2, product: 'iPad Air', amount: 4999, status: '已发货', address: '上海市浦东新区xxx' }
  
  // 重置文件
  files['doc_001'] = { id: 'doc_001', userId: 1, name: '工资单_202401.pdf', content: '张三 2024年1月工资: ¥25,000' }
  files['doc_002'] = { id: 'doc_002', userId: 1, name: '合同.pdf', content: '机密合同内容...' }
  files['doc_003'] = { id: 'doc_003', userId: 2, name: '工资单_202401.pdf', content: '李四 2024年1月工资: ¥30,000' }
  files['doc_004'] = { id: 'doc_004', userId: 3, name: '公司财务报表.xlsx', content: '公司机密财务数据...' }
  
  // 重置用户
  users[1] = { id: 1, username: 'zhangsan', email: 'zhangsan@test.com', phone: '138****1234', role: 'user' }
  users[2] = { id: 2, username: 'lisi', email: 'lisi@test.com', phone: '139****5678', role: 'user' }
  users[3] = { id: 3, username: 'admin', email: 'admin@test.com', phone: '137****0000', role: 'admin' }
  
  res.json({ success: true, message: '数据已重置' })
})

export default router
