// Public 配置, 可改变
type TimerConfig = {
    runningMode: 'frequency' | 'timeout' | 'timeline',
    clockMode: 'freqSync' | 'timeSync' | 'lagCompensate',
    timeout?: number,
    frequency?: number,
    timeline?: { loop: boolean, timeline: Array<number> }
}

// Public 状态, 被动改变
type TimerState = {
    state: 'running' | 'suspend'
}

// Private 配置
type TimerInternal = {
    listeners: Array<Function>
}

export { TimerConfig, TimerState, TimerInternal };
