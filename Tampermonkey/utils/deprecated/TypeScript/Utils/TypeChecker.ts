class TypeMissmatchException extends Error {
    name = 'TypeMissmatchException'
}
class RequiredException extends Error {
    name = 'RequiredException'
}
class TypeChecker {
    static Required<T>(name: string = this.Required('name')): T {
        throw new RequiredException(`${name} is not given`);
    }
    static matchType(obj: any = this.Required('obj'), type: Function = this.Required('type')): boolean {
        return obj?.constructor === type && obj?.__proto__ === type?.prototype;
    }
    static matchNever(obj: any = this.Required('obj')): boolean {
        return obj === undefined || obj === null;
    }
    static matchAny(obj: any = this.Required('obj')): true {
        return true;
    }
    static checkType(...option: [any, Function]): void {
        for (let [obj, type] of option) {
            if (!this.matchType(obj, type)) {
                throw new TypeMissmatchException(`Type missmatch: ${obj?.constructor?.name} is not inctance of ${type?.name}`);
            }
        }
    }
}

export default TypeChecker;
