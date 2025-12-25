import { Router } from 'express'
import initSqlJs from 'sql.js'

const router = Router()

// 初始化数据库
let db = null

async function initDb() {
  if (db) return db
  
  const SQL = await initSqlJs()
  db = new SQL.Database()
  
  // 创建表和初始数据
  db.run(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT,
      balance INTEGER
    )
  `)
  
  db.run(`
    CREATE TABLE secrets (
      id INTEGER PRIMARY KEY,
      content TEXT,
      level TEXT
    )
  `)
  
  db.run(`INSERT INTO users VALUES (1, 'admin', 'super_secret_123', 'admin', 99999)`)
  db.run(`INSERT INTO users VALUES (2, 'zhangsan', '123456', 'user', 1000)`)
  db.run(`INSERT INTO users VALUES (3, 'lisi', 'password', 'user', 500)`)
  db.run(`INSERT INTO users VALUES (4, 'test', 'test', 'guest', 100)`)
  
  db.run(`INSERT INTO secrets VALUES (1, 'FLAG{sql_injection_master}', 'top_secret')`)
  db.run(`INSERT INTO secrets VALUES (2, '数据库root密码: r00t@2024', 'secret')`)
  db.run(`INSERT INTO secrets VALUES (3, 'AWS密钥: AKIA...', 'secret')`)
  
  console.log('✅ SQLite 数据库初始化完成')
  return db
}

// 初始化
initDb()

// 辅助函数：执行查询并返回结果
function queryAll(sql) {
  const result = db.exec(sql)
  if (result.length === 0) return []
  
  const columns = result[0].columns
  return result[0].values.map(row => {
    const obj = {}
    columns.forEach((col, i) => obj[col] = row[i])
    return obj
  })
}

function queryOne(sql) {
  const results = queryAll(sql)
  return results[0] || null
}

// ==================== 实验1: 登录绕过 ====================

// 有漏洞的登录
router.post('/login/unsafe', async (req, res) => {
  await initDb()
  const { username, password } = req.body
  
  // ❌ 直接拼接 SQL，存在注入漏洞
  const sql = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`
  
  console.log('\n[SQL注入] 执行的SQL:')
  console.log(sql)
  console.log('')
  
  try {
    const user = queryOne(sql)
    
    if (user) {
      res.json({ 
        success: true, 
        message: '登录成功',
        user: { id: user.id, username: user.username, role: user.role, balance: user.balance },
        sql 
      })
    } else {
      res.json({ success: false, message: '用户名或密码错误', sql })
    }
  } catch (err) {
    res.json({ success: false, message: err.message, sql })
  }
})

// 安全的登录（模拟参数化查询）
router.post('/login/safe', async (req, res) => {
  await initDb()
  const { username, password } = req.body
  
  try {
    // ✅ 使用参数化查询
    const stmt = db.prepare('SELECT * FROM users WHERE username=? AND password=?')
    stmt.bind([username, password])
    
    let user = null
    if (stmt.step()) {
      const row = stmt.getAsObject()
      user = row
    }
    stmt.free()
    
    if (user) {
      res.json({ 
        success: true, 
        message: '登录成功',
        user: { id: user.id, username: user.username, role: user.role, balance: user.balance }
      })
    } else {
      res.json({ success: false, message: '用户名或密码错误' })
    }
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
})

// ==================== 实验2: 数据泄露 (UNION注入) ====================

// 有漏洞的用户查询
router.get('/user/unsafe', async (req, res) => {
  await initDb()
  const { id } = req.query
  
  // ❌ 直接拼接
  const sql = `SELECT id, username, role FROM users WHERE id=${id}`
  
  console.log('\n[SQL注入] 执行的SQL:')
  console.log(sql)
  console.log('')
  
  try {
    const users = queryAll(sql)
    res.json({ success: true, users, sql })
  } catch (err) {
    res.json({ success: false, message: err.message, sql })
  }
})

// ==================== 实验3: 搜索功能 (LIKE注入) ====================

router.get('/search/unsafe', async (req, res) => {
  await initDb()
  const { keyword } = req.query
  
  // ❌ 直接拼接
  const sql = `SELECT id, username, role FROM users WHERE username LIKE '%${keyword}%'`
  
  console.log('\n[SQL注入] 执行的SQL:')
  console.log(sql)
  console.log('')
  
  try {
    const users = queryAll(sql)
    res.json({ success: true, users, sql })
  } catch (err) {
    res.json({ success: false, message: err.message, sql })
  }
})

// ==================== 辅助接口 ====================

// 获取所有用户（用于展示）
router.get('/users', async (req, res) => {
  await initDb()
  const users = queryAll('SELECT id, username, role, balance FROM users')
  res.json(users)
})

// 获取表结构
router.get('/schema', async (req, res) => {
  await initDb()
  const tables = queryAll(`SELECT name, sql FROM sqlite_master WHERE type='table'`)
  res.json(tables)
})

// 重置数据库
router.post('/reset', async (req, res) => {
  await initDb()
  db.run(`DELETE FROM users`)
  db.run(`INSERT INTO users VALUES (1, 'admin', 'super_secret_123', 'admin', 99999)`)
  db.run(`INSERT INTO users VALUES (2, 'zhangsan', '123456', 'user', 1000)`)
  db.run(`INSERT INTO users VALUES (3, 'lisi', 'password', 'user', 500)`)
  db.run(`INSERT INTO users VALUES (4, 'test', 'test', 'guest', 100)`)
  res.json({ success: true, message: '数据库已重置' })
})

export default router
