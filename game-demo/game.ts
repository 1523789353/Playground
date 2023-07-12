class Game {

}


// https://osu.ppy.sh/wiki/zh/Gameplay/Score/ScoreV1/osu%21mania
// https://www.bilibili.com/read/cv3571833/
class GameSession {
    /*
        Judgement  HitValue  HitBonusValue  HitBonus  HitPunishment
        MAX        320       32             2         /
        300        300       32             1         /
        200        200       16             /         8
        100        100       8              /         24
        50         50        4              /         44
        Miss       0         0              /         ∞
    */

    /*
        Mod         ModMultiplier   ModDivider
        Easy        0.5             /
        NoFail      0.5             /
        HalfTime    0.5             /
        HardRock    /               1.08
        DoubleTime  /               1.1
        NightCore   /               1.1
        FadeIn      /               1.06
        Hidden      /               1.06
        Flashlight  /               1.06
     */

    maxScore = 1_000_000;
    totalNotes: number;
    modMultiplier: number;
    modDivider: number;
    get score() { return this.baseScore + this.bonusScore; }

    baseScore: number;  // 基础分数 (MaxScore * ModMultiplier * 0.5 / TotalNotes) * (HitValue / 320)
    bonusScore: number; // 奖励分数 (MaxScore * ModMultiplier * 0.5 / TotalNotes) * (HitBonusValue * Sqrt(Bonus) / 320)
    bonus: number;      // Bonus before this hit + HitBonus - HitPunishment / ModDivider
}

enum NoteType {
    Tap,    // 点击
    Hold,   // 长条
}

class NoteJudgeRule {
    static FullPerfect = new NoteJudgeRule(timeDelta => 0 <= timeDelta && timeDelta <= 20);
    static Perfect = new NoteJudgeRule(timeDelta => 20 < timeDelta && timeDelta <= 20);
    static Great = new NoteJudgeRule(timeDelta => 0 <= timeDelta && timeDelta <= 20);
    static Good = new NoteJudgeRule(timeDelta => 0 <= timeDelta && timeDelta <= 20);
    static Bad = new NoteJudgeRule(timeDelta => 0 <= timeDelta && timeDelta <= 20);
    static Miss = new NoteJudgeRule(timeDelta => 0 <= timeDelta);

    match: (timeDelta: number) => boolean;

    constructor(match: (timeDelta: number) => boolean) {
        this.match = match;
    }
}

class Note {
    type: NoteType;         // Note类型
    time: number;           // 出现时间
    lane: number;           // 出现位置
    duration?: number;      // 持续时间
    hitTime?: number;       // 击中时间
    Judge?: NoteJudgeRule;  // 分数等级
}

class BeatMap {
    duration: number;
    notes: Note[];
}
