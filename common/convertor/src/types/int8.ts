export default class Int8 {

    public static toUint8(int: number): Uint8Array {
        return new Uint8Array((new Int8Array([int])).buffer);
    }

    public static fromUint8(bytes: Uint8Array): number {
        const int8 = new Int8Array((new Uint8Array(bytes)).buffer);
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
