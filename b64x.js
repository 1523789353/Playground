function be4(str) {
    var arr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
    tmp = '',
    res = '',
    n2c = String.fromCharCode; //num2char
    for (let i = 0; i < str.length;) {
        let a = arr.indexOf(str.charAt(i++)),
        b = arr.indexOf(str.charAt(i++)),
        c = arr.indexOf(str.charAt(i++)),
        d = arr.indexOf(str.charAt(i++));
        tmp += n2c((a << 2) | (b >> 4));
        if (c != 64) tmp += n2c(((b & 15) << 4) | (c >> 2))
        if (d != 64) tmp += n2c(((c & 3) << 6) | d)
    }
    for (let i = 0; i < tmp.length;) {
        let a = tmp.charCodeAt(i++);
        if (a < 128) {
            res += n2c(a);
            continue;
        }
        let b = tmp.charCodeAt(i++) & 63;
        if (a > 191 && a < 224) {
            res += n2c( ((a & 31) << 6) | b );
            continue;
        }
        let c = tmp.charCodeAt(i++) & 63;
        res += n2c( ((a & 15) << 12) | (b << 6) | c );
    }
    return res;
}
//3  => 0x00000011
//15 => 0x00001111
//63 => 0x00111111


