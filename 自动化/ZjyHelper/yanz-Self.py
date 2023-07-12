import hashlib
import threading
import time
from concurrent.futures import thread

import requests
import json


def getMd5(str):
    md5 = hashlib.md5()
    md5.update(str.encode("utf-8"))
    return md5.hexdigest()


def getDevice(equipmentModel, equipmentApiVersion, equipmentAppVersion, emit):
    tmp = getMd5(equipmentModel) + equipmentApiVersion
    tmp = getMd5(tmp) + equipmentAppVersion
    tmp = getMd5(tmp) + emit
    return getMd5(tmp)


def zdqd(userName, userPwd):
    url_api = "https://zjyapp.icve.com.cn/newMobileAPI/"
    equipmentModel = "Xiaomi Redmi K30 Pro"
    equipmentApiVersion = 10
    equipmentAppVersion = "2.8.43"
    emit = str(int(time.time())) + "000"
    basicData = {
        "equipmentAppVersion": equipmentAppVersion,
        "equipmentApiVersion": equipmentApiVersion,
        "equipmentModel": equipmentModel
    }
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Host": "zjyapp.icve.com.cn",
        "Connection": "Keep-Alive",
        "Accept-Encoding": "gzip",
        "User-Agent": "okhttp/4.5.0",
        "emit": emit,
        "device": getDevice(equipmentModel, str(equipmentApiVersion), equipmentAppVersion, emit)
    }
    userData = {
        "clientId": "f47d9901259e48a982eb9af711410aba",
        "sourceType": "2",
        "userPwd": userPwd,
        "userName": userName,
        "appVersion": equipmentAppVersion
    }
    userData.update(basicData)
    session = requests.Session()
    login = session.post(url_api + "MobileLogin/newSignIn", data=userData, headers=headers)
    loginInfo = json.loads(login.text)
    if loginInfo["code"] == -1:
        return ""
    schoolName = loginInfo["schoolName"]
    displayName = loginInfo["displayName"]
    faceDate = (time.strftime("%Y-%m-%d", time.localtime()))
    todayClassData = {"stuId": loginInfo["userId"], "faceDate": faceDate, "newToken": loginInfo["newToken"]}
    todayClassData.update(basicData)
    # 签到列表
    todayClass = session.post(url_api + "faceteach/getStuFaceTeachList", data=todayClassData, headers=headers)
    todayClassInfo = json.loads(todayClass.text)["dataList"]
    if len(todayClassInfo) == 0:
        return displayName + "同学没有课可以签到"

    else:
        result = ""
        for i in range(len(todayClassInfo)):
            courseName = todayClassInfo[i]["courseName"]
            inClassData = {
                "activityId": todayClassInfo[i]["Id"],
                "stuId": loginInfo["userId"],
                "classState": todayClassInfo[i]["state"],
                "openClassId": todayClassInfo[i]["openClassId"],
                "newToken": loginInfo["newToken"]
            }
            inClassData.update(basicData)
            inClass = session.post(url_api + "faceteach/newGetStuFaceActivityList", data=inClassData, headers=headers)
            inClassInfo = json.loads(inClass.text)["dataList"]
            for n in range(len(inClassInfo)):
                if (inClassInfo[n]["DataType"] == "签到" and inClassInfo[n]["State"] == 2):
                    attendData = {
                        "activityId": todayClassInfo[i]["Id"],
                        "openClassId": todayClassInfo[i]["openClassId"],
                        "stuId": loginInfo["userId"],
                        "typeId": inClassInfo[n]["Id"],
                        "type": "1",
                        "newToken": loginInfo["newToken"]
                    }
                    attendData.update(basicData)
                    attend = session.post(url_api + "faceteach/isJoinActivities", data=attendData, headers=headers)
                    attendInfo = json.loads(attend.text)
                    if attendInfo["isAttend"] != 1:
                        signInData = {
                            "signId": inClassInfo[n]["Id"],
                            "stuId": loginInfo["userId"],
                            "openClassId": todayClassInfo[i]["openClassId"],
                            "sourceType": "3",
                            "checkInCode": inClassInfo[n]["Gesture"],
                            "activityId": todayClassInfo[i]["Id"],
                            "newToken": loginInfo["newToken"]
                        }
                        signInData.update(basicData)
                        signIn = session.post(url_api + "faceteach/saveStuSignNew", data=signInData, headers=headers)
                        signInInfo = json.loads(signIn.text)
                        signInTime = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
                        result += courseName + " " + signInInfo["msg"] + "\n"
    if result == "":
        return result
    else:
        return schoolName + "的" + displayName + "同学\n" + result

def main():
    data = [
        {"account": "202003090402", "password": "85474755Aa"},
        {"account": "202003090405", "password": "qazplm0614@"},
        {"account": "202003090416", "password": "Ly20020205"},
        {"account": "202003090429", "password": "Zzz20010712"},
        {"account": "202003090410", "password": "20020912Hh"}
    ]
    while (True):
        for user in data:
            faceDate = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
            info = zdqd(user["account"], user["password"])
            if (info != ""):
                print(faceDate + "\t" + info + "\n")

if __name__ == "__main__":
    main()