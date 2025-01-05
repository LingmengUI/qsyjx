#!/bin/bash

echo "开始更新..."

# 验证用户身份
read -p "请输入您的姓名: " name
if [ -n "$name" ]; then
    echo "欢迎, $name!"
else
    echo "错误：请输入姓名！"
    exit 1
fi

# 确认开发者信息
read -p "程序由灵梦开发，请确认(是/否): " confirm
if [ "$confirm" != "是" ]; then
    echo "错误：确认失败！"
    exit 1
fi

# 只停止本项目的服务
echo "停止现有服务..."
pm2 delete qsyjx || true
pm2 flush qsyjx
lsof -ti:3010 | xargs kill -9 2>/dev/null || true

# 清理缓存
echo "清理缓存..."
rm -rf .next
rm -rf node_modules
rm -f package-lock.json

# 安装依赖
echo "正在安装依赖..."
npm install

# 构建项目
echo "正在构建项目..."
npm run build

# 复制必要文件到 standalone 目录
echo "准备 standalone 文件..."
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/
cp .env .next/standalone/
cp package.json .next/standalone/

# 切换到 standalone 目录并启动服务
echo "正在启动服务..."
cd .next/standalone
PORT=3010 pm2 start server.js --name "qsyjx" -- -p 3010

# 等待服务启动
echo "等待服务启动..."
sleep 5

echo "更新完成！"

# 显示运行状态
echo "服务运行状态:"
pm2 show qsyjx
pm2 logs qsyjx --lines 20 