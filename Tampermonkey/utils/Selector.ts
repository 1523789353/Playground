const DevtoolColors = {
    Content: "rgba(111, 168, 220, 0.66)",
    ContentLight: "rgba(111, 168, 220, 0.5)",
    ContentOutline: "rgba(9, 83, 148, 1)",
    Padding: "rgba(147, 196, 125, 0.55)",
    PaddingLight: "rgba(147, 196, 125, 0.4)",
    Border: "rgba(255, 229, 153, 0.66)",
    BorderLight: "rgba(255, 229, 153, 0.5)",
    Margin: "rgba(246, 178, 107, 0.66)",
    MarginLight: "rgba(246, 178, 107, 0.5)",
    EventTarget: "rgba(255, 196, 196, 0.66)",
    Shape: "rgba(96, 82, 177, 0.8)",
    ShapeMargin: "rgba(96, 82, 127, 0.6)",
    CssGrid: "rgba(75, 0, 130, 1)",
    LayoutLine: "rgba(127, 32, 210, 1)",
    GridBorder: "rgba(127, 32, 210, 1)",
    GapBackground: "rgba(127, 32, 210, 0.3)",
    GapHatch: "rgba(127, 32, 210, 0.8)",
    GridAreaBorder: "rgba(26, 115, 232, 1)",
    /* ===== */
    ParentOutline: "rgba(224, 90, 183, 1)",
    ChildOutline: "rgba(0, 120, 212, 1)",
    /* ===== */
    Resizer: "rgba(222, 225, 230, 1)",
    ResizerHandle: "rgba(166, 166, 166, 1)",
    Mask: "rgba(248, 249, 249, 1)"
}

class SelectorChain {
    private static mask = (function() {
        const mask = document.createElement('div');
        mask.style.position = 'absolute';
        mask.style.zIndex = '99999';
        mask.style.backgroundColor = DevtoolColors.Content;
        mask.style.border = `dashed 1px ${DevtoolColors.LayoutLine}`;
        mask.style.pointerEvents = 'none';
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
    static highlight(elem): void {
        let { width, height, left, top } = elem.getBoundingClientRect();
        SelectorChain.mask.style.width = width + 'px';
        SelectorChain.mask.style.height = height + 'px';
        SelectorChain.mask.style.left = left + window.scrollX + 'px';
        SelectorChain.mask.style.top = top + window.scrollY + 'px';
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
