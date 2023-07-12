// ==UserScript==
// @name         Hook Core
// @description  Hook Core
// @author       皇家养猪场
// @namespace    皇家养猪场
// @version      0.0.1
// @create       2021-04-20
// @lastmodified 2022-04-21
// @note         无
// @charset      UTF-8
// @match        *://*/*
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
    /* ========== 函数定义开始 ========== */

    /**
     * Hook 标志, 避免重复Hook
     */
    if (unsafeWindow[Symbol.for('hooked')] === true)
        return;
    else
        unsafeWindow[Symbol.for('hooked')] = true;

    /**
     * 获取对象的类型
     * @param {...any} target 对象
     * @returns {string} 类型名称
     */
    function getType(target) {
        return Object.prototype.toString.call(target)
            .replace(/\[object (\w+)\]/g, '$1')
            .toLowerCase()
    }

    /**
     * 判断对象是否为空
     * @param {object} obj
     * @returns {boolean} 是否为空
     */
    function isNil(obj) {
        return obj === null || obj === undefined;
    }

    /**
     * 获取函数调用栈
     * @returns {string} 调用栈
     */
    function getStack() {
        var reg = /\w+@|at (.*) \(/g
        return new Error()
            .stack
            .match(reg ?? [])
            .map(i => i.replace(reg, '$1'))
    }

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
            let observer = new MutationObserver((recordsArray, observer) => {
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

    /**
     * hook目标对象上的方法/类
     * @param {object} target 目标对象
     * @param {string} prop 目标的方法/类
     * @param {function||class} fn 接管的方法/类
     * 传递给接管的方法/类的参数: fn(old, ...args)
     * 其中old是被hook的方法/类, args是传递给被hook的方法/类的参数
     */
    function hook(target, prop, fn) {
        // 备份老方法, 创建代理
        let old = target[prop];
        let proxy = new Proxy(old, {
            apply(target, context, args) {
                return Reflect.apply(fn, context, [old, ...args]);
            },
            construct(target, args) {
                return Reflect.construct(fn, [old, ...args]);
            }
        });
        // 替换原方法
        Reflect.set(target, prop, proxy);
        // 强制替换
        if (target[prop] !== proxy) {
            try {
                Object.defineProperty(target, prop, {
                    set(value) {
                        return false;
                    },
                    get() {
                        return proxy;
                    }
                })
            } catch { }
        }
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



    /* 反debugger陷阱, 禁止动态生成调试断点 */
    function antiDebugger(old, ...args) {
        if (args[0] === 'debugger')
            args[0] = 'null';
        return Reflect.apply(old, this, args)
    }
    hook(unsafeWindow, 'Function', antiDebugger)
    hook(unsafeWindow.Function.prototype, 'constructor', antiDebugger)



    //禁止关闭窗口
    hook(unsafeWindow, 'close', function (old, ...args) {});



    /* hook所有事件 */
    // 用于记录所有注册的事件的列表(只读): window.eventListenerList
    var eventListenerList = []
    // 禁止监听的事件列表
    var forbiddenEvent = []
    // hook push方法, 在每次push时阻止onXXX类事件监听
    hook(forbiddenEvent, 'push', function (old, ...args) {
        args.map(eventName => {
            // 处理变量名
            eventName = eventName.toLowerCase()
            if (eventName.startsWith('on'))
                eventName = eventName.substr(2);
            let onevent = 'on' + eventName;
            // 属性对象
            let forbiddenWrite = {
                get() {
                    return null;
                },
                set(value) {
                    console.warn(`已拦截${onevent}事件注册`);
                    return false;
                },
                enumerable: true,
                configurable: false
            }
            Object.defineProperty(unsafeWindow, onevent, forbiddenWrite);
            Object.defineProperty(document, onevent, forbiddenWrite);
            Object.defineProperty(EventTarget.prototype, onevent, forbiddenWrite);
        })
        Reflect.apply(old, this, args);
    })
    // 信任事件开关
    var trustAllEvent = false
    // 暴露
    Object.defineProperties(unsafeWindow, {
        'eventListenerList': {
            get() {
                return eventListenerList;
            },
            enumerable: false,
            configurable: false
        },
        'forbiddenEvent': {
            get() {
                return forbiddenEvent;
            },
            enumerable: false,
            configurable: false
        },
        'trustAnyEvent': {
            get() {
                return trustAllEvent;
            },
            set(value) {
                trustAllEvent = !!value;
            },
            enumerable: false,
            configurable: false
        }
    })
    function recordEvents(old, ...args) {
        // 拆分参数
        let [type, listener, useCapture, ...moreArgs] = args
        // 拦截事件
        if (forbiddenEvent.includes(type)) {
            console.warn(`已拦截${type}事件注册`);
            return;
        }
        // 记录事件
        let record = { "element": this, type, listener, useCapture }
        console.warn('捕捉到事件注册', getStack(), record);
        eventListenerList.push(record);
        // 包装回调方法
        listener = new Proxy(listener, {
            apply(target, context, args) {
                console.log('触发事件', arguments)
                if (!trustAllEvent)
                    return Reflect.apply(target, context, args);
                // 拆分参数
                let [event, ...moreArgs] = args;
                // 信任所有事件
                let forceTrustedEvent = new Proxy(event, {
                    get(target, prop) {
                        if (prop === 'isTrusted')
                            return true;
                        return Reflect.get(target, prop);
                    }
                })
                try {
                    return Reflect.apply(target, context, [forceTrustedEvent, ...moreArgs]);
                } catch {
                    console.warn('强制信任事件失败\n事件: ', event, '\n监听器: ', listener);
                    return Reflect.apply(target, context, args);
                }
            }
        })
        return Reflect.apply(old, this, [type, listener, useCapture, ...moreArgs]);
    }
    hook(document, 'addEventListener', recordEvents);
    hook(unsafeWindow, 'addEventListener', recordEvents);
    hook(EventTarget.prototype, 'addEventListener', recordEvents);



    /* 记录interval循环 */
    var intervalList = {};
    Object.defineProperty(unsafeWindow, 'intervalList', {
        enumerable: false,
        configurable: false,
        get() {
            return intervalList;
        }
    })
    function recordInterval(old, ...args) {
        let id = Reflect.apply(old, this, args);
        let [callback, ms, ...moreArgs] = args;
        intervalList[id] = {
            "function": callback,
            "time": ms,
            "args": moreArgs,
        }
        return id;
    }
    hook(unsafeWindow, 'setInterval', recordInterval);
    function removeInterval(old, ...args) {
        let [id, ...moreArgs] = args;
        delete intervalList[id];
        return Reflect.apply(old, this, args);
    }
    hook(unsafeWindow, 'clearInterval', removeInterval);


    /* 劫持页面的Xhr请求, 任意修改请求与响应的属性 */
    // 设置
    var setting = {
        showLog: false,
        xhrList: [],
        getFilters: {},
        setFilters: {},
        onGetProp(prop, handler) {
            (this.getFilters[prop] ??= []).push(handler)
        },
        onSetProp(prop, handler) {
            (this.setFilters[prop] ??= []).push(handler)
        }
    }
    // 暴露
    Object.defineProperty(unsafeWindow, 'ProxyXhrSetting', { get: () => setting })
    // 新的XMLHttpRequest类
    class ProxyXhr {
        instance = null
        proxy = null
        // 日志记录
        logHistory = []
        // 打印日志
        log(...args) {
            this.logHistory.push(args)
            if (setting.showLog) {
                console.log(...args)
            }
        }
        constructor(old, ...args) {
            this.log("构造XMLHttpRequest实例", getStack())
            // 记录实例
            setting.xhrList.push(this)
            // 初始化XHR实例
            this.instance = Reflect.construct(old, args)
            // 防止this指向不清
            let vm = this
            // 创建代理, target === vm.instance
            this.proxy = new Proxy(this.instance, {
                // 获取值时执行代理方法
                get(target, prop) {
                    let raw = Reflect.get(vm.instance, prop),
                        result = raw
                    // 执行过滤器方法
                    for (let filter of setting.getFilters[prop] ?? []) {
                        try {
                            let newValue = Reflect.apply(filter, vm, [vm.instance, prop, result])
                            result = newValue === undefined ? result : newValue
                        } catch (e) {
                            console.error('执行过滤器时出错: ', filter, e)
                        }
                    }
                    // 打印日志
                    if (result === raw)
                        vm.log(`尝试读取成员"${prop}", 值为: `, raw);
                    else
                        vm.log(`尝试读取成员"${prop}", 值为: `, raw, ', 过滤后的值为: ', result);
                    // 劫持方法/构造函数
                    if (getType(result) === 'function') {
                        return new Proxy(result, {
                            apply(target, context, args) {
                                vm.log(`尝试执行方法: "${prop}" 附参数: `, args, ", 调用栈: ", getStack());
                                let retcode = Reflect.apply(target, vm.instance, args);
                                vm.log(`方法: "${prop}" 执行完毕, 返回值: `, retcode);
                                return retcode;
                            },
                            construct(target, args) {
                                vm.log(`尝试构造对象: "${prop}" 附参数: `, args, ", 调用栈: ", getStack());
                                let retcode = Reflect.construct(target, args);
                                vm.log(`对象: "${prop}" 构造完毕, 返回值: `, retcode);
                                return retcode;
                            }
                        })
                    }
                    return result;
                },
                // 设置值时执行代理方法
                set(target, prop, value) {
                    let old = Reflect.get(vm.instance, prop);
                    let raw = value;
                    // 执行过滤器方法
                    for (let filter of setting.setFilters[prop] ?? []) {
                        try {
                            let newValue = Reflect.apply(filter, vm, [vm.instance, prop, value]);
                            value = newValue ?? value;
                        } catch (e) {
                            console.error('执行过滤器时出错: ', filter, e);
                        }
                    }
                    if (raw === value)
                        vm.log(`尝试设置成员"${prop}", 旧值为: `, old, ', 新值为: ', raw);
                    else
                        vm.log(`尝试设置成员"${prop}", 旧值为: `, old, ', 新值为: ', raw, ', 过滤后的值为: ', value);
                    return Reflect.set(target, prop, value);
                },
                has(target, prop) {
                    return Reflect.has(target, prop);
                }
            })
            // 返回劫持后的xhr实例
            return this.proxy;
        }
    }
    hook(unsafeWindow, 'XMLHttpRequest', ProxyXhr);

    /* ========== 函数定义完毕 ========== */

    if (location.host.includes('chaoxing.com'))
        unsafeWindow.forbiddenEvent.push('mouseout', 'ratechange');

    if (location.href.includes('tltzzsb.pc.smartchutou.com/#/detail'))
        unsafeWindow.forbiddenEvent.push('blur');
})();
