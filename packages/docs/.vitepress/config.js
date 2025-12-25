export default {
  title: 'Security Lab',
  description: '网络安全攻击案例学习平台',
  base: '/',
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: '首页', link: '/' },
      { text: '快速开始', link: '/guide/getting-started' },
      { text: '实验列表', link: '/labs/' },
      { text: '实验平台', link: 'http://localhost:4000', target: '_blank' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '项目结构', link: '/guide/structure' }
          ]
        }
      ],
      '/labs/': [
        {
          text: '注入攻击',
          items: [
            { text: 'XSS 跨站脚本', link: '/labs/xss' },
            { text: 'SQL 注入', link: '/labs/sql-injection' }
          ]
        },
        {
          text: '身份与会话',
          items: [
            { text: 'CSRF 跨站请求伪造', link: '/labs/csrf' },
            { text: 'JWT 安全漏洞', link: '/labs/jwt' },
            { text: '钓鱼攻击', link: '/labs/phishing' }
          ]
        },
        {
          text: '权限控制',
          items: [
            { text: 'IDOR 对象级越权', link: '/labs/idor' },
            { text: 'RBAC 权限模型缺陷', link: '/labs/rbac' }
          ]
        },
        {
          text: '可用性攻击',
          items: [
            { text: 'DDoS 拒绝服务', link: '/labs/ddos' },
            { text: 'Clickjacking 点击劫持', link: '/labs/clickjacking' }
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com' }
    ],
    footer: {
      message: '仅供学习目的，请勿用于非法用途',
      copyright: 'Security Lab © 2024'
    }
  }
}
