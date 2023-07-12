# 数据处理工具类

import os
import sys
from time import time
from datetime import datetime, timezone
import base64
from urllib.parse import quote as encodeUrl
from urllib.parse import unquote as decodeUrl
from hashlib import md5

# 缓存
__localTimedelta = None
__localTimezone = None
__scriptPath = None


# 日期处理
def getGmtTime() -> str:
    FORMAT = '%a, %d %b %Y %H:%M:%S GMT'
    return datetime.utcnow().strftime(FORMAT)


def getDate() -> str:
    FORMAT = '%Y-%m-%d'
    return datetime.utcnow().strftime(FORMAT)


def getTimestamp() -> int:
    return int(round(time() * 1000))


def getLocalTimedelta():
    global __localTimedelta
    if __localTimedelta is None:
        utcTime = datetime.utcnow()
        localeTime = datetime.now()
        __localTimedelta = localeTime - utcTime
    return __localTimedelta


def getLocalTimezone():
    global __localTimezone
    if __localTimezone is None:
        timedelta = getLocalTimedelta()
        hours = int(timedelta.seconds / 3600)
        if hours >= 0:
            __localTimezone = "UTC+" + str(hours)
        else:
            __localTimezone = "UTC" + str(hours)
    return __localTimezone


def getLocalDate() -> str:
    FORMAT = '%Y-%m-%d ' + getLocalTimezone()
    return datetime.now().strftime(FORMAT)


def getLocalDatetime() -> str:
    FORMAT = '%a, %d %b %Y %H:%M:%S ' + getLocalTimezone()
    return datetime.now().strftime(FORMAT)


def getCustomTime() -> str:
    FORMAT = '%Y-%m-%d %H:%M:%S ' + getLocalTimezone()
    return datetime.now().strftime(FORMAT)


# 数据编码
def getMd5(string: str) -> str:
    result = md5()
    result.update(string.encode("utf-8"))
    return result.hexdigest()


def enbase64(text: str) -> str:
    return base64.b64encode(text.encode("utf-8")).decode("utf-8")


def debase64(text: str) -> str:
    return base64.b64decode(text.encode("utf-8")).decode("utf-8")


# 获取本脚本所在目录的绝对路径
# 注意: 运行Windows下的symlink/linux下的link 都会获取到链接最终指向的文件
#
# cd /d D:/
# mklink Util.py D:/testPath/Util.py
#
# python
# from D:/Util.py import *
# getScriptPath() # 输出D:/testPath/Util.py
def getScriptPath() -> str:
    global __scriptPath
    if __scriptPath is None:
        filepath = os.path.realpath(__file__)
        __scriptPath = os.path.split(filepath)[0]
    return __scriptPath


# 获取第一个被运行的脚本所在目录的绝对路径
def getRunPath() -> str:
    return sys.path[0]
