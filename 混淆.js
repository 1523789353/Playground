//去除某混淆
var exp = /\}\((.*?),\d+,\d+,(.*?),0,{}\)\)$/g,
    [base, value] = (i => [i[0].substring(1, i[0].length - 1), i[1].substring(1, i[1].length - 12)])(eval(data.match(exp)[0].replace(exp, '[`$1`,`$2`]'))),
    arr = value.split('|'),
    map = Object.assign(...[[10, 48], [26, 97]].map(a => Array(a[0]).fill(1).map((_, b) => String.fromCharCode(a[1] + b))).flat().map((a, b) => ({ [a]: b })))
base.replace(/\b\w+\b/g, a => map[a] > arr.length ? a : (arr[map[a]].length == 0 ? a : arr[map[a]]))



//模拟某混淆
var code = ``
//收集关键词
var keywords = Array.from(new Set(code.match(/\b\w+\b/g)))
//打乱
for (let i in keywords) {
    let rand = parseInt(Math.random() * keywords.length), tmp = keywords[i]
    keywords[i] = keywords[rand]
    keywords[rand] = tmp
}
//输出完整代码
console.log(`new Function((a => atob("${btoa(code.replace(/\b\w+\b/g, i => keywords.indexOf(i).toString(36)))
    }").replace(/\\b\\w+\\b/g, i => a[parseInt(i, 36)]))(atob("${btoa(keywords.join('|'))
    }").split("|")))()`)



var num2char = [[10, 48], [26, 97], [26, 65]].map(a => Array(a[0]).fill(0).map((_, b) => String.fromCharCode(a[1] + b))).reduce((a, b) => a.concat(b)),
    char2num = Object.assign(...num2char.map((a, b) => ({ [a]: b }))),
    en62 = (value, retcode = value ? '' : '0') => value ? en62(parseInt(value / 62), num2char[value % 62] + retcode) : retcode,
    de62 = (value, retcode = 0) => value ? de62(value.substring(1), retcode * 62 + char2num[value[0]]) : retcode;
