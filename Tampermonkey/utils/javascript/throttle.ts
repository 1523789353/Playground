enum ThrottleState {
    idle,
    busy
}

export function Throttle(fn: Function , busyTime: number): Function {
    let state: ThrottleState = ThrottleState.idle;
    let task: Function | null = null;

    function checkTask(): any {
        if (task !== null) {
            let $task = task;
            task = null;
            setTimeout(checkTask, busyTime);
            $task();
        } else {
            state = ThrottleState.idle;
        }
    }
    function handler(target: Function, thisArg: any, args: Array<any>) {
        task = target.bind(thisArg, ...args);
        if (state === ThrottleState.idle) {
            state = ThrottleState.busy;
            checkTask();
        }
    }

    return new Proxy(fn, { apply: handler });
}

export default {
    Throttle
}
