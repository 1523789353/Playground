/**
 * 获取target的类型
 * @param {...any} target 对象
 * @returns {string} 类型名称
 */
function getType(target) {
    return Object.prototype.toString.call(target)
        .replace(/\[object (\w+)\]/g, '$1')
        .toLowerCase()
}

/**
 * 判断obj是否为空
 * @param {object} obj
 * @returns {boolean} 是否为空
 */
function isNil(obj) {
    return obj === null || obj === undefined || obj?.length === 0
}