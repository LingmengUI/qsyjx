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

# 安装依赖
echo "正在安装依赖..."
npm install

# 构建项目
echo "正在构建项目..."
npm run build

# 重启 PM2 服务
echo "正在重启服务..."
pm2 restart qsyjx

echo "更新完成！" 