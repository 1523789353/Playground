function *pinGenerator(length, splitStep = Infinity) {
    let charTable = [
        ...Array(10).fill(0).map((item, index) => String.fromCharCode('0'.charCodeAt(0) + index)),
        ...Array(26).fill(0).map((item, index) => String.fromCharCode('a'.charCodeAt(0) + index)),
        ...Array(26).fill(0).map((item, index) => String.fromCharCode('A'.charCodeAt(0) + index))
    ]
    let splitorLength = Math.ceil(length / splitStep) - 1;
    let pinLength = length + splitorLength;
    while (true) {
        let charArray = Array(pinLength).fill();
        for (let index in charArray) {
            if (index % (splitStep + 1) == splitStep) {
                charArray[index] = '-';
                continue;
            }
            let randomIndex = parseInt(Math.random() * charTable.length);
            charArray[index] = charTable.at(randomIndex);
        }
        yield charArray.join('').toUpperCase();
    }
}

class PinFormat {
    
}
