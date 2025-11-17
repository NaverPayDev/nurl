/* eslint-disable eqeqeq */
/* eslint-disable no-param-reassign */

interface PunycodeStatic {
    version: string
    ucs2: {
        decode(string: string): number[]
        encode(codePoints: number[]): string
    }
    decode(input: string): string
    encode(input: string): string
    toASCII(input: string): string
    toUnicode(input: string): string
}

type ErrorMessages = Record<string, string>

/** Highest positive signed 32-bit float value */
const maxInt: number = 2147483647 // aka. 0x7FFFFFFF or 2^31-1

/** Bootstring parameters */
const base: number = 36
const tMin: number = 1
const tMax: number = 26
const skew: number = 38
const damp: number = 700
const initialBias: number = 72
const initialN: number = 128 // 0x80
const delimiter: string = '-' // '\x2D'

/** Regular expressions */
const regexPunycode: RegExp = /^xn--/
const regexNonASCII: RegExp = /[^\0-\x7F]/ // Note: U+007F DEL is excluded too.
const regexSeparators: RegExp = /[\x2E\u3002\uFF0E\uFF61]/g // RFC 3490 separators

/** Error messages */
const errors: ErrorMessages = {
    overflow: 'Overflow: input needs wider integers to process',
    'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
    'invalid-input': 'Invalid input',
}

/** Convenience shortcuts */
const baseMinusTMin: number = base - tMin
const floor: (x: number) => number = Math.floor
const stringFromCharCode: (...codes: number[]) => string = String.fromCharCode

/**
 * A generic error utility function.
 * @private
 * @param {string} type The error type.
 * @throws {RangeError} with the applicable error message.
 */
function error(type: string): never {
    throw new RangeError(errors[type])
}

/**
 * A generic `Array#map` utility function.
 * @private
 * @param {T[]} array The array to iterate over.
 * @param {(value: T) => U} callback The function that gets called for every array item.
 * @returns {U[]} A new array of values returned by the callback function.
 */
function map<T, U>(array: T[], callback: (value: T) => U): U[] {
    const result: U[] = new Array(array.length)
    let length: number = array.length
    while (length--) {
        result[length] = callback(array[length])
    }
    return result
}

/**
 * A simple `Array#map`-like wrapper to work with domain name strings or email addresses.
 * @private
 * @param {string} domain The domain name or email address.
 * @param {(string: string) => string} callback The function that gets called for every character.
 * @returns {string} A new string of characters returned by the callback function.
 */
function mapDomain(domain: string, callback: (string: string) => string): string {
    const parts: string[] = domain.split('@')
    let result: string = ''
    if (parts.length > 1) {
        // In email addresses, only the domain name should be punycoded. Leave
        // the local part (i.e. everything up to `@`) intact.
        result = parts[0] + '@'
        domain = parts[1]
    }
    // Avoid `split(regex)` for IE8 compatibility. See #17.
    domain = domain.replace(regexSeparators, '\x2E')
    const labels: string[] = domain.split('.')
    const encoded: string = map(labels, callback).join('.')
    return result + encoded
}

/**
 * Creates an array containing the numeric code points of each Unicode
 * character in the string.
 * @param {string} string The Unicode input string (UCS-2).
 * @returns {number[]} The new array of code points.
 */
function ucs2decode(string: string): number[] {
    const output: number[] = []
    let counter: number = 0
    const length: number = string.length

    while (counter < length) {
        const value: number = string.charCodeAt(counter++)
        if (value >= 0xd800 && value <= 0xdbff && counter < length) {
            // It's a high surrogate, and there is a next character.
            const extra: number = string.charCodeAt(counter++)
            if ((extra & 0xfc00) == 0xdc00) {
                // Low surrogate.
                output.push(((value & 0x3ff) << 10) + (extra & 0x3ff) + 0x10000)
            } else {
                // It's an unmatched surrogate; only append this code unit, in case the
                // next code unit is the high surrogate of a surrogate pair.
                output.push(value)
                counter--
            }
        } else {
            output.push(value)
        }
    }
    return output
}

/**
 * Creates a string based on an array of numeric code points.
 * @param {number[]} codePoints The array of numeric code points.
 * @returns {string} The new Unicode string (UCS-2).
 */
const ucs2encode = (codePoints: number[]): string => String.fromCodePoint(...codePoints)

/**
 * Converts a basic code point into a digit/integer.
 * @private
 * @param {number} codePoint The basic numeric code point value.
 * @returns {number} The numeric value of a basic code point.
 */
const basicToDigit = (codePoint: number): number => {
    if (codePoint >= 0x30 && codePoint < 0x3a) {
        return 26 + (codePoint - 0x30)
    }
    if (codePoint >= 0x41 && codePoint < 0x5b) {
        return codePoint - 0x41
    }
    if (codePoint >= 0x61 && codePoint < 0x7b) {
        return codePoint - 0x61
    }
    return base
}

/**
 * Converts a digit/integer into a basic code point.
 * @private
 * @param {number} digit The numeric value of a basic code point.
 * @param {number} flag The flag value.
 * @returns {number} The basic code point.
 */
const digitToBasic = (digit: number, flag: number): number => {
    //  0..25 map to ASCII a..z or A..Z
    // 26..35 map to ASCII 0..9
    // @descriptoin 원래 코드는 아래와 같았지만, 타입스크립트에서는 불리언 연산이 안되서 임의로 수정
    // return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5)
    return digit + 22 + 75 * (digit < 26 ? 1 : 0) - ((flag != 0 ? 1 : 0) << 5)
}

