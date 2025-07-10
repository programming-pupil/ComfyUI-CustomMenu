#!/bin/bash

# Linux/macOS 安装脚本
# 查找 comfyui_frontend_package 目录并安装菜单扩展

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
EXTENSION_NAME="ComfyUI-CustomMenu"

echo "正在执行..."

# 搜索
COMFYUI_DIR=$(find / -type d -name "comfyui_frontend_package" 2>/dev/null | head -1)

if [ -z "$COMFYUI_DIR" ]; then
    # 如果全局搜索失败，尝试在常见位置搜索
    for path in "$HOME" "/opt" "/usr/local" "$(pwd)/../.." "$(pwd)/../../.."; do
        FOUND=$(find "$path" -type d -name "comfyui_frontend_package" 2>/dev/null | head -1)
        if [ -n "$FOUND" ]; then
            COMFYUI_DIR="$FOUND"
            break
        fi
    done
fi

if [ -z "$COMFYUI_DIR" ]; then
    echo "错误: 未找到目录"
    exit 1
fi

TARGET_DIR="$COMFYUI_DIR/static/extensions/$EXTENSION_NAME"

# 删除已存在的扩展目录
if [ -d "$TARGET_DIR" ]; then
    rm -rf "$TARGET_DIR"
fi

# 创建目标目录
mkdir -p "$TARGET_DIR"

# 复制文件
cp -r "$SCRIPT_DIR"/* "$TARGET_DIR/"

echo "安装完成!"
echo "无需重启，请刷新 ComfyUI 页面以加载扩展"