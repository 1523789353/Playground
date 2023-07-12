/**
 * hook目标对象的方法与类
 * @param {Object} target 目标对象
 * @param {String} prop 目标属性名
 * @param {Function} fn 处理方法
 */
function hook(target, prop, fn) {
    // 备份老方法, 包装新方法
    let old = target[prop],
        warpped = function () {
            return this instanceof warpped ?
                new fn(old, ...arguments) :
                fn.call(this, old, ...arguments)
        }
    // 伪装toString方法
    warpped.__proto__.toString = toString.bind(old)
    // 存在原形则继承原形
    if ('prototype' in old) {
        warpped.prototype = old.prototype
    }
    // 替换原方法
    target[prop] = warpped
    // 强制替换
    if (target[prop] !== warpped) {
        Object.defineProperty(target, prop, { value: warpped })
    }
}



/* 反debugger陷阱, 禁止动态生成调试断点 */
function antiDebugger(old, ...args) {
    if (args[0] === 'debugger') {
        args[0] = 'null'
    }
    return old.apply(this, args ?? [])
}
hook(unsafeWindow, 'Function', antiDebugger)
hook(unsafeWindow.Function.prototype, 'constructor', antiDebugger)



/* 记录所有事件 */
//用于记录所有注册的事件的列表(只读): window.eventListenerList
var eventListenerList = []
Object.defineProperty(unsafeWindow, 'eventListenerList', {
    enumerable: false,
    configurable: false,
    get() {
        return eventListenerList
    }
})
function recordEvents(old, ...args) {
    let [type, listener, useCapture] = args
    eventListenerList.push({
        "element": this,
        "type": type,
        "listener": listener,
        "options": useCapture
    })
    old.apply(this, args)
}
hook(document, 'addEventListener', recordEvents)
hook(unsafeWindow, 'addEventListener', recordEvents)
hook(EventTarget.prototype, 'addEventListener', recordEvents)



/* 禁止监听Blur事件 */
function antiBlur(old, ...args) {
    let [type, listener, useCapture] = args
    if (type === 'blur') {
        return
    }
    old.apply(this, args)
}
hook(document, 'addEventListener', antiBlur)
hook(unsafeWindow, 'addEventListener', antiBlur)
hook(EventTarget.prototype, 'addEventListener', antiBlur)



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
    let [callback, ms, ...moreArgs] = args
    let id = old.apply(this, args)
    intervalList[id] = {
        "function": callback,
        "time": ms,
        "args": moreArgs,
    }
}

hook(unsafeWindow, 'setInterval', recordInterval)
function removeInterval(old, ...args) {
    let [id] = args
    delete intervalList[id]
    old.apply(this, args)
}
hook(unsafeWindow, 'clearInterval', removeInterval)



/* 劫持页面的Xhr请求, 任意修改请求与响应的属性 */
// 设置
var setting = {
    showLog: false,
    xhrList: [],
    getFilters: {},
    setFilters: {},
    onGetProp(name, handler) {
        (this.getFilters[name] ?? (this.getFilters[name] = [])).push(handler)
    },
    onSetProp(name, handler) {
        (this.setFilters[name] ?? (this.setFilters[name] = [])).push(handler)
    }
}
// 暴露
Object.defineProperty(unsafeWindow, 'ProxyXhrSetting', { get: () => setting })
// 新的XMLHttpRequest类
class ProxyXhr {
    // 获取调用栈
    getStack() {
        var reg = /\w+@|at (.*) \(/g
        return new Error().stack.match(reg).map(i => i.replace(reg, '$1'))
    }
    // 日志记录
    logHistory = []
    // 打印日志
    log(...args) {
        this.logHistory.push(args)
        if (setting.showLog) {
            console.log(...args)
        }
    }
    // 强制设置属性
    setProp(prop, value) {
        this.instance[prop] = value
        if (this.instance[prop] !== value) {
            // 常规方式修改失败, 使用强制修改
            Object.defineProperty(this.instance, prop, { value })
        }
    }
    constructor(rawXhr) {
        this.log("创建XMLHttpRequest实例", this.getStack())
        // 记录实例
        setting.xhrList.push(this)
        // 初始化XHR实例
        this.instance = new rawXhr()
        // 防止this指向不清
        let vm = this
        // 替换属性
        for (let prop in this.instance) {
            // 判断要继承属性是在原型链上还是在实例上
            let target = prop in ProxyXhr.prototype ? this.__proto__ : this
            // 继承并劫持属性
            Object.defineProperty(target, prop, {
                // getter劫持
                get() {
                    this.log(`尝试读取成员"${prop}", 值为: `, vm.instance[prop])
                    // 执行过滤器方法
                    for (let filter of setting.getFilters[prop] ?? []) {
                        let result = filter.apply(this, [vm.instance, vm.instance[prop]])
                        if (result !== undefined) {
                            vm.setProp(prop, result)
                        }
                    }
                    // 劫持函数执行
                    if (vm.instance[prop] instanceof Function) {
                        return (function () {
                            vm.log(`尝试执行方法: "${prop}" 附参数: `, arguments, " 调用栈: ", vm.getStack())
                            // 注意不能用apply等方法修改this指向
                            return vm.instance[prop](...arguments)
                        })
                    }
                    // 劫持其他属性
                    return vm.instance[prop]
                },
                // setter劫持
                set(value) {
                    vm.log(`尝试修改成员"${prop}", 原值为: `, vm.instance[prop], " 新值为: ", value)
                    // 执行过滤器方法
                    for (let filter of setting.setFilters[prop] ?? []) {
                        value = filter.apply(this, [vm.instance, vm.instance[prop], value]) ?? value
                    }
                    vm.setProp(prop, value)
                }
            })
        }
    }
}
hook(unsafeWindow, 'XMLHttpRequest', ProxyXhr)
