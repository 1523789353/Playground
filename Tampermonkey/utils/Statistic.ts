class SortedArray<T> extends Array<T> {
    private compareFn?: (a: T, b: T) => number;
    constructor(compareFn?: (a: T, b: T) => number) {
        super();
        this.compareFn = compareFn;
    }
    push(...items: Array<T>): number {
        if (this.compareFn === undefined) {
            return super.push(...items);
        }
        for (let item of items) {
            let index = this.findIndex((value) => (this.compareFn as Function)(value, item) > 0);
            if (index === -1) {
                super.push(item);
            } else {
                super.splice(index, 0, item);
            }
        }
        return this.length;
    }
}


class StatisticRecord {
    start_timestamp: number;
    stop_timestamp: number;
    timeSpent: number;
    constructor(start_timestamp: number, stop_timestamp: number) {
        this.start_timestamp = start_timestamp;
        this.stop_timestamp = stop_timestamp;
        this.timeSpent = stop_timestamp - start_timestamp;
    }
};


class Statistician {
    record = {
        raw: new Array<StatisticRecord>(),
        sortByTimestamp: new SortedArray<StatisticRecord>((a, b) => a.timestamp - b.timestamp),
        sortByTimeSpent: new SortedArray<StatisticRecord>((a, b) => a.timeSpent - b.timeSpent)
    }
    constructor() {

    }
    addRecord(record: StatisticRecord) {
        this.record.raw.push(record);
        this.record.sortByTimestamp.push(record);
        this.record.sortByTimeSpent.push(record);
    }
    get average() {
        let sum = 0;
        for (let i = 0; i < this.record.length; i++) {
            sum += this.record[i].timeSpent;
        }
        return sum / this.record.length;
    }
    get onePercentLow() {
        return this.record[Math.floor(this.record.length * 0.01)];
    }
}
