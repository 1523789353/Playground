@echo off
for %%i in (1,2,3) do (
    set "val=%%i.%random%"
    @rem �˴�valȡ����ֵ
    echo %val%
    @rem ˫ð��ע�ͱ���
    ::������ע��
)
pause
