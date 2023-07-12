#!/usr/bin/env python3
import os
import sys
from typing import Tuple
import requests
import logging
from sanic import Sanic, response as sanicResponse, Request

# 订阅客户端, 用于爬取订阅信息
class ClashSubscribeService:
    def __init__(self, username: str, password: str):
        self.session = requests.Session()
        self.session.headers.update({
            "Accept": "*/*",
            "User-Agent": "ClashforWindows/0.20.25",
            "Accept-Encoding": "gzip, deflate",
            "Accept-Language": "zh-CN"
        })
        self._userdata = {"email": username, "password": password}
        self.authorization = "MTUyMzc4OTM1M0BxcS5jb206JDJ5JDEwJDFibThHSnpvNW9mNmNwUWt5VVlJUU80b0R5a2dhWC81ejdGaXRNV2xobzExVHVyZmJVRXV1"
        self.token = "wc60ymyicg7teqvabi5scxf6rdmdnoc3"

    def login(self) -> None:  # 获取authorization和token
        logging.info("正在登录...")
        url = "https://一元机场.com/api/v1/passport/auth/login"
        response = self.session.post(url=url, params=self._userdata)
        try:
            responseData = response.json()
            self.authorization = responseData.get("data").get("auth_data")
            self.token = responseData.get("data").get("token")
            logging.info("登录成功!")
        except:
            logging.info("登录失败, 可能是CloudFlare拦截了请求")
            logging.info("将使用默认值")

    def getToken(self) -> str:  # 通过authorization更新token
        logging.info("正在更新Token...")
        url = "https://一元机场.com/api/v1/user/getSubscribe"
        headers = {"authorization": self.authorization}
        response = self.session.get(url=url, headers=headers)
        if (response.status_code == 200):
            logging.info("更新Token成功!")
            responseData = response.json()
            self.token = responseData.get("data").get("token")
        else:
            logging.info("更新Token失败, 尝试重新登录...")
            self.login()
        return self.token

    def fastfail(self, clientType: str = "clash") -> sanicResponse.HTTPResponse:
        url = "https://一元机场.com/api/v1/client/subscribe"
        fullUrl = "{0}?token={1}&flag={2}".format(
            url,
            self.token,
            clientType
        )
        return sanicResponse.redirect(to=fullUrl)

    # 通过token获取订阅内容
    def getSubscribeContent(self, userAgent: str = "", clientType: str = "clash") -> sanicResponse.HTTPResponse:
        return self.fastfail(clientType) # 主机被cloud-flare屏蔽了，暂时无法使用下面的方案
        logging.info("正在获取订阅...")
        url = "https://一元机场.com/api/v1/client/subscribe"
        headers = {
            "User-Agent": userAgent
        }
        params = {"token": self.token, "flag": clientType}
        response = self.session.get(url=url, headers=headers, params=params)
        if (response.status_code == 200):
            logging.info("获取订阅内容成功!")
            # 构造response
            resultHeader = {
                "vary": "Accept-Encoding",
                "subscription-userinfo": str(headers.get("subscription-userinfo")),
                "profile-update-interval": "1",
                "profile-web-page-url": str(headers.get("profile-web-page-url")),
                "content-disposition": "attachment%3Bfilename*%3DUTF-8''%E4%B8%80%E5%85%83%E6%9C%BA%E5%9C%BA-%E8%BD%AC%E5%8F%91",
                "strict-transport-security": str(headers.get("strict-transport-security")),
                "X-Content-Type-Options": "nosniff"
            }
            # Clash客户端特有header
            if userAgent.lower().startswith("clash"):
                resultHeader["content-disposition"] = str(headers.get("content-disposition"))
            return sanicResponse.html(body=response.text, headers=resultHeader)
        else:
            logging.info("获取订阅内容失败, 尝试重新获取Token...")
            self.getToken()
            return self.fastfail(clientType)


# 配置日志格式
logging.basicConfig(
    format="%(asctime)s %(levelname)s\t%(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    level=logging.INFO
)

# 启动http服务器
httpServer = Sanic.get_app("ClashSubscribeServer", force_create=True)

# 创建订阅服务
service = ClashSubscribeService("xxxxxxxxxx@xxx.com", "Passw0rd!")

@httpServer.route("/")
async def Subscribe(request: Request) -> sanicResponse.HTTPResponse:
    # 获取UA
    userAgent = str(request.headers.get("User-Agent"))
    # 获取参数clientType, 默认为clash
    clientType = request.args.get("clientType", ["clash"])[0]
    return service.getSubscribeContent(userAgent, clientType)


def main():
    httpServer.run(host="0.0.0.0", port=40771)


if __name__ == "__main__":
    main()
