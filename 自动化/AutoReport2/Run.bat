@echo off
Title Python console

python --version||goto no_python
cls

cd /d %~dp0
python __init__.py
echo=����10���رմ���
timeout /T 10 /NOBREAK>nul
goto=End

:no_python
cls
echo=��, �ҵĻ��, �����û�а�װpython
echo=����˵û�н�������path��������
echo=
echo=��ȷ��python --versionָ�����ú��������԰�
pause
:End