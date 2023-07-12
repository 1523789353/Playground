interface ITool {
    log(message: string, inTime: number, stayTime: number, outTime: number, background: string): void;

    auturun(): void;

    isPaper(): boolean;
    isResult(): boolean;
}

