/**
 * 跨域import
 * @param {String} src 需要导入的模块链接. 
 * @returns {Promise} 返回一个Promise对象, 当模块导入完成时, 返回一个Module对象.
 */
function GM_import(src) {
    return new Promise((resolve, reject) => {
        // 获取方法名
        let name = arguments.callee.name
        // 获取本地缓存
        let cache = GM_getValue(name + '_cache_' + src)
        // 工具函数
        let is_nil = obj => obj === null || obj === undefined || obj?.length === 0
        // 尝试import并返回module
        let try_import = module => {
            // 检查script合法性
            if (!is_nil(module)) {
                // 创建blob链接, 阻止跨域
                let blobObj = new Blob([module], { type: 'text/javascript; charset=utf-8' }),
                    blobUrl = URL.createObjectURL(blobObj)
                // 尝试导入
                import(blobUrl).then(result => {
                    // 成功时返回module
                    resolve(result)
                    // 将导入成功的, 更新的script写入缓存
                    if (module != cache) {
                        GM_setValue(name + '_cache_' + src, module)
                        console.warn(`[${name}]: ${src}已更新, 将在下次启用`)
                    }
                }).catch(() => {
                    console.error(`[${name}]: 导入${src}时出错`)
                }).finally(() => {
                    // 销毁blob链接
                    URL.revokeObjectURL(blobUrl)
                })
            }
        }
        // 优先导入本地缓存
        try_import(cache)
        // 请求远程脚本
        GM_xmlhttpRequest({
            method: "GET",
            url: src,
            onload(res) {
                if (res.status == 200) {
                    // 导入远程脚本
                    try_import(res.responseText)
                }
                reject(res)
            },
            onerror: res => reject(res)
        })
    })
}

/**
 * 跨域执行脚本
 * @param {String} src 需要执行的脚本链接. 
 * @returns {Promise} 返回一个Promise对象, 当脚本执行完成时, 返回脚本的返回值.
 */
function GM_require(src) {
    return new Promise((resolve, reject) => {
        // 获取方法名
        let name = arguments.callee.name
        // 获取本地缓存
        let cache = GM_getValue(name + '_cache_' + src)
        // 工具函数
        let is_nil = obj => obj === null || obj === undefined || obj?.length === 0
        // 尝试执行并返回结果
        let try_eval = script => {
            // 检查script合法性
            if (!is_nil(script)) {
                try {
                    // 尝试导入
                    let result = eval(script)
                    resolve(result)
                    // 将导入成功的, 更新的script写入缓存
                    if (script != cache) {
                        GM_setValue(name + '_cache_' + src, script)
                        console.warn(`[${name}]: ${src}已更新, 将在下次启用`)
                    }
                } catch (e) {
                    console.error(`[${name}]: 导入${src}时出错`)
                }
            }
        }
        // 优先导入本地缓存
        try_eval(cache)
        // 请求远程脚本
        GM_xmlhttpRequest({
            method: "GET",
            url: src,
            onload(res) {
                if (res.status == 200) {
                    // 导入远程脚本
                    try_eval(res.responseText)
                }
                reject(res)
            },
            onerror: res => reject(res)
        })
    })
}