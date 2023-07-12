#!/usr/bin/env python3
from time import sleep
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

def FillText(ID, Text):
    browser.find_element_by_id(ID).send_keys(Text)
    return

def ClickItem(ID):
    browser.find_element_by_id(ID).click()
    return

def GetAlert():
    print("网站消息: " + browser.switch_to.alert.text)
    browser.switch_to.alert.accept()
    return

def HealthReport(StuID, City="长沙市"):
    print("正在尝试报备:{},所在城市:{}".format(StuID,City))
    browser.get('http://www.hngczy.cn/jkreport/jkbb.aspx')
    FillText('txtXgh', StuID)
    ClickItem('submitok')
    sleep(.3)
    try:
        GetAlert()
        return False
    except:
        ClickItem('njk')
        FillText('txtaddress', City)
        ClickItem('nhb')
        ClickItem('ncdoubt')
        ClickItem('ndoubt')
        ClickItem('submitbb')
        GetAlert()
        return True


if __name__ == '__main__':
    from config import *
    try:
        print("您可以使用Ctrl+C终止本次报备\n")
        #Init Browser
        browser_options = Options()
        browser_options.add_argument('--headless')
        browser_options.add_experimental_option('excludeSwitches', ['enable-logging'])
        global browser
        browser = webdriver.Chrome(options = browser_options)
        browser.implicitly_wait(5)
        #Report
        for StuInfo in StuList:
            HealthReport(StuInfo[0], StuInfo[1])
            print()
        print("\n报备完成!")
    except:
        print("报备终止")
    finally:
        print("正在进行回收...\n")
        browser.quit()
