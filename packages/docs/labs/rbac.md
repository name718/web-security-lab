# RBAC 权限模型缺陷

RBAC (Role-Based Access Control) 是常见的权限控制模型，但设计和实现中的缺陷会导致权限绕过。

## 漏洞原理

RBAC 缺陷不是"没有校验"，而是"校验逻辑有问题"：

- 前端校验 ≠ 安全
- 角色判断逻辑错误
- 权限继承设计缺陷

## 实验一：前端校验绕过

### 漏洞场景

开发者只在前端隐藏管理功能，后端未做校验。

### 错误实现

```javascript
// 前端代码
if (user.role === 'admin') {
  showAdminPanel()
}

// 后端代码 - 没有权限校验！
app.delete('/api/users/:id', (req, res) => {
  deleteUser(req.params.id)
  res.json({ success: true })
})
```

### 攻击方式

```javascript
// 直接调用 API，绕过前端
fetch('/api/users/123', { method: 'DELETE' })
```

### 正确实现

```javascript
// 后端必须校验权限
app.delete('/api/users/:id', (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: '权限不足' })
  }
  deleteUser(req.params.id)
  res.json({ success: true })
})
```

## 实验二：角色伪造

### 漏洞场景

服务端信任客户端传递的角色信息。

### 错误实现

```javascript
// ❌ 从请求中读取角色
app.get('/api/admin/data', (req, res) => {
  const role = req.headers['x-user-role']
  if (role === 'admin') {
    return res.json(sensitiveData)
  }
  res.status(403).json({ error: '权限不足' })
})
```

### 攻击方式

```javascript
// 伪造角色头
fetch('/api/admin/data', {
  headers: { 'X-User-Role': 'admin' }
})
```

### 正确实现

```javascript
// ✅ 从服务端 Session/Token 获取角色
app.get('/api/admin/data', (req, res) => {
  const user = getUserFromSession(req)
  if (user.role !== 'admin') {
    return res.status(403).json({ error: '权限不足' })
  }
  res.json(sensitiveData)
})
```

## 实验三：权限继承错误

### 漏洞场景

角色权限继承逻辑设计错误，导致权限扩大。

### 错误设计

```javascript
// 角色定义
const roles = {
  guest: ['read'],
  user: ['read', 'write'],
  admin: ['read', 'write', 'delete', 'admin']
}

// ❌ 错误：权限叠加
function getUserPermissions(userRoles) {
  let permissions = []
  userRoles.forEach(role => {
    permissions = [...permissions, ...roles[role]]
  })
  return permissions
}

// 用户同时拥有 guest 和 user 角色
// 结果：['read', 'read', 'write'] - 可能导致意外行为
```

### 攻击场景

```
1. 用户注册时获得 guest 角色
2. 升级为 user 角色（未移除 guest）
3. 某些逻辑只检查是否包含 guest
4. 导致 user 被当作 guest 处理（降级）
   或 guest 获得 user 权限（提权）
```

### 正确设计

```javascript
// ✅ 使用权限优先级
function getEffectiveRole(userRoles) {
  const priority = ['admin', 'user', 'guest']
  for (const role of priority) {
    if (userRoles.includes(role)) return role
  }
  return 'guest'
}

// ✅ 或使用明确的权限集合
function getUserPermissions(userId) {
  // 从数据库查询用户的实际权限
  return db.query('SELECT permission FROM user_permissions WHERE user_id = ?', [userId])
}
```

## 安全设计原则

| 原则 | 说明 |
|------|------|
| 最小权限 | 只授予必要的权限 |
| 后端校验 | 永远不信任前端 |
| 显式授权 | 默认拒绝，显式允许 |
| 权限分离 | 敏感操作需要多重验证 |

## RBAC 检查清单

- [ ] 所有 API 都有后端权限校验
- [ ] 角色信息从服务端获取
- [ ] 权限继承逻辑清晰
- [ ] 敏感操作有审计日志
- [ ] 定期审查权限配置

## 开始实验

访问 [RBAC 权限实验](/labs/rbac) 体验权限绕过漏洞。
