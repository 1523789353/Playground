class Type {
    static typeEnum = ['undefined', 'null', 'boolean', 'number', 'string', 'function', 'array', 'date', 'regExp', 'object', 'error']
    get class2type() {
        return {
            '[object Undefined]': 'undefined',
            '[object Null]': 'null',
            '[object Boolean]': 'boolean',
            '[object Number]': 'number',
            '[object String]': 'string',
            '[object Function]': 'function',
            '[object Array]': 'array',
            '[object Date]': 'date',
            '[object RegExp]': 'regExp',
            '[object Object]': 'object',
            '[object Error]': 'error'
        }
    }
    static getType(obj) {
        var classname = Object.prototype.toString.call(obj)
        return this.#class2type[classname] ?? this.typeEnum.object
    }
}

class Methods {
    #methods = {}
    #compareArray(arr1, arr2) {
        if (Array.isArray(arr1) && Array.isArray(arr2)) {
            return (arr1.length == arr2.length) && arr1.every((o, i) => o === arr2[i])
        } else {
            throw new TypeError(`Failed to compare array: Invalid Array`)
        }
    }
    register(name, fn, ...argTypes) {
        if (Type.getType(fn) != 'function') {
            throw new TypeError(`Failed to register '${name}': Invalid function`)
        }
        if (fn.length > argTypes.length) {
            throw new TypeError(`Failed to register '${name}': at least ${fn.length} argument required, but only ${argTypes.length} present.`);
        }
        if (Array.isArray(this.#methods[name])) {
            for (let i in this.#methods) {
                if (this.#compareArray(this.#methods[name][i].argTypes, argTypes)) {
                    // 去除参数相同项
                    this.#methods[name].splice(i, 1);
                    break;
                }
            }
            this.#methods[name].push({ fn, argTypes });
        } else {
            this.#methods[name] = [{ fn, argTypes }];
        }
    }
    invoke(name, ...args) {
        if (Array.isArray(this.#methods[name])) {
            for (let i in this.#methods[name]) {
                if (this.#compareArray(this.#methods[name][i].argTypes, args.map(a => Type.getType(a)))) {
                    return this.#methods[name][i].fn(...args);
                }
            }
            throw new ReferenceError(`Failed to invoke ${name}: arguments miss match: [${args.map(a => Type.getType(a))}].`);
        } else {
            throw new ReferenceError(`Failed to invoke ${name}: ${name} is not defined`);
        }
    }
    delete(name, ...argTypes) {
        if (Array.isArray(this.#methods[name])) {
            for (let i in this.#methods[name]) {
                if (this.#compareArray(this.#methods[name][i].argTypes, argTypes)) {
                    if (this.#methods[name].length == 1) {
                        delete this.#methods[name];
                    } else {
                        this.#methods[name].splice(i, 1);
                    }
                    return;
                }
            }
            throw new ReferenceError(`Failed to delete ${name}: arguments miss match: [${argTypes}].`);
        } else {
            console.warn(`Failed to delete ${name}: ${name} is not defined`);
        }
    }
}
class UrlBase {
    #methods = new Methods()
    #init() {
        this.#methods.register('constructor', () => {
            console.log('测试')
        })
    }
    constructor() {
        this.#init();
        this.#methods.invoke('constructor', ...arguments);
    }
    toString() {

    }
}