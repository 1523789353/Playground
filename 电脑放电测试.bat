#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
@echo off&cls
cd /d "%~dp0"
echo ��Ctrl+C��������, ��������־
python "%~dpnx0" %*
exit /b
"""
import time
import psutil

class Logger:
    def __init__(self, filename):
        self.logfile = open(filename, mode='a')
    def log(self, msg):
        convert = {
            list: lambda x: '\t'.join([str(i) for i in x]),
            tuple: lambda x: '\t'.join([str(i) for i in x]),
            dict: lambda x: str(x),
            int: lambda x: str(x),
            float: lambda x: str(x),
            'default': lambda x: str(x)
        }
        cast = convert.get(type(msg), convert['default'])
        msg = cast(msg)

        self.logfile.write(msg + '\n')
        print(msg)

logger = Logger('BatteryReport.txt')

logger.log(['ʱ���', '�����ٷֱ�', '�����ӵ�Դ'])
while True:
    battery = psutil.sensors_battery()
    logger.log([round(time.time() * 1000), battery.percent, battery.power_plugged])
    time.sleep(5)


