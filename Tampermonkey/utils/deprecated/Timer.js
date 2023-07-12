// running mode:
//     freq     : 60/s
//     timeout  : 1000ms
//     timeline : { loop: false, timeline: [] }
//     event    : timer.onExpire((event) => {
//                    console.log('do something');
//                })
//                timer.addEventListener('expire', () => {
//                    console.log('do something');
//                })

// sync mode:
//     legacy
//     allowLostSync
//     auto

// methods:
//     start()
//     pause()

// statistics:
//     totalCycles
//     totalOffset
//     offsetPerCycle



/**
 * name: Timer/计时器
 * desc: 致力于替代setInterval, 用于解决setInterval计时器不可靠的问题
 * tips: 因浏览器特性, 浏览器窗口不可见的情况下计时器的性能会受到影响
 * warning: 请确保auto模式下timeout大于0
 * author: 皇家养猪场/1523789353@qq.com
 * version: 0.1 beta
 * last-update-time: 2022.09.16
 */
class Timerjs {
    // 周期
    timeout = 1000;
    // 目标函数
    handler = undefined;
    // debug信息输出
    debug = false;
    // 状态获取
    get state() {
        return this.#internal.running ? 'running' : 'suspend';
    }
    // 同步模式
    #syncModeName = 'auto'
    get syncMode() {
        return this.#syncModeName
    }
    set syncMode(modeName) {
        let mode = this.#syncModePresets[modeName];
        if (mode === undefined) {
            console.warn(`No such sync mode: "${modeName}"`);
            return false;
        }
        this.#syncModeName = modeName;
    }
    // 内部属性
    #internal = {
        // 周期的起始时间
        lastTime: 0,
        // 周期的时间偏移(延迟)
        offset: 0,
        // 计时器状态
        running: false,
        // 统计信息
        statistics: {
            lifetimes: 0,
            offsets: 0,
            lostSyncs: 0
        }
    }

    constructor(config = {}) {
        this.timeout = config?.timeout ?? 0;
        this.handler = config?.handler ?? undefined;
        this.debug = !!config?.debug;
        return this;
    }

    sleep(ms) {
        return new Promise((res) => ms > 0 ? setTimeout(res, ms) : res());
    }

    // 启动
    start() {
        if (this.#internal.running) {
            console.warn('Timer is still running!');
        } else {
            this.#internal = {
                ...this.#internal,
                lastTime: 0,
                duration: 0,
                offset: 0,
                running: true
            }
            this.#lifespan();
        }
        return this;
    }

    // 生命周期
    #lifespan() {
        // 控制生命周期
        if (!this.#internal.running) return;
        // 记录起始时间
        this.#internal.lastTime = (new Date).getTime();
        // 计算休眠时长
        this.#internal.duration = this.timeout - this.#internal.offset;
        // 执行休眠方法
        Reflect.apply(this.#syncModePresets[this.#syncModeName], this, []);
        // 输出debug信息
        if (this.debug) {
            console.log(`Time offset: ${this.#internal.offset}`);
        }
    }

    // 同步模式预设
    #syncModePresets = {
        // 卡顿时将帧延迟到流畅时执行
        legacy() {
            setTimeout(() => {
                // 计算时间偏移
                this.#internal.offset = (new Date).getTime() - this.#internal.lastTime - this.#internal.duration;
                // 进入下个生命周期
                this.#lifespan();
                // 执行目标函数
                Reflect.apply(this.handler, window, []);
            }, this.#internal.duration)
        },
        // 卡顿时丢帧
        allowLostSync() {
            // 休眠
            this.sleep(this.#internal.duration).then(() => {
                // 计算时间偏移
                this.#internal.offset = (new Date).getTime() - this.#internal.lastTime - this.#internal.duration;
                // 计算丢帧数
                let lostSyncs = parseInt(this.#internal.offset / this.timeout);
                // 警告信息
                if (this.debug && lostSyncs > 0) {
                    console.warn(`Lost sync: ${lostSyncs} times!`);
                }
                // 丢帧
                this.#internal.offset %= this.timeout;
                // 进入下个生命周期
                this.#lifespan();
                // 执行目标函数
                Reflect.apply(this.handler, window, []);
            });
        },
        // 卡顿时将异步执行变为同步执行(*推荐)
        auto() {
            // 休眠
            this.sleep(this.#internal.duration).then(() => {
                // 计算时间偏移
                this.#internal.offset = (new Date).getTime() - this.#internal.lastTime - this.#internal.duration;
                // 进入下个生命周期
                this.#lifespan();
                // 执行目标函数
                Reflect.apply(this.handler, window, []);
            });
        }
    }

    // 暂停
    suspend() {
        if (this.#internal.running) {
            this.#internal.running = false;
        } else {
            console.warn('Timer is not running!');
        }
        return this;
    }
}


/* ##### Test Case ##### */
let t = new Timer({
    timeout: 1000/60,
    handler() {
        console.log("渲染一帧");
    }
}).start();

let sec = new Timer({
    timeout: 1000,
    handler() {
        console.log("一秒过去了...");
    }
}).start();
