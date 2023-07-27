/**
 * Tampermonkey API for TypeScript
 * @version 1.0.0
 * @author 皇家养猪场
 * @license MIT
 * @note 每一节不太相同的内容, 都以三个空行分隔
 * @note 使用前需要在脚本声明中添加相应的 `@grant GM_*` 权限声明
 * @note 部分网络/cookie相关函数需要添加相应的 `@connect` / `@require` 权限声明
 *
 * @see https://www.tampermonkey.net/documentation.php#api:GM_addElement 官方文档
 */

/*
 * 全部API:
 * unsafeWindow
 * GM_addElement
 * GM_addStyle
 * GM_download
 * GM_getResourceText
 * GM_getResourceURL
 * GM_info
 * GM_log
 * GM_notification
 * GM_openInTab
 * GM_registerMenuCommand
 * GM_unregisterMenuCommand
 * GM_setClipboard
 * GM_getTab
 * GM_saveTab
 * GM_getTabs
 * GM_setValue
 * GM_getValue
 * GM_deleteValue
 * GM_listValues
 * GM_addValueChangeListener
 * GM_removeValueChangeListener
 * GM_xmlhttpRequest
 * GM_webRequest
 * GM_cookie.list
 * GM_cookie.set
 * GM_cookie.delete
 * window.onurlchange
 * window.close
 * window.focus

 * 需要提前 `@grant` 声明才能使用的函数:
 * window.close
 * window.focus
 * window.onurlchange
 */

/** 标记回调函数 */
declare type Callback<F extends Function> = F;

/** @warning 标记在浏览器测试出来, 但未出现在官方文档的回调 */
declare type UndocumentedCallback<F extends Function> = F;

/** @todo 标记未知回调, 没时间/没法测试的回调 */
declare type UnknowCallback = Function;



/** 油猴代理全局 */
declare const unsafeWindow: Window;



/**
 * 向页面添加新元素, 应用给定的属性, 并返回添加的元素
 * @note 对于多种目的很有用，例如如果页面使用内容安全策略 (CSP) 限制这些元素，则添加script和标记。
 * @beta 此功能是实验性的，API 可能会更改
 *
 * @param parentNode 父节点 *可选*
 * @param tagName 标签名
 * @param attributes 初始化属性
 * @param callback 回调函数 *可选* **试出来的**
 *
 * @returns 添加的元素
 */
declare function GM_addElement
    <K extends keyof HTMLElementTagNameMap>
    (tagName: K, attributes: Partial<HTMLElementTagNameMap[K]>, callback?: UndocumentedCallback<() => void>):
    HTMLElementTagNameMap[K];
declare function GM_addElement
    <K extends keyof HTMLElementTagNameMap>
    (parentNode: HTMLElement, tagName: K, attributes: Partial<HTMLElementTagNameMap[K]>, callback?: UndocumentedCallback<() => void>):
    HTMLElementTagNameMap[K];

/** 添加样式, 并返回注入的样式元素 */
declare function GM_addStyle(css: string, callback?: Callback<() => void>): HTMLStyleElement;



declare type GM_DownloadError = {
    // 错误原因
    error: 'not_enabled ' // 用户未启用下载功能
    | 'not_whitelisted' // 请求的文件扩展名未列入白名单
    | 'not_permitted' // 用户启用了下载功能，但未授予*GM_Download*权限
    | 'not_supported' // 浏览器/版本不支持下载功能
    | 'not_succeeded' //下载未开始或失败，*details*属性可能提供更多信息
    | string, // http错误信息
    details?: Record<any, any>, // 详细信息
};
declare type GM_DownloadConfig = {
    url: string | URL, // 下载地址
    name: string, // 保存的文件名
    headers?: Record<string, string>, // 请求头
    saveAs?: boolean, // 是否弹出另存为对话框
    // 文件存在冲突处理方式
    conflictAction?: 'uniquify' // 自动重命名
    | 'overwrite' // 覆盖
    | 'prompt', // 提示
    onload?: Callback<() => void>, // 下载完成回调
    onerror?: Callback<(event: ProgressEvent & GM_DownloadError) => void>, // 下载失败回调
    onprogress?: Callback<(event: ProgressEvent) => void>, // 下载进度回调
    ontimeout?: Callback<(event: ProgressEvent) => any>, // 下载超时回调
}
/** 终止下载函数 */
declare type GM_DownloadAbort = () => void;
/**
 * 下载文件
 * @param url 下载地址
 * @param name 保存的文件名
 * @returns 终止下载函数
 *
 * @warning 很容易触发not_whitelisted错误
 */
