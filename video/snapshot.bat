@echo off
cd /d "%~dp0"
:: mkdir caches

set "ffmpeg=D:\Program Files\ffmpeg-5.1.2-full_build\bin\ffmpeg.exe"
:: set "infile=E:\OneDrive\OneDrive - �ʼ�����\����\���������㻨԰ �糡�� _��Ƭ_.flv"
set "infile=%cd%\86-1-raw.mp4"

"%ffmpeg%" -y -threads 12 -c:v h264_cuvid -i "%infile%" -an -vf "scale='min(320,iw)':'min(180,ih)'" -preset fast -crf 18 -c:v h264_qsv "%cd%\preview.mp4" -benchmark
:: -loglevel quiet

pause

::::: �Ͻ������ :::::

:: �� ���320, ���180 0.2fps(ÿ5��1֡) ������Ƶ
:: "%ffmpeg%" -i "%infile%" -vf "scale='min(320, iw)': 'min(180, ih)'" -r 0.2 "%cd%\caches\frame%%d.jpg"
:: �� 1fps ͼƬΪ����, ����1fps 5������(����)���
:: "%ffmpeg%" -framerate 1 -i "%cd%\caches\frame%%d.jpg" -vf fps=1 -q:v 5 "%cd%\out.mp4"
:: �����ļ�
:: del /s /f /q "%cd%\caches\*.jpg"
