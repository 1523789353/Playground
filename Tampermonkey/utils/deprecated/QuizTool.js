// ==UserScript==
// @name         职教云icve※智慧职教 答案提取/填充
// @description  职教云icve※智慧职教 答案提取/填充
// @author       皇家养猪场
// @namespace    皇家养猪场
// @version      1.3.9
// @create       2021-04-20
// @lastmodified 2022-04-21
// @note         更新日志: 修复不停跳转的bug...
// @note         如有什么功能需求/好点子/bug，请反馈QQ1523789353。
// @charset      UTF-8
// @updateURL    http://81.71.31.250/QuizTool.js
// @downloadURL  http://81.71.31.250/QuizTool.js
// @require      https://ajax.aspnetcdn.com/ajax/jQuery/jquery-3.6.0.min.js
// @require      http://81.71.31.250/QuizTool/utils/afterLoaded.js
// @require      http://81.71.31.250/QuizTool/utils/extends.js
// @require      http://81.71.31.250/QuizTool/utils/GM_extends.js
// @require      http://81.71.31.250/QuizTool/utils/hook.js
// @match        *://*.icve.com.cn/*
// @connect      81.71.31.250
// @connect      localhost
// @run-at       document-start
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @compatible   chrome
// @license      MIT
// ==/UserScript==


//异步休眠
var sleep = ms => {
    var result = new Promise((res, rej) => ms == 0 ? res() : setTimeout(res, ms))
    result.__proto__.sleep = async function (ms) {return await this.then(() => sleep(ms))}
    return result
}


