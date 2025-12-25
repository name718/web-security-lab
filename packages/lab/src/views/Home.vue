<template>
  <div>
    <div class="card">
      <h2>🎯 网络安全攻击案例学习平台</h2>
      <p style="margin: 1rem 0; line-height: 1.8;">
        这是一个用于学习常见网络攻击的实验平台。通过实际操作，了解攻击原理和防御方法。
      </p>
      <div class="warning">
        ⚠️ 警告：本平台仅供学习目的，请勿将所学知识用于非法用途！
      </div>
    </div>

    <div class="card">
      <h2>📚 攻击类型</h2>
      <div style="display: grid; gap: 1rem; margin-top: 1rem;">
        <router-link to="/xss" class="lab-item">
          <h3>🔴 XSS (跨站脚本攻击)</h3>
          <p>学习反射型、存储型XSS攻击原理及防御</p>
        </router-link>
        <router-link to="/sql-injection" class="lab-item">
          <h3>🟠 SQL注入</h3>
          <p>了解SQL注入漏洞的利用与防护</p>
        </router-link>
        <router-link to="/csrf" class="lab-item">
          <h3>🟡 CSRF (跨站请求伪造)</h3>
          <p>理解CSRF攻击机制和Token防护</p>
        </router-link>
      </div>
    </div>

    <div class="card">
      <h2>👤 测试账号</h2>
      <pre>
管理员: admin / admin123
普通用户: user1 / 123456
测试账号: test / test</pre>
    </div>
  </div>
</template>

<style scoped>
.lab-item {
  display: block;
  background: #0f3460;
  padding: 1rem;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s, background 0.2s;
}

.lab-item:hover {
  background: #1a4a7a;
  transform: translateX(5px);
}

.lab-item h3 {
  margin-bottom: 0.5rem;
}

.lab-item p {
  color: #aaa;
  font-size: 0.9rem;
}
</style>
