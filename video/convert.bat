@echo off
:: 进入脚本所在目录
cd /d "%~dp0"
:: 调用main函数, 移交所有参数
call :main %*
exit /b %ErrorLevel%


:main <主函数>
    set "method=%~1"
    set "infile=%~2"
    set "outpath=%~dpn3"
    if not exist "%3" set "outpath=%~dp2%~nx3"

    if "%method%" == "-use_acc" call :use_acc
    if "%method%" == "-no_acc" call :no_acc
exit /b %ErrorLevel%

:use_acc <硬件加速>
    ::pc用, 硬件加速, 硬编解码, 支持3种清晰度同时压制(四种会oom)
    ffmpeg -hwaccel cuda -c:v h264_cuvid -y -i "%infile%" -preset fast -g 120 -sc_threshold 0 -map 0:0 -map 0:1 -map 0:0 -map 0:1 -map 0:0 -map 0:1 -s:v:0 1920*1080 -b:v:0 6000k -s:v:1 1280*720 -b:v:1 2800k -s:v:2 858*480 -b:v:2 1200k -crf 23.5 -c:v h264_nvenc -c:a copy -var_stream_map "v:0,a:0,name:1080p v:1,a:1,name:720p v:2,a:2,name:480p" -f hls -hls_time 6 -hls_playlist_type vod -master_pl_name master.m3u8 -hls_segment_filename "%outpath%\v%%vseg%%d.ts" "%outpath%\v%%vindex.m3u8" -loglevel quiet
exit /b %ErrorLevel%

:no_acc <无硬件加速>
    ::服务器用, 无硬件加速, 软编解码, 支持4种清晰度同时压制
    ffmpeg -y -i "%infile%" -preset ultrafast -g 120 -sc_threshold 0 -map 0:0 -map 0:1 -map 0:0 -map 0:1 -map 0:0 -map 0:1 -map 0:0 -map 0:1 -s:v:0 1920*1080 -b:v:0 6000k -b:a:0 320k -s:v:1 1280*720 -b:v:1 2800k -b:a:1 160k -s:v:2 858*480 -b:v:2 1200k -b:a:1 140k -s:v:3 630*360 -b:v:3 650k -b:a:1 140k -crf 23.5 -c:a copy -var_stream_map "v:0,a:0,name:1080p v:1,a:1,name:720p v:2,a:2,name:480p v:3,a:3,name:360p" -f hls -hls_time 6 -hls_playlist_type vod -master_pl_name master.m3u8 -hls_segment_filename "%outpath%\v%%v\seg%%d.ts" "%outpath%\v%%v\index.m3u8" -loglevel quiet
exit /b %ErrorLevel%

