let url = 'https://www.bilibili.com/video/BV1Z24y1z7DC/';
let config = {
    // left: 0,
    // top: 0,
    // width: 800,
    // height: 600,
    // screenX
    // screenY
    // chrome: 'yes',
    // centerscreen: 'yes',
    // fullscreen:'yes',
    // outerHeight: 1920,
    // outerWidth: 1080,
    // innerHeight
    // innerWidth
    titlebar: 'no', // 标题栏
    toolbar: 'no', // 工具栏 前进后退按钮
    location: 'no', // 地址栏
    directories: 'no', // 工具栏？？？
    status: 'no', // 状态栏
    menubar: 'no',
    personalbar: 'no', // 收藏夹栏
    scrollbars: 'no',
    // dependent: true // 子窗口
    hotkeys: 0, // 禁用快捷键
    resizable: 'yes',
    copyhistory: 'no',
}
let ref = window.open(url, undefined, Object.keys(config).map(i => i + '=' + config[i]).join())


// twitter登录弹窗参数
"toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=no,resizable=no,copyhistory=no,width=500,height=550,top=157,left=518"
