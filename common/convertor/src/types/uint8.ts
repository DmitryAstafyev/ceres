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
        const result: number[] = [];
        Array.prototype.forEach.call(str, (char: string, i: number) => {
            // result.push(...Uint16.toUint8(char.charCodeAt(0)));
        });
        return new Uint8Array(result);
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
