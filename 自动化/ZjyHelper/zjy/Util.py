# 数据处理工具类

from time import time
from datetime import datetime, timezone
import base64
from urllib.parse import quote as encodeUrl
from urllib.parse import unquote as decodeUrl
from hashlib import md5


__localTimedelta = None
__localTimezone = None


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


def getCustomTime() ->str:
    FORMAT = '%Y-%m-%d %H:%M:%S ' + getLocalTimezone()
    return datetime.now().strftime(FORMAT)


def getMd5(string: str) -> str:
    result = md5()
    result.update(string.encode("utf-8"))
    return result.hexdigest()


def enbase64(text: str) -> str:
    return base64.b64encode(text.encode("utf-8")).decode("utf-8")


def debase64(text: str) -> str:
    return base64.b64decode(text.encode("utf-8")).decode("utf-8")
