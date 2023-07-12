function toUnicode(str) {
    const escapeArr = ['.', '~', '\\', '/']; // 需要转义的字符
    const charArr = [...str]; // 字符数组
    for (let index in charArr) {
        // 属于需要转义的字符
        if (escapeArr.includes(charArr[index])) {
            // 转义
            let charDec = str.charCodeAt(index); // 字符ASCLL
            let charHex = charDec.toString(16); // 16进制ASCLL
            let padding = '0'.repeat(4 - charHex); // 4位补充
            let unicode = `\\u${padding}${charHex}`;
            charArr[index] = unicode;
        }
    }
    return charArr.join('');
}

