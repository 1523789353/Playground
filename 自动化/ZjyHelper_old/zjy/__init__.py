import requests
import json
from .Util import *


def getDevice(equipmentModel, equipmentApiVersion, equipmentAppVersion, emit):
    tmp = getMd5(equipmentModel) + equipmentApiVersion
    tmp = getMd5(tmp) + equipmentAppVersion
    tmp = getMd5(tmp) + emit
    return getMd5(tmp)


class ZjySession:
    def __init__(self, account, password):
        # 对象的数据
        self.session = requests.Session()
        self.data = {
            "online": False,
            "displayName": "",
            "schoolName": None,
            "userId": None,
            "newToken": None,
            "todayClass": {
                "lastUpdate": 0,
                "classList": [],
            }
        }
        # 自动签到需要的数据
        self.url_api = "https://zjyapp.icve.com.cn/newMobileAPI/"
        self.equipmentModel = "Xiaomi Redmi K30 Pro"
        self.equipmentApiVersion = 10
        self.equipmentAppVersion = "2.8.43"
        self.emit = str(getTimestamp())
        self.basicData = {
            "equipmentAppVersion": self.equipmentAppVersion,
            "equipmentApiVersion": self.equipmentApiVersion,
            "equipmentModel": self.equipmentModel
        }
        self.headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Host": "zjyapp.icve.com.cn",
            "Connection": "Keep-Alive",
            "Accept-Encoding": "gzip",
            "User-Agent": "okhttp/4.5.0",
            "emit": self.emit,
            "device": getDevice(self.equipmentModel, str(self.equipmentApiVersion), self.equipmentAppVersion, self.emit)
        }
        self.userData = {
            "userName": account,
            "userPwd": password,
            "clientId": "f47d9901259e48a982eb9af711410aba",
            "sourceType": "2",
            "appVersion": self.equipmentAppVersion
        }
        self.userData.update(self.basicData)

    # 登录
    def login(self) -> bool:
        if not self.data["online"]:
            login = self.session.post(self.url_api + "MobileLogin/newSignIn", data=self.userData, headers=self.headers)
            loginInfo = json.loads(login.text)
            if loginInfo["code"] != -1:
                self.data["schoolName"] = loginInfo["schoolName"]
                self.data["displayName"] = loginInfo["displayName"]
                self.data["userId"] = loginInfo["userId"]
                self.data["newToken"] = loginInfo["newToken"]
                self.data["online"] =  True
        return self.data["online"]

    # 获取今日课程
    async def getTodayClass(self):
        if self.login():
            todayClassData = {"stuId": self.data["userId"], "faceDate": getDate(), "newToken": self.data["newToken"]}
            todayClassData.update(self.basicData)
            todayClass = self.session.post(
                self.url_api + "faceteach/getStuFaceTeachList", data=todayClassData, headers=self.headers)
            todayClassInfo = json.loads(todayClass.text)["dataList"]
            if todayClassInfo != self.data["todayClass"]["classList"]:
                self.data["todayClass"]["classList"] = todayClassInfo
                self.data["todayClass"]["lastUpdate"] = getTimestamp()

    # 课程签到
    async def signInClass(self) -> str:
        if self.login():
            result = ""
            for i in range(len(self.data["todayClass"]["classList"])):
                courseName = self.data["todayClass"]["classList"][i]["courseName"]
                inClassData = {
                    "activityId": self.data["todayClass"]["classList"][i]["Id"],
                    "stuId": self.data["userId"],
                    "classState": self.data["todayClass"]["classList"][i]["state"],
                    "openClassId": self.data["todayClass"]["classList"][i]["openClassId"],
                    "newToken": self.data["newToken"]
                }
                inClassData.update(self.basicData)
                inClass = self.session.post(
                    self.url_api + "faceteach/newGetStuFaceActivityList", data=inClassData, headers=self.headers)
                inClassInfo = json.loads(inClass.text)["dataList"]
                for n in range(len(inClassInfo)):
                    if inClassInfo[n]["DataType"] == "签到" and inClassInfo[n]["State"] == 2:
                        attendData = {
                            "activityId": self.data["todayClass"]["classList"][i]["Id"],
                            "openClassId": self.data["todayClass"]["classList"][i]["openClassId"],
                            "stuId": self.data["userId"],
                            "typeId": inClassInfo[n]["Id"],
                            "type": "1",
                            "newToken": self.data["newToken"]
                        }
                        attendData.update(self.basicData)
                        attend = self.session.post(
                            self.url_api + "faceteach/isJoinActivities", data=attendData, headers=self.headers)
                        attendInfo = json.loads(attend.text)
                        if attendInfo["isAttend"] != 1:
                            signInData = {
                                "signId": inClassInfo[n]["Id"],
                                "stuId": self.data["userId"],
                                "openClassId": self.data["todayClass"]["classList"][i]["openClassId"],
                                "sourceType": "3",
                                "checkInCode": inClassInfo[n]["Gesture"],
                                "activityId": self.data["todayClass"]["classList"][i]["Id"],
                                "newToken": self.data["newToken"]
                            }
                            signInData.update(self.basicData)
                            signIn = self.session.post(
                                self.url_api + "faceteach/saveStuSignNew", data=signInData, headers=self.headers)
                            signInInfo = json.loads(signIn.text)
                            signInTime = getGmtTime()
                            result += courseName + " " + signInInfo["msg"] + "\n"
            self.data["lastSign"] = self.data["todayClass"]["lastUpdate"]
            return result
        return self.userData["userName"] + "登录失败"
