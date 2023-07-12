class ArknightsDrawing {
    // 初始概率
    get initialProbability() { return 0.02; };
    // 统计信息
    statistics = {
        // 抽奖次数
        drawingCount: 0,
        // 中奖次数
        luckyCount: 0,
        // 中奖率
        get luckyRate() {
            return this.luckyCount / this.drawingCount;
        }
    }

    // 保底计数器
    badLuckCount = 0;
    // 动态中奖概率
    probability = this.initialProbability;

    // 抽奖
    draw() {
        // 抽奖次数+1
        this.statistics.drawingCount++;
        if (Math.random() < this.probability) {// 中奖
            // 中奖次数+1
            this.statistics.luckyCount++;
            // 重置计数器
            this.badLuckCount = 0;
            // 初始化概率
            this.probability = this.initialProbability;
        } else {// 未中奖
            // 保底计数+1
            this.badLuckCount++;
            // 当保底计数超过50次时，概率每次增加0.02
            if (this.badLuckCount > 50) {
                this.probability += this.initialProbability;
            }
        }
    }
}
var drawing = new ArknightsDrawing();
console.time('drawing')
// 模拟抽奖
for (let i = 0; i < 1E10; i++) {
    drawing.draw();
}
console.timeEnd('drawing');