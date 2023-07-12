/**
 * 等待元素加载完成, 再进行回调
 * 适用于对异步加载dom的修改
 * 一些情况下建议搭配setTimeout使用(例如: startNode找不到时)
 */
class AwaitElement {
    // 定义promise, 用于外部获取任务结果
    promise = null;
    // 定义resolve方法, 用于异步执行任务时, 通知外部任务已经完成
    resolve = null;
    // 定义reject方法, 用于停止运行时, 通知外部任务失败
    reject = null;
    observer = null;

    constructor(selector, startNode = document, timeout = 0) {
        this.promise = new Promise((res, rej) => {
            this.resolve = res;
            this.reject = rej;
        });
        // 初次运行时检查元素
        let result = this.queryElements(startNode, selector);
        if (result.length != 0) {
            this.resolve(result);
            return;
        }
        // 元素变动处理器, 节流: 每秒最多执行30次
        let handler = throttle(
            () => this.handleMutation(startNode, selector),
            1000 / 30
        );
        // 配置observer
        this.observer = new MutationObserver(handler);
        this.observer.observe(startNode, {
            childList: true,
            subtree: true
        });
        // 超时停止运行
        if (timeout > 0 && timeout != Infinity) {
            setTimeout(() => {
                this.abort('timeout');
            }, timeout);
        }
    }

    queryElements(startNode, selector) {
        return startNode.querySelectorAll(selector);
    }

    handleMutation(startNode, selector) {
        let result = this.queryElements(startNode, selector);
        if (result.length == 0) {
            return;
        }
        this.observer.disconnect();
        this.resolve(result);
    }

    //
    then(callback) {
        this.promise.then(callback);
    }

    // 停止运行
    abort(reason = '') {
        this.observer.disconnect();
        this.promise.catch((msg) => console.warn(msg));
        this.reject(reason);
    }
}

请帮我优化这段代码的代码风格、健壮性，其次是性能

import { throttle } from './throttle.js';
/**
 * 防抖hook
 * 在busyTime时间内, 只会执行一次, 如果在busyTime时间内再次调用, 统一返回下次执行的结果
 * @type {(fn: function, busyTime: number, immediate: boolean = true): function => {}} throttle
 * @param {function} fn 需要限制执行频率的函数
 * @param {number} busyTime 忙碌时间, 单位毫秒
 * @param {boolean} immediate 是否立即执行, 默认为true
 * @returns {function} 被代理的函数, 执行结果是一个Promise
 */

function awaitElement(selector, startNode = document, timeout = 0) {
    let observer = null;
    let promise = null;
    let resolve = null;
    let reject = null;

    promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });

    // 初次运行时检查元素
    let $result = startNode.querySelectorAll(selector);
    if ($result.length != 0) {
        resolve($result);
        return promise;
    }

    function handleMutation(startNode, selector) {
        let $result = startNode.querySelectorAll(selector);
        if ($result.length == 0) {
            return;
        }
        observer.disconnect();
        resolve($result);
    }

    // 元素变动处理器, 节流: 每秒最多执行30次
    let handler = throttle(
        () => handleMutation(startNode, selector),
        1000 / 30
    );

    // 配置observer
    observer = new MutationObserver(handler);
    observer.observe(startNode, {
        childList: true,
        subtree: true
    });

    // 停止运行
    promise.abort = (function abort(reason = '') {
        observer.disconnect();
        promise.catch((msg) => {
            console.warn(msg);
        });
        reject(reason);
    });

    // 超时停止运行
    if (timeout > 0 && timeout != Infinity) {
        setTimeout(() => {
            promise.abort('timeout');
        }, timeout);
    }

    return promise;
}
