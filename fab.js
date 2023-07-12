function* fab() {
    let [a, b] = [1, 1];
    while (b !== Infinity) {
        [a, b] = [b, a + b];
        yield a;
    }
    while (true) yield Infinity;
}
