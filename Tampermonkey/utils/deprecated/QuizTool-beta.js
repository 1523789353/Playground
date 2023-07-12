// ==UserScript==
// @name         职教云icve※智慧职教 答案提取/填充
// @description  职教云icve※智慧职教 答案提取/填充
// @author       皇家养猪场
// @namespace    皇家养猪场
// @version      1.3.9
// @create       2021-04-20
// @lastmodified 2022-04-21
// @note         更新日志: 修复不停跳转的bug...
// @note         如有什么功能需求/好点子/bug，请反馈QQ1523789353。
// @charset      UTF-8
// @updateURL    http://81.71.31.250/QuizTool.js
// @downloadURL  http://81.71.31.250/QuizTool.js
// @require      https://ajax.aspnetcdn.com/ajax/jQuery/jquery-3.6.0.min.js
// @require      http://81.71.31.250/QuizTool/utils/afterLoaded.js
// @require      http://81.71.31.250/QuizTool/utils/extends.js
// @require      http://81.71.31.250/QuizTool/utils/GM_extends.js
// @require      http://81.71.31.250/QuizTool/utils/hook.js
// @match        *://*.icve.com.cn/*
// @connect      81.71.31.250
// @connect      localhost
// @run-at       document-start
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @compatible   chrome
// @license      MIT
// ==/UserScript==

(function () {
    class QuizTool {
        // 版本号
        static get version() {
            return '1.3.7'
        }

        // 元素样式
        static styles = {
            // 消息框容器样式
            msgbox: {
                position: "fixed",
                width: "100%",
                textAlign: "center",
                zIndex: 9999,
                pointerEvents: "none"
            },
            // 消息框样式
            msg: bg => ({
                display: "inline-block",
                margin: "4px 0",
                padding: ".5em 1em",
                background: bg,
                backdropFilter: 'saturate(180%) blur(20px)',
                boxShadow: "2px 2px 4px rgba(0,0,0,.35)",
                border: "solid 1px rgba(0,0,0,.15)",
                borderRadius: "8px",
                textAlign: "center",
                opacity: 0,
                userSelect: "none",
                pointerEvents: "none"
            })
        }

        // 安全模式
        safeMode = false

        // 消息框元素
        msgbox = $('<div></div>')
            .css(this.styles.msgbox)
            .prependTo('body')

        // 显示消息
        notice(
            str,
            In = 500,
            Keep = 3000,
            Out = 500,
            bg = 'rgba(0, 0, 0, 0.8)'
        ) {
            if (this.safeMode) {
                // 安全模式: 日志输出到控制台
                return console.log(str)
            }
            // 日志输出到页面
            setTimeout(
                (_elem, _out) => {
                    _elem.fadeTo(_out, 0)
                        .slideUp(_out, function () {
                            $(this).remove()
                        })
                },
                Keep,
                $('<span></span><br>')
                    .text(str)
                    .css(this.styles.msg(bg))
                    .appendTo(this.props.msgbox)
                    .fadeTo(In, 1),
                Out
            )
        }

        constructor() {
            this.notice('QuizTool运行中...')
        }

        // 初始化数据
        initData() {
            this.data = {}
        }

        // 导出数据
        exportData() {
            console.log(JSON.stringify(this.data))
        }

        // 导入数据
        importData(data) {
            if (this.typeOf(data) === 'String') {
                this.data = JSON.parse(data)
            } else if (this.typeOf(data) === 'Object') {
                this.data = data
            } else {
                this.notice('数据格式错误！只允许传入JSON字符串或对象！')
            }
        }

        // 整理数据
        trimData() {
            for (let key in this.data) {

            }
        }

        // 云同步答案
        cloudSync() {

        }

        // 答案页提取
        getAns() {

        }

        // 填入答案
        fillAns() {

        }

        // 获取类型
        typeOf(obj) {
            return Object.prototype.toString.call(obj).slice(8, -1)
        }
    }
})()
