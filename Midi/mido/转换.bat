@echo off
call :main %*
exit /b %ErrorLevel%

:main <主函数>
    cd /d "%~dp0"
    call :active_venv
    python "%cd:\=/%/lyric.py"
    pause
exit /b 0

:active_venv <激活虚拟环境>
    call "%cd%\venv\Scripts\activate.bat"
exit /b 0

:deactive_venv <搁置虚拟环境>
    call "%cd%\venv\Scripts\deactivate.bat"
exit /b 0

