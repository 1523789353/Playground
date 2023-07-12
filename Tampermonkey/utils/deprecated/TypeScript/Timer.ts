import iTimer from './interface/iTimer'
import { TimerConfig, TimerInternal, TimerState } from './type/TimerConfig'

class Timer implements iTimer {
    // Configs
    private config: TimerConfig & TimerState & TimerInternal = {
        runningMode: 'frequency',
        clockMode: 'freqSync',
        timeout: 1000,
        frequency: 1,
        timeline: { loop: false, timeline: [] },
        listeners: new Array<Function>(),
        state: 'suspend'
    };
    // Getters
    get runningMode() {
        return this.config.runningMode;
    }
    get clockMode(): TimerConfig['clockMode'] {
        return this.clockMode;
    }
    get timeout(): TimerConfig['timeout'] {
        return this.timeout;
    }
    get frequency() {
        return this.config.frequency;
    }
    get state(): TimerState['state'] {
        return this.config.state;
    }

    constructor(config: TimerConfig) {
        this.config = { ...this.config, ...config }
    }

    start(): never {
        throw new Error("suspend Method not implemented.");
    }
    suspend(): never {
        throw new Error("suspend Method not implemented.");
    }

    onExpire(handler: Function): never {
        throw new Error("onExpire Method not implemented.");
    }
}

export default Timer;
