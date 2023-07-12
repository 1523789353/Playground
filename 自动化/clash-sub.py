#!/usr/bin/env python3
from typing import Tuple
import requests
import logging
from sanic import Sanic, response as sanicResponse, Request


# 订阅客户端, 用于爬取订阅信息
class ClashSubscribeService:
    def __init__(self, username: str, password: str):
        self.session = requests.Session()
        self._userdata = {"email": username, "password": password}
        self.authorization = ""
        self.token = ""

    def login(self) -> None:  # 获取authorization和token
        logging.info("正在登录...")
        url = "https://一元机场.com/api/v1/passport/auth/login"
        response = self.session.post(url=url, params=self._userdata)
        responseData = response.json()
        self.authorization = responseData.get("data").get("auth_data")
        self.token = responseData.get("data").get("token")
        logging.info("登录成功!")

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

    # 通过token获取订阅内容
    def getSubscribeContent(self, userAgent: str = "", clientType: str = "clash") -> Tuple[str, dict]:
        logging.info("正在获取订阅...")
        url = "https://一元机场.com/api/v1/client/subscribe"
        headers = {
            "Accept": "*/*",
            "User-Agent": userAgent,
            "Accept-Encoding": "gzip, deflate",
            "Accept-Language": "zh-CN"
        }
        params = {"token": self.token, "flag": clientType}
        response = self.session.get(url=url, headers=headers, params=params)
        if (response.status_code == 200):
            logging.info("获取订阅内容成功!")
            return response.text, {**response.headers}
        else:
            logging.info("获取订阅内容失败, 尝试重新获取Token...")
            self.getToken()
            return self.getSubscribeContent(clientType)


# 配置日志格式
logging.basicConfig(
    format="%(asctime)s %(levelname)s\t%(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    level=logging.INFO
)

# 启动http服务器
httpServer = Sanic.get_app("ClashSubscribeServer", force_create=True)

# 创建订阅服务
service = ClashSubscribeService(
    username="example@mail.com",
    password="example password"
)


@httpServer.route("/")
async def Subscribe(request: Request) -> sanicResponse.HTTPResponse:
    # 获取UA
    userAgent = str(request.headers.get("User-Agent"))
    # 获取参数clientType, 默认为clash
    clientType = request.args.get("clientType", ["clash"])[0]
    # 获取订阅内容
    content, headers = service.getSubscribeContent(userAgent, clientType)
    # 构造headers
    responseHeader = {
        "vary": "Accept-Encoding",
        "subscription-userinfo": str(headers.get("subscription-userinfo")),
        "profile-update-interval": "1",
        "profile-web-page-url": str(headers.get("profile-web-page-url")),
        "content-disposition": "attachment%3Bfilename*%3DUTF-8''%E4%B8%80%E5%85%83%E6%9C%BA%E5%9C%BA-%E8%BD%AC%E5%8F%91",
        "strict-transport-security": str(headers.get("strict-transport-security")),
        "X-Content-Type-Options": "nosniff"
    }
    # Clash客户端特有header
    # if userAgent.lower().startswith("clash"):
    #     responseHeader["content-disposition"] = str(headers.get("content-disposition"))
    # 返回response
    return sanicResponse.html(body=content, headers=responseHeader)


def main():
    httpServer.run(host="0.0.0.0", port=40771)


if __name__ == "__main__":
    main()
