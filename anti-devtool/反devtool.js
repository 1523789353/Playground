let timer = 0

function antiDevtools(type) {
    console.log(`你打开了${type}浏览器的开发人员工具!!`);
    // clearInterval(timer)
    //document.body.innerHTML = String();
}

let isSafari = (new Error).stack.includes('toString@');

let errorMsg = 'Web page panic, Caused by devtool.'

let detector = () => console.debug(Object.defineProperties(new Error(), {
    toString: { value() { isSafari && antiDevtools('Safari'); return errorMsg; } },
    message: { get() { antiDevtools('Chrome/Firefox'); return errorMsg; } },
}));

timer = setInterval(detector, 1000);

