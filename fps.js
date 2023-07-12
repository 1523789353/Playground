var showFPS = (function () {
    var requestAnimationFrame = [
        window.requestAnimationFrame,
        window.webkitRequestAnimationFrame,
        window.mozRequestAnimationFrame,
        window.oRequestAnimationFrame,
        window.msRequestAnimationFrame,
        function (callback) { setTimeout(callback, 1000 / 60); }
    ].find(i => i !== undefined)
    var fps, step, appendFps;

    fps = 0;
    last = Date.now();
    step = function () {
        fps += 1;
        requestAnimationFrame(step);
    };
    appendFps = function () {
        console.log(fps, 'FPS');
        document.querySelector('#fps').textContent = fps + ' FPS';
        fps = 0;
    };
    step();
    setInterval(appendFps, 1000);
})();