declare function GM_download(url: string | URL, name: string): GM_DownloadAbort;
/**
 * 下载文件
 * @param config 下载配置
 * @returns 终止下载函数
 *
 * @warning 很容易触发not_whitelisted错误
 */
declare function GM_download(config: GM_DownloadConfig): GM_DownloadAbort;



/**
 * 获取'@resource'标签中资源的文本内容
 * 资源缓存出错时返回空字符串, 资源不存在时返回null
 * @example ```TypeScript
 * //@resource res http://example.com/index.html#md5=1234...,sha256=abcd...
 * let resText = GM_getResourceText('res');
 * ```
 */
declare function GM_getResourceText(name: string): string | null;
/**
 * 获取'@resource'标签中资源的URL
 * 资源缓存出错时返回空字符串, 资源不存在时返回null
 * @example ```TypeScript
 * //@resource res http://example.com/index.html#md5=1234...,sha256=abcd...
 * let resUrl = GM_getResourceText('res');
 * ```
 */
declare function GM_getResourceURL(name): string | null;



/** 打印日志到控制台 */
declare function GM_log(...msgs: any): void;



declare type GM_NotificationDetails = {
    text: string, // 通知消息
    title: string, // 通知标题
    image?: string, // 要在通知中显示的图像的 URL
    highlight?: boolean, // 是否突出显示选项卡
    silent?: boolean, // 是否静音
    timeout?: number, // 超时时间
    onclick?: UnknowCallback, // 点击通知时的回调
    ondone?: UnknowCallback, // 通知关闭时的回调
}
/**
 * 在屏幕上显示通知 *不太管用*
 * @param details
 * @param onDone 当通知关闭(无论是超时还是点击)或选项卡突出显示时将调用的回调函数
 */
declare function GM_notification(details: GM_NotificationDetails, onDone?: UnknowCallback): void;
/**
 * 在屏幕上显示通知 *不太管用*
 * @param text 通知消息
 * @param title 通知标题
 * @param image 要在通知中显示的图像的 URL
 * @param onClick 点击通知时的回调 *测试不出来*
 */
declare function GM_notification(text: string, title: string, image: string, onClick?: UnknowCallback): void;



declare type GM_TabState = {
    close: () => void, // 关闭标签页
    onclose: Callback<() => void | null>, // 标签页关闭时的回调
    focus: () => void, // 聚焦标签页
    readonly closed: boolean, // 标签页是否已关闭
    name?: string, // 标签页名称
}
declare type GM_OpenInTabOptions = {
    active?: boolean, // 是否激活标签页, 默认为false
    insert?: number | false, // 插入标签页位置, 默认为false(添加到末尾)
    setParent?: boolean, // 新选项卡是否应被视为当前选项卡的子选项卡, 默认为false
    incognito?: boolean, // 是否在隐身模式下打开, 默认为false
    loadInBackground?: boolean, // 是否在后台加载, 具有与active相反的含义，添加它是为了实现 Greasemonkey 3.x 兼容性
}
/**
 * 新建标签页
 * @param url 标签页地址
 * @param loadInBackground 是否在后台加载
 */
declare function GM_openInTab(url: string | URL, loadInBackground?: boolean): GM_TabState;
/**
 * 新建标签页
 * @param url 标签页地址
 * @param options 选项
 */
declare function GM_openInTab(url: string | URL, options: GM_OpenInTabOptions): GM_TabState;



/**
 * 注册右键菜单
 * @param text 菜单文本
 * @param callback 点击菜单时的回调, 参数为当前标签页索引,
 *                 从 Tampermonkey 4.14 开始, 参数为 MouseEvent 或 KeyboardEvent 对象
 * @param hotkey 快捷键  如果快捷键是“s​​”，则当菜单打开时，可以通过按"s"来选择菜单项
 * @returns 菜单ID, 可用于取消注册
 */
declare function GM_registerMenuCommand(text: string, callback: Callback<(tabIndex: number) => void>, hotkey?: string): number;
/**
 * 取消注册右键菜单
 * @param id 菜单ID
 */
declare function GM_unregisterMenuCommand(id: number): void;



