class SelectorChain {
    private static mask = (function() {
        const mask = document.createElement('div');
        mask.style.position = 'absolute';
        mask.style.zIndex = '999';
        document.body.appendChild(mask);
        return mask;
    })();
    private head: SelectorNode = null!;
    constructor(elem) {
        while (elem != document.body) {
            this.head = new SelectorNode(elem, this.head);
            if (document.querySelectorAll(this.toString()).length == 1)
                break;
            elem = elem.parentElement;
        }
    }
    toString(): string {
        let cursor: SelectorNode | null = this.head;
        let childIndex = cursor.childIndex;
        let selector = cursor.toString();
        cursor = cursor.child;
        while (cursor != null) {
            selector += cursor.toString();
            if (!Number.isNaN(childIndex)) {
                selector += `:nth-child(${childIndex + 1})`;
            }
            childIndex = cursor.childIndex;
            cursor = cursor.child
        }
        return selector;
    }
    /**
     *  增强CSS选择器
     *  增加对:parent(n)的支持, 以下是对:parent(n)的定义
     *      :parent(n)表示获取第n层父元素, n只能为数字, 且从1开始
     *      :parent(0)无意义, 抛出异常
     *      #id:parent(1)表示获取#id的父元素
     *      #id.class1:parent(2)表示获取#id的祖父元素
     *      不支持多个:parent(n), 即不支持#id:parent(1):parent(2)...这样的写法
     *      :parent只存在于解析前, 解析后会变成SelectorChain对象, 该对象toString方法返回标准CSS选择器
     * @param selector CSS选择器
     */
    static parse(selector: string): SelectorChain {
        throw new Error('Not implemented');
    }
}
/**
 * One Selector Node in Selector Chain
 */
class SelectorNode {
    elem: HTMLElement
    tagName: string
    id: string
    classList: Array<string>
    child: SelectorNode | null
    childIndex: number
    constructor(elem: HTMLElement, child: SelectorNode | null = null) {
        this.elem = elem;
        this.tagName = elem.tagName.toLowerCase();
        this.id = elem.id;
        this.classList = Array.from(elem.classList);
        this.child = child;
        if (child == null) {
            this.childIndex = NaN;
            return;
        }
        if (elem.children.length == 1) {
            this.childIndex = NaN;
        }
        this.childIndex = Array.from(elem.children).indexOf(child.elem);
    }
    toString(): string {
        let selector = this.tagName;
        if (this.id.length != 0)
            selector += '#' + this.id;
        if (this.classList.length != 0) {
            selector += '.' + this.classList.join('.');
        }
        return selector;
    }
}

/* Test case
<div>
    <p>
        <span>Here is target</span>
    </p>
    <p>
        <span></span>
    </p>
    <p>
        <span></span>
    </p>
    <p>
        <span></span>
    </p>
</div>
 */
