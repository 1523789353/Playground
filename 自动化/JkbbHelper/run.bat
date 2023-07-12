#!/usr/bin/env python3
# -*- coding: utf-8 -*-
'''
@echo off
cls
cd /d "%~dp0"
:time
set "$date=%date:~0,10%"
set "$date=%$date:/=-%"
set "$time=%time:~0,8%"
set "$time=%$time::=.%"
>"%cd%\logs\jkbb_[%$date% %$time%].txt" python "%~dpnx0" %*
exit /b
'''


import asyncio
from jkbb import *
from peewee import *


# 定义数据库信息
database = MySQLDatabase(
    'db_reporting',
    user='root',
    password='85474755a',
    host='gz-cdb-9ysdxje3.sql.tencentcdb.com',
    port=57816,
    charset='utf8',
    use_unicode=True
)


# 定义用户数据模型
class information(Model):
    ID = IntegerField(column_name="ID")
    StudentNumber = CharField(column_name="Student_number")
    Name = CharField(column_name="Name")
    ViewState = CharField(column_name="__VIEWSTATE")
    ViewStateGenerator = CharField(column_name="__VIEWSTATEGENERATOR")
    EventValidation = CharField(column_name="__EVENTVALIDATION")

    class Meta:
        database = database


async def jkbbAll():
    # 从数据库取数据
    userData = []
    database.connect()
    for line in information.select():
        userData.append({
            "viewstate": line.ViewState,
            "viewstategenerator": line.ViewStateGenerator,
            "eventvalidation": line.EventValidation
        })
    database.close()

    # 异步并发报备
    result = await jkbbSession().reportAll(*userData)

    # 结果整理分类
    ret_data = {}
    for item in result:
        if item["result"] not in ret_data:
            ret_data[item["result"]] = []
        ret_data[item["result"]].append(item["Name"])

    message = ""
    for key in ret_data:
        message += ', '.join(
            [str(i) for i in ret_data[key]]
        ) + ": \n" + key + "\n\n"

    return message[:-1]


async def main():
    msg = await jkbbAll()
    print(msg)


if __name__ == "__main__":
    asyncio.run(main())
    exit(0)
