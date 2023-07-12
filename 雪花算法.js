/**
 * 雪花算法, 生成UUID
 */
class SnowFlake {
    get #timestamp() {
        return (new Date).getTime();
    }
    #head = '0';
    get #bitTime() {
        return this.#timestamp.toString('2').padStart(41, 0);
    }
    #datacenterId = '00001';
    #workerId = '00001';
    #last = {
        timestamp: 0,
        SN: 0,
    }
    get #bitSN() {
        return this.#last.SN.toString(2).padStart(12, 0);
    }
    get #bitCode() {
        return this.#head + this.#bitTime + this.#datacenterId + this.#workerId + this.#bitSN;
    }
    get next() {
        // 检查时间戳
        if (this.#last.timestamp == this.#timestamp) {
            // 相同时间, 增加序号
            this.#last.SN++;
            // 序号达到上限
            if (this.#last.SN >= 4096) {
                // 阻塞等待
                while (this.#last.timestamp == this.#timestamp);
                // 返回下一时间的GUID
                return this.next;
            }
        } else {
            // 不同时间, 重置序号
            this.#last = {
                timestamp: this.#timestamp,
                SN: 0
            }
        }
        // 返回UUID
        return parseInt(this.#bitCode, 2).toString(16);
    }
    #checkType(obj, type) {
        let reg = new RegExp(`[object ${type}]`)
        return !!Object.prototype.toString.apply(obj).match(reg)
    }
    #getBin(num) {
        if (this.#checkType(num, 'String') && !!num.match(/^[01]{5}$/)) {
            return num;
        } else {
            throw new Error('invalid bin')
        }
    }
    get datacenterId() {
        return this.#datacenterId;
    }
    set datacenterId(bin) {
        this.#datacenterId = this.#getBin(bin);
    }
    get workerId() {
        return this.#workerId;
    }
    set workerId(bin) {
        this.#workerId = this.#getBin(bin);
    }
}
