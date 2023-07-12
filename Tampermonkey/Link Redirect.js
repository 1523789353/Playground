// ==UserScript==
// @name         Link Redirect
// @description  外链跳转, "非官方页面"提示页跳转
// @author       皇家养猪场
// @namespace    皇家养猪场
// @version      0.0.1
// @create       2022-12-03
// @lastmodified 2022-12-03
// @note         首次更新
// @charset      UTF-8
// @match        *://c.pc.qq.com/middlem.html*
// @match        *://c.pc.qq.com/pc.html*
// @match        *://weixin110.qq.com/*
// @match        *://jump.bdimg.com/safecheck/index*
// @match        *://jump2.bdimg.com/safecheck/index*
// @match        *://link.csdn.net/?target*
// @connect      localhost
// @run-at       document-start
// @grant        unsafeWindow
// @compatible   chrome
// @license      MIT
// ==/UserScript==

(function () {
    function unescapeHtml(htmlStr = '') {
        // 稳固函数健壮性
        if (!htmlStr) return null;
        htmlStr = htmlStr.toString();
        if (htmlStr.length == 0) return null;

        return htmlStr.replaceAll(/&#x?(.*?);/g, (full, part1) => String.fromCharCode(parseInt(part1, 16)));
    }

    function setStatus(status = '') {
        status = status.split('\n')
            .map(line => '[Link Redirect] ' + line)
            .join('\n');
        console.warn(status);
        document.title = status;
        document.body.innerHTML = status.replaceAll('\n', '<br />');
    }

    // 备份并清空Dom
    const body = document.body;
    document.body = document.createElement('body');

    setStatus('链接解析中...');

    // Parse Url Param
    let params = new URLSearchParams(location.search);

    function handler() {
        const urlRegex = /^(?:([A-Za-z]+):\/\/)?(?:([^:@\/]+)(?::([^@\/]+))?@)?([^:\/?#]+)(?::(\d+))?(\/[^?#]*)?(?:\?([^#]*))?(?:#(.*))?$/;

        let urlPart = null;
        urlPart ??= body.querySelector('.link')?.innerText; // 贴吧
        urlPart ??= params.get('pfurl'); // QQ
        urlPart ??= params.get('url'); // QQ
        urlPart ??= unescapeHtml(unsafeWindow?.cgiData?.desc); // 微信
        urlPart ??= params.get('target'); // CSDN

        let matches = null;
        if (urlPart) {
            matches = urlRegex.exec(urlPart);
        }
        if (matches) {
            let [_, protocol, username, password, host, port, path, query, hash] = matches;
            let urlBuilder = [];
            urlBuilder.push(protocol ?? 'http');
            urlBuilder.push('://');
            if (username) {
                urlBuilder.push(username);
                if (password) urlBuilder.push(`:${password}`);
                urlBuilder.push('@');
            }
            urlBuilder.push(host);
            if (port) urlBuilder.push(`:${port}`);
            if (path) urlBuilder.push(path);
            if (query) urlBuilder.push(`?${query}`);
            if (hash) urlBuilder.push(`#${hash}`);
            let targetUrl = urlBuilder.join('');

            setStatus(`链接解析成功！正在重定向...\n${targetUrl}`);
            location.replace(targetUrl);
            location = targetUrl;
            return;
        }

        setStatus('链接解析失败, 未进行重定向...');
    }

    window.addEventListener('load', handler);

})();
