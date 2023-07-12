// Url参数解析
Object.defineProperties(window.location, {
    params: {
        get () {
            let params = {};
            let search = window.location.search;
            if (search) {
                search = search.slice(1);
                search.split('&').forEach((param) => {
                    let [key, value] = param.split('=');
                    value = decodeURIComponent(value);
                    // 多值参数处理
                    if (key in params) {
                        if (Array.isArray(params[key])) {
                            // 如果已经存在数组，直接push
                            params[key].push(value);
                        } else {
                            // 如果不是数组，转换为数组
                            params[key] = [params[key], value];
                        }
                    } else {
                        params[key] = value;
                    }
                });
            }
            return params;
        }
    }
})

// QQ Pc外链解析跳转
if (location.origin == 'https://c.pc.qq.com') {
    location = location.params.pfurl
}
