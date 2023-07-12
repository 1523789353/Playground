class TypeMissmatchException extends Error {
    name = 'TypeMissmatchException'
}
class RequiredException extends Error {
    name = 'RequiredException'
}

/**
 * 类型检查器，暂不支持Omit/Pick/Partial等复合类型
 */
class Type {
    // TypeScript预设类型以及特殊类型
    static any = Symbol('any')
    static never = Symbol('never')
    static class = Symbol('class')
    static undefined = Symbol('undefined')
    static null = Symbol('null')

    /**
     * 不想理你并向你抛出一个异常 (╯>д<)╯
     * @param {string} name 必要参数的参数名
     * @usage function (arg1 = Type.Required('arg1')) {...}
     */
    static Required(name = Type.Required('name')) {
        throw new RequiredException(`${name} is not given`);
    }

    /**
     * 匹配对象的class
     * @param {*} obj 对象
     * @param {Function} type 类型
     * @returns {boolean} 类型是否匹配
     */
    static match(obj, type = Type.Required('type')) {
        switch (type) {
            case Type.any:
                return true;
            case Type.never:
                return obj === undefined || obj === null;
            case Type.class:
                return obj?.prototype !== undefined && this.match(obj, Function);
            case Type.undefined:
                return obj === undefined;
            case Type.null:
                return obj === this.null;
            default:
                // 过滤Function，防止无限递归；type非class类型，则抛出异常
                if (type !== Function && obj?.prototype !== undefined) {
                    let typeString;
                    // 字符串转义所有双引号，左右加双引号
                    if (this.match(type, String)) {
                        typeString = `"${type.replaceAll(/"/g, '\\"')}"`;
                    } else {
                        typeString = this.type2string(type);
                    }
                    throw new TypeMissmatchException(`${typeString} is not a class`);
                }
                return obj?.constructor === type && obj?.__proto__ === type?.prototype;
        }
    }

    /**
     * 检查对象类型，不匹配则抛出异常
     * @param {...[obj, ...types]} option [obj, ...types]数组
     * @throws {TypeMissmatchException} 类型不匹配异常
     * @usage Type.checkType([1, Number], [true, Boolean, String], ["", Function, Object])
     */
    static check(...option) {
        matchAll:
        for (let [obj, ...types] of option) {
            for (let type of types) {
                if (this.match(obj, type)) {
                    continue matchAll;
                }
            }
            let typeNames = types.map(type => this.type2string(type)).join(' or ');
            throw new TypeMissmatchException(`${Type.obj2string(obj)} is not inctance of ${typeNames}`);
        }
    }

    /**
     * 类型 转 类型名称
     * @param {*} type 类型
     * @returns {string} 类型名称
     */
    static type2string(type) {
        switch (type) {
            case Type.any:
                return 'any';
            case Type.never:
                return 'never';
            case Type.class:
                return 'class';
            case Type.undefined:
                return 'undefined';
            case Type.null:
                return 'null';
            default:
                // type必须为class类型
                this.check([type, Type.class]);
                return type?.name ?? type?.toString();
        }
    }

    /**
     * 对象转字符串的实现
     * @param {*} obj 对象
     * @returns 对象描述字符串
     */
    static obj2string(obj) {
        if (obj === undefined) return 'undefined';
        if (obj === null) return 'null';
        if (Type.match(obj, Type.class)) return `class(${obj.constructor.name})`;
        return `${obj?.constructor?.name}(${JSON.stringify(obj)})`;
    }
}
