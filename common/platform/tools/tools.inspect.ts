import { ETypes, getTypeOf } from './tools.primitivetypes';
const DEFAULT_MAX_DEEP = 4;

function renderPrimitive(type: string, value: string){
    return `<${type}>: ${value}`; 

}

export default function inspect(smth: any, maxDeep = DEFAULT_MAX_DEEP, deep = 0): string {
    try {
        const type = getTypeOf(smth);
    
        maxDeep <= 0 && (maxDeep = DEFAULT_MAX_DEEP);
        
        if (deep >= maxDeep){
            return `maximum deep reached (${maxDeep})`;
        }
    
        if (~[ETypes.number, ETypes.boolean].indexOf(type)){
            return renderPrimitive(type, smth); 
        } else if (type === ETypes.string) {
            return renderPrimitive(type, `"${smth}"`); 
        } else if (type === ETypes.array) {
            let items = smth.map((smth: any, i: number) => {
                return `${i}: ${inspect(smth, maxDeep, (deep + 1))}`;
            });
            return `${type}[${smth.length}]: [${items.join(',')}]`;
        } else if (type === ETypes.null) {
            return renderPrimitive(type, 'null'); 
        } else if (type === ETypes.function) {
            return `${type}: ${smth.constructor.name}`
        } else if (type === ETypes.undefined) {
            return ETypes.undefined;
        } else if (getTypeOf(smth.map) === ETypes.function) {
            let items = smth.map((smth: any, i: number) => {
                return `${i}: ${inspect(smth, maxDeep, (deep + 1))}`;
            });
            return `${type}: [${items.join(',')}]`;
        } else if (type === ETypes.Error && getTypeOf(smth.message) === ETypes.string){
            return `${type}: {${smth.message}}`;
        } else if (type === ETypes.object || typeof smth === 'object') {
            let properties = [];
            for (let prop in smth){
                properties.push(`${prop}: ${inspect(smth[prop], maxDeep, (deep + 1))}`);
            }
            return `${type}: {${properties.join(',')}}`;
        } else if (getTypeOf(smth.toString) === ETypes.function) {
            return `${type}: ${smth.toString()}`;
        } else {
            return `${type}`;
        }
        
    } catch(e){
        return `Error during detection of type (${(typeof smth)}): ${e.message}.`;
    }
}