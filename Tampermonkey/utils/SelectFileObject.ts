let allEvents = ["abort", "animationcancel", "animationend", "animationiteration", "animationstart", "auxclick", "beforeinput", "blur", "cancel", "canplay", "canplaythrough", "change", "click", "close", "compositionend", "compositionstart", "compositionupdate", "contextmenu", "copy", "cuechange", "cut", "dblclick", "drag", "dragend", "dragenter", "dragleave", "dragover", "dragstart", "drop", "durationchange", "emptied", "ended", "error", "focus", "focusin", "focusout", "formdata", "gotpointercapture", "input", "invalid", "keydown", "keypress", "keyup", "load", "loadeddata", "loadedmetadata", "loadstart", "lostpointercapture", "mousedown", "mouseenter", "mouseleave", "mousemove", "mouseout", "mouseover", "mouseup", "paste", "pause", "play", "playing", "pointercancel", "pointerdown", "pointerenter", "pointerleave", "pointermove", "pointerout", "pointerover", "pointerup", "progress", "ratechange", "reset", "resize", "scroll", "scrollend", "securitypolicyviolation", "seeked", "seeking", "select", "selectionchange", "selectstart", "slotchange", "stalled", "submit", "suspend", "timeupdate", "toggle", "touchcancel", "touchend", "touchmove", "touchstart", "transitioncancel", "transitionend", "transitionrun", "transitionstart", "volumechange", "waiting", "webkitanimationend", "webkitanimationiteration", "webkitanimationstart", "webkittransitionend", "wheel"]

interface FileInputConfig {
    multiple?: boolean;
    accept?: string;
    directory?: boolean;
}

/**
 * 选择文件系统对象
 * 通过config指定是否为目录、文件类型、是否多选等
 */
const selectFileObject = (function () {
    let fileInput = document.createElement('input');

    /**
     * 对外暴露的方法
     * @param config 文件选择配置
     */
    function selectFileObject(config?: FileInputConfig) {
        let conf: Required<FileInputConfig> = {
            multiple: false,
            accept: '*/*',
            directory: false,
            ...config
        };
        return new Promise((resolve, reject) => {
            fileInput.type = 'file';
            fileInput.multiple = conf.multiple;
            fileInput.accept = conf.accept;
            fileInput.webkitdirectory = conf.directory;

            fileInput.addEventListener('change', e => fileInput.files!.length > 0 ? resolve(fileInput.files) : reject('canceled'));
            fileInput.addEventListener('cancel', e => reject('canceled'));
            fileInput.click();
        })
    }
    return selectFileObject;
})();
