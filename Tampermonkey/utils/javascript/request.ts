class RequestConfig {
    method: string;
    url: string | URL;
    params?: { [key: string]: string } = {};
    headers?: { [key: string]: string } = {};
    data?: any = null;
    async?: boolean = true;
}

class Response<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: any;
    config: RequestConfig;
    request?: any;
}

export async function request(config: RequestConfig) {
    function handler(resolve, reject) {
        let xhr = new XMLHttpRequest()
        config.url = new URL(config.url.toString())

        let params = new URLSearchParams(config.url.search)
        for (let key in config.params) {
            params.set(key, config.params[key])
        }
        config.url.search = params.toString()

        xhr.open(config.method, config.url.toString(), config.async as boolean)
        for (let key in config.headers) {
            xhr.setRequestHeader(key, config.headers[key])
        }
        xhr.send(config.data)
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(xhr.responseText)
                } else {
                    reject(xhr.statusText)
                }
            }
        }
    }
    return new Promise(handler)
}

export default {
    request
}
