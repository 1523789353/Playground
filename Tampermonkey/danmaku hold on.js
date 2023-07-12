// ==UserScript==
// @name         danmaku hold on!!!
// @description  无论如何, 不要动我的弹幕开关!!!
// @author       皇家养猪场
// @namespace    皇家养猪场
// @version      0.0.1
// @create       2022-12-03
// @lastmodified 2022-12-03
// @note         首次更新
// @charset      UTF-8
// @match        *://www.bilibili.com/video*
// @connect      localhost
// @run-at       document-start
// @grant        unsafeWindow
// @compatible   chrome
// @license      MIT
// ==/UserScript==

(function () {

    /**
     * 等待元素加载完成, 再进行回调
     * 适用于对异步加载dom的修改
     * 一些情况下建议搭配setTimeout使用(例如: startNode找不到时)
     * @param {string} selector 目标元素的选择器, 必传值
     * @param {HTMLElement} startNode 起始节点, 默认值: document
     * @param {number} timeout 超时时间(单位: ms), 默认值: 0(无超时)
     * @returns {Promise<HTMLElement>}
     */
    function afterLoaded(selector, startNode = document, timeout = 0) {
        return new Promise((resolve, reject) => {
            let observer = new MutationObserver((records, observer) => {
                let result = startNode.querySelector(selector);
                if (result !== null) {
                    observer.disconnect();
                    resolve(result);
                }
            });
            observer.observe(startNode, {
                subtree: true,
                childList: true
            });
            if (timeout > 0) {
                setTimeout(() => {
                    observer.disconnect();
                    reject('timeout');
                }, timeout);
            }
        });
    }

    // 等待弹幕开关的element加载完成, 再打开弹幕开关
    afterLoaded('input.bui-danmaku-switch-input', document, 10000)
        .then(elem => setTimeout(() => elem.checked || elem.dispatchEvent(new MouseEvent('click')), 500))

})();
