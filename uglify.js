/** 仿Python range枚举器, 写着玩的 :) */
function* range(...opts) {
    let [start, stop, step] = [
        [0, opts[0], 1],
        [opts[0], opts[1], 1],
        [opts[0], opts[1], opts[2]]
    ][opts.length - 1] ?? {
        get [Symbol.iterator]() {
            throw new Error('expects 1~3 arguments, bug got ' + opts.length);
        }
    };
    for (let i = start; stop < 0 ? i > stop : i < stop; i += step)
        yield i;
}

/**
 * 数组去重
 * @param {Array<T>} array 需要去重的数组
 * @returns {Array<T>} 去重后的数组
 */
function union(array) {
    return Array.from(new Set(array));
}

/**
 * 打乱数组
 * @param {Array<T>} array 需要打乱的数组
 * @param {number} level 打乱等级, 数值越大, 打乱程度越大
 * @returns {Array<T>} 打乱后的数组
 */
function shuffleArray(array, level = 1) {
    if (array.length == 1 || level == 0) return array;
    for (let i = 0; i < array.length * level; i++) {
        let index = i % array.length;
        let randomIndex = parseInt(Math.random() * (array.length - 1));
        if (randomIndex == index)
            randomIndex++;
        [array[index], array[randomIndex]] = [array[randomIndex], array[index]];
    }
    return array
}

class Node {
    word = null;
    children = [];
    index = null;
    get childrenCount() {
        let count = 0;
        for (let child of this.children) {
            count += 1 + child.childrenCount;
        }
        return count;
    }
    constructor(word) {
        this.word = word;
    }
    allocate(indexArray) {
        for (let child of this.children) {
            // 分配index
            let subIndexArray = indexArray.splice(0, child.childrenCount + 1);
            // 父节点的index取最大值
            let maxIndex = Math.max(...subIndexArray);
            subIndexArray.splice(subIndexArray.indexOf(maxIndex), 1);
            child.index = maxIndex;
            // 子节点的index取剩下的值
            child.allocate(subIndexArray);
        }
    }
}

class WordTree {
    root = new Node('');
    constructor(...words) {
        for (let word of words) {
            this.add(word);
        }
    }
    add(word) {
        function add(node, word) {
            if (word == node.word) return;
            for (let child of node.children) {
                if (word.includes(child.word)) {
                    return add(child, word);
                }
            }
            let newNode = new Node(word);
            node.children.push(newNode);
        }
        add(this.root, word);
    }
    shuffle(level) {
        let indexArray = new Array(this.root.childrenCount).fill(0).map((_, i) => i);
        indexArray = shuffleArray(indexArray, level)
        this.root.allocate(indexArray);
    }
    toArray() {
        let nodes = [];
        function toArray(node) {
            nodes.push(node);
            for (let child of node.children) {
                toArray(child);
            }
        }
        toArray(this.root);
        nodes.shift();
        return nodes.sort((a, b) => a.index - b.index).map(n => n.word);
    }
}

/**
 * unicode转义
 * @param {string} string 需要转义的字符串
 * @returns {string} 转义后的字符串
 */
function unicodeEscape(string) {
    let specailChars = ['\t', '\r', '\n', '\v', '\f', '\b', '\0', '\'', '\"', '\\'];
    let charArray = Array.from(string);
    let escapedCharArray = charArray.map(char => {
        // 于 Latin1 范围内, 且不是特殊字符的不转义
        if (char.charCodeAt(0) < 0xFF && !specailChars.includes(char)) return char;
        return '\\u' + char.charCodeAt(0).toString(16).padStart(4, '0');
    })
    return escapedCharArray.join('');
}

function escape(string) {
    let specailChars = {
        '\r': '\\r',
        '\n': '\\n',
        '\'': '\\\''
    };
    let charArray = Array.from(string);
    let escapedCharArray = charArray.map(char => {
        if (!(char in specailChars)) return char;
        return specailChars[char];
    })
    return escapedCharArray.join('');
}

/**
 * 丑化/混淆代码
 * 注意: 丑化后的代码需要在浏览器环境下运行, 因为使用setTimeout替代了eval
 *       eval(code); == setTimeout(code); == new Function(code)();
 *       如需在其他环境中运行, 请自行替换codeRunner中的对应方法
 * @param {string} code 需要丑化的JavaScript代码
 * @returns {string} 丑化后的JavaScript代码
 */
function uglify(code) {
    // 匹配所有单词
    let allWords = code.match(/\w+/g);
    // 消除重复单词
    let words = union(allWords);
    // 打乱单词顺序
    let wordsTree = new WordTree(...words);
    wordsTree.shuffle(3);
    let wordsShuffle = wordsTree.toArray();
    // 单词索引 { [word]: index, ... }
    let words2index = Object.assign(...wordsShuffle.map((item, index) => ({ [item]: index })));

    // 丑化代码
    let uglyCodeBase = code.replaceAll(/\w+/g, target => words2index[target].toString(36));
    // 经过unicode转义的丑化代码, 用base64的话不仅要实现编码, 还要把解码函数嵌入到codeRunner里(懒)
    let escapedUglyCodeBase = escape(uglyCodeBase);

    // 单词分隔符
    let wordSplitor = '\u202e'; //
    // 解码器
    let codeRunner = `(a,b)=>void setTimeout(a.replaceAll(/\\w+/g,i=>b[parseInt(i,36)]))`;
    // 生成丑化代码
    let uglyCode = `(${codeRunner})('${escapedUglyCodeBase}','${wordsShuffle.join(wordSplitor)}'.split('${wordSplitor}'));`;

    return uglyCode;
}
