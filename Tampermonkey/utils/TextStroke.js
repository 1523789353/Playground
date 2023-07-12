function getTextStroke(color, width) {
    class TextShadow {
        #shadows = []
        add(h, v, blur, color) {
            this.#shadows.push({
                h, v, blur, color,
                toString() {
                    function num2px(num) {
                        if (num == 0) return '0';
                        let decimal = (num % 1).toString();
                        return (decimal.length > 4 ? num.toFixed(4) : num.toString()) + 'px';
                    }
                    return [num2px(h), num2px(v), num2px(blur), color].join(' ');
                }
            })
        }
        toString() {
            return `text-shadow: ${this.#shadows.join(',\n')}`;
        }
    }
    let textShadow = new TextShadow();
    const range = Math.ceil(2 * Math.PI * width) /* 字体阴影的数量 */
    var str = ''
    for (var i = 0; i < range; i++) { /* 在 n 个方向上均匀分布 text-shadow */
        const theta = 2 * Math.PI * i / range;
        textShadow.add(width * Math.cos(theta), width * Math.sin(theta), 0, color);
    }
    return textShadow.toString();
}
