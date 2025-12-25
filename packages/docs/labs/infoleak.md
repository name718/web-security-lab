# 敏感信息泄露

敏感信息泄露是 OWASP Top 10 常见漏洞，可能导致数据库密码、API 密钥等关键信息暴露。

## 常见泄露类型

| 类型 | 示例 | 危害 |
|---|---|---|
| Debug 接口 | /debug, /actuator | 系统配置暴露 |
| 错误堆栈 | 500 错误详情 | 代码路径、框架版本 |
| 配置文件 | .env, config.json | 数据库密码、API 密钥 |
| 源码泄露 | .git, .svn | 完整源代码 |

## 实验一：Debug 接口暴露

### 漏洞场景

开发环境的调试接口在生产环境未关闭。

```javascript
// ❌ 危险：暴露所有配置
app.get('/debug', (req, res) => {
  res.json({
    config: serverConfig,
    env: process.env
  })
})
```

## 实验二：错误堆栈泄露

### 错误做法

```javascript
app.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack  // 暴露堆栈！
  })
})
```

### 正确做法

```javascript
app.use((err, req, res, next) => {
  console.error(err)  // 只在服务端记录
  res.status(500).json({
    error: 'Internal Server Error',
    requestId: generateRequestId()
  })
})
```

## 实验三：配置文件暴露

### 防护措施

```nginx
# Nginx 配置
location ~ /\. {
  deny all;  # 禁止访问隐藏文件
}

location ~* \.(env|config|bak|sql)$ {
  deny all;
}
```

## 开始实验

访问 [敏感信息泄露实验](/labs/infoleak) 了解信息泄露风险。
