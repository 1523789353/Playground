// ==UserScript==
// @name         米游社-后台原神签到
// @description  米游社签到，需要导Cookie
// @author       皇家养猪场
// @namespace    皇家养猪场
// @version      0.0.1
// @create       2022-04-22
// @lastmodified 2022-04-22
// @charset      UTF-8
// @require      https://ajax.aspnetcdn.com/ajax/jQuery/jquery-3.6.0.min.js
// @require      http://81.71.31.250/QuizTool/utils/afterLoaded.js
// @require      https://cdn.jsdelivr.net/gh/emn178/js-md5/build/md5.min.js
// @require      http://81.71.31.250/QuizTool/utils/GM_extends.js
// @match        *://*/*
// @connect      api-takumi.mihoyo.com
// @run-at       document-start
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @compatible   chrome
// @license      MIT
// ==/UserScript==

class genshinPlayer {
    // 获取盐
    get ds() {
        var salt = 'h8w582wxwgqvahcdkpvdhbh2w9casgfl'
        var t = parseInt(Date.now() / 1000)
        var r = Math.random().toString(36).slice(-6)
        var c = ['salt=' + salt, 't=' + t, 'r=' + r].join('&')
        var ds = [t, r, md5(c)].join(',')
        return ds
    }

    // 获取yyyy-MM-dd格式日期
    get date() {
        let date = new Date()
        return [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-')
    }

    constructor(cookie) {
        this.cookie = cookie
        this.sign()
    }

    // 签到
    async sign() {
        let response = await this.getPlayerInfo()
        let playerInfo = JSON.parse(response.responseText)
        if (playerInfo.retcode !== 0) {
            console.log("米游社签到失败", json.message)
            return json.message;
        }
        let playerList = playerInfo.data.list
        if (playerList.length === 0) {
            console.log("米游社签到失败", "未请求到账号")
            return "未请求到账号"
        }
        this.batchSign(playerList)
    }

    // 请求玩家信息
    getPlayerInfo() {
        return GM_request({
            url: 'https://api-takumi.mihoyo.com/binding/api/getUserGameRolesByCookie?game_biz=hk4e_cn',
            method: 'GET',
            cookie: this.cookie
        })
    }

    // 批量签到
    batchSign(playerList) {
        for (let player of playerList) {
            let uid = player.game_uid,
                region = player.region,
                region_name = player.region_name,
                nickname = player.nickname,
                level = player.level,

                data = `{"act_id":"e202009291139501","region":"${region}","uid":"${uid}"}`,
                tips = `【${region_name}】—【${nickname}】[ Lv : ${level}]—${uid}\n`

            // 检查签到状态
            if (GM_getValue('GenshinSignDate_' + uid) == this.date) {
                console.log(tips, "今日米游社已签到")
                continue
            }

            // 签到
            GM_request({
                url: 'https://api-takumi.mihoyo.com/event/bbs_sign_reward/sign',
                method: 'POST',
                data: data,
                headers: {
                    'DS': this.ds,
                    'x-rpc-app_version': '2.3.0',
                    'x-rpc-client_type': '5',
                    "x-rpc-device_id": "bd7f912e-908c-3692-a520-e70206823495",
                },
                cookie: this.cookie
            }).then(res => {
                // 设置签到状态
                GM_setValue('GenshinSignDate_' + uid, this.date)

                // 解析签到结果
                var resObj = JSON.parse(res.responseText),
                    msg = resObj.message

                // 显示签到结果
                console.log("米游社签到成功", tips, msg)
            }).catch(() => {
                // 异常情况
                console.log("米游社签到失败, 网络错误!")
            })
        }
    }
}

// 先进https://bbs.mihoyo.com/ys/登录
// 再去https://user.mihoyo.com/#/account/home登录, 并执行copy(document.cookie)拷贝cookie
new genshinPlayer('此处填写cookie')