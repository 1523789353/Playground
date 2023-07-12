// ==UserScript==
// @name         ProxyXhr
// @description  劫持页面的Xhr请求, 任意修改请求与响应的属性
// @author       皇家养猪场
// @namespace    皇家养猪场
// @version      1.0.1
// @create       2022-04-07
// @lastmodified 2022-04-19
// @charset      UTF-8
// @match        *://*/*
// @connect      localhost
// @run-at       document-start
// @grant        unsafeWindow
// @compatible   chrome
// @license      MIT
// ==/UserScript==

(function () {
    // 保留原始的XMLHttpRequest类
    var rawXhr = unsafeWindow.XMLHttpRequest
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
        // 创建实例
        instance = new rawXhr()
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
        constructor() {
            this.log("创建XMLHttpRequest实例", this.getStack())
            // 记录实例
            setting.xhrList.push(this)
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
    // 劫持XMLHttpRequest类
    unsafeWindow.XMLHttpRequest = ProxyXhr
})()