declare type GM_SetClipboardInfo = {
    type: string,
    mimetype: string
}
/**
 * 设置剪贴板内容
 * @param data 剪贴板文本的字符串
 * @param info 可以只是一个表示类型的字符串 像`text`或`html`; 或是一个类型描述对象
 * @param callback 成功回调 **试出来的**
 */
declare function GM_setClipboard(data: string, info: string | GM_SetClipboardInfo, callback?: UndocumentedCallback<() => void>): void;



declare type GM_TabInfo = Record<string, any>;
/**
 * 新建选项卡回调
 * @param callback 回调函数, 参数为新建的选项卡信息对象
 */
declare function GM_getTab(callback: Callback<(tabInfo: GM_TabInfo) => void>): void;
/**
 * 保存选项卡信息, 以供后续使用
 * @param tabInfo 选项卡信息对象
 */
declare function GM_saveTab(tabInfo: GM_TabInfo): void;
declare type GM_TabMap = Array<{ [tabId: number]: GM_TabInfo }>
declare function GM_getTabs(callback: Callback<(tabMap: GM_TabMap) => void>): void;



/**
 * 设置指定键的值
 * @param keyName 键
 * @param value 值
 * @note 若值为对象, 则请确保对象没有循环引用
 */
declare function GM_setValue(keyName: string, value: any): void;
/**
 * 获取指定键的值
 * @param keyName 键
 * @param defaultValue 默认值 *可选*
 * @returns 值 *找不到且无默认值时为undefined*
 */
declare function GM_getValue(keyName: string): any | undefined;
declare function GM_getValue(keyName: string, defaultValue: any): any;
/** 列出所有键 */
declare function GM_listValues(): Array<string>;
/** 删除指定键的值 */
declare function GM_deleteValue(keyName: string): void;
/**
 * 键值监听器
 * @param keyName 键名
 * @param oldValue 旧值
 * @param newValue 新值
 * @param remote 是否为远程更改
 */
declare type GM_ValueChangeHandler = <T>(keyName: string, oldValue: T, newValue: T, remote: boolean) => void;
/**
 * 添加监听器
 * @param keyName 键名
 * @param handler 监听器
 * @returns 监听器ID, 可用于取消监听
 */
declare function GM_addValueChangeListener(keyName: string, listener: GM_ValueChangeHandler): number;
/** 删除监听器 */
declare function GM_removeValueChangeListener(listenerId: number): void;



/** @note 不支持synchronous flag */
declare type GM_XHRConfig = {
    method?: 'GET' | 'POST' | 'HEAD', // 请求方法
    url: string | URL, // 请求地址
    headers?: Record<string, string>, // 请求头
    data?: string, // 请求体
    redirect?: 'follow' | 'error' | 'manual', // 重定向方式
    cookie?: string, // 请求时附带的cookie
    binary?: boolean, // 是否返回二进制数据
    nocache?: boolean, // 是否禁用缓存
    revalidate?: boolean, // 是否重新验证缓存
    timeout?: number, // 超时时间(单位ms)
    context?: any, // 上下文
    responseType?: 'arraybuffer' | 'blob' | 'json' | 'text', // 响应类型
    overrideMimeType?: string, // 重写响应类型
    anonymous?: boolean, // 是否匿名
    fetch?: boolean, // 使用fetch而不是XHR, 会使details.timeout和xhr.onprogress不起作用, 并且会使xhr.onreadystatechange只接收readyState == 4 (DONE)事件
    user?: string, // 用户名
    password?: string, // 密码
    onabort?: Callback<() => void>, // 请求中止回调
    onerror?: Callback<(event: ProgressEvent) => any>, // 请求失败回调
    onloadstart?: Callback<(event: ProgressEvent) => any>, // 请求开始回调
    onprogress?: Callback<(event: ProgressEvent) => any>, // 请求进度回调
    onreadystatechange?: Callback<(event: ProgressEvent) => any>, // 请求状态改变回调
    ontimeout?: Callback<(event: ProgressEvent) => any>, // 请求超时回调
    onload?: Callback<(response: GM_XHRResponse) => void>, // 请求成功回调
}
declare type GM_XHRResponse = {
    finalUrl: string, // 最终请求地址
    readyState: number, // 请求状态
    status: number, // 响应状态码
    statusText: string, // 响应状态文本
    responseHeaders: string, // 响应头
    response: any, // 响应体
    responseXML: XMLDocument, // 响应XML
    responseText: string, // 响应文本
}
/**
 * 发送请求
 * @warning **重要提示**: 如果您想使用此方法，请同时查看有关[@connect](https://www.tampermonkey.net/documentation.php#meta:connect)的文档
*/
declare function GM_xmlhttpRequest(config: GM_XHRConfig): () => void;



