title CatServer
:start
Java -Xms4G -Xmx4G -XX:+UseG1GC -XX:+UnlockExperimentalVMOptions -XX:MaxGCPauseMillis=100 -XX:+DisableExplicitGC -XX:TargetSurvivorRatio=90 -XX:G1NewSizePercent=50 -XX:G1MaxNewSizePercent=80 -XX:G1MixedGCLiveThresholdPercent=35 -XX:+AlwaysPreTouch -XX:+ParallelRefProcEnabled -XX:+UseLargePagesInMetaspace -Dusing.aikars.flags=mcflags.emc.gs -jar CatServer-1.16.5-2b1466f6-server.jar nogui
goto start
pause
exit /b
