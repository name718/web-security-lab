import { Router } from 'express'

const router = Router()

// ==================== 角色权限定义 ====================

const roles = {
  guest: {
    name: '游客',
    permissions: ['read:public']
  },
  user: {
    name: '普通用户',
    permissions: ['read:public', 'read:own', 'write:own']
  },
  editor: {
    name: '编辑',
    permissions: ['read:public', 'read:own', 'write:own', 'write:content']
  },
  admin: {
    name: '管理员',
    permissions: ['read:public', 'read:own', 'write:own', 'read:all', 'write:all', 'delete:all', 'manage:users']
  }
}

// 用户数据
const users = {
  1: { id: 1, username: 'guest_user', role: 'guest' },
  2: { id: 2, username: 'normal_user', role: 'user' },
  3: { id: 3, username: 'editor_user', role: 'editor' },
  4: { id: 4, username: 'admin_user', role: 'admin' }
}

// 敏感操作日志
const adminLogs = [
  { id: 1, action: '删除用户', target: 'test_user', time: '2024-01-15 10:30' },
  { id: 2, action: '修改权限', target: 'editor_user', time: '2024-01-15 11:00' },
  { id: 3, action: '导出数据', target: '全部用户', time: '2024-01-15 14:20' }
]

// 系统配置
const systemConfig = {
  siteName: 'Security Lab',
  maxUsers: 1000,
  secretKey: 'super_secret_key_12345',
  dbPassword: 'db_password_67890'
}

let currentUser = null

// ==================== 登录 ====================

router.post('/login', (req, res) => {
  const { userId } = req.body
  currentUser = users[userId]
  
  if (currentUser) {
    res.json({ 
      success: true, 
      user: currentUser,
      permissions: roles[currentUser.role].permissions
    })
  } else {
    res.json({ success: false, message: '用户不存在' })
  }
})

router.get('/me', (req, res) => {
  if (currentUser) {
    res.json({ 
      success: true, 
      user: currentUser,
      permissions: roles[currentUser.role].permissions
    })
  } else {
    res.json({ success: false, message: '未登录' })
  }
})

router.post('/logout', (req, res) => {
  currentUser = null
  res.json({ success: true })
})

// ==================== 漏洞1: 前端校验绕过 ====================

// 有漏洞：只在前端隐藏按钮，后端不校验
router.get('/admin/logs/unsafe', (req, res) => {
  // ❌ 没有后端权限校验，只依赖前端隐藏
  console.log(`[RBAC] 用户 ${currentUser?.username}(${currentUser?.role}) 访问了管理日志`)
  
  res.json({ 
    success: true, 
    logs: adminLogs,
    vulnerability: currentUser && currentUser.role !== 'admin'
      ? `⚠️ 权限绕过！${currentUser.role} 角色不应该能访问管理日志`
      : null
  })
})

// 安全版本
router.get('/admin/logs/safe', (req, res) => {
  if (!currentUser) {
    return res.json({ success: false, message: '请先登录' })
  }
  
  // ✅ 后端校验权限
  if (currentUser.role !== 'admin') {
    return res.json({ success: false, message: '权限不足，需要管理员权限' })
  }
  
  res.json({ success: true, logs: adminLogs })
})

// ==================== 漏洞2: 角色参数可控 ====================

// 有漏洞：角色从请求参数获取
router.post('/action/unsafe', (req, res) => {
  const { action, role } = req.body
  
  // ❌ 信任客户端传来的 role
  const userRole = role || currentUser?.role || 'guest'
  const permissions = roles[userRole]?.permissions || []
  
  console.log(`[RBAC] 声称角色: ${userRole}, 实际角色: ${currentUser?.role}`)
  
  if (permissions.includes('manage:users') || permissions.includes('delete:all')) {
    res.json({ 
      success: true, 
      message: `执行敏感操作: ${action}`,
      usedRole: userRole,
      vulnerability: currentUser && userRole !== currentUser.role
        ? `⚠️ 角色伪造！实际是 ${currentUser.role}，伪造成 ${userRole}`
        : null
    })
  } else {
    res.json({ success: false, message: '权限不足' })
  }
})

// 安全版本
router.post('/action/safe', (req, res) => {
  if (!currentUser) {
    return res.json({ success: false, message: '请先登录' })
  }
  
  const { action } = req.body
  
  // ✅ 从服务端 session 获取角色
  const permissions = roles[currentUser.role]?.permissions || []
  
  if (permissions.includes('manage:users') || permissions.includes('delete:all')) {
    res.json({ success: true, message: `执行敏感操作: ${action}` })
  } else {
    res.json({ success: false, message: '权限不足' })
  }
})

// ==================== 漏洞3: 管理接口暴露 ====================

// 有漏洞：管理接口没有权限校验
router.get('/system/config/unsafe', (req, res) => {
  // ❌ 任何人都能访问系统配置
  console.log(`[RBAC] 用户 ${currentUser?.username} 访问了系统配置`)
  
  res.json({ 
    success: true, 
    config: systemConfig,
    vulnerability: '⚠️ 敏感配置暴露！包含数据库密码和密钥'
  })
})

// 安全版本
router.get('/system/config/safe', (req, res) => {
  if (!currentUser || currentUser.role !== 'admin') {
    return res.json({ success: false, message: '权限不足' })
  }
  
  res.json({ success: true, config: systemConfig })
})

// ==================== 漏洞4: 权限继承错误 ====================

// 有漏洞：错误的权限继承逻辑
router.post('/permission/check/unsafe', (req, res) => {
  const { requiredPermission } = req.body
  
  if (!currentUser) {
    return res.json({ success: false, message: '请先登录' })
  }
  
  const userPermissions = roles[currentUser.role]?.permissions || []
  
  // ❌ 错误：只检查权限名称是否包含关键字
  const hasPermission = userPermissions.some(p => 
    p.includes('write') || requiredPermission.includes(p.split(':')[1])
  )
  
  res.json({ 
    success: hasPermission, 
    message: hasPermission ? '权限校验通过' : '权限不足',
    userPermissions,
    requiredPermission,
    vulnerability: hasPermission && !userPermissions.includes(requiredPermission)
      ? `⚠️ 权限继承错误！用户没有 ${requiredPermission} 但通过了校验`
      : null
  })
})

// 安全版本
router.post('/permission/check/safe', (req, res) => {
  const { requiredPermission } = req.body
  
  if (!currentUser) {
    return res.json({ success: false, message: '请先登录' })
  }
  
  const userPermissions = roles[currentUser.role]?.permissions || []
  
  // ✅ 精确匹配权限
  const hasPermission = userPermissions.includes(requiredPermission)
  
  res.json({ 
    success: hasPermission, 
    message: hasPermission ? '权限校验通过' : '权限不足',
    userPermissions,
    requiredPermission
  })
})

// ==================== 辅助接口 ====================

router.get('/roles', (req, res) => {
  res.json(roles)
})

router.get('/users', (req, res) => {
  res.json(Object.values(users))
})

export default router
