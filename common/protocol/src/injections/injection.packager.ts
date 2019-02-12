// tslint:disable:no-namespace
// tslint:disable:max-classes-per-file
// tslint:disable:object-literal-sort-keys

declare var Json: any;

export namespace Packager {

    export function join(...items: any[]): string | Uint8Array | Error {
        if (items instanceof Array && items.length === 1 && items[0] instanceof Array) {
            items = items[0];
        }
        if (!(items instanceof Array) || items.length === 0) {
            return new Error(`No arguments provided to join`);
        }
        const strs: any[] = [];
        const bytes: number[] = [];
        let isBinary: boolean | undefined;
        try {
            items.forEach((item: any, i: number) => {
                if (item instanceof Uint8Array && (isBinary === undefined || isBinary === true)) {
                    isBinary = true;
                    if (i === 0) {
                        // Set type as array
                        bytes.push(Json.Scheme.Types.array);
                    }
                    // Set length of item
                    bytes.push(...Json.Impls.Uint32.toUint8(item.length));
                    // Put item
                    bytes.push(...item);
                } else if (typeof item === 'string' && (isBinary === undefined || isBinary === false)) {
                    isBinary = false;
                    strs.push(item);
                } else {
                    throw new Error(`Only strings or Uint8Array can be joined. Each array item should be same type.`);
                }
            });
            if (isBinary) {
                return new Uint8Array(bytes);
            }
        } catch (error) {
            return error;
        }
        return JSON.stringify(strs);
    }

    export function split(source: string | Uint8Array): string[] | Uint8Array[] | Error {
        if (!isPackage(source)) {
            return new Error(`Source isn't a package of protocol data.`);
        }
        if (source instanceof ArrayBuffer) {
            source = new Uint8Array(source);
        }
        if (source instanceof Uint8Array) {
            let buffer = source.slice(1, source.length);
            const items: Uint8Array[] = [];
            do {
                const itemLength = Json.Impls.Uint32.fromUint8(buffer.slice(0, 4));
                items.push(buffer.slice(4, 4 + itemLength));
                buffer = buffer.slice(4 + itemLength, buffer.length);
            } while (buffer.length > 0);
            return items;
        } else {
            return JSON.parse(source) as string[];
        }
    }

    export function isPackage(source: any): boolean {
        if (source instanceof Uint8Array) {
            return source[0] === Json.Scheme.Types.array;
        } else if (source instanceof ArrayBuffer) {
            const uint8array: Uint8Array = new Uint8Array(source);
            return uint8array.length > 0 ? (uint8array[0] === Json.Scheme.Types.array) : false;
        } else if (typeof source === 'string') {
            try {
                return JSON.parse(source) instanceof Array;
            } catch (error) {
                return false;
            }
        } else {
            return false;
        }
    }

}
