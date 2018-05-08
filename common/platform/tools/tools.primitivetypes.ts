export enum ETypes {
    //Primitive
    string = 'string',
    number = 'number',
    function = 'function',
    array = 'array',
    object = 'object',
    boolean = 'boolean',
    undefined = 'undefined',
    null = 'null',
    //Classes
    Error = 'Error',
    Date = 'Date'
};

export function getTypeOf(smth: any){
    if (typeof smth === ETypes.undefined) {
        return ETypes.undefined;
    } else if (smth === null) {
        return ETypes.null;
    } else if (smth.constructor !== void 0 && typeof smth.constructor.name === ETypes.string){
        return ETypes[smth.constructor.name.toLowerCase()] !== void 0 ? smth.constructor.name.toLowerCase() : smth.constructor.name;
    } else {
        return (typeof smth);
    }
}