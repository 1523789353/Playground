Object.defineProperty(Object.prototype, 'clone', {
    get() {
        return (function () {
            let newInstance = Object.create(this);
            let copyQueue = [newInstance];
            while (copyQueue.length > 0) {
                let attr = copyQueue.shift();
                for (let key of Object.getOwnPropertyNames(attr)) {
                    let value = attr[key];
                    if (value && typeof value === 'object') {
                        attr[key] = Object.create(value);
                        copyQueue.push(attr[key]);
                    }
                }
            }
        })
    }
})