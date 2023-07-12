// 简单反debugger
setInterval('\u0064\u0065\u0062\u0075\u0067\u0067\u0065\u0072');



function devtoolLock() {
    const keys = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let progress = 0;

    window.addEventListener('keydown', e => {
        if (progress == keys.length) {
            return true;
        } /* else block: */
        if (e.key == keys[progress]) {
            progress++;
            return true;
        } /* else block: */
        progress = 0;

        if (e.key == 'F12' || (e.ctrlKey && e.shiftKey && e.key == 'I')) {
            e.preventDefault();
            return false;
        }
    })
}
devtoolLock();



// 一般反debugger
let isSafari = (new Error).stack.includes('toString@');
let detector = () => console.debug(
    Object.defineProperties(new Error, {
        toString: { value() { isSafari && antiDevtools('Safari'); } },
        message: { get() { antiDevtools('Chrome/Firefox'); } }
    })
);

function antiDevtools(type) {
    console.log(`你打开了${type}浏览器的开发人员工具!!`);
    // do something...
}

setInterval(detector, 200);


// 混淆过
((a,b)=>void setTimeout(a.replaceAll(/\w+/g,i=>b[parseInt(i,36)])))('(m() {\nd 6 = (5 i).7.h(\'4@\');\nd n = () => 3.b(\n k.c(5 i, {\n 4: { 9() { 6 && 0(\'l\'); } },\n 1: { g() { 0(\'j/q\'); } }\n })\n);\n\nm 0(a) {\n 3.p(`你打开了${a}浏览器的开发人员工具!!`);\n r.2.f = \'\';\n o (e);\n}\n\ns(n, 8);\n})();', 'antiDevtools‮message‮body‮console‮toString‮new‮isSafari‮stack‮1000‮value‮type‮debug‮defineProperties‮let‮true‮innerHTML‮get‮includes‮Error‮Chrome‮Object‮Safari‮function‮detector‮while‮log‮Firefox‮document‮setInterval'.split('‮'));
