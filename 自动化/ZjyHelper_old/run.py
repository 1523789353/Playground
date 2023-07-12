import asyncio
from zjy import *

users = [
    {"account": "202003090402", "password": "85474755Aa"},
    {"account": "202003090403", "password": "Qjb2100657732"},
    {"account": "202003090405", "password": "qazplm0614@"},
    {"account": "202003090410", "password": "20020912Hh"},
    {"account": "202003090416", "password": "Ly20020205"},
    {"account": "202003090417", "password": "Lpy20020713"},
    {"account": "202003090420", "password": "Qxh18874598446"},
    {"account": "202003090425", "password": "Xy0727!!"},
    {"account": "202003110218", "password": "1028964875qP"},
    #{"account": "202003090429", "password": "Zzz20010712"},
]


async def main():
    sessions = [ZjySession(user["account"], user["password"]) for user in users]
    while True:
        try:
            # 并发获取课程列表
            getTaskList = [session.getTodayClass() for session in sessions]
            await asyncio.gather(*getTaskList)
            # 并发签到
            signTaskList = [session.signInClass() for session in sessions]
            print(getCustomTime(), await asyncio.gather(*signTaskList))
            await asyncio.sleep(1)
        except Exception as e:
            print(e)
            continue

if __name__ == "__main__":
    asyncio.run(main())
