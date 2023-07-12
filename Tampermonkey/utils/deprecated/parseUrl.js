/**
 *
 * @param {string} url
 * @returns {
 *      scheme?: string,
 *      user?: string,
 *      pwd?: string,
 *      host?: string,
 *      port?: string,
 *      path?: string,
 *      query?: string,
 *      fragment?: string
 * }
 *
 * Some examples:
 * protocal://user:password@domain:port/path?search#hash
 * protocal://user@domain:port/path?search#hash
 * protocal://domain:port/path?search#hash
 * protocal://domain/path?search#hash
 *
 * 注意: url中的port必须是数字
 */
function parseUrl(url) {
    // ASCLL范围内的保留字符
    // ['\t', '\n', ' ', '!', '"', '#', '$', '%', '&', "'", '(', ')', '*', '+', ',', '/', ':', ';', '<', '=', '>', '?', '@', '\\[', '\\\\', '\\]', '^', '`', '{', '|', '}', '~']
    // 完整保留字符表:
    // ['"', '\'', ',', ';', '<', '>', '?', '\\[', '\\]', '{', '|', '}', '@', '$', '!', '*', '(', ')', '\\/', '~', ':', ' ', '\t', '#', '%', '&', '+', '=', '\\\\', '^', '`', '\n'];

    // path:    "<>`
    const urlReservedChars = [' ', '"', '#', '$', '%', '&', '+', ',', '/', ':', ';', '=', '?', '@', '\\[', '\\\\', '\\]', '^', '`', '{', '|', '}'];
    const urlChars = `[^${urlReservedChars.join('')}]`;

    /**
     * 等效于下面的正则表达式
     * '^((\\w+)://)?((\\w+)(:(\\w+))?@)?([\\w.]+)(:(\\d+))?((/[\\w.]*)*)(\\?(\\w+))?(#(\\w+))?$'
     */
    // let parttern = `
    //     ((${urlChars}+):\\/\\/)?                // scheme 协议
    //     ((${urlChars}+)(:(${urlChars}+))?@)?    // user:pwd@ 用户验证信息
    //     ([${urlChars}.]+)?                      // host 主机
    //     (:(\\d+))?                              // port 端口
    //     ((/${urlChars}*)*)                      // path 路径
    //     (\\?(${urlChars}+))?                    // ?query 查询字符串
    //     (#(${urlChars}+))?                      // #fragment 锚点/hash值
    // `;
    let parttern = `
        ((${urlChars}+):\\/\\/)?                // scheme 协议
        ((${urlChars}+)(:(${urlChars}+))?@)?    // user:pwd@ 用户验证信息
    `
    let urlReg = new RegExp(`^${
        // 去除注释, 并将转义的/恢复
        parttern
            .replace(/^\s*|\s*\/\/.*$\n|\/\*[\s\S]*?\*\//gm, '')
            .replace(/\\\//g, '/')
    }$`, 'g');

    let [, , scheme, , user, , pwd, host, , port, path, , , query, , fragment] = urlReg.exec(url ?? '') ?? [];
    return { scheme, user, pwd, host, port, path, query, fragment };
}