function QuizTool(config) {
    var Self = this
    this.config = config
    this.version="1.3.7"

    var msgbox = $('<div></div>').css({
        position: "fixed",
        width: "100%",
        textAlign: "center",
        zIndex: 9999,
        pointerEvents: "none"
    }).prependTo('body')
    // notice(Message, fadeInTime, keepTime, fadeOutTime, background)
    var notice = this.config.SafeMode ? str => console.log(str) : (str, In, Keep, Out, bg) => {
        setTimeout(
            (e, o) => {
                e.fadeTo(o, 0).slideUp(o, function(){
                    $(this).remove()
                })
            },
            Keep,
            $('<span></span><br>').text(str).css({
                display: "inline-block",
                margin: "4px 0",
                padding: ".5em 1em",
                background: (bg ? bg : "#FFF"),
                backdropFilter: "blur(1px)",
                boxShadow: "2px 2px 4px rgba(0,0,0,.35)",
                border: "solid 1px rgba(0,0,0,.15)",
                borderRadius: "8px",
                textAlign: "center",
                opacity: 0,
                userSelect: "none",
                pointerEvents: "none"
            }).appendTo(msgbox).fadeTo(In, 1),
            Out
        )
    }

    notice("QuizTool运行中...", 500, 3000, 500, "rgba(0,0,0,0)")

    this.initData = () => {
        Self.JsonObj = {}
        Self.trimData()
    }
    this.exportData = () => console.log(GM_getValue('QuizToolJsonData'))
    this.importData = obj => {
        Object.assign(Self.JsonObj, obj)
        Self.trimData()
    }
    this.trimData = () => {
        var tmp = {}
        for (var ID in Self.JsonObj) {
            if (Self.JsonObj[ID] != undefined && Self.JsonObj[ID].length != 0 && Self.JsonObj[ID].length <= 4)
                tmp[ID] = Self.JsonObj[ID]
        }
        Self.JsonObj = tmp
        GM_setValue('QuizToolJsonData', JSON.stringify(Self.JsonObj))
    }
    try {
        this.JsonObj = JSON.parse(GM_getValue('QuizToolJsonData', '{}'));
    } catch (e) {
        notice(`读取数据失败: ${e}, 初始化数据...`, 500, 3000, 500, "rgba(0,0,0,0)");
        Self.initData();
    }

    this.cloudSync = () => {
        // 冷却
        var lastUpdate = GM_getValue('QuizToolLastUpdate', 0);
        if (Date.now() - lastUpdate < 6e4) {
            notice("云同步冷却中...", 500, 3000, 500, "rgba(0,0,0,0)");
            return;
        }
        GM_setValue('QuizToolLastUpdate', Date.now());
        // 请求
        GM_xmlhttpRequest({
            method: "GET",
            url: 'http://81.71.31.250:9999/Quiz',
            onload(res) {
                if (res.status == 200) {
                    try {
                        let resObj = JSON.parse(res.responseText);
                        if (resObj["msg"] == "Success") {
                            let tmp = new Object();
                            $(resObj["data"]).each((i,n)=>{
                                $(tmp).attr(n["id"], n["answer"]);
                            });
                            Self.importData(tmp);
                            notice("云同步成功", 500, 3000, 500, "rgba(0,0,0,0)");
                        } else {
                            notice("云同步失败:服务器内部异常", 500, 3000, 500, "rgba(0,0,0,0)");
                        }
                    } catch (e) {
                        notice("云同步失败:数据格式异常" + e, 500, 3000, 500, "rgba(0,0,0,0)");
                    }
                } else notice(`云同步失败:请求异常(${res.status})`, 500, 3000, 500, "rgba(0,0,0,0)");
            },
            onerror() {
                notice(`云同步失败:网络异常(${res.status})`, 500, 3000, 500, "rgba(0,0,0,0)");
            },
        });
    }
    this.get = () => {
        var Framework = $('div.np-wrapper>div.np-container>div.np-contenter>div.hasNoLeft>form#indexForm>div#container>div#homework_div');
        if (Framework.length == 0) Framework = $('div.np-wrapper>div.np-container>div.np-contenter>div.hasNoLeft>div#dataForm>div#container>div.center-all');
        if (Framework.find('div.e-ans-ref.am-cf').length == 0) return; // 非答案页
        var last = Framework.find('div.e-q-body').length;
        if (last == 0) return; // 无题目。。？
        var obj = {};
        for (var ID = 1; ID <= last; ID++) {
            var target = Framework.find(`div.e-q-body[data-num=${ID}]`);
            obj[target.attr("data-questionid")] = $(target.find('div.e-ans-ref.am-cf')[0]).find('span.e-ans-r').text();
            // 选择题 选项转换
            if (obj[target.attr("data-questionid")] == "正确") obj[target.attr("data-questionid")] = "A";
            if (obj[target.attr("data-questionid")] == "错误") obj[target.attr("data-questionid")] = "B";
        }
        Self.importData(obj);
        notice(`已提取${last}个答案, 正在上传...`, 500, 3000, 500, "rgba(0,0,0,0)");
        for (let ID in obj) {
            GM_xmlhttpRequest({
                method: "POST",
                url: 'http://81.71.31.250:9999/Quiz',
                headers: {"Content-Type": "application/json;charset=UTF-8"},
                data: JSON.stringify({id:ID, answer:obj[ID]}),
            });
        }
    }
    this.search = () => {
        var sleepTime = 0;// ms
        var Framework = $('div.np-wrapper>div.np-container>div.np-contenter>div.hasNoLeft>div#dataForm>div#container>div>div.am-cf.wl_types>div.center-all>div.e-q-panel.e-q-panel-paper.typebox.bigquestionblock'); //作业
        if (Framework.length == 0) {
            Framework = $('div.np-wrapper>div.np-container>div.np-contenter>div.hasNoLeft>div#dataForm>div#container>div.center-all>div.e-q-panel.e-q-panel-paper.typebox.bigquestionblock'); //考试
        }
        if (Framework.length == 0) {
            Framework = $('div.np-wrapper>div.np-container>div.np-contenter>div.hasNoLeft>div#dataForm>div#container>div.am-cf.wl_types>div.center-all>div.e-q-panel.e-q-panel-paper.typebox.bigquestionblock'); //MOOC作业
        }
        if (Framework.length == 0) Framework = $('div.np-wrapper>div.np-container>div.np-contenter>div.hasNoLeft>div#dataForm>div#container>div.center-all>div.e-q-panel.e-q-panel-paper.typebox'); //MOOC考试
        var last = Framework.find('div.e-q-body.questionSortOrder').length;
        if (last == 0) last = Framework.find('div.e-q-body.questioSortOrder').length;
        if (last == 0) return;
        var notFound = [];
        var unknowType = [];
        var Tasklist = []; // 用于异步处理的任务列表
        var DA = {'A': 0, 'B': 1, 'C': 2, 'D': 3};
        for (var n = 1; n <= last; n++) {
            var Quest = Framework.find(`div.e-q-body.questionSortOrder[data-num=${n}]`);
            if (Quest.length = 0) Quest = Framework.find(`div.e-q-body.questioSortOrder[data-num=${n}]`);
            Quest = $(Quest[0]);
            try {
                var Answer = $(Self.JsonObj).attr(Quest.attr("data-questionid")).toString();
            } catch (e) {
                notFound.push(n);
                continue;
            }
            switch (Quest.attr("data-questiontype")) {
                case "1": // 单选
                    Tasklist.push(Quest.children("form").find(`ul>li.e-a[data-index=${DA[Answer]}]`));
                    break;
                case "2": // 多选
                    (Self.config.SafeMode == "true") ?
                    Quest.children("form").find('ul>li.e-a.checked').css("background-color", "#FFF0F0"):
                    Quest.children("form").find('ul>li.e-a.checked').click();
                    for (var i of Answer) Tasklist.push(Quest.children("form").find(`ul>li.e-a[data-index=${DA[i]}]`));
                    break;
                case "3": // 判断(AB取值相反...)
                    Tasklist.push(Quest.children("form").find(`ul>li.e-a[data-index=${(Answer == "A" ? 1 : 0)}]`));
                    break;
                default:
                    unknowType.push(n);
                    break;
            }
        }
        var Handle = Self.config.SafeMode ? Target => (Target.children('div.ErichText.destroyTitleButton').css({backgroundColor: "#EFE"})) : (Target => Target.click());
        var Runtasks = (Tasklist, index = 0) => {
            if (index >= Tasklist.length) return;
            Handle(Tasklist[index]);
            sleep(sleepTime).then(() => Runtasks(Tasklist, index + 1));
        }
        Runtasks(Tasklist);
        $('input[name="UseTime"]').attr("value", parseInt(Math.random() * 600 + last * 15));
        notice("正在运行自动答题...", 500, 3000, 500, "rgba(0,0,0,0)");
        if (notFound.length != 0) {
            notice(`未找到第 ${notFound} 题答案!`, 500, 500, 500, "rgba(0,0,0,0)");
            notice("您可以尝试清除浏览器缓存来刷新答案!", 500, 5000, 500, "rgba(255,127,0,.2)");
        }
        if (unknowType.length != 0) notice(`未能匹配第 ${unknowType} 题的题型!`, 500, 5000, 500, "rgba(0,0,0,0)");
    }
}

