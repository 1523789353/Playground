interface iTimer {
    start(): void;
    stop(): void;
    reset(): void;
}

interface iTimeout extends iTimer {
    timeout: number;
}

interface iInterval extends iTimer {
    interval: number;
}

interface iTimeline extends iTimer {
    timeline: Array<number>;
    loop: boolean;
}


