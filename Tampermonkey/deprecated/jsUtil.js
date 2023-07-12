// ==UserScript==
// @name         JavaScript实用工具
// @description  JavaScript实用工具
// @author       皇家养猪场
// @namespace    皇家养猪场
// @version      0.14
// @create       2021-10-16
// @lastmodified 2022-04-21
// @note         JavaScript实用工具
// @charset      UTF-8
// @require      https://ajax.aspnetcdn.com/ajax/jQuery/jquery-3.6.0.min.js
// @require      http://81.71.31.250/QuizTool/utils/afterLoaded.js
// @require      http://81.71.31.250/QuizTool/utils/extends.js
// @require      http://81.71.31.250/QuizTool/utils/hook.js
// @match        *://*/*
// @connect      localhost
// @run-at       document-start
// @grant        unsafeWindow
// @grant        GM_registerMenuCommand
// @compatible   chrome
// @license      MIT
// ==/UserScript==

/**
 * 深度搜索所有iframe的window对象
 */
var topWindow = unsafeWindow;
while (topWindow !== (topWindow = topWindow.parent)) { }
function dpGetFrames(win) {
    var frames = win.frames,
        result = []
    for (var i = 0; i < frames.length; i++) {
        result.push(frames[i])
        result = result.concat(dpGetFrames(frames[i]))
    }
    return result
}
var globals = [topWindow, ...dpGetFrames(topWindow)]
$(topWindow.document).on('DOMSubtreeModified', () => {
    globals = [topWindow, ...dpGetFrames(topWindow)]
})
var $G = (selector) => $(selector, $(globals.map(i => i.document)))


// 超星注入
if (location.host.includes('chaoxing.com')) {
    /* 禁止监听一些事件 */
    unsafeWindow.forbiddenEvent.push('mouseout', 'ratechange')

    // 移除答题界面
    afterLoaded('.x-container').then(e => e.remove())
    afterLoaded('.x-component').then(e => e.remove())

    afterLoaded('video').then(e => {
        // 切换下一章节
        function nextChapter() {
            // 跳转
            let topDocument = topWindow.document,
                coursetree = topDocument.querySelector('#coursetree'),
                ncells = [...coursetree.querySelectorAll('.ncells')],
                current = coursetree.querySelector('.currents').parentElement,
                currentIndex = ncells.indexOf(current)
            // 点击下一章节
            ncells[++currentIndex]?.querySelector('a')?.click()
        }

        // 访问已完成的学习点, 自动跳转下一章节
        afterLoaded('.ans-job-finished', $(globals.map(i => i.document))).then(e => nextChapter())

        // 对所有video元素进行操作
        for (let i = 0; i < e.length; i++) {
            // 静音
            e[i].volume = 0;
            // 禁止暂停
            e[i].pause = () => { };
            function autoplay() {
                e[i].autoplay = true
                e[i].play()
            }

            // 倍速, 自动播放
            var eventNames = ["canplay", "canplaythrough", "seeking", "seeked", "durationchange", "progress", "suspend", "stalled", "loadedmetadata", "loadeddata"]
            for (let eventName of eventNames) {
                $(e[i]).on(eventName, event => {
                    event.target.autoplay = true
                    event.target.playbackRate = 1.5
                    event.target.play()
                })
            }

            // 挂载播放完成事件, 自动跳转下一章节
            $(e[i]).on('ended', () => nextChapter())
        }
    })
}


// 简单的JsonFormatter
var formatter = () => {
    var TargetElement = document.body.children[0]; // body>pre
    var JsonObj = JSON.parse(TargetElement.innerText);
    TargetElement.innerText = JSON.stringify(JsonObj, ' ', 4);
}
GM_registerMenuCommand("格式化该页面上的Json数据", formatter);
if (document.contentType == "application/json" && document.body.children[0] instanceof HTMLPreElement || location.href.endsWith('.json')) {
    unsafeWindow.onload = formatter;
    formatter();
}


//URL匹配执行

//禁止关闭窗口
unsafeWindow.close = () => { }
