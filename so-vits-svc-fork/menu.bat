@echo off
set "script=%~0"
set "args=%*"
:: ���Լ������⻷��
call :activate
call :main %*
exit /b %ErrorLevel%

:main <������-�˵�>
    :: setup ��Ȩ��ת
    if "%~1" == "SETUP" (
        shift
        call :setup %*
    )
    cd /d "%~dp0"
    cls
    echo=��ѡ�����:
    echo=1. ��װ Python ���⻷��
    echo=2. ��װ/���� Pytorch+SoVits
    echo=3. �鿴������Ϣ(�Կ�Cuda��Ϣ)
    echo=4. Ԥ����-�ָ���Ƶ
    echo=5. Ԥ����-��Ƶ�ز���
    echo=6. Ԥ����-��������
    echo=7. Ԥ����-����hubert��f0
    echo=8. ѵ��AIģ��
    echo=9. ѵ��clusterģ��
    echo=Q. �����ļ�(ע�ⱸ��)
    echo=W. ����GUI(������Ƶ�ƶ�)
    echo=E. �˳�
    choice /c 123456789QWE /n /m "��ѡ�����:"
    cls
    if "%ErrorLevel%" == "1" call :setup
    if "%ErrorLevel%" == "2" call :update
    if "%ErrorLevel%" == "3" cmd /c status.bat
    if "%ErrorLevel%" == "4" call :pre-split
    if "%ErrorLevel%" == "5" call :pre-resample
    if "%ErrorLevel%" == "6" call :pre-config
    if "%ErrorLevel%" == "7" call :pre-hubert
    if "%ErrorLevel%" == "8" call :train
    if "%ErrorLevel%" == "9" call :train-cluster
    if "%ErrorLevel%" == "10" svc clean
    if "%ErrorLevel%" == "11" start "" /b /wait svcg
    if "%ErrorLevel%" == "12" exit /b 0
goto :main


:: ===== ���ú��� =====
:activate <�������⻷��>
    :: ����Ѿ�����, ���ټ���
    if "%__ACTIVATE__%" == "0" exit /b 0
    :: ��������
    set "HUGGINGFACE_TOKEN=hf_put-your-token-here"
    set "CUDA_HOME=D:/Devtool/Cuda/V12.2"
    set "CUDA_PATH=%CUDA_HOME%"
    :: ���Լ������⻷��, ���ı�flag
    cd /d "%~dp0"
    2>nul >nul call venv/Scripts/activate.bat
    set "__ACTIVATE__=%ErrorLevel%"
exit /b %__ACTIVATE__%

:is_dir
    2>nul >nul dir /a:d "%~1"
exit /b %ErrorLevel%

:is_admin <������ԱȨ��>
    fsutil dirty query %systemdrive% 2>nul >nul
exit /b %ErrorLevel%

:elevate <�������ԱȨ��>
    cls
    echo=�������ԱȨ��...
    start "" /b /wait mshta vbscript:createobject^("shell.application"^).shellexecute^("cmd","/c %script% %* %args%","","runas",1^)^(window.close^)
exit /b 0



:: ===== ���� =====
:setup <��װ Python ���⻷��>
    echo=========================================
    echo=��װ Python ���⻷��
    echo=========================================
    call :is_admin
    if not "%ErrorLevel%" == "0" (
        call :elevate SETUP
        exit 0
    )
    cd /d "%~dp0"
    :: ���û�����⻷��, �򴴽����⻷��
    call :is_dir venv
    if not "%ErrorLevel%" == "0" (
        py -3.10 -m venv venv
        call :activate
    )
    call :update
    cd /d "%~dp0"
    cmd /c status.bat
exit /b 0

:update <��װ/���� Pytorch+SoVits>
    echo=========================================
    echo=��װ/���� Pytorch+SoVits
    echo=========================================
    py -m pip install -U pip setuptools wheel
    pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
    pip install -U so-vits-svc-fork
exit /b 0

:pre-split <Ԥ����-�ָ���Ƶ>
    echo=========================================
    echo=Ԥ����-�ָ���Ƶ(pre-split)
    echo=========================================
    set /p "input_dir=������Ŀ¼·��:"
    svc pre-split -i %input_dir%
exit /b 0

:pre-resample
    echo=========================================
    echo=Ԥ����-�ز���(pre-resample)
    echo=========================================
    svc pre-resample
exit /b 0


:pre-config
    echo=========================================
    echo=Ԥ����-����(pre-config)
    echo=========================================
    svc pre-config
exit /b 0

:pre-hubert
    echo=========================================
    echo=Ԥ����-����Hubert��f0(pre-hubert)
    echo=========================================
    svc pre-hubert
exit /b 0

:train <ѵ��AIģ��>
    echo=========================================
    echo=ѵ��AIģ��(train)
    echo=�� Ctrl+C ��ֹѵ��, ����ѵ�� 1000 Epochs ����
    echo=========================================
    svc train -t
exit /b 0

:train-cluster <ѵ��Clusterģ��>
    echo=========================================
    echo=ѵ��Clusterģ��(train-cluster)
    echo=========================================
    svc train-cluster
exit /b 0
