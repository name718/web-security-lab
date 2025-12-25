# IDOR 对象级越权

## 什么是 IDOR？

IDOR (Insecure Direct Object Reference) 是指应用程序使用用户可控的输入直接访问对象，但没有验证用户是否有权访问该对象。

::: danger 重要
IDOR 是 OWASP Top 10 中最常见的漏洞之一！真实案例极多，面试必问。
:::

## 漏洞示例

```javascript
// ❌ 有漏洞：只校验订单是否存在
router.get('/order/:id', (req, res) => {
  const order = orders[req.params.id]
  res.json(order)  // 不管是谁的订单都返回
})

// 攻击者只需遍历 ID 就能获取所有订单！
GET /api/order/1001
GET /api/order/1002
GET /api/order/1003
...
```

## 攻击类型

### 水平越权

访问同级别其他用户的数据：

- 用户A查看用户B的订单
- 用户A修改用户B的资料
- 用户A删除用户B的文件

### 垂直越权

普通用户访问管理员数据：

- 普通用户查看管理员日志
- 普通用户访问系统配置

## 实验演示

访问 [IDOR 实验](/labs/idor) 进行实践：

1. **查看他人订单** - 修改订单ID越权访问
2. **修改他人资料** - 篡改用户ID修改信息
3. **删除他人文件** - 越权删除敏感文件

## 防御方法

### 1. 对象级权限校验

```javascript
// ✅ 安全：校验资源归属
router.get('/order/:id', (req, res) => {
  const order = orders[req.params.id]
  
  if (order.userId !== currentUser.id) {
    return res.status(403).json({ error: '无权访问' })
  }
  
  res.json(order)
})
```

### 2. 使用 UUID

避免可预测的自增 ID：

```javascript
// ❌ 可预测
/api/order/1001
/api/order/1002

// ✅ 不可预测
/api/order/550e8400-e29b-41d4-a716-446655440000
```

### 3. 间接引用

使用映射表而非直接 ID：

```javascript
// 用户只能看到自己的订单索引
const userOrders = {
  'order_1': 1001,  // 映射到真实ID
  'order_2': 1002
}
```

## 真实案例

- 某电商平台：修改订单ID可查看任意用户订单
- 某社交平台：修改用户ID可查看私密相册
- 某云存储：遍历文件ID可下载他人文件
