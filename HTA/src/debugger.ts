(function () {
    const isSafari = (new Error).stack?.includes('@');

    /**
     * 获取函数调用栈
     * @returns {Array<string>} 调用栈
     */
    function getStack() {
        let chromeRegx = /^\s*at\s+([\w\d_\.]+)\s+\(.*$/g;
        let safariRegx = /^([\w\d_\.]*)@.*$/g;
        let regx = isSafari ? safariRegx : chromeRegx;

        let stackString = (new Error).stack ?? '';
        let stack = stackString.split('\n')
            .map(i => regx.exec(i))
            .filter(i => i !== null)
            .map(i => i![1])
            .map(i => i.length == 0 ? '<anonymous>' : i)
        stack.shift(); // 移除 getStack 函数本身
        return stack;
    }

    /**
     * 获取对象的类型
     * @param {any} target 对象
     * @returns {string} 类型名称
     */
    function getType(target: any) {
        return Object.prototype.toString.call(target)
            .replace(/\[object (\w+)\]/g, '$1');
    }

    /**
     * hook目标对象上的方法/类
     * @param {object} target 目标对象
     * @param {string} prop 目标的方法/类
     * @param {function|class} fn 接管的方法/类
     * 传递给接管的方法/类的参数: fn(old, ...args)
     * 其中old是被hook的方法/类, args是传递给被hook的方法/类的参数
     * case:
     * hook(window, 'XMLHttpRequest', (old, ...args) => {
     *     console.log('hooked', old, args);
     *     return new old(...args);
     * });
     */
    function hook(target: any, prop: string, fn: Function) {
        // 备份老方法, 创建代理
        let old: any = target[prop];
        let proxy = new Proxy(old, {
            apply(target, thisArg, args) {
                return Reflect.apply(fn, thisArg, [old, ...args]);
            },
            construct(target, args) {
                return Reflect.construct(fn, [old, ...args]);
            }
        });
        // 替换原方法
        if (Reflect.set(target, prop, proxy) && target[prop] === proxy)
            return;
        // 替换失败, 尝试使用defineProperty
        try {
            Object.defineProperty(target, prop, {
                set(value) { return false; },
                get() { return proxy; }
            })
        } catch {
            console.warn(`Hook Faild`, target, prop)
        }
    }

    function formattedTime() {
        return new Date().toLocaleString('zh', {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        }).replace(/\//g, '-');
    }

    let download = (function () {
        const anchorForDownload = document.createElement('a');
        anchorForDownload.target = '_blank';
        return function (url: string, filename: string) {
            anchorForDownload.href = url;
            anchorForDownload.download = filename;
            anchorForDownload.click();
        }
    })();

    let escapeHTML = (function () {
        const elem = document.createElement('div');
        return function (str: string) {
            elem.innerText = str;
            return elem.innerHTML
                .replace(/ /g, '&nbsp;')
                .replace(/\t/g, '&nbsp;'.repeat(4))
                .replace(/\n/g, '</br>');
        }
    })();

    /**
     * 将对象转换为方便打印的字符串
     */
    function toString(obj: any) {
        let objType = getType(obj);
        switch (objType) {
            case 'Object':
                return `<Object ${JSON.stringify(obj, null, 4).replace(/\\(.)/g, '$1')}>`;
            case 'Array':
                return `<Array [${obj.map((i: any) => getType(i) == 'String' ? `"${i}"` : toString(i)).join(', ')}]>`;
            case 'Function':
                let fnName = obj.name.trim();
                if (fnName.length == 0)
                    return `<Function>`
                return `<Function ${fnName}()>`
            case 'Error':
                return `\n<${obj.stack}>`;
            case 'Symbol':
                return `<Symbol ${obj.toString()}>`;
            case 'String':
            case 'Number':
            case 'Boolean':
            case 'Undefined':
            case 'Null':
                return obj;
            default:
                let objStr = String(obj);
                if (/^\[.*\]$/g.test(objStr))
                    objStr = obj.toString();
                if (objStr.length == 0)
                    return `<${objType}>`;
                return `<${objType} ${objStr}>`;
        }
    }

    /**
     * 去除注释
     * @param {string} str
     * @returns
     */
    function escapeComments(str: string) {
        return str.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '');
    }

    const style = `
        #wrapper {
            height: 500px;
            width: calc(100vw - 18px);
            overflow: auto;
            transform: translate(0, 0);
        }

        #logs {
            background: rgb(32 33 36);
            color: rgb(255 255 255);
            font-family: consolas, lucida console, courier new, monospace;
            font-size: 12px;
            line-height: 1.5em;
            word-break: break-all;
        }

        #save-log {
            position: fixed;
            top: 8px;
            right: 8px;
            z-index: 4;
        }

        .log {
            margin: 0;
            padding: 0 8px 0 24px;
            position: relative;
            align-items: center;
            border-top: 1px solid rgb(58, 58, 58);
            border-bottom: 1px solid rgba(0, 0, 0, 0);
            z-index: 1;
        }

        .log::before {
            content: '';
            display: inline-block;
            width: 14px;
            height: 1.5em; // 从 #logs 继承的行高
            position: absolute;
            left: 6px;
            z-index: 2;
        }

        // hover高亮
        .log:hover::after {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            background: rgba(255, 255, 255, .05);
            z-index: 3;
            pointer-events: none;
        }

        // 日志 logo
        .log.level-warn::before {
            -webkit-mask-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Im0xIDE3IDktMTUgOSAxNUgxWk0xMSA3djVIOVY3aDJabS0xIDguMWExLjEgMS4xIDAgMSAwIDAtMi4yIDEuMSAxLjEgMCAwIDAgMCAyLjJaIiBmaWxsPSIjMDAwIi8+PC9zdmc+');
            -webkit-mask-position: center;
            -webkit-mask-repeat: no-repeat;
            -webkit-mask-size: 99%;
            background-color: rgb(238, 152, 54);
        }

        .log.level-error::before {
            -webkit-mask-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTcuMDYyIDE0IDEwIDExLjA2MiAxMi45MzggMTQgMTQgMTIuOTM4IDExLjA2MiAxMCAxNCA3LjA2MiAxMi45MzggNiAxMCA4LjkzOCA3LjA2MiA2IDYgNy4wNjIgOC45MzggMTAgNiAxMi45MzggNy4wNjIgMTRaTTEwIDE4YTcuNzk0IDcuNzk0IDAgMCAxLTMuMTA0LS42MjUgOC4wNjcgOC4wNjcgMCAwIDEtMi41NTItMS43MTkgOC4wNjUgOC4wNjUgMCAwIDEtMS43MTktMi41NTJBNy43OTUgNy43OTUgMCAwIDEgMiAxMGMwLTEuMTExLjIwOC0yLjE1LjYyNS0zLjExNWE4LjA2NiA4LjA2NiAwIDAgMSA0LjI3MS00LjI2QTcuNzk1IDcuNzk1IDAgMCAxIDEwIDJjMS4xMTEgMCAyLjE1LjIwOCAzLjExNS42MjVhOC4xIDguMSAwIDAgMSA0LjI2IDQuMjZDMTcuNzkyIDcuODUgMTggOC44ODkgMTggMTBhNy43OTQgNy43OTQgMCAwIDEtLjYyNSAzLjEwNCA4LjA2NiA4LjA2NiAwIDAgMS00LjI2IDQuMjcxQTcuNzc1IDcuNzc1IDAgMCAxIDEwIDE4WiIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==');
            -webkit-mask-position: center;
            -webkit-mask-repeat: no-repeat;
            -webkit-mask-size: 99%;
            background-color: rgb(228, 105, 98);
        }

        // 日志染色
        .log.level-warn {
            color: rgb(242, 171, 38);
            border-top: 1px solid hsl(50deg 100% 25%);
            border-bottom: 1px solid hsl(50deg 100% 25%);
            background-color: hsl(50deg 100% 10%);
        }

        .log.level-error {
            color: rgb(255, 128, 128);
            border-top: 1px solid hsl(0deg 89% 25%);
            border-bottom: 1px solid hsl(0deg 89% 25%);
            background-color: hsl(0deg 89% 10%);
        }

        .log>*::after {
            content: ' ';
        }
    `;
    // 日志样式标签
    const styleLink = document.createElement('link');
    styleLink.rel = 'stylesheet';
    styleLink.href = URL.createObjectURL(new Blob([escapeComments(style)], { type: 'text/css' }))

    // 日志显示区域的容器
    const warpperElem = document.createElement('div');
    warpperElem.id = 'wrapper';

    // 日志显示区域
    const logsElem = document.createElement('div');
    logsElem.id = 'logs';
    warpperElem.appendChild(logsElem);

    // 用于下载日志的按钮
    const saveLogBtnElem = document.createElement('button');
    saveLogBtnElem.id = 'save-log';
    saveLogBtnElem.innerText = 'Save Log';
    warpperElem.appendChild(saveLogBtnElem);

    saveLogBtnElem.addEventListener('click', () => {
        let blob = new Blob([logsElem.innerText], { type: 'text/plain' });
        let blobUrl = URL.createObjectURL(blob);
        download(blobUrl, 'console.log');
    })

    function domLog(level: string, ...args: Array<any>) {
        let log = document.createElement('p');
        log.classList.add('log', 'level-' + level);
        log.innerHTML += `<span class="function">[${escapeHTML(getStack()[isSafari ? 2 : 1])}]</span> `;
        log.innerHTML += `<span class="log-time">${formattedTime()}</span> `;
        for (let arg of args) {
            log.innerHTML += escapeHTML(toString(arg));
        }
        logsElem.appendChild(log);
    }

    // hook console
    function handler(this: any, fnName: string, old: Function, ...args: Array<any>) {
        domLog(fnName, ...args);
        return Reflect.apply(old, this, args);
    }
    for (let fnName in window.console) {
        let fn = (window.console as any)[fnName] as Function;
        if (typeof fn !== 'function') continue;
        hook(console, fnName, handler.bind(console, fnName));
    }



    // 注入样式与日志显示区域
    window.addEventListener('load', () => {
        document.head.appendChild(styleLink);
        document.body.appendChild(warpperElem);
    });

    window.addEventListener('error', e => {
        console.error(e.error);
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
    });


    // 测试日志样式
    console.warn('Test Console Warn');
    console.error('Test Console Error');



    /* 劫持页面的Xhr请求 */
    // 设置
    var setting = {
        showLog: true,
        xhrList: new Array<ProxyXhr>(),
    }
    // 暴露
    Object.defineProperty(window, 'ProxyXhrSetting', {
        get() {
            return setting;
        },
        set(value) {
            setting = value;
        }
    })
    // 新的XMLHttpRequest类
    class ProxyXhr {
        instance: XMLHttpRequest
        proxy: XMLHttpRequest
        // 日志记录
        logHistory: Array<any> = []
        // 打印日志
        log(...args: Array<any>) {
            this.logHistory.push(args);
            if (setting.showLog) {
                console.log(...args);
            }
        }
        constructor(old: XMLHttpRequest, ...args: Array<any>) {
            this.log("构造XMLHttpRequest实例, 调用栈: ", getStack())
            // 记录实例
            setting.xhrList.push(this)
            // 初始化XHR实例
            this.instance = Reflect.construct(old as any, args);
            // 防止this指向不清
            let vm = this
            // 创建代理, target === vm.instance
            this.proxy = new Proxy(this.instance, {
                // 获取值时执行代理方法
                get(target, prop) {
                    let result = Reflect.get(vm.instance, prop)
                    vm.log(`尝试读取成员"${String(prop)}", 值为: `, result);
                    if (getType(result) !== 'Function')
                        return result;
                    // 劫持方法/构造函数
                    return new Proxy(result, {
                        apply(target, context, args) {
                            vm.log(`尝试执行方法"${String(prop)}", 参数: `, args, ", 调用栈: ", getStack());
                            let retcode = Reflect.apply(target, vm.instance, args);
                            // vm.log(`方法: "${prop}" 执行完毕, 返回值: `, retcode);
                            return retcode;
                        },
                        construct(target, args) {
                            vm.log(`尝试构造对象"${String(prop)}", 参数: `, args, ", 调用栈: ", getStack());
                            let retcode: object = Reflect.construct(target, args);
                            // vm.log(`对象"${prop}"构造完毕, 返回值: `, retcode);
                            return retcode;
                        }
                    })
                },
                // 设置值时执行代理方法
                set(target, prop, value) {
                    let old = Reflect.get(vm.instance, prop);
                    vm.log(`尝试写入成员"${String(prop)}", 旧值: `, old, ', 新值: ', value);
                    return Reflect.set(target, prop, value);
                },
                has(target, prop) {
                    return Reflect.has(target, prop);
                }
            })
            // 返回劫持后的xhr实例
            return this.proxy as any;
        }
    }
    hook(window, 'XMLHttpRequest', ProxyXhr);
})();
