@echo off
Title Python console

python --version||goto no_python
if not exist "%cd%/chromedriver.exe" goto no_tools

cls
pushd %~dp0
python __init__.py
echo=����10���رմ���
ping -n 11 ::1 >nul
goto=End

:no_tools
cls
echo=�������ذ�װchrome���������Ӧ�汾��chromedriver
echo=P.S.�Ҳ�����Ӧ�汾����������ӽ��İ汾
start "" "http://npm.taobao.org/mirrors/chromedriver/"
goto End

:no_python
cls
echo=��, �ҵĻ��, �����û�а�װpython
echo=����˵û�н�������path��������
echo=
echo=��ȷ��python --versionָ�����ú��������԰�
pause
:End