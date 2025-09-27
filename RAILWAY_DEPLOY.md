# Railway部署指南 - Typst Editor到restyp.com

## 准备工作完成清单 ✅

- [x] 创建了Dockerfile配置Typst编译环境
- [x] 修改了后端服务器支持生产环境
- [x] 配置了前端环境变量
- [x] 创建了.dockerignore文件
- [x] 创建了railway.toml配置文件

## Railway部署步骤

### 1. 创建Railway项目

1. 访问 [Railway.app](https://railway.app)
2. 登录GitHub账号并授权Railway
3. 点击 "Deploy from GitHub repo"
4. 选择你的 `typst-editor` 仓库

### 2. 配置Railway项目

#### 在Railway Dashboard中：

1. **选择服务类型**: Web Service
2. **构建命令**: 留空 (使用Dockerfile)
3. **启动命令**: `node typst-server/server.js`

#### 设置环境变量：

在Railway项目的Variables标签页中添加：

```
NODE_ENV=production
PORT=8080
TYPST_FONT_PATHS=/app/fonts
```

### 3. 配置自定义域名

1. 在Railway项目中点击 "Settings" → "Domains"
2. 点击 "Custom Domain"
3. 输入：`restyp.com`
4. Railway会提供CNAME记录

### 4. DNS配置

在你的域名提供商处配置：

```
类型: CNAME
主机: @
值: [Railway提供的域名，例如: xxx.railway.app]
```

或者配置A记录：
```
类型: A
主机: @
值: [Railway提供的IP地址]
```

### 5. 部署触发

1. 提交所有代码更改到GitHub
2. Railway会自动检测并开始构建
3. 构建完成后，应用将在 `restyp.com` 可用

## 构建过程说明

Railway将会：

1. 拉取你的代码
2. 使用Dockerfile构建镜像：
   - 安装Node.js和系统依赖
   - 安装Typst编译器
   - 安装Puppeteer依赖
   - 构建React前端应用
   - 安装后端依赖
   - 复制字体文件
3. 启动容器运行你的应用

## 预期构建时间

- 首次构建：15-20分钟（需要安装所有依赖）
- 后续构建：5-10分钟（利用缓存）

## 故障排除

### 如果构建失败：

1. 检查Railway构建日志
2. 常见问题：
   - Typst下载失败：检查网络连接
   - 前端构建失败：检查package.json依赖
   - 字体文件缺失：确保fonts目录存在

### 如果应用无法访问：

1. 检查环境变量设置
2. 检查端口配置（必须使用PORT环境变量）
3. 检查域名DNS配置

## 后续优化建议

1. **监控**: 设置Railway监控和日志
2. **备份**: 定期备份重要配置
3. **性能**: 监控应用性能和响应时间
4. **安全**: 配置HTTPS和安全头
5. **缓存**: 考虑添加CDN加速静态资源

## 成本估算

Railway免费计划包含：
- 500小时/月运行时间
- 1GB RAM
- 1GB磁盘空间

对于生产环境，建议升级到Pro计划以获得更好的性能和稳定性。