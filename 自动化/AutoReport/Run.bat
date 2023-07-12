@echo off
Title Python console

python --version||goto no_python
if not exist "%cd%/chromedriver.exe" goto no_tools

cls
pushd %~dp0
python __init__.py
echo=将在10秒后关闭窗口
ping -n 11 ::1 >nul
goto=End

:no_tools
cls
echo=请先下载安装chrome浏览器及对应版本的chromedriver
echo=P.S.找不到对应版本可以下载最接近的版本
start "" "http://npm.taobao.org/mirrors/chromedriver/"
goto End

:no_python
cls
echo=噢, 我的伙计, 你好像没有安装python
echo=或者说没有将它加入path环境变量
echo=
echo=请确认python --version指令能用后再来试试吧
pause
:End