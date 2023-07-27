@echo off
for %%i in (1,2,3) do (
    set "val=%%i.%random%"
    @rem 此处val取不到值
    echo %val%
    @rem 双冒号注释报错
    ::这里是注释
)
pause
