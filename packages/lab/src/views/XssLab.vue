<template>
  <div>
    <div class="card">
      <h2>🔴 XSS (跨站脚本攻击) 实验</h2>
      <p style="margin: 1rem 0;">
        XSS攻击通过在网页中注入恶意脚本，当其他用户浏览该页面时执行攻击代码。
      </p>
    </div>

    <!-- 存储型XSS演示 -->
    <div class="card">
      <h2>💾 存储型XSS - 评论系统</h2>
      
      <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
        <label>
          <input type="checkbox" v-model="safeMode"> 启用XSS防护
        </label>
        <button class="btn" @click="clearComments">清空评论</button>
      </div>

      <div style="margin-bottom: 1rem;">
        <textarea 
          v-model="commentInput" 
          placeholder="输入评论内容..."
          rows="3"
        ></textarea>
        <button class="btn" @click="submitComment" style="margin-top: 0.5rem;">
          发表评论
        </button>
      </div>

      <div class="warning" v-if="!safeMode">
        ⚠️ 防护已关闭！尝试输入: <code>&lt;script&gt;alert('XSS')&lt;/script&gt;</code>
        <br>或: <code>&lt;img src=x onerror="alert('XSS')"&gt;</code>
      </div>
      <div class="success" v-else>
        ✅ XSS防护已启用，输入会被转义
      </div>

      <h3 style="margin: 1rem 0;">评论列表:</h3>
      <div v-for="comment in store.comments" :key="comment.id" class="comment">
        <div class="comment-header">
          <strong>{{ comment.author }}</strong>
          <span>{{ comment.time }}</span>
        </div>
        <div v-html="comment.content" class="comment-content"></div>
      </div>
      <p v-if="store.comments.length === 0" style="color: #666;">暂无评论</p>
    </div>

    <!-- 反射型XSS演示 -->
    <div class="card">
      <h2>🔄 反射型XSS - 搜索功能</h2>
      <input 
        v-model="searchQuery" 
        placeholder="输入搜索内容..."
        @keyup.enter="search"
      >
      <button class="btn" @click="search" style="margin-top: 0.5rem;">搜索</button>
      
      <div v-if="searchResult" style="margin-top: 1rem;">
        <p>搜索结果:</p>
        <div v-html="searchResult" class="search-result"></div>
      </div>

      <div class="warning">
        尝试搜索: <code>&lt;img src=x onerror="alert('反射型XSS')"&gt;</code>
      </div>
    </div>

    <!-- 防御方法 -->
    <div class="card">
      <h2>🛡️ 防御方法</h2>
      <ul style="line-height: 2;">
        <li>对用户输入进行HTML实体编码 (转义 &lt; &gt; &amp; " ')</li>
        <li>使用 Content-Security-Policy (CSP) 头</li>
        <li>设置 HttpOnly Cookie 防止脚本读取</li>
        <li>使用现代框架的自动转义功能 (如Vue的 {{ }} )</li>
        <li>避免使用 v-html、innerHTML 等直接渲染HTML</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useLabStore } from '../stores/labStore'

const store = useLabStore()
const commentInput = ref('')
const safeMode = ref(false)
const searchQuery = ref('')
const searchResult = ref('')

function submitComment() {
  if (!commentInput.value.trim()) return
  store.addComment(commentInput.value, safeMode.value)
  commentInput.value = ''
}

function clearComments() {
  store.clearComments()
}

function search() {
  if (!searchQuery.value) return
  // 不安全的搜索结果展示
  searchResult.value = `您搜索的内容是: ${searchQuery.value}`
}
</script>

<style scoped>
.comment {
  background: #0f3460;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #888;
}

.comment-content {
  word-break: break-all;
}

.search-result {
  background: #0f3460;
  padding: 1rem;
  border-radius: 4px;
}
</style>
