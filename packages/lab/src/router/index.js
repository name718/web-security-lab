import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('../views/Home.vue') },
  { path: '/xss', component: () => import('../views/XssLab.vue') },
  { path: '/sql-injection', component: () => import('../views/SqlInjectionLab.vue') },
  { path: '/csrf', component: () => import('../views/CsrfLab.vue') }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
