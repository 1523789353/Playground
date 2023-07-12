/**
 * 类型不匹配异常
 */
class TypeMissmatchException extends Error {
    name = 'TypeMissmatchException'
    type = null
    target = null

    constructor(type, target) {
        super(`${type.toString()} is not match ${this.type2string(target)}`);
        this.type = type;
        this.target = target;
    }
}

/**
 * 找不到class异常
 */
class ClassNotFoundException extends Error {
    name = 'ClassNotFoundException'
    className = null

    constructor(className) {
        super(`Cannot find class "${className}"`);
        this.className = className;
    }
}

class ArgumentsError extends Error {
    name = 'ArgumentsError'
}


/**
 * Type.js 类型检查
 * @version 1.0.0
 * @author 皇家养猪场
 * @license MIT
 *
 * TypeMissmatchException
 *
 */
class Type {
    static extend = {
        any: Object.assign(Symbol('any'), {
            matchs: (obj) => true,
        }),
        never: Object.assign(Symbol('never'), {
            matchs: (obj) => obj === undefined || obj === null,
        }),
        class: Object.assign(Symbol('class'), {
            matchs: (obj) => (obj instanceof Function && obj.toString().trim().startsWith('class')),
        }),
        undefined: Object.assign(Symbol('undefined'), {
            matchs: (obj) => obj === undefined,
        }),
        null: Object.assign(Symbol('null'), {
            matchs: (obj) => obj === null,
        })
    }

    /**
     *
     * @param  {Array<any>} opthons
     */
    constructor(...options) {
        if (options.length == 0) {
            throw new ArgumentsError('Type constructor need at least one argument')
        }
        switch (options) {
            case undefined:
                return Type.extend.undefined
            case null:
                return Type.extend.null
        }
    }

    /**
     *
     * @param {*} obj
     * @returns {boolean} matched or not
     */
    matchs(obj) {
        
    }

    /**
     * @returns {string} TypeName
     */
    toString() {

    }

    /**
     * 类型联合
     * @param  {Array<Type|Function>} types
     * @returns {any extend Type}
     */
    static union(...types) {
        return new TypesOperation(types, TypesOperation.modes.union);
    }

    /**
     * 类型其一
     * @param  {Array<Type|Function>} types
     * @returns {Type}
     */
    static oneOf(...types) {
        return new TypesOperation(types, TypesOperation.modes.oneOf);
    }

    /**
     * 排除key
     * @param  {Type|Function} type
     * @param  {...string} keys
     * @returns {Type}
     */
    static omit(type, ...keys) {
        return new KeysOperation(type, KeysOperation.modes.omit, keys);
    }

    /**
     * 选择key
     * @param {Type|Function} type
     * @param  {...string} keys
     * @returns {Type}
     */
    static pick(type, ...keys) {
        return new KeysOperation(type, KeysOperation.modes.pick, keys);
    }

    /**
     * Find type from global
     * @param {string} typeName
     * @returns {Type} Type object
     * @throws {ClassNotFoundException} Class not found
     */
    static findType(typeName) {
        let type = window[typeName];
        if (!Type.extend.class.matchs(type)) {
            throw new ClassNotFoundException(typeName)
        }
        return type;
    }

    /**
     *
     * @param {string} typeString Type string
     * @param {{[string]: Function}} providedTypes Provided types
     * @returns {Type} Type object
     */
    static parse(typeString, providedTypes = {}) {

    }

    /**
     *
     * @param {Type} typeObject Type object
     * @returns {string} Type string
     */
    static stringify(typeObject) {

    }

    /**
     * Convert object to object description string
     * @param {*} obj Object
     * @returns {string} Object description string
     */
    static descObj(obj) {
        let objType = new Type(obj?.constructor ?? obj)
        let result = new Format('${className}${incetanceData}')
        let attrs = {
            className: objType.toString(),
            incetanceData: ''
        }
        if (Type.extend.class.matchs())
        return result.toString(attrs)
    }
}

/**
 * 类型操作：合并/其一
 */
class TypesOperation extends Type {
    static modes = {
        union: Symbol('union'),
        oneOf: Symbol('oneOf')
    }
    types = []
    mode = TypeOperation.modes.union
    constructor(types, mode) {
        this.types = types
        this.mode = mode
    }
}

/**
 * 键操作：排除/选择
 */
class KeysOperation extends Type {
    static modes = {
        omit: Symbol('omit'),
        pick: Symbol('pick')
    }
    type = null
    mode = KeysOperation.modes.omit
    keys = []
    constructor(type, mode, keys) {
        this.type = type
        this.mode = mode
        this.keys = keys
    }
}

