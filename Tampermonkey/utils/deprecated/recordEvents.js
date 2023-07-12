// ==UserScript==
// @name         recordEvents
// @description  记录所有事件与循环任务
// @author       皇家养猪场
// @namespace    皇家养猪场
// @version      1.0.0
// @create       2022-04-12
// @lastmodified 2022-04-12
// @charset      UTF-8
// @match        *://*/*
// @connect      localhost
// @run-at       document-start
// @grant        unsafeWindow
// @compatible   chrome
// @license      MIT
// ==/UserScript==

(function () {
    //用于记录所有注册的事件的列表(只读): window.eventListenerList
    var eventListenerList = []
    Object.defineProperty(unsafeWindow, 'eventListenerList', {
        enumerable: false,
        configurable: false,
        get() {
            return eventListenerList
        }
    })

    //注册事件监听时记录到列表
    var document_addEventListener = document.addEventListener,
        window_addEventListener = unsafeWindow.addEventListener,
        EventTarget_addEventListener = EventTarget.prototype.addEventListener
    function addEventListener(type, listener, useCapture) {
        var _addEventListener = EventTarget_addEventListener
        if (this === document) {
            _addEventListener = document_addEventListener
        } else if (this === unsafeWindow) {
            _addEventListener = window_addEventListener
        }
        eventListenerList.push({
            "element": this,
            "type": type,
            "listener": listener,
            "options": useCapture
        })
        _addEventListener.apply(this, arguments)
    }
    document.addEventListener = addEventListener
    unsafeWindow.addEventListener = addEventListener
    EventTarget.prototype.addEventListener = addEventListener

    //停止事件监听时从列表删除
    var document_removeEventListener = document.removeEventListener,
        window_removeEventListener = unsafeWindow.removeEventListener,
        EventTarget_removeEventListener = EventTarget.prototype.removeEventListener
    function removeEventListener(type, listener, useCapture) {
        var _removeEventListener = EventTarget_removeEventListener
        if (this === document) {
            _removeEventListener = document_removeEventListener
        } else if (this === unsafeWindow) {
            _removeEventListener = window_removeEventListener
        }
        var newList = []
        for (let item of eventListenerList) {
            if (item["element"] == this && item["type"] == type && item["listener"] == listener) {
                continue
            }
            newList.push(item)
        }
        eventListenerList = newList
        _removeEventListener.apply(this, arguments)
    }
    document.removeEventListener = removeEventListener
    unsafeWindow.removeEventListener = removeEventListener
    EventTarget.prototype.removeEventListener = removeEventListener

    //记录setInterval(方便查询与删除)
    var intervalList = {}
    Object.defineProperty(unsafeWindow, 'intervalList', {
        enumerable: false,
        configurable: false,
        get() {
            return intervalList
        }
    })
    var setInterval_back = unsafeWindow.setInterval
    unsafeWindow.setInterval = function (callback, ms, ...args) {
        var id = setInterval_back.apply(this, arguments)
        intervalList[id] = {
            "function": callback,
            "time": ms,
            "args": args,
        }
        return id
    }
    var clearInterval_back = unsafeWindow.clearInterval
    unsafeWindow.clearInterval = function (id) {
        if (id in intervalList) {
            delete intervalList[id]
        }
        return clearInterval_back.apply(this, arguments)
    }
})()