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
    totalNotes;
    modMultiplier;
    modDivider;
    get score() { return this.baseScore + this.bonusScore; }
    baseScore; // 基础分数 (MaxScore * ModMultiplier * 0.5 / TotalNotes) * (HitValue / 320)
    bonusScore; // 奖励分数 (MaxScore * ModMultiplier * 0.5 / TotalNotes) * (HitBonusValue * Sqrt(Bonus) / 320)
    bonus; // Bonus before this hit + HitBonus - HitPunishment / ModDivider
}
var NoteType;
(function (NoteType) {
    NoteType[NoteType["Tap"] = 0] = "Tap";
    NoteType[NoteType["Hold"] = 1] = "Hold";
})(NoteType || (NoteType = {}));
class NoteJudgeRule {
    static FullPerfect = new NoteJudgeRule(timeDelta => 0 <= timeDelta && timeDelta <= 20);
    static Perfect = new NoteJudgeRule(timeDelta => 20 < timeDelta && timeDelta <= 20);
    static Great = new NoteJudgeRule(timeDelta => 0 <= timeDelta && timeDelta <= 20);
    static Good = new NoteJudgeRule(timeDelta => 0 <= timeDelta && timeDelta <= 20);
    static Bad = new NoteJudgeRule(timeDelta => 0 <= timeDelta && timeDelta <= 20);
    static Miss = new NoteJudgeRule(timeDelta => 0 <= timeDelta);
    match;
    constructor(match) {
        this.match = match;
    }
}
class Note {
    type; // Note类型
    time; // 出现时间
    lane; // 出现位置
    duration; // 持续时间
    hitTime; // 击中时间
    Judge; // 分数等级
}
class BeatMap {
    duration;
    notes;
}
