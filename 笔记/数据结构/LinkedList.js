class FreezeableObject {
    #readonly = false;
    #data = new Proxy({}, {
        set(target, p, newValue, receiver) {
            // target[prop] = value;
            return true;
        }
    });
    get [Symbol.for('data')]() {
        return this.#data;
    }
}
class LinkedList {
    #data = {
        readonly: false,
        head: null
    };
    get head() {
        return this.#data.head;
    }
    set head(value) {
        if (this.#data.readonly)
            throw new Error("can't modify redonly List");
    }
    get tail() {
        let node = null;
        for (node of this)
            ;
        return node;
    }
    get length() {
        let count = 0;
        for (let i of this)
            count++;
        return count;
    }
    append(data) {
        let tail = this.tail;
        if (tail == null)
            this.head = new LinkedNode(data);
        else
            tail.next = new LinkedNode(data);
    }
    freeze() {
        for (let i of this)
            i.readonly = true;
    }
    toArray() {
        let arr = new Array();
        for (let node of this) {
            arr.push(node.data);
        }
        return arr;
    }
    [Symbol.iterator]() {
        return (function* (head) {
            for (let i = head; i != null; i = i.next)
                yield i;
        })(this.head);
    }
}
class LinkedNode {
    #data = {
        readonly: false,
        next: null,
        data: null
    };
    constructor(data = null) {
        this.#data.data = data;
    }
    get readonly() {
        return this.#data.readonly;
    }
    set readonly(value) {
        if (value === true)
            this.#data.readonly = true;
    }
    get next() {
        return this.#data.next;
    }
    set next(value) {
        if (this.#data.readonly)
            throw new Error("can't modify redonly Node");
        if (value != null && value.#data.readonly)
            throw new Error("can't attach redonly Node");
        this.#data.next = value;
    }
    get data() {
        return this.#data.data;
    }
    set data(value) {
        if (this.#data.readonly)
            throw new Error("can't modify redonly LinkedList");
        this.#data.data = value;
    }
}
