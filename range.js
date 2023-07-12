/** 仿Python range枚举器, 写着玩的 :) */
function* range(...opts) {
    let [start, stop, step] = [
        [0, opts[0], 1],
        [opts[0], opts[1], 1],
        [opts[0], opts[1], opts[2]]
    ][opts.length - 1] ?? {
        get [Symbol.iterator]() {
            throw new Error('expects 1~3 arguments, bug got ' + opts.length);
        }
    };
    for (let i = start; stop < 0 ? i > stop : i < stop; i += step)
        yield i;
}
