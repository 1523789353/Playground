enum PlayerSize {
    Small, // 小屏
    Wide, // 宽屏
    FullScreen, // 全屏
    PictureInPicture // 画中画
}

declare type PlayerConfig = {
    // player options
    elem: string | HTMLElement;
    video: VideoConfig;
    subtitle: SubtitleConfig;
    danmakuConfig?: DanmakuConfig;
    size: PlayerSize;
    controls?: boolean;
    preload?: string;

    // video tag attributes
    autoplay?: boolean;
    loop?: boolean;
    volume?: number;
    muted?: boolean;
    playbackRate?: number;
    width?: number;
    height?: number;
    poster?: string;
}

declare type VideoConfig = {
    source: Array<{
        resolution: string;
        url: string | URL;
        preview?: string | URL;
    }>;
    defaultResolution: string;
}

declare type SubtitleConfig = {
    source: Array<{
        lang: string;
        url: string | URL;
    }>;
    fontFamily: string;
    fontSize: number;
    fontWeight: string;
    fontColor: string;
    background: string;
    textOutline: string;
    textShadow: string;
    textAlign: string;
    opacity: number;
    scaleWithVideo: boolean;
    FadeInFadeOut: boolean;
}

declare type DanmakuConfig = {
    url: string | URL;
    maxCount: number;
}

class Player {
    constructor(config: PlayerConfig) {

    }
}
