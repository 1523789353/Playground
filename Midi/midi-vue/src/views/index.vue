<template>
    <div id="index">
        <label id="midi-text-lable" for="midi-text">请输入midi代码：</label>
        <textarea id="midi-text" name="midi-text" cols="120" rows="20" v-model="text"></textarea>
        <div class="button-set">
            <label id="input-lable" for="input" role="button">导入Midi</label>
            <input
                id="input"
                type="file"
                accept=".mid,.midi"
                @change="input($event.target.files[0])"
                hidden />
            <button id="output" @click="output">导出Midi</button>
        </div>
        <a ref="download" download="out.midi" :href="fileUrl" hidden @change="console.log(123)"></a>
    </div>
</template>
<script>
import { Midi } from '@tonejs/midi'
export default {
    data() {
        return {
            fileUrl: '',
            text: `MFile 1 1 96
MTrk
000:00:000 Tempo 500000
000:00:000 KeySig 0 major
000:00:000 Par ch=1 c=11 v=127
000:00:000 Par ch=1 c=1 v=64
000:00:000 Par ch=1 c=91 v=0
000:00:000 Par ch=1 c=93 v=0
000:00:000 PrCh ch=1 p=41
000:00:000 On ch=1 n=50 v=127
000:00:480 Off ch=1 n=50 v=0
000:01:440 On ch=1 n=52 v=127
000:02:160 Off ch=1 n=52 v=0
000:02:880 On ch=1 n=50 v=127
000:03:600 Off ch=1 n=50 v=0
000:04:320 On ch=1 n=45 v=127
000:05:040 Off ch=1 n=45 v=0
000:05:760 On ch=1 n=47 v=127
000:06:480 Off ch=1 n=47 v=0
000:07:200 On ch=1 n=50 v=127
000:08:640 Off ch=1 n=50 v=0
TrkEnd
MTrk`,
            midi: new Midi()
        }
    },
    mounted() { },
    methods: {
        input(file) {
            let blobUrl = URL.createObjectURL(file);
            Midi.fromUrl(blobUrl)
                .then(midi => {
                    this.midi = midi;
                    console.log(midi);
                });
        },
        output() {
            this.midi = new Midi();
            let track = this.midi.addTrack();
            let data = this.format(
                this.text,
                /(\d+):(\d+):(\d+) (On|Off) ch=(\d+) n=(\d+) v=(\d+)/g,
                ['m', 's', 'ms', 'opt', 'ch', 'n', 'v']
            );
            let time = 0;
            for (let i = 0; i < data.length; i += 2) {
                let on = data[i], off = data[i + 1];
                let duration = this.timeDiff(off, on) / 8;
                track = track.addNote({
                    midi: on.n,
                    time,
                    duration,
                    ticks: time / 480,
                    durationTicks: duration / 480,
                    velocity: data.v / 127
                });
                time += duration
            }
            this.download();
        },
        format(text, reg, varNames) {
            reg = new RegExp(reg, 'g');
            let matchs = text.match(reg);
            let results = [];
            if (matchs == null) return results;
            for (let match of matchs) {
                void match.replace(reg, function handler(...args) {
                    args.shift();
                    let item = {};
                    for (let index in varNames) {
                        let name = varNames[index];
                        if (name == undefined) continue;
                        item[name] = args[index];
                    }
                    results.push(item);
                })
            }
            return results;
        },
        timeDiff(a, b) {
            return ((+a.m - b.m) * 60 + a.s - b.s) * 1000 + a.ms - b.ms;
        },
        download() {
            let blob = new Blob([this.midi.toArray()], { type: "arraybuffer" });
            this.fileUrl = URL.createObjectURL(blob);
            this.$nextTick(() => this.$refs.download.click());
        }
    }
}
</script>
<style lang="scss">
#index {
    padding: 8px;

    #midi-text-lable {
        display: block;
    }

    .button-set {
        padding: 8px;
        width: 200px;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-content: center;
        justify-content: space-between;
        align-items: center;
    }
}

*[role="button"],
button {
    display: inline-block;
    border: solid #808080 1px;
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 16px;
    color: #000000;
    background: #E0E0E0;
    cursor: pointer;

    &:hover {
        background: #D8D8D8;
    }

    &:active {
        background: #E8E8E8;
    }
}

*[hidden] {
    display: none;
}
</style>
