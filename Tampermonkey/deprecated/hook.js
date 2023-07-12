// ==UserScript==
// @name         hook
// @description  hook
// @author       皇家养猪场
// @namespace    皇家养猪场
// @version      0.0.1
// @create       2021-04-20
// @lastmodified 2022-04-21
// @note         更新日志: 重构项目
// @note         如有什么功能需求/好点子/bug，请反馈QQ1523789353。
// @charset      UTF-8
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

    if (unsafeWindow[Symbol.for('hooked')] === true) return
    unsafeWindow[Symbol.for('hooked')] = true



    /**
     * 获取target的类型
     * @param {...any} target 对象
     * @returns {string} 类型名称
     */
    function getType(target) {
        return Object.prototype.toString.call(target)
            .replace(/\[object (\w+)\]/g, '$1')
            .toLowerCase()
    }

    /**
     * 判断obj是否为空
     * @param {object} obj
     * @returns {boolean} 是否为空
     */
    function isNil(obj) {
        return obj === null || obj === undefined || obj?.length === 0
    }

    /**
     * 获取函数调用栈
     * @returns {string} 调用栈
     */
    function getStack() {
        var reg = /\w+@|at (.*) \(/g
        return new Error().stack.match(reg).map(i => i.replace(reg, '$1'))
    }



    /**
     * hook目标对象的方法/类
     * @param {object} target 目标对象
     * @param {string} prop 目标属性名
     * @param {function||class} fn 接管的方法/类
     */
    function hook(target, prop, fn) {
        // 备份老方法, 创建代理
        let old = target[prop],
            proxy = new Proxy(old, {
                apply(target, context, args) {
                    return Reflect.apply(fn, context, [old, ...args])
                },
                construct(target, args) {
                    return Reflect.construct(fn, [old, ...args])
                }
            })
        // 替换原方法
        target[prop] = proxy
        // 强制替换
        if (target[prop] !== proxy) {
            Object.defineProperty(target, prop, { value: proxy })
        }
    }



    /* 反debugger陷阱, 禁止动态生成调试断点 */
    function antiDebugger(old, ...args) {
        if (args[0] === 'debugger') {
            args[0] = 'null'
        }
        return Reflect.apply(old, this, args)
    }
    hook(unsafeWindow, 'Function', antiDebugger)
    hook(unsafeWindow.Function.prototype, 'constructor', antiDebugger)



    /* hook所有事件 */
    // 用于记录所有注册的事件的列表(只读): window.eventListenerList
    var eventListenerList = []
    // 禁止监听的事件列表
    var forbiddenEvent = []
    // hook push方法, 在每次push时阻止onXXX类事件监听
    hook(forbiddenEvent, 'push', function (old, ...args) {
        for (let eventName of args) {
            let onevent = 'on' + eventName.toLowerCase(),
                forbiddenWrite = {
                    get() {
                        return null
                    },
                    set(value) {
                        console.warn(`已拦截${onevent}事件注册`)
                        return false
                    },
                    enumerable: true,
                    configurable: false
                }
            Object.defineProperty(unsafeWindow, onevent, forbiddenWrite);
            Object.defineProperty(document, onevent, forbiddenWrite);
            Object.defineProperty(EventTarget.prototype, onevent, forbiddenWrite);
        }
        Reflect.apply(old, this, args)
    })
    // 信任事件开关
    var trustAllEvent = false
    // 暴露
    Object.defineProperties(unsafeWindow, {
        'eventListenerList': {
            get() {
                return eventListenerList
            },
            enumerable: false,
            configurable: false
        },
        'forbiddenEvent': {
            get() {
                return forbiddenEvent
            },
            enumerable: false,
            configurable: false
        },
        'trustAnyEvent': {
            get() {
                return trustAllEvent
            },
            set(value) {
                trustAllEvent = !!value
            },
            enumerable: false,
            configurable: false
        }
    })
    function recordEvents(old, ...args) {
        // 拆分参数
        let [type, listener, useCapture, ...moreArgs] = args
        // 记录事件
        let record = { "element": this, type, listener, useCapture }
        console.warn('捕捉到事件注册', getStack(), record)
        eventListenerList.push(record)
        // 拦截事件
        if (forbiddenEvent.includes(type)) {
            console.warn(`已拦截${type}事件注册`)
            return
        }
        listener = new Proxy(listener, {
            apply(target, context, args) {
                if (!trustAllEvent) {
                    return Reflect.apply(target, context, args)
                }
                // 拆分参数
                let [event, ...moreArgs] = args
                // 信任所有事件
                event = new Proxy(event, {
                    get(target, prop) {
                        if (prop === 'isTrusted') {
                            return true
                        }
                        return Reflect.get(target, prop)
                    }
                })
                try {
                    return Reflect.apply(target, context, [event, ...moreArgs])
                } catch {
                    [event, ...moreArgs] = args
                    console.warn('强制信任事件失败\n事件: ', event, '\n监听器: ', listener)
                    return Reflect.apply(target, context, args)
                }
            }
        })
        return Reflect.apply(old, this, [type, listener, useCapture, ...moreArgs])
    }
    hook(document, 'addEventListener', recordEvents)
    hook(unsafeWindow, 'addEventListener', recordEvents)
    hook(EventTarget.prototype, 'addEventListener', recordEvents)



    /* 记录interval循环 */
    var intervalList = {}
    Object.defineProperty(unsafeWindow, 'intervalList', {
        enumerable: false,
        configurable: false,
        get() {
            return intervalList
        }
    })
    function recordInterval(old, ...args) {
        let id = Reflect.apply(old, this, args)
        let [callback, ms, ...moreArgs] = args
        intervalList[id] = {
            "function": callback,
            "time": ms,
            "args": moreArgs,
        }
        return id
    }
    hook(unsafeWindow, 'setInterval', recordInterval)
    function removeInterval(old, ...args) {
        let [id, ...moreArgs] = args
        delete intervalList[id]
        return Reflect.apply(old, this, args)
    }
    hook(unsafeWindow, 'clearInterval', removeInterval)


    function recordTimeout(old, ...args) {
        let id = Reflect.apply(old, this, args)
        let [callback, ms, ...moreArgs] = args
        timeout = {
            'id': id,
            "function": callback,
            "time": ms,
            "args": moreArgs,
        }
        console.log(timeout)
        return id
    }
    hook(unsafeWindow, 'setTimeout', recordTimeout)


    /* 劫持页面的Xhr请求, 任意修改请求与响应的属性 */
    // 设置
    var setting = {
        showLog: false,
        xhrList: [],
        getFilters: {},
        setFilters: {},
        onGetProp(prop, handler) {
            (this.getFilters[prop] ?? (this.getFilters[prop] = [])).push(handler)
        },
        onSetProp(prop, handler) {
            (this.setFilters[prop] ?? (this.setFilters[prop] = [])).push(handler)
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
            // 创建代理
            this.proxy = new Proxy(this.instance, {
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
                    if (result === raw) {
                        vm.log(`尝试读取成员"${prop}", 值为: `, raw)
                    } else {
                        vm.log(`尝试读取成员"${prop}", 值为: `, raw, ', 覆盖值为: ', result)
                    }
                    // 劫持方法
                    if (getType(result) === 'function') {
                        return new Proxy(result, {
                            apply(target, context, args) {
                                vm.log(`尝试执行方法: "${prop}" 附参数: `, args, ", 调用栈: ", getStack())
                                let retcode = Reflect.apply(target, vm.instance, args)
                                vm.log(`方法: "${prop}" 执行完毕, 返回值: `, retcode)
                                return retcode
                            },
                            construct(target, args) {
                                vm.log(`尝试构造对象: "${prop}" 附参数: `, args, ", 调用栈: ", getStack())
                                let retcode = Reflect.construct(target, args)
                                vm.log(`对象: "${prop}" 构造完毕, 返回值: `, retcode)
                                return retcode
                            }
                        })
                    }
                    return result
                },
                set(target, prop, value) {
                    let old = Reflect.get(vm.instance, prop),
                        raw = value
                    // 执行过滤器方法
                    for (let filter of setting.setFilters[prop] ?? []) {
                        try {
                            let newValue = Reflect.apply(filter, vm, [vm.instance, prop, value])
                            value = newValue === undefined ? value : newValue
                        } catch (e) {
                            console.error('执行过滤器时出错: ', filter, e)
                        }
                    }
                    if (raw === value) {
                        vm.log(`尝试设置成员"${prop}", 旧值为: `, old, ', 新值为: ', raw)
                    } else {
                        vm.log(`尝试设置成员"${prop}", 旧值为: `, old, ', 新值为: ', raw, ', 覆盖值为: ', value)
                    }
                    return Reflect.set(target, prop, value)
                },
                has(target, prop) {
                    return Reflect.has(target, prop)
                }
            })
            // 返回劫持后的xhr实例
            return this.proxy
        }
    }
    hook(unsafeWindow, 'XMLHttpRequest', ProxyXhr)

    function hookProxy(old, ...args) {
        console.log('有人调用了Proxy函数!!!', getStack())
        return Reflect.apply(old, this, args)
    }
    hook(unsafeWindow, 'Proxy', hookProxy)
})();