declare type GM_WebRequestRule = {
    // 选择器
    selector: string | { // 应触发规则的 URL
        include?: string | Array<string>, // 用于规则触发的URL、模式和正则表达式
        match?: string | Array<string>, // 用于规则触发的 URL 和模式
        exclude?: string | Array<string> // 用于避免触发的URL、模式和正则表达式
    },
    // 如何处理请求
    action: string | { // { cancel: true } 可缩短为字符串 "cancel"
        cancel?: boolean, // 是否取消请求
        redirect?: string | { // 重定向到另一个URL, 必须包含在任何 @match 或 @include 声明中
            from: string, // 用于提取 URL 某些部分的正则表达式，例如"([^:]+)://match.me/(.*)"
            to: string // 替换模式，例如"$1://redirected.to/$2"
        }
    },
}
declare type GM_WebRequestHandler = (
    info: 'cancel' | 'redirect', // 操作类型
    message: 'ok' | 'error', // 操作结果
    details: {
        rule: GM_WebRequestRule, // 规则
        url: string, // 请求地址
        redirect_url: string, // 重定向地址
        description?: string // 错误描述
    }
) => void;
/**
 * 注册Web请求监听器
 * @note 如果您只需要注册规则，最好使用 `@webRequest` 声明
 * @note 请注意，webRequest 仅处理类型为sub_frame、script、xhr和websocket请求
 * @beta 此 API 是实验性的，可能随时更改。它也可能在清单 v3 迁移期间消失或更改。
 * @param rules
 * @param listener
 */
declare function GM_webRequest(rules: GM_WebRequestRule, listener: GM_WebRequestHandler): void;



declare type GM_CookieListConfig = {
    url?: string, // 要检索 cookie 的 URL (默认为当前文档 URL)
    domain?: string, // 要检索 cookie 的域
    name?: string, // 要检索 cookie 的名称
    path?: string, // 要检索 cookie 的路径
}
declare type GM_CookieItem = {
    domain: string,
    firstPartyDomain?: string,
    hostOnly: boolean,
    httpOnly: boolean,
    name: string,
    path: string,
    sameSite: string,
    secure: boolean,
    session: boolean,
    value: string
}
declare type GM_CookieSetConfig = {
    url?: string, // 与 cookie 关联的 URL (默认为当前文档 URL)
    name: string, // cookie 的名称
    value: string, // cookie 的值
    domain?: string, // cookie 的域
    firstPartyDomain?: string, // cookie 的第一方域
    path?: string, // cookie 的路径
    secure: boolean, // cookie 是否应仅通过 HTTPS 发送
    httpOnly: boolean, // cookie 是否应仅通过 HTTP 发送
    expirationDate: number, // cookie 的过期时间戳, 如果未指定，cookie 永远不会过期
}
declare type GM_CookieDeleteConfig = {
    url?: string, // 与 cookie 关联的 URL (默认为当前文档 URL)
    name: string, // cookie 的名称
    firstPartyDomain?: string, // cookie 的第一方域
}
/**
 * @beta GM_cookie API 是实验性的，在某些 Tampermonkey 版本中可能会返回`not supported`错误。
 * @warning 油猴将从 `@include` 或 `@match` 检查 `config.url` 的访问权限!
 */
declare class GM_cookie {
    /** 列出 cookie */
    static list(config: GM_CookieListConfig, callback?: Callback<(cookies: Array<GM_CookieItem>, error: string | null) => void>): void
    /** 设置 cookie */
    static set(config: GM_CookieSetConfig, callback?: Callback<(error?: string) => void>): void
    /** 删除 cookie */
    static delete(config: GM_CookieDeleteConfig, callback?: Callback<(error?: string) => void>): void
}



/**
 * 通过兼容性选项支持基于 CDATA 的元数据存储方式。
 * Tampermonkey 尝试自动检测脚本是否需要启用此选项。
 *
 * ```JavaScript
 * var inline_src = (<><![CDATA[
 *     console.log('Hello World!');
 * ]]> </>).toString();
 * eval(inline_src);
 * ```
 */
declare const CDATA = `<><![CDATA[...]]></>`;
