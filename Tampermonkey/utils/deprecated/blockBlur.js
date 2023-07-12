// ==UserScript==
// @name         blockBlur
// @description  禁止监听Blur事件
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
    var notWritable = {
        value: null,
        enumerable: true,
        writable: false,
        configurable: false,
    }
    Object.defineProperty(unsafeWindow, 'onblur', notWritable)
    Object.defineProperty(document, 'onblur', notWritable)
    Object.defineProperty(EventTarget.prototype, 'onblur', notWritable)

    var document_addEventListener = document.addEventListener,
        window_addEventListener = unsafeWindow.addEventListener,
        EventTarget_addEventListener = EventTarget.prototype.addEventListener
    function addEventListener(type, listener, useCapture) {
        if (type == 'blur') return
        var _addEventListener = EventTarget_addEventListener
        if (this === document) {
            _addEventListener = document_addEventListener
        } else if (this === unsafeWindow) {
            _addEventListener = window_addEventListener
        }
        _addEventListener.apply(this, arguments)
    }
    document.addEventListener = addEventListener
    unsafeWindow.addEventListener = addEventListener
    EventTarget.prototype.addEventListener = addEventListener
})()