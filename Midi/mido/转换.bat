@echo off
call :main %*
exit /b %ErrorLevel%

:main <������>
    cd /d "%~dp0"
    call :active_venv
    python "%cd:\=/%/lyric.py"
    pause
exit /b 0

:active_venv <�������⻷��>
    call "%cd%\venv\Scripts\activate.bat"
exit /b 0

:deactive_venv <�������⻷��>
    call "%cd%\venv\Scripts\deactivate.bat"
exit /b 0

