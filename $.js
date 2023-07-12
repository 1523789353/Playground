function* range(...args) {
    if (args.length == 0 || args.length > 3)
        throw new TypeError("illegal arguments");
    let [start, step, stop] = [
        args.length == 1 ? 0 : args[0],
        args.length == 3 ? args[2] : 1,
        args.length == 1 ? args[0] : args[1]
    ]
    for (let i = start; i < stop; i += step)
        yield i;
}

for (let i of range(0, 100, 2))
    console.log(i);


let allAns = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
let conList = document.querySelectorAll('div[id^=con]')
let map = Array(9).fill().map(() => Array(9).fill())
map.block = Array(9).fill().map(() => new Set())
map.put = (function (x, y, val) {
    map[x][y] = val
    let b = getBlock(x, y)
    map.block[b].add(val)
})
function getBlock(x, y) {
    return parseInt(y / 3) * 3 + parseInt(x / 3)
}
for (let elem of conList) {
    if (elem.className == 'fix') {
        let [y, x] = elem.id.match(/\d+/g)[0],
            val = elem.innerHTML
        map.put(x, y, val)
    }
}
map.print = (function () {
    let str = ''
    for (let y of range(9)) {
        for (let x of range(9)) {
            str += map[x][y] ?? ' '
        }
        str += '\n'
    }
    console.log(str)
})
map.check = (function () {
    for (let y of range(9)) {
        let col = map.map(i => i[y]),
            row = map[x],
            block = map.block[getBlock(x, y)]
        for (let x of range(9)) {
            if (map[x][y] !== undefined) {
                continue
            }
            let exist = Array.from(new Set([...col, ...row, ...Array.from(block)]))
            let left = allAns.filter(i => !exist.includes(i))
            if (left.length == 1) {
                map.put(x, y, left[0])
            }
            for (let val of left) {

            }
        }
    }
    this.print()
})



function $(selector, startNode) {
    class $ extends Array {
        constructor(...args) {
            this.concat(...args)
        }

        children() {
            var result = [];
            this.forEach((i) => result.push(...i.children));
            return new Elements(result);
        }

        attr(key, value) {
            if (value) {
                this.forEach((i) => i.setAttribute(key, value));
                return this;
            } else {
                if (this.length > 0) {
                    var attr = this[0].getAttribute(key);
                    return attr ? attr.value : undefined;
                }
            }
        }

        on(name, callback) {

        }

        text() {
            if (this.length > 0) {
                return this[0].innerText;
            }
        }
    }
    var result;
    try {
        if (startNode) {
            result = new $([...window.document.querySelectorAll.apply(window.document, arguments)])
        } else {
            result = new $([...window.document.querySelectorAll(selector)])
        }
    } catch (e) {
        if (selector instanceof HTMLElement) {
            result = new $([selector]);
        } else if (e instanceof DOMException) {
            console.warn(`${selector} not a illegal selector`)
            result = new $();
        }
    }
    return result;
}

window.$ = new Proxy((
    class $ extends Array {
        constructor(...args) {
            this.concat(...args)
        }

        children() {
            var result = [];
            this.forEach((i) => result.push(...i.children));
            return new Elements(result);
        }

        attr(key, value) {
            if (value) {
                this.forEach((i) => i.setAttribute(key, value));
                return this;
            } else {
                if (this.length > 0) {
                    var attr = this[0].getAttribute(key);
                    return attr ? attr.value : undefined;
                }
            }
        }

        on(name, callback) {

        }

        text() {
            if (this.length > 0) {
                return this[0].innerText;
            }
        }
    }
), {
    apply(target, context, args) {
        // 执行

        return
    },
    construct(target, args) {
        // 构造
        return Reflect.construct(target, ...args)
    }
})
