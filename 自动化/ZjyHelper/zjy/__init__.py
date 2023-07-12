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
            "lastLogin": 0,
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
        self.url_api = "https://zjyapp.icve.com.cn/newMobileAPI/MobileLogin/newSignIn"
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
            "User-Agent": "okhttp/4.5.0"
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
        # 登录状态15分钟过期
        self.data["online"] &= getTimestamp() - self.data["lastLogin"] < 15 * 60 * 1000
        # 登录
        if not self.data["online"]:
            # 初始化数据
            self.emit = str(getTimestamp())
            self.headers["emit"] = self.emit
            self.headers["device"] = getDevice(self.equipmentModel, str(self.equipmentApiVersion),
                                               self.equipmentAppVersion, self.emit)
            # 发送请求
            login = self.session.post(self.url_api + "MobileLogin/newSignIn", data=self.userData, headers=self.headers)
            # 解析响应数据
            loginInfo = json.loads(login.text)
            # 获取登录状态
            if loginInfo["code"] != -1:
                self.data["schoolName"] = loginInfo["schoolName"]
                self.data["displayName"] = loginInfo["displayName"]
                self.data["userId"] = loginInfo["userId"]
                self.data["newToken"] = loginInfo["newToken"]
                self.data["lastLogin"] = getTimestamp()
                self.data["online"] = True
        # 返回登录结果
        return self.data["online"]

    # 获取今日课程
    async def getTodayClass(self):
        if self.login():
            # 初始化数据
            todayClassData = {
                "stuId": self.data["userId"],
                "faceDate": getDate(),
                "newToken": self.data["newToken"]
            }
            todayClassData.update(self.basicData)
            # 发送请求
            todayClass = self.session.post(
                self.url_api + "faceteach/getStuFaceTeachList", data=todayClassData, headers=self.headers)
            # 解析响应数据
            todayClassInfo = json.loads(todayClass.text)["dataList"]
            # 获取课程数据
            if todayClassInfo != self.data["todayClass"]["classList"]:
                self.data["todayClass"]["classList"] = todayClassInfo
                self.data["todayClass"]["lastUpdate"] = getTimestamp()

    # 课程签到
    async def signInClass(self) -> str:
        if self.login():
            result = ""
            # 循环课程
            for i in range(len(self.data["todayClass"]["classList"])):
                # 初始化数据
                courseName = self.data["todayClass"]["classList"][i]["courseName"]
                inClassData = {
                    "activityId": self.data["todayClass"]["classList"][i]["Id"],
                    "stuId": self.data["userId"],
                    "classState": self.data["todayClass"]["classList"][i]["state"],
                    "openClassId": self.data["todayClass"]["classList"][i]["openClassId"],
                    "newToken": self.data["newToken"]
                }
                inClassData.update(self.basicData)
                # 发送请求
                inClass = self.session.post(
                    self.url_api + "faceteach/newGetStuFaceActivityList", data=inClassData, headers=self.headers)
                # 解析响应数据
                inClassInfo = json.loads(inClass.text)["dataList"]
                # 循环课时, 获取事件
                for n in range(len(inClassInfo)):
                    # 筛选签到事件
                    if inClassInfo[n]["DataType"] == "签到" and inClassInfo[n]["State"] == 2:
                        # 初始化数据
                        attendData = {
                            "activityId": self.data["todayClass"]["classList"][i]["Id"],
                            "openClassId": self.data["todayClass"]["classList"][i]["openClassId"],
                            "stuId": self.data["userId"],
                            "typeId": inClassInfo[n]["Id"],
                            "type": "1",
                            "newToken": self.data["newToken"]
                        }
                        attendData.update(self.basicData)
                        # 发送请求
                        attend = self.session.post(
                            self.url_api + "faceteach/isJoinActivities", data=attendData, headers=self.headers)
                        # 解析响应数据
                        attendInfo = json.loads(attend.text)
                        # 获取签到结果
                        if attendInfo["isAttend"] != 1:
                            # 初始化数据
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
                            # 发送请求
                            signIn = self.session.post(
                                self.url_api + "faceteach/saveStuSignNew", data=signInData, headers=self.headers)
                            # 解析响应数据
                            signInInfo = json.loads(signIn.text)
                            # signInTime = getGmtTime()
                            # 记录签到结果
                            result += courseName + " " + signInInfo["msg"] + "\n"
            self.data["lastSign"] = self.data["todayClass"]["lastUpdate"]
            return result
        return self.userData["userName"] + "登录失败"
