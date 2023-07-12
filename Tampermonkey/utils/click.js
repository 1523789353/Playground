function getPosition(elem) {
    let left = 0, top = 0
    for (let current = elem; current; current = current.offsetParent) {
        left += current.offsetLeft
        top += current.offsetTop
    }
    var topLeft = { left, top }
    center = {
        left: left + (elem.offsetWidth >> 1),
        top: top + (elem.offsetHeight >> 1)
    }
    return { topLeft, center }
}

function getElemtenPath(elem) {
    let path = []
    for (let current = elem; current; current = current.parentElement) {
        path.push(current)
    }
    return [...path, document, window]
}

function click(target) {
    var position = getPosition(target),
        newEvent = new PointerEvent('click', {
            bubbles: true,
            cancelable: true,
            clientX: position.center.left,
            clientY: position.center.top,
            composed: true,
            detail: 1,
            offsetX: position.center.left,
            offsetY: position.center.top,
            pageX: position.center.left,
            pageY: position.center.top,
            path: getElemtenPath(target),
            pointerId: 1,
            pointerType: "mouse",
            screenX: position.center.left,
            screenY: position.center.top,
            sourceCapabilities: null,
            srcElement: target,
            target: target,
            view: window,
            x: position.center.left,
            y: position.center.top,
        })
    window.newEvent = newEvent
    target.dispatchEvent(newEvent)
}
click($('[id*=GameLayer][class*=t]')[0])
