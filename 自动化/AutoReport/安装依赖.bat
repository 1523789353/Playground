@echo off
Title Environment update
cd /d "%~dp0"&&(if exist "%temp%\getadmin.vbs" del "%temp%\getadmin.vbs")&&fsutil dirty query "%systemdrive%" 1>nul 2>nul||(echo=���������ԱȨ��&&cmd /u /c echo=Set UAC = CreateObject^("Shell.Application"^) : UAC.ShellExecute "cmd.exe", "/c cd ""%~sdp0"" && %~s0 %*", "", "runas", 1 >"%temp%\getadmin.vbs"&&"%temp%\getadmin.vbs"&&exit/B)
python --version||goto no_python

cls
echo=���ڳ��Ը���pip
python -m pip install --upgrade pip
echo=���ڰ�װ����
pip install Selenium
(echo=������װ���
echo=��ʹ��Run.bat����)|msg %username% /time 180
goto=End

:no_python
cls
echo=��, �ҵĻ��, �����û�а�װpython
echo=����˵û�н�������path��������
echo=
echo=��ȷ��python --versionָ�����ú��������԰�
pause
:End
pause