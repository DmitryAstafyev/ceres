export enum ETypes {
    string = 'string',
    number = 'number',
    function = 'function',
    array = 'array',
    object = 'object',
    boolean = 'boolean',
    undefined = 'undefined',
    null = 'null',
    error = 'error',
    date = 'date'
};

export function getTypeOf(smth: any){
    if (typeof smth === ETypes.undefined) {
        return ETypes.undefined;
    } else if (smth === null) {
        return ETypes.null;
    } else if (smth.constructor !== void 0 && typeof smth.constructor.name === ETypes.string){
        return smth.constructor.name.toLowerCase();
    } else {
        return (typeof smth);
    }
}