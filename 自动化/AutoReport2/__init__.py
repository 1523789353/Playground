#!/usr/bin/env python3
import requests
import json

def HealthReport(StuID, City="长沙市"):
    print("正在尝试报备:{},所在城市:{}".format(StuID,City))
    session = requests.Session()
    report = session.get("http://missgem.cn/api/hngcjkbb/?address={}&studentID={}".format(City,StuID))
    reportInfo = json.loads(report.text)
    print("===报备人: {}, 结果: {}===\n".format(reportInfo["name"], reportInfo["result"]))


if __name__ == '__main__':
    from config import *
    try:
        print("您可以使用Ctrl+C终止本次报备\n")
        #Report
        for StuInfo in StuList:
            HealthReport(StuInfo[0], StuInfo[1])
            print()
        print("\n报备完成!")
    except:
        print("报备终止")
    finally:
        print("正在退出...\n")
