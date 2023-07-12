// ==UserScript==
// @name         Nvidea显驱下载 实用工具
// @description  让驱动下载页面显示更多更老的驱动
// @author       皇家养猪场
// @namespace    皇家养猪场
// @note         安装此脚本后前往 https://www.nvidia.cn/geforce/drivers/ 能够看到更多更老的驱动。
// @note         注意: 开启此脚本后 请求驱动数据所需的时间也会增加很多!!!
// @note         ===== 2022-02-18 =====
// @note         修复了无法显示5XX版本驱动的问题
// @note         ===== 2023-04-15 =====
// @note         修复了只显示10个Studio驱动的问题
// @version      0.3
// @create       2021-10-22
// @lastmodified 2023-04-15
// @charset      UTF-8
// @match        *://www.nvidia.cn/geforce/drivers/
// @run-at       document-idle
// @grant        unsafeWindow
// @compatible   chrome
// @license      MIT
// ==/UserScript==

(function () {
    const proto = unsafeWindow.SystemScanner.prototype;
    function applyHandler(target, thisArg, argumentsList) {
        argumentsList[7] = 200; //请求驱动个数(最多多少个)
        return target.apply(thisArg, argumentsList);
    }
    proto.DriverSearch = new Proxy(proto.DriverSearch, {
        apply: applyHandler
    });;
})()
