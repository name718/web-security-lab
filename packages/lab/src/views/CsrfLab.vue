<template>
  <div>
    <div class="card">
      <h2>🟡 CSRF (跨站请求伪造) 实验</h2>
      <p style="margin: 1rem 0;">
        CSRF攻击利用用户已登录的身份，在用户不知情的情况下执行恶意操作。
      </p>
    </div>

    <!-- 用户状态 -->
    <div class="card">
      <h2>👤 当前用户</h2>
      <div v-if="store.currentUser">
        <p>用户名: {{ store.currentUser.username }}</p>
        <p>余额: ¥{{ store.currentUser.balance }}</p>
        <button class="btn" @click="logout" style="margin-top: 0.5rem;">退出登录</button>
      </div>
      <div v-else>
        <p style="color: #888;">未登录，请先在SQL注入页面登录</p>
        <router-link to="/sql-injection" class="btn" style="display: inline-block; margin-top: 0.5rem;">
          去登录
        </router-link>
      </div>
    </div>

    <!-- 转账功能 -->
    <div class="card" v-if="store.currentUser">
      <h2>💰 转账功能</h2>
      
      <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
        <label>
          <input type="checkbox" v-model="csrfProtection"> 启用CSRF Token防护
        </label>
      </div>

      <div style="max-width: 400px;">
        <div style="margin-bottom: 1rem;">
          <label>收款人:</label>
          <input v-model="toUser" placeholder="输入收款用户名">
        </div>
        <div style="margin-bottom: 1rem;">
          <label>金额:</label>
          <input v-model.number="amount" type="number" placeholder="输入金额">
        </div>
        <div v-if="csrfProtection" style="margin-bottom: 1rem;">
          <label>CSRF Token:</label>
          <input :value="csrfToken" disabled>
        </div>
        <button class="btn" @click="transfer">转账</button>
      </div>

      <div v-if="transferResult" :class="transferResult.success ? 'success' : 'warning'" style="margin-top: 1rem;">
        {{ transferResult.message }}
      </div>
    </div>

    <!-- 攻击演示 -->
    <div class="card">
      <h2>⚔️ CSRF攻击演示</h2>
      <p>假设攻击者创建了一个恶意页面，包含以下隐藏表单:</p>
      <pre>&lt;form action="/api/transfer" method="POST"&gt;
  &lt;input type="hidden" name="to" value="hacker"&gt;
  &lt;input type="hidden" name="amount" value="1000"&gt;
&lt;/form&gt;
&lt;script&gt;document.forms[0].submit()&lt;/script&gt;</pre>
      
      <p style="margin-top: 1rem;">当已登录用户访问该页面时，会自动提交转账请求。</p>
      
      <button class="btn" @click="simulateAttack" style="margin-top: 1rem;" :disabled="!store.currentUser">
        模拟CSRF攻击 (转账100给hacker)
      </button>

      <div class="warning" v-if="!csrfProtection">
        ⚠️ CSRF防护已关闭！攻击会成功执行
      </div>
      <div class="success" v-else>
        ✅ CSRF Token防护已启用，攻击会被拦截
      </div>
    </div>

    <!-- 防御方法 -->
    <div class="card">
      <h2>🛡️ 防御方法</h2>
      <ul style="line-height: 2;">
        <li>使用CSRF Token (每个表单包含随机token)</li>
        <li>验证 Referer/Origin 头</li>
        <li>使用 SameSite Cookie 属性</li>
        <li>敏感操作要求二次确认</li>
        <li>使用验证码</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useLabStore } from '../stores/labStore'

const store = useLabStore()
const toUser = ref('')
const amount = ref(100)
const csrfProtection = ref(false)
const transferResult = ref(null)

// 模拟CSRF Token
const csrfToken = computed(() => {
  return 'csrf_' + Math.random().toString(36).substring(2, 15)
})

function transfer() {
  if (!store.currentUser) {
    transferResult.value = { success: false, message: '请先登录' }
    return
  }
  
  const result = store.transfer(toUser.value, amount.value)
  transferResult.value = result
}

function simulateAttack() {
  if (!store.currentUser) {
    transferResult.value = { success: false, message: '请先登录' }
    return
  }

  if (csrfProtection.value) {
    transferResult.value = { 
      success: false, 
      message: '❌ CSRF攻击被拦截！Token验证失败' 
    }
    return
  }

  // 模拟攻击成功
  const result = store.transfer('hacker', 100)
  if (result.success) {
    transferResult.value = { 
      success: false, 
      message: '⚠️ CSRF攻击成功！你的钱被转走了！' 
    }
  } else {
    transferResult.value = result
  }
}

function logout() {
  store.logout()
}
</script>
