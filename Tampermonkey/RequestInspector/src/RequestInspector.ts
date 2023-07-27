// 单个匹配规则与规则组
declare type URLMatchRule = RegExp | Array<RegExp>;
// 匹配与排除规则
declare type InspectFilter = string // 匹配固定 URL
    | URLMatchRule // 仅触发规则
    | {
        include?: URLMatchRule, // 触发规则(优先级 低)
        exclude?: URLMatchRule, // 排除规则(优先级 中)
        matcher?: (url: string) => boolean, // 触发规则(优先级 高)
    }
// 请求处理方式
declare type InspectAction = 'block' // 简短字符串, 拦截请求
    | { block: true } // 拦截请求
    | {
        redirect: string // 重定向到另一个静态 URL
        | {
            from: RegExp, // 用于提取 URL 某些部分的正则表达式, 例如"([^:]+)://match.me/(.*)"
            to: string // 替换格式, 例如"$1://redirected.to/$2"
        }
        | ((url: string) => string) // 重定向处理器
    }
// 回调, 请求处理器; 处理匹配的请求
declare type InspectHandler = (details: any) => void;
// 请求拦截配置
declare type InspectConfig = {
    filter: InspectFilter,
    action: InspectAction,
    handler: InspectHandler
}

/**
 * 请求拦截器 拦截处理XHR、fetch、WebSocket等请求
 * @note **转发需要配置GM_xmlhttpRequest来跨域**
 */
class RequestInspector {
    // 备份原生方法
    private static XHR = window.XMLHttpRequest;
    private static fetch = window.fetch;
    private static WebSocket = window.WebSocket;
    private static EventSource = window.EventSource;

    // hook, 并且改变标记位
    private static hooked = (function(){
        // Todo: hook
        return true;
    })();

    // 所有拦截配置
    private static inspectConfigs: Array<InspectConfig> = [];
    // 添加拦截配置
    public static add(filter: InspectFilter, action: InspectAction, handler: InspectHandler) { };

    // 截获请求, 对请求进行匹配, 再执行对应的操作
    private static matchAll(url: string): InspectConfig | null {
        let result: InspectConfig | null = null;
        for (const config of this.inspectConfigs) {
            if (this.match(url, config)) {
                result = config;
                break;
            }
        }
        return result;
    }
    // 匹配单个规则
    private static match(url: string, config: InspectConfig): boolean {
        // 匹配固定 URL
        if (typeof config.filter === 'string') {
            return config.filter === url;
        }
        // 单个触发规则
        if (config.filter instanceof RegExp) {
            return config.filter.test(url);
        }
        // 规则组
        if (Array.isArray(config.filter)) {
            return config.filter.some(f => f.test(url));
        }
        // 过滤非法规则对象
        if (typeof config.filter !== 'object') {
            console.warn('Invalid filter', config.filter);
            return false;
        }
        // 匹配器
        if (config.filter.matcher) {
            return config.filter.matcher(url);
        }
        // 排除规则
        if (config.filter.exclude) {
            // 规则组与单规则
            if (Array.isArray(config.filter.exclude)) {
                if (config.filter.exclude.some(f => f.test(url))) {
                    return false;
                }
            } else if (config.filter.exclude.test(url)) {
                return false;
            }
        }
        // 触发规则
        if (config.filter.include) {
            // 规则组与单规则
            if (Array.isArray(config.filter.include)) {
                if (config.filter.include.some(f => f.test(url))) {
                    return true;
                }
            } else if (config.filter.include.test(url)) {
                return true;
            }
        }
        // 无规则匹配
        return false;
    }
    // 处理请求
    private static handle(action: InspectAction, url: string): void {
        if (action === 'block') {
            return;
        }

    }
    // 执行回调, 将请求移交给用户处理
    private static callback(handler: InspectHandler, url: string): void {
        try {
            handler(url);
        } catch (error) {
            console.error('InspectHandler error:', error);
        }
    }
}
