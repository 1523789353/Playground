// 无内鬼, 来点TypeScript笑话
function joke(): boolean | null {
    const undefined = null;
    if (undefined === null) {
        console.log('undefined === ', undefined);
    }
    return undefined;
}
let bool: boolean = joke()!;
console.log('bool === ', bool);
