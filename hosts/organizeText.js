function organizeText(text) {
    let lines = text.split('\n');
    lines = Array.from(new Set(lines));
    lines.sort((a, b) => {
        if (a === b) return 0;
        let cursor = 0;
        while (cursor < Math.min(a.length, b.length)) {
            let diff = a.charCodeAt(0) - b.charCodeAt(0)
            if (diff !== 0)
                return diff;
            cursor++;
        }
        return a.length - b.length;
    });
    return lines.join('\n');
}