/**
 * Bias adaptation function as per section 3.4 of RFC 3492.
 * @private
 * @param {number} delta The delta value.
 * @param {number} numPoints The number of points.
 * @param {boolean} firstTime Whether this is the first time.
 * @returns {number} The adapted bias.
 */
const adapt = (delta: number, numPoints: number, firstTime: boolean): number => {
    let k: number = 0
    delta = firstTime ? floor(delta / damp) : delta >> 1
    delta += floor(delta / numPoints)
    for (; /* no initialization */ delta > (baseMinusTMin * tMax) >> 1; k += base) {
        delta = floor(delta / baseMinusTMin)
    }
    return floor(k + ((baseMinusTMin + 1) * delta) / (delta + skew))
}

/**
 * Converts a Punycode string of ASCII-only symbols to a string of Unicode symbols.
 * @param {string} input The Punycode string of ASCII-only symbols.
 * @returns {string} The resulting string of Unicode symbols.
 */
const decode = (input: string): string => {
    const output: number[] = []
    const inputLength: number = input.length
    let i: number = 0
    let n: number = initialN
    let bias: number = initialBias

    let basic: number = input.lastIndexOf(delimiter)
    if (basic < 0) {
        basic = 0
    }

    for (let j: number = 0; j < basic; ++j) {
        if (input.charCodeAt(j) >= 0x80) {
            error('not-basic')
        }
        output.push(input.charCodeAt(j))
    }

    for (let index: number = basic > 0 ? basic + 1 : 0; index < inputLength /* no final expression */; ) {
        const oldi: number = i
        for (let w: number = 1, k: number = base /* no condition */; ; k += base) {
            if (index >= inputLength) {
                error('invalid-input')
            }

            const digit: number = basicToDigit(input.charCodeAt(index++))

            if (digit >= base) {
                error('invalid-input')
            }
            if (digit > floor((maxInt - i) / w)) {
                error('overflow')
            }

            i += digit * w
            const t: number = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias

            if (digit < t) {
                break
            }

            const baseMinusT: number = base - t
            if (w > floor(maxInt / baseMinusT)) {
                error('overflow')
            }

            w *= baseMinusT
        }

        const out: number = output.length + 1
        bias = adapt(i - oldi, out, oldi == 0)

        if (floor(i / out) > maxInt - n) {
            error('overflow')
        }

        n += floor(i / out)
        i %= out

        output.splice(i++, 0, n)
    }

    return String.fromCodePoint(...output)
}

/**
 * Converts a string of Unicode symbols to a Punycode string of ASCII-only symbols.
 * @param {string} input The string of Unicode symbols.
 * @returns {string} The resulting Punycode string of ASCII-only symbols.
 */
const encode = (input: string): string => {
    const output: string[] = []

    // Convert the input in UCS-2 to an array of Unicode code points.
    const inputArray: number[] = ucs2decode(input)

    // Cache the length.
    const inputLength: number = inputArray.length

    // Initialize the state.
    let n: number = initialN
    let delta: number = 0
    let bias: number = initialBias

    // Handle the basic code points.
    for (const currentValue of inputArray) {
        if (currentValue < 0x80) {
            output.push(stringFromCharCode(currentValue))
        }
    }

    const basicLength: number = output.length
    let handledCPCount: number = basicLength

    // Finish the basic string with a delimiter unless it's empty.
    if (basicLength) {
        output.push(delimiter)
    }

    // Main encoding loop:
    while (handledCPCount < inputLength) {
        let m: number = maxInt
        for (const currentValue of inputArray) {
            if (currentValue >= n && currentValue < m) {
                m = currentValue
            }
        }

        const handledCPCountPlusOne: number = handledCPCount + 1
        if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
            error('overflow')
        }

        delta += (m - n) * handledCPCountPlusOne
        n = m

        for (const currentValue of inputArray) {
            if (currentValue < n && ++delta > maxInt) {
                error('overflow')
            }
            if (currentValue === n) {
                let q: number = delta
                for (let k: number = base /* no condition */; ; k += base) {
                    const t: number = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias
                    if (q < t) {
                        break
                    }
                    const qMinusT: number = q - t
                    const baseMinusT: number = base - t
                    output.push(stringFromCharCode(digitToBasic(t + (qMinusT % baseMinusT), 0)))
                    q = floor(qMinusT / baseMinusT)
                }

                output.push(stringFromCharCode(digitToBasic(q, 0)))
                bias = adapt(delta, handledCPCountPlusOne, handledCPCount === basicLength)
                delta = 0
                ++handledCPCount
            }
        }

        ++delta
        ++n
    }
    return output.join('')
}

/**
 * Converts a Punycode string representing a domain name or an email address to Unicode.
 * @param {string} input The Punycoded domain name or email address.
 * @returns {string} The Unicode representation of the given Punycode string.
 */
const toUnicode = (input: string): string => {
    return mapDomain(input, (string: string): string => {
        return regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string
    })
}

/**
 * Converts a Unicode string representing a domain name or an email address to Punycode.
 * @param {string} input The domain name or email address to convert.
 * @returns {string} The Punycode representation of the given domain name or email address.
 */
const toASCII = (input: string): string => {
    return mapDomain(input, (string: string): string => {
        return regexNonASCII.test(string) ? 'xn--' + encode(string) : string
    })
}

/** Define the public API */
/**
 * @description originated from https://unpkg.com/browse/punycode@2.3.1/
 */
const punycode: PunycodeStatic = {
    version: '2.3.1',
    ucs2: {
        decode: ucs2decode,
        encode: ucs2encode,
    },
    decode,
    encode,
    toASCII,
    toUnicode,
}

export {ucs2decode, ucs2encode, decode, encode, toASCII, toUnicode}
export default punycode
