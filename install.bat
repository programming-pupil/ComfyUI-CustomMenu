@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM Windows 安装脚本
REM 查找 comfyui_frontend_package 目录并安装菜单扩展

set "SCRIPT_DIR=%~dp0"
set "EXTENSION_NAME=ComfyUI-CustomMenu"

echo 正在执行...

REM 搜索 comfyui_frontend_package 目录
for /f "delims=" %%i in ('dir /s /b /ad comfyui_frontend_package 2^>nul') do (
    set "COMFYUI_DIR=%%i"
    goto :found
)

REM 如果全局搜索失败，尝试在常见位置搜索
set "SEARCH_PATHS=C:\ D:\ %USERPROFILE% %SCRIPT_DIR%..\.. %SCRIPT_DIR%..\..\.. %ProgramFiles% %ProgramFiles(x86)%"

for %%p in (%SEARCH_PATHS%) do (
    if exist "%%p" (
        for /f "delims=" %%i in ('dir /s /b /ad "%%p\comfyui_frontend_package" 2^>nul') do (
            set "COMFYUI_DIR=%%i"
            goto :found
        )
    )
)

echo 错误: 未找到目录
pause
exit /b 1

:found

set "TARGET_DIR=!COMFYUI_DIR!\static\extensions\%EXTENSION_NAME%"

REM 删除已存在的扩展目录
if exist "!TARGET_DIR!" (
    rmdir /s /q "!TARGET_DIR!"
)

REM 创建目标目录
mkdir "!TARGET_DIR!"

REM 复制文件
xcopy "%SCRIPT_DIR%*" "!TARGET_DIR!\" /E /I /Y >nul

echo 安装完成!
echo 无需重启，请刷新 ComfyUI 页面以加载扩展
pause