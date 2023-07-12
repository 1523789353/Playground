/**
 * 跨域异步请求
 * @param {Object} config 请求配置
 * @returns {Promise} 返回一个Promise对象, 当请求完成时, 返回一个响应体对象.
 */
function GM_request(config) {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            ...config,
            onload: res => res.status == 200 ? resolve(res) : reject(res),
            onerror: res => reject(res)
        })
    })
}

/**
 * 跨域import
 * @param {String} src 需要导入的模块链接. 
 * @returns {Promise} 返回一个Promise对象, 当模块导入完成时, 返回一个Module对象.
 */
function GM_import(src) {
    return GM_request({
        method: "GET",
        url: src
    }).then(res => {
        // 创建blob链接, 阻止跨域
        let blobObj = new Blob([res.responseText], { type: 'text/javascript; charset=utf-8' }),
            blobUrl = URL.createObjectURL(blobObj),
            // 尝试导入
            result = import(blobUrl)
        // 销毁blob链接
        URL.revokeObjectURL(blobUrl)
        return result
    })
}

/**
 * 跨域执行脚本(应该不需要吧? 在脚本声明中写@require src一样能导入)
 * @param {String} src 需要执行的脚本链接. 
 * @returns {Promise} 返回一个Promise对象, 当脚本执行完成时, 返回脚本的返回值.
 */
function GM_require(src) {
    return GM_request({
        method: "GET",
        url: src
    }).then(res => eval(res.responseText))
}
