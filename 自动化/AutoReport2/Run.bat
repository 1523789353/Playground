@echo off
Title Python console

python --version||goto no_python
cls

cd /d %~dp0
python __init__.py
echo=将在10秒后关闭窗口
timeout /T 10 /NOBREAK>nul
goto=End

:no_python
cls
echo=噢, 我的伙计, 你好像没有安装python
echo=或者说没有将它加入path环境变量
echo=
echo=请确认python --version指令能用后再来试试吧
pause
:End