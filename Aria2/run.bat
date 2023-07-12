@echo off
cd /d "%~dp0"

>nul 2>nul taskkill /f /t /im "aria2c.exe"
start "" mshta vbscript:createobject("wscript.shell").run("%cd%\aria2c.exe --conf-path=""%cd%\config.cfg""",0)(Close)
