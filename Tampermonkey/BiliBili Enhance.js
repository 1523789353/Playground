// ==UserScript==
// @name         BiliBili 播放器增强
// @description  BiliBili 播放器增强
// @author       皇家养猪场
// @namespace    皇家养猪场
// @version      0.0.1
// @create       2022-12-03
// @lastmodified 2023-02-17
// @note         首次更新
// @charset      UTF-8
// @match        *://*.bilibili.com/*
// @connect      localhost
// @run-at       document-start
// @grant        unsafeWindow
// @compatible   chrome
// @license      MIT
// ==/UserScript==

(function () {
    // 移除B站直播P2P上传
    setTimeout(() => {
        return;
        delete unsafeWindow.RTCPeerConnection;
        delete unsafeWindow.mozRTCPeerConnection;
        delete unsafeWindow.webkitRTCPeerConnection;
        delete unsafeWindow.RTCDataChannel;
        delete unsafeWindow.DataChannel;
    }, 0);
    const { hide, api } = (function () {
        const style = document.createElement('style');
        document.head.appendChild(style);

        const hide = (selector, holdPlace) => style.innerHTML += `
            ${selector} {
                ${holdPlace ? 'visibility: hidden' : 'display: none' } !important;
            }
        `;


        const api = {};
        function copyProp(propName, target, prop) {
            Object.defineProperties(api, {
                [propName]: {
                    get: () => target[prop],
                    set: value => void (target[prop] = value)
                }
            });
        }
        function toTitleCase(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        }
        function addPrefix(text, prefix) {
            if (prefix === 'default') return text;
            return prefix + text.charAt(0).toUpperCase() + text.slice(1);
        }
        function findApi(target, names, events = []) {
            let titleCase = toTitleCase(names[0]);
            let findResult;
            for (let item of [
                { type: 'default', name: names[0] },
                { type: 'moz', name: 'moz' + titleCase },
                { type: 'ms', name: 'ms' + titleCase },
                { type: 'webkit', name: 'webkit' + titleCase}
            ]) {
                if (target[item.name] !== undefined) {
                    findResult = item.type;
                }
            }
            if (findResult === undefined) return false;
            for (let name of names) {
                copyProp(name, target, addPrefix(name, findResult));
            }
            for (let event of events) {
                if (findResult === 'default') {
                    api[event] = event;
                } else {
                    api[event] = findResult + event;
                }
            }
            return true;
        }

        findApi(document, ['fullscreen'], ['fullscreenchange']);

        findApi(document, ['hidden', 'visibilityState'], ['visibilitychange']);

        return { hide, api };
    })();

    function fastFail(obj) {
        let TryReflect = new Proxy(Reflect, {
            get(target, prop, receiver) {
                let result = Reflect.get(target, prop, receiver);
                if (typeof result !== 'function') return result;
                function tryApply(target, thisArg, args) {
                    try {
                        return Reflect.apply(target, thisArg, args);
                    } catch (e) {
                        console.error('[Fastfail]:\n', e);
                    }
                    return null;
                }
                return new Proxy(result, { apply: tryApply });
            }
        });
        const proxy = new Proxy(obj, {
            apply: TryReflect.apply,
            construct: TryReflect.construct,
        })
        return proxy;
    }

    // 导航栏
    hide('.left-entry>li:nth-child(n+4)', true);
    hide('.left-entry>li:nth-child(n+8)');
    hide('.right-entry>div:nth-child(2)');
    hide('.right-entry>li:nth-child(7)', true);
    hide('.right-entry>li:nth-child(8)', true);

    // 播放页 选集上面的会员提示
    hide('div[class*=vipPaybar_container]');

    function isNil(obj) {
        return obj === null || obj === undefined;
    }

    function unite(array) {
        return Array.from(new Set(array));
    }

    function num2px(num, maxLen = 4) {
        const factor = Math.pow(10, maxLen);
        const formatted = Math.round(num * factor) / factor;
        if (formatted == 0) return '0';
        return formatted + 'px';
    }

    /**
     * 防抖hook
     * 在busyTime时间内, 只会执行一次, 如果在busyTime时间内再次调用, 统一返回下次执行的结果
     * @param {function} fn 需要限制执行频率的函数
     * @param {number} busyTime 忙碌时间, 单位毫秒
     * @returns {function} 被代理的函数, 执行结果是一个Promise
     */
    function throttle(fn, busyTime) {
        let state = "idle"; // 定义当前的状态, idle表示空闲, busy表示忙碌
        let asyncExec = busyTime == 1000 / 60 ? requestAnimationFrame : setTimeout; // 定义异步执行的方法, 可以根据需要修改
        let timer = null; // 定义定时器的变量, 用于清除定时
        let task = null; // 定义当前的任务, 是一个函数
        // task存在则下面三个变量也一定存在, 其中result是一个Promise供外部使用
        let result = null; // 定义当前任务的返回值, 是一个Promise
        let resolve = null; // 定义resolve方法, 用于异步执行任务时, 通知外部任务已经完成
        let reject = null; // 定义reject方法, 用于异步执行任务时, 通知外部任务失败

        // 重置所有状态和属性
        function resetAll() {
            state = 'idle';
            timer = null;
            resetTask();
            return;
        }

        // 重设任务及其结果
        function resetTask() {
            task = null;
            result = null;
            resolve = null;
            reject = null;
            return;
        }

        // 周期末尾任务执行器
        function tailExecutor() {
            // 若无任务则重置所有状态和属性
            if (task == null) {
                resetAll();
                return;
            }
            // 如果使用的是setTimeout, 则需要清除定时器, 以防内存泄漏
            if (asyncExec == setTimeout) {
                clearTimeout(timer);
            }
            // 继续进行检查, 直到没有新任务
            timer = asyncExec(tailExecutor, busyTime);
            // 保留上次task、resolve、reject, 以便执行异步任务, 和通知外部任务结果
            let lastTask = task;
            let lastResolve = resolve;
            let lastReject = reject;
            // 重置任务及其结果
            resetTask();
            // 执行当前周期最末尾的任务
            execute(lastTask, lastResolve, lastReject);
        }

        function execute(task, resolve, reject) {
            return Promise.resolve(task())
                .then((value) => {
                // 在fn成功时, 通知外部任务已经完成
                resolve(value);
            })
                .catch((error) => {
                // 在fn失败时打印错误信息到控制台
                console.error(error);
                // 通知外部任务失败, 以便后续处理
                reject(error);
            })
        }

        async function handler(target, thisArg, args) {
            // 如果result为空, 则创建一个Promise, 否则复用之前的Promise.
            if (result == null) {
                result = new Promise((res, rej) => {
                    resolve = res;
                    reject = rej;
                });
            }
            if (state == 'idle') {
                // 设置状态为busy
                state = "busy";
                // 在一个忙碌周期结束后检查是否有新任务, 如果有则执行
                timer = asyncExec(tailExecutor, busyTime);
                // 执行当前的任务, 并用Promise.resolve包裹, 以支持异步函数
                execute(target.bind(thisArg, ...args), resolve, reject);
            } else {
                // 如果当前状态为busy, 则将任务保存起来, 以便在周期末尾执行
                task = target.bind(thisArg, ...args);
            }
            return result;
        }

        return new Proxy(fn, { apply: handler });
    }

    // 简单性能统计
    function benchmark(fn) {
        let history = [];
        function handler(target, thisArg, args) {
            let startTime = performance.now();
            let result = target.apply(thisArg, args);
            let endTime = performance.now();
            history.push(endTime - startTime);
            if (history.length > 100) history.shift();
            console.log(`Running ${target.name} tooks ${endTime - startTime}ms.\n    Average: ${history.reduce((a, b) => a + b, 0) / history.length}\n`, history);
            return result;
        }
        return new Proxy(fn, { apply: handler });
    }

    /**
     * 等待元素加载完成, 再进行回调
     * 适用于对异步加载dom的修改
     * 一些情况下建议搭配setTimeout使用(例如: startNode找不到时)
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
            1000 / 5
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



    /** B站播放器 小窗播放缩放 */
    class Resize {
        static #instance = null;

        elem = null;
        initPos = null;
        onDrag = false;
        styleElem = null;
        playerElem = null;
        playerSize = { width: 0, height: 0 };

        minWidth = window.screen.width > 1681 ? 360 : 320;
        minHeight = window.screen.width > 1681 ? 203 : 180;
        maxWidth = window.screen.width > 1681 ? 720 : 540; // ? 640 : 480;
        maxHeight = window.screen.width > 1681 ? 405 : 303.75 ; // ? 360 : 270;

        listeners = {
            beforeresize: [],
            resize: [],
            afterresize: []
        };

        constructor() {
            // 单例模式
            if (Resize.#instance) return Resize.#instance;
            Resize.#instance = this;
            this.init();
        }
        init() {
            // 创建缩放的拖动手柄
            this.elem = document.createElement('div');
            this.elem.className = 'bpx-player-mini-resize';
            this.elem.style.cssText = `
                position: absolute;
                right: -16px;
                bottom: -16px;
                width: 32px;
                height: 32px;
                background: #00000080;
                transform: rotate(45deg);
                z-index: 11;
                cursor: nwse-resize;
            `;
            awaitElement('.bpx-player-mini-warp').then(elems => void elems[0].appendChild(this.elem));
            // 创建样式元素
            this.styleElem = document.createElement('style');
            document.head.appendChild(this.styleElem);
            // 获取播放器元素
            this.playerElem = document.querySelector('.bpx-player-container');
            // 获取播放器大小
            const rect = this.playerElem.getBoundingClientRect();
            this.playerSize.width = rect.width;
            this.playerSize.height = rect.height;

            // 监听事件
            this.elem.addEventListener('mousedown', () => void this.startDrag());
            window.addEventListener('mousemove', this.moveHandler.bind(this));
            window.addEventListener('mouseup', () => void this.stopDrag());
        }
        moveHandler(event) {
            if (!this.onDrag) return;
            if (!this.isMini) {
                this.stopDrag();
                return;
            }
            // 阻止其他事件（小窗拖动事件）
            event.stopPropagation();
            event.stopImmediatePropagation();
            event.cancelBubble = true;
            this.resize(
                this.initPos.width + event.clientX - this.initPos.right,
                this.initPos.height + event.clientY - this.initPos.bottom
            );
        }
        startDrag() {
            this.onDrag = true;
            this.initPos = this.playerElem.getBoundingClientRect();
            this.dispatchEvent(new Event('beforeresize'));
        }
        stopDrag() {
            if (!this.onDrag) return;
            this.dispatchEvent(new Event('afterresize'));
            this.onDrag = false;
        }
        resize(width, height) {
            // 强制 16:9
            if (width / height > 16 / 9) {
                height = width * 9 / 16;
            } else {
                width = height * 16 / 9;
            }
            // 限制大小
            if (width < this.minWidth) width = this.minWidth;
            if (height < this.minHeight) height = this.minHeight;
            if (width > this.maxWidth) width = this.maxWidth;
            if (height > this.maxHeight) height = this.maxHeight;
            const deltaWidth = num2px(width - this.minWidth);
            const deltaHeight = num2px(height - this.minHeight);
            width = num2px(width);
            height = num2px(height);
            /**
             * 缩放播放器
             * 由于B站使用了right/bottom定位，所以使用transform补偿偏移量
             */
            this.styleElem.innerHTML = `
                .bpx-player-container[data-revision="1"][data-screen=mini],
                .bpx-player-container[data-revision="2"][data-screen=mini] {
                    width: ${width} !important;
                    height: ${height} !important;
                    transform: translate(${deltaWidth}, ${deltaHeight});
                }
            `;
            // 更新播放器宽高数据
            this.playerSize.width = width;
            this.playerSize.height = height;
            this.dispatchEvent(new Event('resize'));
        }
        get isMini() {
            return this.playerElem.dataset.screen === 'mini';
        }
        addEventListener(type, listener) {
            if (typeof listener !== 'function') throw new TypeError(`${listener.name} is not a function`);
            if (!this.listeners[type]) throw new Error(`Event ${type} is not supported`);
            this.listeners[type].push(listener);
        }
        dispatchEvent(event) {
            if (!(event instanceof Event)) throw new TypeError(`${event} is not an event`);
            if (!this.listeners[event.type]) throw new Error(`Event ${event.type} is not supported`);
            (async () => {
                for (const listener of this.listeners[event.type]) {
                    try {
                        listener(event);
                    } catch (error) {
                        console.error(error);
                    }
                }
            })();
        }
        removeEventListener(type, listener) {
            if (typeof listener !== 'function') throw new TypeError(`${listener.name} is not a function`);
            if (!this.listeners[type]) throw new Error(`Event ${type} is not supported`);
            const index = this.listeners[type].indexOf(listener);
            if (index !== -1) this.listeners[type].splice(index, 1);
        }
    }




    // 默认打开弹幕开关
    awaitElement('input.bui-danmaku-switch-input', document, 10 * 1000).then($elems => {
        if (!$elems[0].checked) {
            $elems[0].click();
        }
    });

    // 播放器增强: 等比缩放 加重阴影 适配视频and番剧
    awaitElement('.bpx-player-dm-setting-left-fontsize .bui-progress-val, .bilibili-player-video-control-bottom-center, #live-player', document).then(() => {
        const resize = new (fastFail(Resize));
        // 创建style元素
        let $style = document.createElement('style');
        $style.id = 'better-danmaku';

        /**
         * 播放器对象
         * {HTMLElement} main 用于获取播放器尺寸的元素
         * {HTMLElement} videoArea 用于获取播放器尺寸的元素
         * {HTMLElement} biuOpacity
         */
        let $player = {
            ...([
                { main: document.querySelector('#bilibili-player'), type: 'video' }, // 视频主体
                { main: document.querySelector('#bilibiliPlayer'), type: 'anime' }, // 动画主体
                { main: document.querySelector('.supportWebp'), type: 'live' }, // 直播主体
            ].find(i => !isNil(i.main))),
            // 播放器视频区域
            videoArea: document.querySelector('.bpx-player-video-area, .bilibili-player-video-wrap, #live-player'),
            // 弹幕透明度
            V_biuOpacity: document.querySelector('.bpx-player-dm-setting-left-opacity .bui-progress-val'),
            get biuOpacity() {
                if ($player.type == 'video') return $player.V_biuOpacity;
                // 番剧播放器在小窗下没有这个元素
                return document.querySelector('.bilibili-player-video-danmaku-setting-left-opacity .bui-thumb-tooltip');
            },
            // 弹幕字号(缩放)
            V_biuScale: document.querySelector('.bpx-player-dm-setting-left-fontsize .bui-progress-val'),
            get biuScale() {
                if ($player.type == 'video') return $player.V_biuScale;
                // 番剧播放器在小窗下没有这个元素
                return document.querySelector('.bilibili-player-video-danmaku-setting-left-fontsize .bui-thumb-tooltip');
            },
            volume: document.querySelector('.bpx-player-ctrl-volume-icon'),
            get muted() {
                return $player.volume?.style?.display == 'none';
            },
            set muted(value) {
                if ($player.muted != value) {
                    $player.volume?.click();
                }
            }
        }

        // 页面加载完自动解除静音
        $player.muted = false;

        /** 离开页面时自动静音 */
        /*
        document.addEventListener(api.visibilityChange, function () {
            $player.muted = !document[api.hidden];
        }, false);
        */

        /**
         * 生成 text-shadow 文本描边
         * @param color 描边颜色
         * @param width 描边宽度
         * @returns {string} text-shadow文本, 格式: 'h v blur color, ..., h v blur color'
         */
        function getTextStroke(color, width) {
            class TextShadow {
                #shadows = []
                add(h, v, blur, color) {
                    this.#shadows.push([num2px(h), num2px(v), num2px(blur), color].join(' '));
                }
                toString() {
                    return unite(this.#shadows).join(', ');
                }
            }

            let textStroke = new TextShadow();
            // 虚化半径, 抗锯齿
            let blur = 0.5;

            // 基础阴影
            textStroke.add(0, -width, blur, color); // 上
            textStroke.add(width, 0, blur, color); // 右
            textStroke.add(0, width, blur, color); // 下
            textStroke.add(-width, 0, blur, color); // 左

            // { '无': 0, '低': 1, '中': 2, '高': 4}
            let level = 1;
            // 字体阴影的数量 (向上取整是为了均匀分布)
            let amount = Math.ceil(width * Math.PI * level);
            for (var i = 0; i < amount; i++) { // 在 amount 个方向上均匀分布
                let theta = Math.PI * 2 * i / amount; // 2 pi等于360°, 按百分比取角度
                let delta_x = width * Math.sin(theta); // x轴偏移量
                let delta_y = width * Math.cos(theta); // y轴偏移量
                textStroke.add(delta_x, delta_y, blur, color);
            }

            return textStroke.toString();
        }

        /** 保存最后一次的配置, 用于比对、节流 */
        let lastConfig = {
            playerHeight: 0,
            fontOpacity: 0,
            fontScale: 0
        }

        /** 播放器变化时 修改弹幕字体大小 */
        function changeFontSize() {
            // 播放器高度 弹幕字号(字体缩放)
            let playerHeight = $player.videoArea.getBoundingClientRect().height;
            let fontOpacity = parseInt($player.biuOpacity?.innerText ?? 50) / 100;
            let fontScale = parseInt($player.biuScale?.innerText ?? 100) / 100;

            // 对比最后一次结果
            if (
                lastConfig.playerHeight == playerHeight &&
                lastConfig.fontOpacity == fontOpacity &&
                lastConfig.fontScale == fontScale
            ) return;

            lastConfig.playerHeight = playerHeight;
            lastConfig.fontOpacity = fontOpacity;
            lastConfig.fontScale = fontScale;

            let rules = [
                { min: 0, max: 320, get fontSize() { return 16; } }, // 高度在320px以下时固定16px字体
                { min: 320, max: 500, get fontSize() { return (playerHeight * 0.0385 + 3.3) * fontScale; } }, //3.29
                { min: 500, max: 620, get fontSize() { return (playerHeight * 0.0428 + 0.92) * fontScale; } }, // 0.9167
                { min: 620, max: Infinity, get fontSize() { return (playerHeight * 0.022 + 12) * fontScale } }, // 12
            ];
            let matchedRule = rules.find(rule => rule.min <= playerHeight && playerHeight < rule.max);
            let fontSize = matchedRule.fontSize;

            if (fontSize == 16) {
                console.warn('[BiliBili Enhance]: Minimum font size. look like hook failed?', lastConfig);
            }

            let innerTextStroke = Math.max(fontSize * 0.065, 1.35); // 内层黑色描边, 最低1px宽度
            let outerTextStroke = innerTextStroke * 1.55; // 外层白色描边

            let css = `
            :root {
                --TextStroke: ${getTextStroke('#000000', innerTextStroke)},
                    ${getTextStroke('#FFFFFF', outerTextStroke)},
                    2px 2px 4px #000000,
                    0 0 16px #000000;
                --DanmakuFontSize: ${num2px(fontSize)};
                --SubtitleFontSize: ${num2px(fontSize * 1.2)};
                --TextOpacity: ${fontOpacity.toFixed(2)};
            }
            `;
            $style.innerHTML = css;
        }
        // 立即应用字体大小
        changeFontSize();
        document.head.prepend($style);

        let danmakuFps = 5;

        /** 静态css样式, 内部css不会再改变 */
        (function ($staticStyle) {
            $staticStyle.id = 'better-danmaku-static';

            let danmakuSpf = +(1 / danmakuFps).toFixed(4);
            let css = `
            .bpx-player-container[data-screen="mini"] {
                box-shadow: 4px 4px 12px 0px #00000080;
            }
            .bili-dm, .b-danmaku, .bilibili-danmaku {
                font-size: var(--DanmakuFontSize) !important;
                opacity: var(--TextOpacity) !important;
                text-shadow: var(--TextStroke) !important;
                text-rendering: optimizeSpeed;
            }
            .bpx-player-adv-dm-wrap>div:first-child div>pre {
                opacity: var{--TextOpacity} !important;
                text-shadow: var(--TextStroke) !important;
                text-rendering: optimizeSpeed;
            }
            .subtitle-item-text {
                font-size: var(--SubtitleFontSize) !important;
                text-shadow: var(--TextStroke) !important;
                text-rendering: optimizeSpeed;
            }
            `;
            $staticStyle.innerHTML = css;
            document.head.prepend($staticStyle);
        })(document.createElement('style'));

        // 后续节省性能: 防抖
        changeFontSize = throttle(changeFontSize, 1000 / danmakuFps, true);
        resize.addEventListener('afterresize', () => void changeFontSize());


        /** 通用hook处理器 */
        function hookHandler(obj, prop,target, thisArg, args) {
            let pre = obj[prop];
            let result = target.apply(thisArg, args);
            // 检查属性变动
            if (obj[prop] != pre) {
                changeFontSize();
            }
            //setTimeout(, 8);
            return result;
        }

        /** 代理对象, 当属性变化时回调callback函数 */
        function proxyObject(obj, callback) {
            let proxy = new Proxy(obj, {
                set(target, prop, value) {
                    let old = Reflect.get(target, prop);
                    let success = Reflect.set(target, prop, value);
                    // 检查属性变动
                    if (success && value != old) {
                        Reflect.apply(callback, this, []);
                    }
                    return success;
                }
            })

            return proxy;
        }

        /** hook对象，以监听属性变化 */
        function hookProp(obj, prop, deep = false) {
            if (isNil(obj)) return;
            let getter = obj.__lookupGetter__(prop)
            let setter = obj.__lookupSetter__(prop)
            if (isNil(getter) && isNil(setter)) return;
            function deepGetter() {
                let result = Reflect.apply(getter, this, arguments);
                try {
                    return proxyObject(result, changeFontSize);
                } catch (e) {
                    console.warn(e);
                    return result;
                }
            }
            Object.defineProperties(obj, {
                [prop]: {
                    get: deep ? deepGetter : getter,
                    set(value) {
                        hookHandler(obj, prop, setter, this, [value]);
                    },
                }
            })
        }

        /** hook对象，以监听class变动 */
        function hookClass(elem) {
            if (isNil(elem)) return;
            elem.classList.remove = new Proxy(
                elem.classList.remove,
                { apply: hookHandler.bind(null, elem, 'className') }
            );
            elem.classList.add = new Proxy(
                elem.classList.add,
                { apply: hookHandler.bind(null, elem, 'className') }
            );
            hookProp(elem, 'className');
        }

        hookClass($player.main);
        hookProp($player.biuOpacity, 'textContent');
        hookProp($player.biuScale, 'textContent');

        awaitElement('.bpx-player-mini-warp', document).then($elems => {
            hookProp($elems[0], 'style', true);
            changeFontSize();
        });

        // 监听窗口大小改变
        window.addEventListener('resize', () => void changeFontSize());
        document.addEventListener(api.fullscreenChange, () => void changeFontSize());
    });
})();
