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
        maxHeight = window.screen.width > 1681 ? 405 : 303.75; // ? 360 : 270;

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
                right: -12px;
                bottom: -12px;
                width: 24px;
                height: 24px;
                background: #000000C0;
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
            // 四舍五入
            width = Math.round(width);
            height = Math.round(height);
            // 限制大小
            if (width < this.minWidth) width = this.minWidth;
            if (height < this.minHeight) height = this.minHeight;
            if (width > this.maxWidth) width = this.maxWidth;
            if (height > this.maxHeight) height = this.maxHeight;
            const deltaWidth = width - this.minWidth;
            const deltaHeight = height - this.minHeight;
            /**
             * 缩放播放器
             * 由于B站使用了right/bottom定位，所以使用transform补偿偏移量
             */
            this.styleElem.innerHTML = `
                .bpx-player-container[data-revision="1"][data-screen=mini],
                .bpx-player-container[data-revision="2"][data-screen=mini] {
                    width: ${width}px !important;
                    height: ${height}px !important;
                    transform: translate(${deltaWidth}px, ${deltaHeight}px)
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
