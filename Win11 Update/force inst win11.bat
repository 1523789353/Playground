@echo off
set "file=C:\$WINDOWS.~BT\Sources\appraiserres.dll"
set "detected=0"

:loop
if exist "%file%" (
    if "%detected%" == "0" (
        set "detected=1"
        cls
        echo Detected!
    )
    del /s /f /q "%file%" >nul 2>nul
) else (
    if "%detected%" == "1" (
        set "detected=0"
        cls
    )
)
goto loop