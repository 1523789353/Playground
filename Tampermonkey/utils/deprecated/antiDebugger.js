// ==UserScript==
// @name         antiDebugger
// @description  反debugger陷阱, 禁止生成调试断点
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
    var rawFunction = unsafeWindow.Function
    unsafeWindow.Function = function () {
        if (arguments && typeof arguments[0] === 'string') {
            if (arguments[0] === 'debugger') {
                arguments[0] = 'null'
                //arguments[0] = 'console.log("anti debugger")'
            }
        }
        return rawFunction.apply(this, arguments)
    }
    unsafeWindow.Function.prototype = rawFunction.prototype

    var rawFunctionConstructor = unsafeWindow.Function.prototype.constructor
    unsafeWindow.Function.prototype.constructor = function () {
        if (arguments && typeof arguments[0] === 'string') {
            if (arguments[0] === 'debugger') {
                arguments[0] = 'null'
                //arguments[0] = 'console.log("anti debugger")'
            }
        }
        return rawFunctionConstructor.apply(this, arguments)
    }
})