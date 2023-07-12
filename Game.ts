// 操作类型枚举
enum ActionType {
    TouchDown, // 按下
    TouchMove, // 移动
    TouchUp // 抬起
}

// 屏幕坐标实体类, 精确到0.01
type Point = {
    x: number;
    y: number;
}

// 操作实体类
type Action = {
    time: number; // 时间, 精确到0.01ms
    type: ActionType; // 操作类型
    point: Point; // 坐标
    groupNumber: number; // 操作分组标号, 负责区分 按下->移动->抬起 操作组合
}

type Timeline = {
    [time: number]: Array<Action>;
    parse(str: String): Timeline;
    toString(): String;
}

enum PlayerStatus {
    paused,
    playing,
    ended
}

type ScriptPlayer = {
    elem: HTMLElement;
    timeline: Timeline;
    play(): void;
    pause(): void;
    status: PlayerStatus;
    currentTime: number;
    playbackrate: number;

    showPoint: boolean;
    showTrack: number;

}

