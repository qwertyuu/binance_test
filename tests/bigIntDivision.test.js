const { expect } = require('@jest/globals');
const bigIntDivision = require('../src/bigIntDivision');

test('division works for numerator equal to denominator', () => {
    expect(bigIntDivision(BigInt(5), BigInt(5))).toStrictEqual("1");
});

test('division works for repeating decimals, respecting precision and has rounding', () => {
    expect(bigIntDivision(BigInt(250), BigInt(6), 5)).toStrictEqual("41.66667");
});

test('division works for whole number answer', () => {
    expect(bigIntDivision(BigInt(246), BigInt(6), 5)).toStrictEqual("41");
});

test('division on denominator bigger than numerator', () => {
    expect(bigIntDivision(BigInt(249), BigInt(250), 5)).toStrictEqual("0.996");
});

test('division on very big integers with decimal place', () => {
    expect(bigIntDivision(BigInt('1000000000000000000000000000000000000000000000000000'), BigInt('1000000000000000000000000000000000000000000000000001'), 64)).toStrictEqual("0.9999999999999999999999999999999999999999999999999990000000000000");
});

test('division on very big integers, flush answer', () => {
    expect(bigIntDivision(BigInt('1000000000000000000000000000000000000000000000000000'), BigInt('2'), 64)).toStrictEqual("500000000000000000000000000000000000000000000000000");
});

test('division on +1 denominator', () => {
    expect(bigIntDivision(BigInt('10'), BigInt('11'), 10)).toStrictEqual("0.9090909091");
});

test('division goes to full integer after rounding', () => {
    expect(bigIntDivision(BigInt('99999'), BigInt('1000'), 2)).toStrictEqual("100");
});

test('nines all the way to the integer part of the answer', () => {
    expect(bigIntDivision(BigInt('109999'), BigInt('1000'), 2)).toStrictEqual("110");
});

test('first non-nine starting from the end of the answer after division is to the left side of the decimal place', () => {
    expect(bigIntDivision(BigInt('999'), BigInt('1000'), 2)).toStrictEqual("1");
});

test('first non-nine from the right after division is to the right side of the decimal place', () => {
    expect(bigIntDivision(BigInt('99'), BigInt('1000'), 2)).toStrictEqual("0.1");
});

test('random failed test (834/27)', () => {
    expect(bigIntDivision(BigInt('834'), BigInt('27'), 2)).toStrictEqual("30.89");
});

test('supports precision 0 division', () => {
    expect(bigIntDivision(BigInt('834'), BigInt('27'), 0)).toStrictEqual("30");
});

test('divide by 0 throws', () => {
    expect(() => {
        bigIntDivision(BigInt('834'), BigInt('0'), 2);
    }).toThrow();
});

test('divide 0 returns 0', () => {
    expect(bigIntDivision(BigInt('0'), BigInt('27'), 2)).toStrictEqual("0");
});

test('cannot divide by negative numbers', () => {
    expect(() => {
        bigIntDivision(BigInt('-1'), BigInt('5'), 2);
    }).toThrow();
    expect(() => {
        bigIntDivision(BigInt('-1'), BigInt('-1'), 2);
    }).toThrow();
    expect(() => {
        bigIntDivision(BigInt('6'), BigInt('-1'), 2);
    }).toThrow();
});

function toFixed( num, precision ) {
    return (+(Math.round(+(num + 'e' + precision)) + 'e' + -precision)).toFixed(precision);
}
const pairs = [];
for (let i = 0; i < 5000; i++) {
    const numerator = Math.floor(Math.random() * 1000) + 1;
    const denominator = Math.floor(Math.random() * 1000) + 1;
    pairs.push([numerator, denominator]);
}
test.each(pairs)(
    '%i / %i',
    (numerator, denominator) => {
        let division = bigIntDivision(BigInt(numerator), BigInt(denominator), 2);
        if (division.indexOf('.') > -1) {
            division = division.replace(/0+$/, '').replace(/\.+$/, '');
        }
        expect(division).toStrictEqual(toFixed(numerator / denominator, 2).toString().replace(/0+$/, '').replace(/\.+$/, ''));
    }
);
