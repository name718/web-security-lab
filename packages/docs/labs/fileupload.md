# 文件上传漏洞

文件上传漏洞可导致恶意代码执行、服务器被完全控制。

## 攻击原理

```
上传恶意文件 → 绕过检查 → 文件保存 → 访问执行 → 服务器沦陷
```

## 实验一：后缀名绕过

### 常见绕过方式

| 方式 | 示例 | 原理 |
|---|---|---|
| 双扩展名 | shell.php.jpg | 某些服务器按第一个扩展名解析 |
| 大小写 | shell.PhP | Windows 不区分大小写 |
| 空字节 | shell.php%00.jpg | 截断文件名 |
| 替代扩展 | .phtml, .php5 | 黑名单遗漏 |

### 漏洞代码

```javascript
// ❌ 只检查最后的扩展名
const ext = filename.substring(filename.lastIndexOf('.'))
// shell.php.jpg → ext = .jpg → 通过！
```

## 实验二：MIME 类型欺骗

### 漏洞场景

```javascript
// ❌ 只检查 Content-Type
if (!ALLOWED_MIMES.includes(req.body.mime)) {
  return res.status(400).json({ error: '类型不允许' })
}
// 问题：MIME 由客户端设置，可伪造！
```

### 正确做法

检查文件魔数（Magic Number）：

| 文件类型 | 魔数 |
|---|---|
| JPEG | FF D8 FF |
| PNG | 89 50 4E 47 |
| GIF | 47 49 46 38 |
| PDF | 25 50 44 46 |

## 安全上传方案

```javascript
// ✅ 多重验证
const upload = multer({
  fileFilter: (req, file, cb) => {
    // 1. 扩展名白名单
    // 2. 双扩展名检测
    // 3. MIME 类型验证
    // 4. 文件大小限制
  }
})

// 上传后验证文件内容
const type = await fileType.fromBuffer(buffer)
if (!type || !ALLOWED_MIMES.includes(type.mime)) {
  fs.unlinkSync(file.path)
  throw new Error('文件内容与类型不符')
}

// 重命名文件
const safeName = crypto.randomBytes(16).toString('hex') + ext
```

## 安全检查清单

- [ ] 扩展名白名单验证
- [ ] 检查双扩展名
- [ ] 验证文件魔数
- [ ] 限制文件大小
- [ ] 随机重命名文件
- [ ] 存储到非 Web 目录

## 开始实验

访问 [文件上传漏洞实验](/labs/fileupload) 体验绕过与防护。
