/**
 * 监听dom变化, 等待目标元素加载
 * @param {String} selector 目标元素的选择器
 * @param {String} startNode 起始节点(jQuery元素)
 * @return {Object} jQuery元素
 */
function afterLoaded(selector, $startNode = $(document)) {
    return new Promise(res => {
        let tryFind = $target => {
            let $elem = $target.find(selector)
            return $elem.length > 0 && !res($elem)
        }
        let observer = e => {
            if (tryFind($(e.target))) {
                $startNode.off('DOMSubtreeModified', observer)
            }
        }
        tryFind($startNode) || $startNode.on('DOMSubtreeModified', observer)
    })
}


function awaitElem(selector, startNode = document, timeout = 0) {
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
