import { TimerConfig, TimerState } from '../type/TimerConfig'

interface iTimer extends TimerConfig, TimerState {
    start(): never;
    suspend(): never;

    onExpire(handler: Function): never;
}

export default iTimer;
