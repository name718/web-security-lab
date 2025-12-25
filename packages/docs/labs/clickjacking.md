# Clickjacking 点击劫持

点击劫持通过透明 iframe 覆盖，诱骗用户点击隐藏的恶意按钮，执行非预期操作。

## 攻击原理

```
攻击者页面
┌─────────────────────────────┐
│  "点击领取红包"  ← 诱饵按钮   │
│  ┌─────────────────────┐    │
│  │ 透明 iframe         │    │
│  │ ┌─────────────────┐ │    │
│  │ │ [确认转账] ← 真实 │ │    │
│  │ └─────────────────┘ │    │
│  └─────────────────────┘    │
└─────────────────────────────┘
```

用户以为点击"领取红包"，实际点击了银行"确认转账"按钮。

## 实验一：iframe 覆盖攻击

### 攻击代码

```html
<div style="position: relative;">
  <!-- 诱饵层 -->
  <div class="decoy">
    <h2>🎁 领取红包</h2>
    <button>立即领取</button>
  </div>
  
  <!-- 透明 iframe 覆盖 -->
  <iframe 
    src="https://bank.com/transfer" 
    style="
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      opacity: 0;
    ">
  </iframe>
</div>
```

### 攻击条件

- 目标页面未设置 `X-Frame-Options`
- 目标页面未设置 CSP `frame-ancestors`

## 实验二：X-Frame-Options 防护

### 响应头选项

| 值 | 说明 |
|---|---|
| `DENY` | 完全禁止被嵌入 |
| `SAMEORIGIN` | 只允许同源嵌入 |

### 服务端实现

```javascript
// Express.js
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY')
  next()
})
```

## 实验三：CSP frame-ancestors 防护

### 语法

```
Content-Security-Policy: frame-ancestors 'none'
Content-Security-Policy: frame-ancestors 'self'
Content-Security-Policy: frame-ancestors https://trusted.com
```

### 优势

- 支持多个域名
- 支持通配符 `*.example.com`
- 更灵活的控制

## 防护对比

| 特性 | X-Frame-Options | CSP frame-ancestors |
|---|---|---|
| 多域名 | ❌ | ✅ |
| 通配符 | ❌ | ✅ |
| 兼容性 | 所有浏览器 | 现代浏览器 |

## 最佳实践

同时设置两个响应头：

```
X-Frame-Options: DENY
Content-Security-Policy: frame-ancestors 'none'
```

## 开始实验

访问 [Clickjacking 实验](/labs/clickjacking) 体验点击劫持攻击与防护。
