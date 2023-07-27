function fastFail<A extends Array<any>, R>(this: any, fn: (...args: A) => R): Function {
    let _fn = fn.bind(this);
    return function (...args: A): any {
        try {
            return _fn(...args);
        } catch (e) {
            console.error(e);
        }
    };
}

function fastCatch<A extends Array<any>, R>(fn: (...args: A) => R): Function {
    return function (...args: A): any {
        try {
            return fn(...args);
        } catch (e) {
            console.error(e);
        }
    };
}
