function inspect<T extends Function>(func: T): T {
    let proxy = new Proxy(func, {
        apply(target, thisArg, args) {
            console.debug(`[Inspect]: Calling "${target.name}" with args [${Array.from(args).join(', ')}]`);
            return Reflect.apply(target, thisArg, args);
        }
    });
    return proxy;
}
