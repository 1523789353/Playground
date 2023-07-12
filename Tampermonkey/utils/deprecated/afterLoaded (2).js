function afterLoaded(selector, startNode = document, timeout = 0) {
    return new Promise((resolve, reject) => {
        let observer = new MutationObserver((recordsArray, observer) => {
            let result = startNode.querySelector(selector);
            if (result !== null) {
                observer.disconnect();
                resolve(result);
            }
        });
        observer.observe(startNode, {
            subtree: true,
            childList: true
        });
        if (timeout > 0) {
            setTimeout(() => {
                observer.disconnect();
                reject('timeout');
            }, timeout);
        }
    });
}

afterLoaded('input.bui-danmaku-switch-input').then(elem => elem.checked = true, document, 10)

