export default class Boolean {

    public static toUint8(value: any): Uint8Array {
        return new Uint8Array((new Uint8Array([value ? 1 : 0])).buffer);
    }

    public static fromUint8(bytes: Uint8Array): boolean {
        const int8 = new Uint8Array((new Uint8Array(bytes)).buffer);
        return int8[0] === 1;
    }

    public static validate(value: number): Error | undefined {
        if (typeof value !== 'boolean') {
            return new Error(`Invalid basic type: ${typeof value}. Expected type: boolean.`);
        }
        return undefined;
    }

}
