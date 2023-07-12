function getElemCenter(elem) {
    let rect = elem.getBoundingClientRect()
    return {
        x: (rect.left + rect.right) / 2,
        y: (rect.top + rect.bottom) / 2
    }
}

function getElemPath(elem) {
    let result = []
    for (let i = elem; i.parentElement != null; i = i.parentElement) {
        result.push(i)
    }
    result.push(window)
    return result
}

function genEventConfig(elem, x, y) {
    return {
        bubbles: true,
        buttons: 1,
        cancelable: true,
        clientX: x,
        clientY: y,
        composed: true,
        detail: 1,
        layerX: 0,
        layerY: 0,
        offsetX: 0,
        offsetY: 0,
        pageX: x,
        pageY: y,
        path: getElemPath(elem),
        screenX: x,
        screenY: y,
        sourceCapabilities: new InputDeviceCapabilities(),
        srcElement: elem,
        target: elem,
        toElement: elem,
        view: window,
        x,
        y
    }
}

function swipe(elem, length, step) {
    let center = getElemCenter(elem)
    dispatchEvent(new MouseEvent('mousedown', genEventConfig(elem, center.x, center.y)));
    for (let i = 0; i < length; i += step) {
        setTimeout(() => dispatchEvent(
            new MouseEvent('mousemove', genEventConfig(elem, center.x + step, center.y))
        ), 50)
    }
    center = getElemCenter(elem)
    setTimeout(() => dispatchEvent(
        new MouseEvent('mouseup', genEventConfig(elem, center.x, center.y))
    ), 50 * length / step + 50)
}
