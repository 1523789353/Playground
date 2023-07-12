//简单异步休眠
window.sleep = (ms) => new Promise(r => ms == 0 ? r() : setTimeout(r, ms));
Promise.prototype.sleep = async function(ms) {
    await this;
    return await sleep(ms);
};

// 劫持重玩函数
document.querySelector('*[onclick="replayBtn()"]').setAttribute('onclick', '_replayBtn()')
function _replayBtn() {
    _count_ = 0;
    replayBtn();
}

//打击间隔, 单位ms, 请勿直接设置为0
var _time_ = 1, 
    // combo计数
    _count_ = 0,
    cheat = () => sleep(_time_).then(() => {
        // 限制最大combo数, Infinity代表无限制
        if (_count_ >= Infinity) return;
        // 获取元素
        let target = document.querySelector(`div.block[id*="GameLayer${parseInt(++_count_ / 10) % 2 + 1}"][class*=t]:not([class*=tt])`);
        // 发送点击事件
        gameTapEvent({targetTouches: [{clientY: (touchArea[0]+touchArea[1])/2}], target});
        cheat()
    });
// 修复bug
returnCitySN = []
cheat();