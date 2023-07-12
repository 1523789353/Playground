/**
 * 等待元素加载完成, 再进行回调
 * 适用于对异步加载dom的修改
 * 一些情况下建议搭配setTimeout使用(例如: startNode找不到时)
 * @param {string} selector 目标元素的选择器, 必传值
 * @param {HTMLElement} startNode 起始节点, 默认值: document
 * @param {number} timeout 超时时间(单位: ms), 默认值: 0(无超时)
 */
class AwaitElem {
    #promise = null;
    #reject = null;
    #observer = null;

    constructor(selector, startNode = document, timeout = 0, once = true) {
        this.#promise = new Promise((resolve, reject) => {
            this.#reject = reject;
            let result = new AwaitElemResult(selector, startNode);
            if (result.elem !== null) resolve(result);
            this.#observer = new MutationObserver((records, observer) => {
                if (result.elem !== null) {
                    observer.disconnect();
                    resolve(result);
                }
            });
            this.#observer.observe(startNode, {
                subtree: true,
                childList: true
            });
            if (timeout > 0) {
                setTimeout(() => {
                    this.#observer.disconnect();
                    reject('timeout');
                }, timeout);
            }
        });
    }

    then(callback) {
        this.#promise.then(callback);
    }

    abort() {
        this.#observer.disconnect();
        this.#reject('abort');
    }
}

class AwaitElemResult {
    #selector = null
    #startNode = null
    #stable = null
    #elem = null

    /**
     * @param {string} selector
     * @param {HTMLElement} startNode
     * @param {boolean} stable
     */
    constructor(selector, startNode, stable = false) {
        this.#selector = selector;
        this.#startNode = startNode;
        this.#stable = stable;
    }

    get selector() {
        return this.#selector;
    }
    get startNode() {
        return this.#startNode;
    }
    get stable() {
        return this.#stable;
    }
    get elem() {
        return this.#stable ? this.#elem ??= this.#startNode.querySelectorAll(this.#selector) : this.#startNode.querySelectorAll(this.#selector);
    }
}
