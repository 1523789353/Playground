/**
 * 防抖hook
 * 在busyTime时间内, 只会执行一次, 如果在busyTime时间内再次调用, 统一返回下次执行的结果
 * @param {function} fn 需要限制执行频率的函数
 * @param {number} busyTime 忙碌时间, 单位毫秒
 * @param {boolean} immediate 是否立即执行, 默认为true
 * @returns {function} 被代理的函数, 执行结果是一个Promise
 */
function throttle(fn, busyTime, immediate = true) {
    let state = "idle"; // 当前的状态, idle表示空闲, busy表示忙碌
    let timeout = setTimeout; // 异步执行的方法, 可以根据需要修改
    let timer = null; // 定时器的变量, 用于清除定时
    let task = null; // 当前的任务, 是一个函数
    let result = null; // 当前任务的返回值, 是一个Promise
    let resolve = null; // 用于通知外部任务已经完成
    let reject = null; // 用于通知外部任务失败

    // 重置所有状态和属性
    function resetAll() {
        state = 'idle';
        timer = null;
        resetTask();
    }

    // 重设任务及其结果
    function resetTask() {
        task = null;
        result = null;
        resolve = null;
        reject = null;
    }

    // 周期末尾任务执行器
    function tailExecutor() {
        // 清除定时器, 防止内存泄漏
        if (timeout == setTimeout) {
            clearTimeout(timer);
        }
        // 若无任务则重置所有状态和属性
        if (task == null) {
            resetAll();
            return;
        }
        // 在一个周期结束后检查是否有新任务, 如果有则执行
        timer = timeout(tailExecutor, busyTime);
        // 执行当前周期最末尾的任务
        execute();
    }

    // 执行任务
    function execute() {
        // 保存当前任务及其结果
        let execute = { task, result, resolve, reject };
        // 重置任务及其结果
        resetTask();
        // 执行任务, 用Promise.resolve包裹, 以支持异步函数
        Promise.resolve(execute.task())
            .then((value) => {
                // 在fn成功时, 通知外部任务已经完成
                execute.resolve(value);
            })
            .catch((error) => {
                // 在fn失败时打印错误信息到控制台
                console.error(error);
                // 通知外部任务失败, 以便后续处理
                execute.reject(error);
            });
    }

    function handler(target, thisArg, args) {
        // 保存当前任务, 在busy状态下会覆盖上一个任务
        task = target.bind(thisArg, ...args);
        // 如果result为空, 则创建一个Promise, 否则复用之前的Promise.
        result ??= new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });
        if (state == 'idle') {
            // 设置状态为busy
            state = "busy";
            // 在一个周期结束后检查是否有新任务, 如果有则执行
            timer = timeout(tailExecutor, busyTime);
            if (immediate) {
                // 如果immediate为true, 则立即执行
                execute();
            }
        }
        return result;
    }

    return new Proxy(fn, { apply: handler });
}
