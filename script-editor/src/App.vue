<template>
    <div id="script-editor">
        <el-row :gutter="20" style="width: 720px">
            <el-col :span="24">
                <el-upload
                    ref="scriptSelector"
                    class="script-selector"
                    :auto-upload="false"
                    :on-change="getScript"
                    :limit="1"
                >
                    <el-button
                        type="primary"
                        @click="$refs.scriptSelector.clearFiles()"
                    >
                        <span>添加脚本</span>
                        <el-icon><Plus /></el-icon>
                    </el-button>
                </el-upload>
            </el-col>
            <el-col :span="24">
                <el-input
                    class="inline"
                    v-model="player.delay"
                    placeholder="请输入全局延迟"
                >
                    <template #prepend>全局延迟:</template>
                </el-input>
            </el-col>
            <el-col :span="24">
                <el-input
                    class="inline"
                    v-model="player.rate"
                    placeholder="请输入运行速率"
                >
                    <template #prepend>运行速率:</template>
                </el-input>
            </el-col>
            <el-col :span="24">
                <el-input
                    class="inline"
                    v-model="player.scale"
                    placeholder="请输入播放器缩放"
                >
                    <template #prepend>播放器缩放:</template>
                </el-input>
            </el-col>
            <el-col :span="24">
                <el-button type="primary" @click="play">
                    <span>播放脚本</span>
                    <el-icon><right /></el-icon>
                </el-button>
            </el-col>
        </el-row>
        <div
            id="preview"
            :style="`
                width: ${player.width * player.scale}px;
                height: ${player.height * player.scale}px;
            `"
        >
            <div
                class="preview-touch"
                v-for="(touchPoint, id) in player.touchPoints"
                :key="id"
                :style="`
                    left: ${touchPoint.x * player.scale}px;
                    top: ${touchPoint.y * player.scale}px;
                `"
            ></div>
        </div>
        <div id="timeline"></div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

declare global {
    interface String {
        format(this: string, ...args: any[]): string;
    }
}
String.prototype.format = function (this: string, ...args: any[]) {
    return this.replace(
        /{(\d+)}/g,
        (raw: string, num: number) => args[num] ?? raw
    );
};

export default defineComponent({
    name: "App",
    data() {
        return {
            codes: Array<{
                cmd: string;
                base: string;
                args: Array<number>;
            }>(),
            player: {
                width: 2732,
                height: 2048,
                scale: 0.25,
                delay: 0,
                rate: 1,
                touchPoints: {} as {
                    [key: number]: {
                        x: number;
                        y: number;
                    };
                },
                startTime: 0,
            },
        };
    },
    methods: {
        // 读取脚本文件
        getScript(ElFile: any) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                const script = e.target.result;
                this.parseScript(script);
            };
            reader.readAsText(ElFile.raw);
        },
        // 解析脚本代码
        parseScript(text: string) {
            // 拆分多行
            let lines = text.split(/\r\n|\r|\n/g);
            // 开始解析
            for (let line of lines) {
                line = line.trim();
                // 获取命令
                let cmd: string = (line.match(/^\w+/) ?? [])[0] ?? "";
                // 对不同命令进行处理
                switch (cmd) {
                    // 不需要处理的命令
                    case "const": // 导入指令
                    case "appActivate": // 启动应用
                        this.codes.push({
                            cmd,
                            base: line,
                            args: [],
                        });
                        break;
                    // 需要处理的命令
                    case "touchDown": // 按下, 参数: [id: 触摸点编号, x: x坐标, y: y坐标]
                    case "touchMove": // 移动, 参数: [id: 触摸点编号, x: x坐标, y: y坐标]
                    case "touchUp": // 抬起, 参数: [id: 触摸点编号, x: x坐标, y: y坐标]
                    case "usleep": // 休眠, 参数: [时间: 微秒(1/1000000秒)]
                        this.codes.push({
                            cmd,
                            ...this.parseCmd(line),
                        });
                        break;
                    // 非命令内容
                    default:
                        // console.warn("Skiped line: " + line)
                        // 获取屏幕分辨率
                        if (line.includes("Resolution")) {
                            let arr = line.match(/(\d+)/g);
                            if (arr?.length == 2) {
                                this.player.width = parseInt(arr[1]);
                                this.player.height = parseInt(arr[0]);
                            }
                        }
                        break;
                }
            }
        },
        // 解析命令
        parseCmd(cmd: string) {
            let reg: RegExp = /\d+(\.\d+)?/g,
                index: number = 0,
                base: string = cmd.replace(reg, () => `{${index++}}`),
                args: Array<number> = (cmd.match(reg) ?? []).map((i) =>
                    parseFloat(i)
                );
            return {
                base: base,
                args: args,
            };
        },
        // 播放脚本
        async play() {
            let startTime = (this.player.startTime = Date.now());
            this.player.touchPoints = {};
            let codeTime = 0;
            for (let code of this.codes) {
                // 如果有新的播放, 则停止当前播放
                if (startTime !== this.player.startTime) {
                    return;
                }
                switch (code.cmd) {
                    case "touchDown": // 按下, 创建元素
                    case "touchMove": // 移动, 改变元素位置
                        this.player.touchPoints[code.args[0]] = {
                            x: code.args[1],
                            y: code.args[2],
                        };
                        break;
                    case "touchUp": // 抬起, 删除元素
                        delete this.player.touchPoints[code.args[0]];
                        break;
                    case "usleep": // 休眠
                        // 脚本时间(乘倍率)
                        codeTime += code.args[0] / this.player.rate;
                        // 当前时间, 以及修正误差后的休眠时间
                        let currunt = Date.now() - startTime,
                            sleepTime = codeTime / 1000 - currunt;
                        // 休眠
                        await this.sleep(sleepTime);
                        break;
                    default:
                        break;
                }
            }
            this.player.startTime = 0;
        },
        sleep(ms: number): Promise<void> {
            return new Promise((res) => (ms > 0 ? setTimeout(res, ms) : res()));
        },
    },
});
</script>

<style lang="scss" scoped>
.inline {
    display: inline-block;
}

#preview {
    position: relative;
    background: #fff;
    border: 1px solid #bbb;
}

.preview-touch {
    position: absolute;

    &:before,
    &:after {
        content: "";
        position: absolute;
        background: #00f;
        z-index: 1;
    }

    &:before {
        width: 21px;
        height: 1px;
        left: -10px;
    }

    &:after {
        width: 1px;
        height: 21px;
        top: -10px;
    }
}
</style>
