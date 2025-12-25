<template>
  <div class="app">
    <nav class="navbar">
      <h1>🔐 Security Lab</h1>
      <div class="nav-links">
        <router-link to="/">首页</router-link>
        <router-link to="/xss">XSS攻击</router-link>
        <router-link to="/sql-injection">SQL注入</router-link>
        <router-link to="/csrf">CSRF攻击</router-link>
      </div>
    </nav>
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
</script>