afterLoaded('#udesk_container')
    .then(() => document.QT = new QuizTool({SafeMode: false})) // 安全模式:无Toast消息弹窗/不自动答题/正确答案显示绿色背景
    .then(() => afterLoaded('div.wl_types.am-cf'))
    .then(() => {
        GM_registerMenuCommand("手动同步答案", document.QT.cloudSync)
        GM_registerMenuCommand("尝试搜索答案", document.QT.search)
        document.QT.cloudSync()
        document.QT.search()
        document.QT.get()
        /*
        setInterval(() => {
            $.each($('video'),(i,v,a)=>{
                v.playbackRate=16;
                // if (v.currentTime <= v.duration - 3) v.currentTime = v.duration - 3;
            });
        }, 3000);
        */
    })

if (location.href.includes('/portal_new/portal/portal.html')) {
    // 直接跳转旧版职教云
    afterLoaded('a#jumpzjy2').then(elem => {
        elem.on('click', e => {
            e.preventDefault()
            open('https://zjy2.icve.com.cn/student/studio/studio.html')
        })
    })
}

// 职教云做题页/答案页请求内容转义
if (location.host === 'zjy2.icve.com.cn') {
    ProxyXhrSetting.onGetProp('responseText', function (xhr, prop, value) {
        try {
            if (
                [
                    '/api/study/homework/preview',
                    '/api/study/homework/history',
                    '/api/study/onlineExam/previewNew',
                    '/api/study/onlineExam/historyNew'
                ].find(i => xhr.responseURL?.includes(i)) != undefined
            ) {
                return value.replace(/</g, '&lt;').replace(/>/g, '&gt;')
            }
        } catch {}
    })
}
