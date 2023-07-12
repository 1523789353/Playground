@echo off
cd /d "%~dp0"
:: mkdir caches

set "ffmpeg=D:\Program Files\ffmpeg-5.1.2-full_build\bin\ffmpeg.exe"
:: set "infile=E:\OneDrive\OneDrive - 皇家养猪场\番剧\紫罗兰永恒花园 剧场版 _正片_.flv"
set "infile=%cd%\86-1-raw.mp4"

"%ffmpeg%" -y -threads 12 -c:v h264_cuvid -i "%infile%" -an -vf "scale='min(320,iw)':'min(180,ih)'" -preset fast -crf 18 -c:v h264_qsv "%cd%\preview.mp4" -benchmark
:: -loglevel quiet

pause

::::: 老解决方案 :::::

:: 以 最宽320, 最高180 0.2fps(每5秒1帧) 采样视频
:: "%ffmpeg%" -i "%infile%" -vf "scale='min(320, iw)': 'min(180, ih)'" -r 0.2 "%cd%\caches\frame%%d.jpg"
:: 以 1fps 图片为输入, 按照1fps 5级质量(最烂)输出
:: "%ffmpeg%" -framerate 1 -i "%cd%\caches\frame%%d.jpg" -vf fps=1 -q:v 5 "%cd%\out.mp4"
:: 清理文件
:: del /s /f /q "%cd%\caches\*.jpg"
