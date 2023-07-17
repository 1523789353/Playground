class XPathNode {
    elem: Element;

    constructor(elem: Element) {
        this.elem = elem;
    }
    get attributes(): NamedNodeMap {
        return this.elem.attributes;
    }
    get parent(): XPathNode | null {
        if (this.elem.parentElement) {
            return new XPathNode(this.elem.parentElement);
        }
        return null;
    }
    get ancestors(): Array<XPathNode> {
        let ancestors: Array<XPathNode> = [];
        let cursor = this.elem;
        while (cursor.parentElement !== null) {
            ancestors.push(new XPathNode(cursor.parentElement));
            cursor = cursor.parentElement;
        }
        return ancestors;
    }
    get children(): Array<XPathNode> {
        let children: Array<XPathNode> = [];
        for (let elem of this.elem.children) {
            children.push(new XPathNode(elem));
        }
        return children;
    }
    get descendants(): Array<XPathNode> {
        let descendants: Array<XPathNode> = [];
        for (let elem of this.elem.querySelectorAll('*')) {
            descendants.push(new XPathNode(elem));
        }
        return descendants;
    }
    get sibling(): Array<XPathNode> {
        let sibling: Array<XPathNode> = [];
        let cursor = this.elem;
        while (cursor.previousElementSibling) {
            sibling.push(new XPathNode(cursor.previousElementSibling));
            cursor = cursor.previousElementSibling;
        }
        cursor = this.elem;
        while (cursor.nextElementSibling) {
            sibling.push(new XPathNode(cursor.nextElementSibling));
            cursor = cursor.nextElementSibling;
        }
        return sibling;
    }
    get previousElementSibling(): XPathNode | null {
        if (this.elem.previousElementSibling) {
            return new XPathNode(this.elem.previousElementSibling);
        }
        return null;
    }
    get nextSibling(): XPathNode | null {
        if (this.elem.nextElementSibling) {
            return new XPathNode(this.elem.nextElementSibling);
        }
        return null;
    }
    fromXPathString(str: string): XPathNode {
        throw new Error("Not implemented");
    }
    fromCSSSelector(str: string): XPathNode {
        throw new Error("Not implemented");
    }
    toXPathString(): string {
        throw new Error("Not implemented");
    }
    toCSSSelector(): string {
        throw new Error("Not implemented");
    }
}
