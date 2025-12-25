import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLabStore = defineStore('lab', () => {
  // 模拟用户数据库 (存储在 localStorage)
  const users = ref(JSON.parse(localStorage.getItem('lab_users') || '[]'))
  const comments = ref(JSON.parse(localStorage.getItem('lab_comments') || '[]'))
  const currentUser = ref(JSON.parse(localStorage.getItem('lab_current_user') || 'null'))

  // 初始化默认数据
  if (users.value.length === 0) {
    users.value = [
      { id: 1, username: 'admin', password: 'admin123', role: 'admin', balance: 10000 },
      { id: 2, username: 'user1', password: '123456', role: 'user', balance: 500 },
      { id: 3, username: 'test', password: 'test', role: 'user', balance: 100 }
    ]
    saveUsers()
  }

  function saveUsers() {
    localStorage.setItem('lab_users', JSON.stringify(users.value))
  }

  function saveComments() {
    localStorage.setItem('lab_comments', JSON.stringify(comments.value))
  }

  function saveCurrentUser() {
    localStorage.setItem('lab_current_user', JSON.stringify(currentUser.value))
  }

  // 不安全的登录 (用于SQL注入演示)
  function unsafeLogin(username, password) {
    // 模拟SQL查询: SELECT * FROM users WHERE username='${username}' AND password='${password}'
    const query = `username='${username}' AND password='${password}'`
    console.log('模拟SQL查询:', `SELECT * FROM users WHERE ${query}`)
    
    // 模拟SQL注入漏洞
    if (username.includes("' OR '1'='1")) {
      return users.value[0] // 返回第一个用户 (admin)
    }
    if (username.includes("' OR 1=1--")) {
      return users.value[0]
    }
    
    return users.value.find(u => u.username === username && u.password === password)
  }

  // 安全的登录
  function safeLogin(username, password) {
    // 参数化查询，防止注入
    return users.value.find(u => u.username === username && u.password === password)
  }

  function login(user) {
    currentUser.value = user
    saveCurrentUser()
  }

  function logout() {
    currentUser.value = null
    saveCurrentUser()
  }

  // 添加评论 (用于XSS演示)
  function addComment(content, sanitize = false) {
    const comment = {
      id: Date.now(),
      content: sanitize ? escapeHtml(content) : content,
      author: currentUser.value?.username || '匿名',
      time: new Date().toLocaleString()
    }
    comments.value.push(comment)
    saveComments()
    return comment
  }

  function escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  function clearComments() {
    comments.value = []
    saveComments()
  }

  // 转账功能 (用于CSRF演示)
  function transfer(toUsername, amount) {
    if (!currentUser.value) return { success: false, message: '请先登录' }
    
    const toUser = users.value.find(u => u.username === toUsername)
    if (!toUser) return { success: false, message: '目标用户不存在' }
    
    if (currentUser.value.balance < amount) {
      return { success: false, message: '余额不足' }
    }
    
    currentUser.value.balance -= amount
    toUser.balance += amount
    saveUsers()
    saveCurrentUser()
    
    return { success: true, message: `成功转账 ${amount} 给 ${toUsername}` }
  }

  return {
    users,
    comments,
    currentUser,
    unsafeLogin,
    safeLogin,
    login,
    logout,
    addComment,
    clearComments,
    transfer
  }
})
