export default class Float32 {

    public static toUint8(int: number): Uint8Array {
        return new Uint8Array((new Float32Array([int])).buffer);
    }

    public static fromUint8(bytes: Uint8Array): number {
        const float32 = new Float32Array((new Uint8Array(bytes)).buffer);
        return float32[0];
    }

    public static validate(value: number): Error | undefined {
        if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
            return new Error(`Invalid basic type: ${typeof value}. Expected type: number.`);
        }
        let generated: number = this.fromUint8(this.toUint8(value));
        if (generated !== value) {
            const valueAsStr: string = value.toString();
            const decimalPos: number = valueAsStr.indexOf('.');
            if (decimalPos === -1) {
                generated = Math.round(generated);
            } else {
                const decimal: number = valueAsStr.substr(decimalPos + 1, valueAsStr.length).length;
                generated = parseFloat(generated.toFixed(decimal));
            }
        }
        return generated === value ? undefined : new Error(`Values dismatch. Original value: ${value}. Encoded & decoded value: ${generated}`);
    }

}
