/**
 * URL查询参数类(不支持hash模式)
 */
class Params {
    /**
     * URL查询参数转换为参数对象
     * @param {string} url
     * @returns {ParamObject}
     */
    static parse(url) {
        let params = {};
        let searchStr = url.toString().split('?')[1];
        if (searchStr === undefined) {
            return params;
        }
        let searchArr = searchStr.split('&');
        for (let pair of searchArr) {
            // 分解键值对
            let [key, value] = pair.split('=');
            // URL解码
            value = decodeURIComponent(value);
            // 解析参数数组
            if (key in params) {
                if (Array.isArray(params[key])) {
                    // 已经是数组，直接添加 [old, ..., new]
                    params[key].push(value);
                } else {
                    // 不是数组，转换为数组 old -> [old, new]
                    params[key] = [params[key], value];
                }
            } else {
                params[key] = value;
            }
        }
        // 代理params对象, 获取到undefined时返回空字符串. 缓存结果
        let proxyPrarms = new Proxy(params, {
            get(target, attr) {
                return target[attr] ?? '';
            }
        })
        return proxyPrarms
    }
    /**
     * 参数对象转换为URL查询参数 (*不带问号)
     * @param {ParamObject} params 参数对象
     * @returns
     */
    static stringify(params) {
        let searchStr = '';
        for (let key in params) {
            let value = params[key];
            if (Array.isArray(value)) {
                for (let v of value) {
                    searchStr += `${key}=${encodeURIComponent(v)}&`;
                }
            } else {
                searchStr += `${key}=${encodeURIComponent(value)}&`;
            }
        }
        // 去除最后一个&
        searchStr = searchStr.slice(0, -1);
        return searchStr;
    }
}

// 本页面URL查询参数
let paramsCache = new Proxy(Params.parse(location.search), {
    set(target, attr, value) {
        if (target[attr] === value) return false;
        target[attr] = value;
        location.search = Params.stringify(target);
        return true;
    },
    deleteProperty(target, attr) {
        if (!(attr in target)) return false;
        delete target[attr];
        location.search = Params.stringify(target);
        return true;
    }
})

Object.defineProperty(window.location, 'params', {
    get() {
        return paramsCache;
    },
    /**
     * 赋值时更新URL
     * @param {ParamObject} value
     */
    set(value) {
        if (value === paramsCache) return false;
        location.search = Params.stringify(value);
        return true;
    }
})
