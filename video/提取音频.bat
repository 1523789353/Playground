@echo off
for /r %%i in (*) do (
    call :audio "%%i"
)
pause


:audio
    set "file=%~1"
    ffmpeg -i "%file%" -vn -b:a 320k -ar 44.1k "%file%.mp3"
exit /b
