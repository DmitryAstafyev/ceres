// tslint:disable:no-bitwise
export default class Uint8 {

    public static fromAsciiStr(str: string): Uint8Array {
        const result = new Uint8Array(str.length);
        Array.prototype.forEach.call(str, (char: string, i: number) => {
            result[i] = char.charCodeAt(0);
        });
        return result;
    }

    public static toAsciiStr(data: Uint8Array): string {
        let result = '';
        data.map((code: number) => {
            result += String.fromCharCode(code);
            return code;
        });
        return result;
    }

    public static fromUtf8Str(str: string): Uint8Array {
        // Source of method implementation: https://stackoverflow.com/questions/18729405/how-to-convert-utf8-string-to-byte-array
        const utf8 = [];
        for (let i = 0; i < str.length; i++) {
            let charcode = str.charCodeAt(i);
            if (charcode < 0x80)  {
                utf8.push(charcode);
            } else if (charcode < 0x800) {
                utf8.push(0xc0 | (charcode >> 6),
                          0x80 | (charcode & 0x3f));
            } else if (charcode < 0xd800 || charcode >= 0xe000) {
                utf8.push(0xe0 | (charcode >> 12),
                          0x80 | ((charcode >> 6) & 0x3f),
                          0x80 | (charcode & 0x3f));
            } else {
                i++;
                // UTF-16 encodes 0x10000-0x10FFFF by
                // subtracting 0x10000 and splitting the
                // 20 bits of 0x0-0xFFFFF into two halves
                charcode = 0x10000 + (((charcode & 0x3ff) << 10)
                          | (str.charCodeAt(i) & 0x3ff));
                utf8.push(0xf0 | (charcode >> 18),
                          0x80 | ((charcode >> 12) & 0x3f),
                          0x80 | ((charcode >> 6) & 0x3f),
                          0x80 | (charcode & 0x3f));
            }
        }
        return new Uint8Array(utf8);
    }

    public static toUtf8Str(bytes: Uint8Array): string {
        // Source of method implementation: https://stackoverflow.com/questions/17191945/conversion-between-utf-8-arraybuffer-and-string
        let out = "";
        let i = 0;
        const len = bytes.length;
        while (i < len) {
            let char2;
            let char3;
            const c = bytes[ i++ ];
            switch (c >> 4) {
                case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
                    // 0xxxxxxx
                    out += String.fromCharCode(c);
                    break;
                case 12: case 13:
                    // 110x xxxx   10xx xxxx
                    char2 = bytes[i++];
                    out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                    break;
                case 14:
                    // 1110 xxxx  10xx xxxx  10xx xxxx
                    char2 = bytes[i++];
                    char3 = bytes[i++];
                    out += String.fromCharCode(((c & 0x0F) << 12) |
                                                ((char2 & 0x3F) << 6) |
                                                ((char3 & 0x3F) << 0));
                    break;
            }
        }
        return out;
    }

    public static toUint8(int: number): Uint8Array {
        return new Uint8Array((new Uint8Array([int])).buffer);
    }

    public static fromUint8(bytes: Uint8Array): number {
        const int8 = new Uint8Array((new Uint8Array(bytes)).buffer);
        return int8[0];
    }

    public static validate(value: number): Error | undefined {
        if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
            return new Error(`Invalid basic type: ${typeof value}. Expected type: number.`);
        }
        const generated: number = this.fromUint8(this.toUint8(value));
        return generated === value ? undefined : new Error(`Values dismatch. Original value: ${value}. Encoded & decoded value: ${generated}`);
    }
}
