module.exports.run = () => {
    Date.prototype.toFormattedString = (function (parttern = 'yyyy/MM/dd hh:mm:ss') {
        let replaceRules = {
            yyyy: this.getFullYear(),
            yy: this.getFullYear() % 100,
            MM: this.getMonth() + 1,
            dd: this.getDate(),
            hh: this.getHours(),
            mm: this.getMinutes(),
            ss: this.getSeconds()
        }
        let entrys = Object.keys(replaceRules)
        let reg = new RegExp(`(${entrys.join("|")})`, 'g')
        let result = parttern.replaceAll(reg, i => replaceRules[i])
        return result
    })
    return new Date().toFormattedString('hh:mm:ss')
}
