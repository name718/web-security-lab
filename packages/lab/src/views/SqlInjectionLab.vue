<template>
  <div>
    <div class="card">
      <h2>🟠 SQL注入实验</h2>
      <p style="margin: 1rem 0;">
        SQL注入通过在输入中插入SQL代码，操纵数据库查询，获取未授权数据或绕过认证。
      </p>
    </div>

    <!-- 登录表单 -->
    <div class="card">
      <h2>🔐 登录系统</h2>
      
      <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
        <label>
          <input type="checkbox" v-model="safeMode"> 启用SQL注入防护
        </label>
      </div>

      <div style="max-width: 400px;">
        <div style="margin-bottom: 1rem;">
          <label>用户名:</label>
          <input v-model="username" placeholder="输入用户名">
        </div>
        <div style="margin-bottom: 1rem;">
          <label>密码:</label>
          <input v-model="password" type="password" placeholder="输入密码">
        </div>
        <button class="btn" @click="login">登录</button>
      </div>

      <div v-if="loginResult" :class="loginResult.success ? 'success' : 'warning'" style="margin-top: 1rem;">
        {{ loginResult.message }}
        <div v-if="loginResult.user">
          <p>用户: {{ loginResult.user.username }}</p>
          <p>角色: {{ loginResult.user.role }}</p>
          <p>余额: {{ loginResult.user.balance }}</p>
        </div>
      </div>

      <div class="warning" v-if="!safeMode">
        ⚠️ 防护已关闭！尝试以下注入:
        <br>用户名: <code>' OR '1'='1</code> 密码: 任意
        <br>用户名: <code>' OR 1=1--</code> 密码: 任意
      </div>
      <div class="success" v-else>
        ✅ 参数化查询已启用，注入攻击无效
      </div>

      <div style="margin-top: 1rem;">
        <h3>模拟的SQL查询:</h3>
        <pre>{{ sqlQuery }}</pre>
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="card">
      <h2>📋 数据库用户表 (模拟)</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th>ID</th>
            <th>用户名</th>
            <th>密码</th>
            <th>角色</th>
            <th>余额</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in store.users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.password }}</td>
            <td>{{ user.role }}</td>
            <td>{{ user.balance }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 防御方法 -->
    <div class="card">
      <h2>🛡️ 防御方法</h2>
      <ul style="line-height: 2;">
        <li>使用参数化查询 (Prepared Statements)</li>
        <li>使用ORM框架 (如Sequelize, TypeORM)</li>
        <li>输入验证和白名单过滤</li>
        <li>最小权限原则 - 数据库账户只给必要权限</li>
        <li>错误信息不要暴露数据库细节</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useLabStore } from '../stores/labStore'

const store = useLabStore()
const username = ref('')
const password = ref('')
const safeMode = ref(false)
const loginResult = ref(null)

const sqlQuery = computed(() => {
  return `SELECT * FROM users WHERE username='${username.value}' AND password='${password.value}'`
})

function login() {
  const user = safeMode.value 
    ? store.safeLogin(username.value, password.value)
    : store.unsafeLogin(username.value, password.value)
  
  if (user) {
    loginResult.value = {
      success: true,
      message: '登录成功！',
      user
    }
    store.login(user)
  } else {
    loginResult.value = {
      success: false,
      message: '用户名或密码错误'
    }
  }
}
</script>

<style scoped>
table {
  margin-top: 1rem;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #0f3460;
}

th {
  background: #0f3460;
}
</style>
