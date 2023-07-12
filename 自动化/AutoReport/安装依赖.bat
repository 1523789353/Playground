@echo off
Title Environment update
cd /d "%~dp0"&&(if exist "%temp%\getadmin.vbs" del "%temp%\getadmin.vbs")&&fsutil dirty query "%systemdrive%" 1>nul 2>nul||(echo=请授予管理员权限&&cmd /u /c echo=Set UAC = CreateObject^("Shell.Application"^) : UAC.ShellExecute "cmd.exe", "/c cd ""%~sdp0"" && %~s0 %*", "", "runas", 1 >"%temp%\getadmin.vbs"&&"%temp%\getadmin.vbs"&&exit/B)
python --version||goto no_python

cls
echo=正在尝试更新pip
python -m pip install --upgrade pip
echo=正在安装依赖
pip install Selenium
(echo=依赖安装完成
echo=请使用Run.bat启动)|msg %username% /time 180
goto=End

:no_python
cls
echo=噢, 我的伙计, 你好像没有安装python
echo=或者说没有将它加入path环境变量
echo=
echo=请确认python --version指令能用后再来试试吧
pause
:End
pause