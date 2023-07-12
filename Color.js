class Color {
    alpha = 1;

    red = 0;
    green = 0;
    blue = 0;

    hue = 0;
    saturation = 0;
    lightness = 0;

    decimal = 0;

    constructor() {

    }
    /**
     *
     * @param hex {string}
     */
    static fromHex(hex) {
        hex = Color.textReader(hex);
        if (hex.read(1) !== '#') {
            throw new Error('Invalid hex color');
        }
        let bit;
        switch (hex.length) {
            case 3:
            case 4:
                bit = 1;
            case 6:
            case 8:
                bit = 2;
        }
        return new Color(
            parseInt(hex.read(bit), 16),
            parseInt(hex.read(bit), 16),
            parseInt(hex.read(bit), 16),
            (n => Number.isNaN(n) ? 0 : n)(parseInt(hex.read(bit), 16) / 255)
        );
    }
    static fromRgb(rgb) {
        let cursor = 0;
    }
    static fromHsl(hsl) {

    }
    static fromDecimal(decimal) {

    }
    static textReader(text) {
        return {
            text,
            cursor: 0,
            read(length) {
                return this.text.substring(this.cursor, this.cursor += length);
            }
        }
    }
}

class NightMode {
    static #instance = null;
    maxBrightness = 0.7;
    targetColor = '#202124';

    constructor() {
        if (NightMode.#instance) {
            return NightMode.#instance;
        }
        this.init();
    }

    init() {
        this.checkStyles();
        this.checkElements();
    }
    checkColor(color) {
        // hex/rgb/rgba/hsl/hsla to rgb
        if (color.startsWith('#')) {
            color = color.substring(1);
            if (color.length === 3) {
                color = color.split('').map(c => c + c).join('');
            }
            color = color.match(/.{2}/g).map(c => parseInt(c, 16));
        } else if (color.startsWith('rgb')) {
            color = color.match(/\d+/g).map(c => parseInt(c));
        } else if (color.startsWith('hsl')) {
            color = color.match(/\d+/g).map(c => parseInt(c));
            color = this.hslToRgb(color[0], color[1], color[2]);
        }
    }
    checkStyles() {
        const styles = document.querySelectorAll('style');
        for (let style of styles) {

        }
    }
    checkElements() { }
}
