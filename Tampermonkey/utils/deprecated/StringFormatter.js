// 字符串格式化类
class Format {
    template = ''

    constructor(template = '') {
        this.template = template
    }

    toString(values = {}) {
        function replacer(key) {
            let result = values[key.substr(2, key.length - 3)]
            return result === undefined ? key : result
        }
        return this.template.replaceAll(/\$\{.*?\}/g, replacer)
    }
}
export default Format
