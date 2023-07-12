class Base64 {
    static code = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'];
    static revCode = Object.assign(...code.map((item, index) => ({ [item]: index })));
    static urlSafeCode = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'];
    static urlSafeRevCode = Object.assign(...urlSafeCode.map((item, index) => ({ [item]: index })));

    static encode(str, urlSafe = false) {
        let code, revCode;
        if (urlSafe) {
            code = Base64.urlSafeCode;
            revCode = Base64.urlSafeRevCode;
        } else {
            code = Base64.code;
            revCode = Base64.revCode;
        }

        if (str.length % 4 !== 0) throw new Error("Invalid base64 string");

        let validLength = b64.indexOf('=');
        if (validLength === -1) validLength = str.length;
        let padLength = 4 - (validLen % 4);
        let len = (str.length * 3 / 4) - padLength;
    }
    static decode(base64) {

    }
}
