taskkill /f /im QQProtect.exe
sc delete QPCore
rd /s /q "%ProgramFiles(x86)%\Common Files\Tencent\QQProtect"
rd /s /q "%AppData%\Tencent\QQ\QQProtect"
rd /s /q "%AppData%\Tencent\QQ\SafeBase"
