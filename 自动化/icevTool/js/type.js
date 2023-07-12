class TypeUtils {
    static nativeClasses = Object.freeze([
        undefined,
        null,
        Object,
        Array,
        Boolean,
        Number,
        Date,
        Error,
        Function,
        String,
        RegExp,
        Map,
        WeakMap
    ])

    /**
     * 检查对象是否是类型
     * @param {*} type
     * @returns {boolean}
     */
    static isClass(type) {
        return Type.nativeClasses.includes(type) || (
            Type.instanceOf(type, Function) &&
            type?.prototype?.constructor === type
        );
    }

    /**
     * 获取对象类型
     * @param {*} object
     * @returns {Function|undefined}
     */
    static typeOf(object) {
        return Object.getPrototypeOf(object)?.constructor;
    }

    /**
     * 检查对象是否是指定类型实例
     * @param {*} object
     * @param {Function} type
     * @returns {boolean}
     */
    static instanceOf(object, type) {
        if (!Type.isClass(type)) {
            throw new TypeError("Type expected, but got:\n", type);
        }
        if (Object.getOwnPropertySymbols(object).includes(Symbol.species)) {
            return Reflect.get(object, Symbol.species) === type;
        }
        return Type.typeOf(object) === type && Object.getPrototypeOf(object) === type?.prototype;
    }

    /**
     * 检查对象/类型是否继承于指定类型
     * @param {*} object
     * @param {Function} type
     * @returns {boolean}
     */
    static extendsFrom(object = null, type) {
        for (let proto = Object.getPrototypeOf(object); proto !== null; proto = Object.getPrototypeOf(proto)) {
            if (proto?.constructor === type) {
                return true;
            }
        }
        return false;
    }
}

/**
 * 类型处理类
 */
class Type extends TypeUtils {
    static #assertType(...types) {
        for (let type of types) {
            if (!Type.instanceOf(type, Type)) {
                throw new TypeError("Class expected, but got:\n", type);
            }
        }
    }

    /**
     * @typedef {{[key: string]: Function | Type | Array<Function | Type>}} TypeMap
     * @param {TypeMap} typeMap
     */
    constructor(typeMap) {
        for (let key in typeMap) {
            let value = typeMap[key];
            if (Type.isClass(value)) {
                this[key] = value;
            } else {
                throw new TypeError("Class expected, but got:\n", value);
            }
        }
    }

    /**
     * or运算符, 保留所有属性, 有冲突的属性二者都能取
     * @param {Type} typeA
     * @param {Type} typeB
     * @returns
     */
    ['|'](typeA, typeB) {
        let result = new Type({});
        for (let key in typeA) {
            result[key] = typeA[key];
        }
        for (let key in typeB) {
            if (key in result) {
                result[key];
            } else {
                result[key] = typeB[key];
            }
        }
        return result;
    }

    /**
     * and运算符, 只保留共有且一致的属性
     * @param {Type} typeA
     * @param {Type} typeB
     * @returns
     */
    ['&'](typeA, typeB) {
        let result = new Type({});
        for (let key in typeA) {
            if (key in typeB && typeA[key] === typeB[key]) {
                result[key] = typeA[key];
            }
        }
        return result;
    }

    omit(type, ...keys) {
        Type.#assertType(type);
        let result = new Type({});
        for (let key in type) {
            if (!keys.includes(key)) {
                result[key] = type[key];
            }
        }
        return result;
    }

    pick(type, ...keys) {
        Type.#assertType(type);
        let result = new Type({});
        for (let key of keys) {
            if (key in type) {
                result[key] = type[key];
            }
        }
        return result;
    }
}
