import asyncio
import requests
from lxml import etree
from viewstate import ViewState
from .Util import *


class jkbbSession:
    def __init__(self):
        self.Session = requests.Session()

    async def report(self, viewstate, viewstategenerator, eventvalidation) -> dict:
        headers = {
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate",
            "Content-Type": "application/x-www-form-urlencoded",
            "Host": "fuwu.hngczy.cn",
            "Origin": "http://fuwu.hngczy.cn",
            "Referer": "http://fuwu.hngczy.cn/jkdk.aspx",
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) " +
                          "AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.15(0x18000f29) " +
                          "NetType/WIFI Language/zh_CN",
            "Upgrade-Insecure-Requests": "1"
        }
        data = {
            "__VIEWSTATE": viewstate,
            "__VIEWSTATEGENERATOR": viewstategenerator,
            "__EVENTVALIDATION": eventvalidation,
            "txtJkinfo": "njk",
            "txtaddress": "湖南长沙",
            "txtHbinfo": "nhb",
            "txtCdoubtinfo": "ncdoubt",
            "txtDoubtinfo": "ndoubt",
            "txtWork": "cschool",
            "txtBz": "",
            "submitbb": "报   备",
        }
        request = self.Session.post(
            headers["Referer"], headers=headers, data=data)
        selector = etree.HTML(request.text)
        result = selector.xpath('//form/script/text()')[0][7:-2]
        user = ViewState(viewstate).decode()
        return {"Name": user[0][1][1][1][1][1][0][0][1],
                "Class": user[0][1][1][1][1][7][0][0][1],
                "StuID": user[0][1][1][1][1][5][0][0][1],
                "result": result}

    async def reportAll(self, *userData: dict):
        TaskList = []
        for item in userData:
            TaskList.append(self.report(
                item["viewstate"], item["viewstategenerator"], item["eventvalidation"]))
        return await asyncio.gather(*TaskList)
