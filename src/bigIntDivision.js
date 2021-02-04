/*
Algorithm to divide big integers without a library

The reason is to support absurdly large numbers for calculating the averages in case the application runs for a very long time. 
It will take a very long time before it halts, therefore making this app (probably) more resistant than Binance's api itself.

@see: https://www.youtube.com/watch?v=5XyaJ_Myqc8
*/
function bigIntDivision(numerator, denominator, precision = 5) {
    if (denominator === BigInt(0)) {
        throw new Error("Cannot divide by 0");
    }
    if (!numerator) {
        return "0";
    }
    if (numerator < BigInt(0) || denominator < BigInt(0)) {
        throw new Error("Cannot divide negative numbers");
    }
    
    let hasDecimal = false;
    let answer = "";
    let numeratorAsString = numerator.toString();
    let numbersAfterDecimal = 0;
    let numberToDivide = BigInt(0);
    let digitPositionPointer = 0;

    // Find first smallest number we can divide by
    // Example: 250/5 would be 25 because we can't evenly divide 2 by 5.
    do {
        digitPositionPointer++;
        if (digitPositionPointer > numeratorAsString.length) {
            if (!hasDecimal) {
                if (precision === 0) {
                    return "0";
                }
                answer += "0.";
                hasDecimal = true;
            } else {
                answer += "0";
            }
            numbersAfterDecimal++;
            numberToDivide = BigInt(numeratorAsString + '0'.repeat(numbersAfterDecimal));
        } else {
            numberToDivide = BigInt(numeratorAsString.substring(0, digitPositionPointer));
        }
    } while(numberToDivide < denominator)
    
    // Once found, we floor-divide this number by our denominator. 25/5 = 5 and add this to our answer
    const toRemove = bigIntFloorDivision(numberToDivide, denominator);
    answer += toRemove.toString();
    const actualRemove = toRemove * denominator;
    // Keep the remaining part and continue dividing
    let remainder = (numberToDivide - actualRemove).toString();
    let insideNumerator = bumpInsideNumerator(remainder, numeratorAsString, digitPositionPointer);

    // While we still have stuff to divide or that we hit the precision limit, find a new number to add to the answer and continue dividing
    while(numbersAfterDecimal < (precision + 1) && (insideNumerator > BigInt(0) || digitPositionPointer < numeratorAsString.length)) {

        // Still, searching for a whole number bigger than the denominator to divide by (make sure we keep track of where the decimals is too!)
        while(numbersAfterDecimal < (precision + 1) && insideNumerator < denominator && insideNumerator > BigInt(0)) {
            digitPositionPointer++;
            if (digitPositionPointer > numeratorAsString.length) {
                if (!hasDecimal) {
                    if (precision === 0) {
                        return answer;
                    }
                    answer += ".";
                    hasDecimal = true;
                }
                numbersAfterDecimal++;
                answer += "0";
                insideNumerator = BigInt(insideNumerator.toString() + '0');
            } else {
                answer += "0";
                insideNumerator = bumpInsideNumerator(insideNumerator.toString(), numeratorAsString, digitPositionPointer);
            }
        }
        if (numbersAfterDecimal >= precision + 1) {
            break;
        }
        if (digitPositionPointer >= numeratorAsString.length && !hasDecimal) {
            if (precision === 0) {
                return answer;
            }
            answer += ".";
            hasDecimal = true;
        }
        // Same logic as first pass, could be refactored
        const toRemove = bigIntFloorDivision(insideNumerator, denominator);
        answer += toRemove.toString();
        const actualRemove = toRemove * denominator;
        remainder = (insideNumerator - actualRemove).toString();
        if (hasDecimal) {
            numbersAfterDecimal++;
        }
        digitPositionPointer++;
        insideNumerator = bumpInsideNumerator(remainder, numeratorAsString, digitPositionPointer);
    }

    // rounding logic :D
    if (numbersAfterDecimal > precision) {
        if (answer[answer.length - 1] >= 5) {
            const roundedLastDigit = parseInt(answer[answer.length - 2]) + 1;
            // propagate the round up if the digit to round is a 9
            if (roundedLastDigit == 10) {
                // find the first non-9 number starting from the end
                let decimalPlaceIndex = -1;
                let firstNonNine = -1;
                for (let i = answer.length - 3; i >= 0; i--) {
                    if (answer[i] != 9 && answer[i] !== ".") {
                        firstNonNine = i;
                        break;
                    } else if (answer[i] === ".") {
                        decimalPlaceIndex = i;
                    }
                }
                // case: the number is ALL 9s
                if (firstNonNine === -1) {
                    answer = '1' + '0'.repeat(decimalPlaceIndex);
                }

                // case: the number becomes non-9 to the left of the decimal place
                else if (firstNonNine < decimalPlaceIndex) {
                    const firstNonNineRounded = parseInt(answer[firstNonNine]) + 1;
                    answer = answer.substring(0, firstNonNine) + firstNonNineRounded.toString();
                    answer += '0'.repeat(decimalPlaceIndex - (firstNonNine + 1));
                }
                
                // case: the number becomes non-9 to the right of the decimal place
                else {
                    const firstNonNineRounded = parseInt(answer[firstNonNine]) + 1;
                    answer = answer.substring(0, firstNonNine) + firstNonNineRounded.toString();
                }

            } else {
                // "straight-forward" rounding. Just do + 1
                answer = answer.substring(0, answer.length - 2) + roundedLastDigit.toString();
            }
        } else {
            // "straight-forward" rounding but the last digit is < 5 so we just remove it
            answer = answer.substring(0, answer.length - 1);
        }
    }
    return answer;
}

// Either pick a number that is available from the numerator or a 0 to add to the inside numerator to keep working on the division
function bumpInsideNumerator(remainder, numeratorAsString, digitPositionPointer) {
    if (digitPositionPointer >= numeratorAsString.length) {
        return BigInt(remainder + '0');
    }
    return BigInt(remainder + numeratorAsString[digitPositionPointer]);
}

function bigIntFloorDivision(numerator, denominator) {
    let amt = BigInt(1);
    while (numerator >= denominator * amt) {
        amt = amt + BigInt(1);
    }
    return amt - BigInt(1);
}

module.exports = bigIntDivision;