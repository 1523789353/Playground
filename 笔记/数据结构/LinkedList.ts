
interface ILinkedList<T> {
    head: ILinkedNode<T> | null;
    length: number;

    toArray(): Array<T | null>;
    [Symbol.iterator]()
}

interface ILinkedNode<T> {
    next: ILinkedNode<T> | null;
    data: T | null;
}



class FreezeableObject {
    #readonly: boolean = false;
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



class LinkedList<T> implements ILinkedList<T> {
    #data: {
        readonly: boolean;
        head: LinkedNode<T> | null;
    } = {
            readonly: false,
            head: null
        }

    get head(): LinkedNode<T> | null {
        return this.#data.head;
    }
    set head(value: LinkedNode<T> | null) {
        if (this.#data.readonly)
            throw new Error("can't modify redonly List")

    }
    get tail(): LinkedNode<T> | null {
        let node: LinkedNode<T> | null = null;
        for (node of this);
        return node;
    }
    get length() {
        let count = 0;
        for (let i of this)
            count++;
        return count;
    }

    append(data: T) {
        let tail = this.tail;
        if (tail == null)
            this.head = new LinkedNode<T>(data)
        else
            tail.next = new LinkedNode<T>(data)
    }
    freeze() {
        for (let i of this)
            i.readonly = true;
    }
    toArray(): Array<T | null> {
        let arr = new Array<T | null>();
        for (let node of this) {
            arr.push(node.data);
        }
        return arr;
    }
    [Symbol.iterator]() {
        return (
            function* (head) {
                for (let i = head; i != null; i = i.next)
                    yield i;
            }
        )(this.head)
    }
}

class LinkedNode<T> implements ILinkedNode<T> {
    #data: {
        readonly: boolean;
        next: LinkedNode<T> | null;
        data: T | null;
    } = {
            readonly: false,
            next: null,
            data: null
        }

    constructor(data: T | null = null) {
        this.#data.data = data
    }

    get readonly(): boolean {
        return this.#data.readonly
    }
    set readonly(value: boolean) {
        if (value === true)
            this.#data.readonly = true
    }

    get next(): LinkedNode<T> | null {
        return this.#data.next
    }
    set next(value: LinkedNode<T> | null) {
        if (this.#data.readonly)
            throw new Error("can't modify redonly Node")
        if (value != null && value.#data.readonly)
            throw new Error("can't attach redonly Node")
        this.#data.next = value
    }

    get data(): T | null {
        return this.#data.data
    }
    set data(value: T | null) {
        if (this.#data.readonly)
            throw new Error("can't modify redonly LinkedList")
        this.#data.data = value
    }
}
