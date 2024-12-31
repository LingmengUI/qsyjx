# 视频解析工具

一个强大的视频解析和下载工具，支持多个主流平台。

![下载量](https://img.shields.io/github/downloads/your-username/qsyjx/total)
![Stars](https://img.shields.io/github/stars/your-username/qsyjx)
![许可证](https://img.shields.io/github/license/your-username/qsyjx)

## 预览

<div align="center">
  <img src="screenshots/light-mode.png" alt="浅色模式" width="45%">
  <img src="screenshots/dark-mode.png" alt="深色模式" width="45%">
</div>

<div align="center">
  <img src="screenshots/mobile.png" alt="移动端" width="30%">
</div>

## 功能特点

- 🚀 支持多个主流平台视频解析
- 💾 支持视频、音频、封面下载
- 🖼️ 支持图集解析和下载
- 🌓 深色/浅色主题切换
- 📱 完美支持移动端

## 支持平台

- 抖音
- 西瓜视频
- 小红书
- 皮皮虾
- 哔哩哔哩
- 微视
- 快手
- 火山
- 微博
- 支持全平台...

## 部署方式
 **Node.js不得低于20版本**

## 下载安装包
 **把env.example改成.env，切记**

### 本地开发
1. **安装依赖**:
   
   ```bash
   npm install
   ```
   
2. **启动开发服务器**：

   ```bash
   npm run dev
   ```

### 服务器部署

1. **下载安装包**：
   进入项目目录终端，第一次部署运行这个命令
   
   ```bash
   pm2 start ecosystem.config.cjs
   ```

2. **然后运行这个命令**：
   
   ```bash
   ./deploy.sh
   ```
   然后运行：http://你的服务器ip:3010，即可访问项目
   **如果访问不了，请检查防火墙是否放行3010端口**
   如果需要域名访问，请自行请教别人或者联系QQ362856178，反向代理不会的找我

3. **以后每修改一次代码就运行这个命令，切记：./deploy.sh**
   

4. **如果你希望在服务器重启后自动启动你的 Next.js 应用，可以使用 PM2 的自启动功能**：

   ```bash
   pm2 startup
   pm2 save
   ```

## 技术栈

- Next.js 15
- React
- TypeScript
- Tailwind CSS
- Shadcn/ui

## 开发者

- 开发者：灵梦
- 联系方式：[QQ：362856178]

## 许可证

本项目基于 MIT 许可证开源，详见 [LICENSE](LICENSE) 文件。

## 更新日志

### v1.0.0 (2024-01-01)
- 🎉 首次发布
- ✨ 支持多平台视频解析
- 🎨 支持深色模式
- 📱 支持移动端

## 贡献

欢迎提交 Issue 和 Pull Request！

## 免责声明

本工具仅供学习交流使用，请勿用于商业用途。使用本工具时请遵守相关法律法规，尊重版权。
