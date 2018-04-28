import { 
    getTypeOf, 
    EPrimitiveTypes
} from '../../platform/tools/index';

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
    
        if (~[EPrimitiveTypes.number, EPrimitiveTypes.boolean].indexOf(type)){
            return renderPrimitive(type, smth); 
        } else if (type === EPrimitiveTypes.string) {
            return renderPrimitive(type, `"${smth}"`); 
        } else if (type === EPrimitiveTypes.array) {
            let items = smth.map((smth: any, i: number) => {
                return `${i}: ${inspect(smth, maxDeep, (deep + 1))}`;
            });
            return `${type}[${smth.length}]: [${items.join(',')}]`;
        } else if (type === EPrimitiveTypes.null) {
            return renderPrimitive(type, 'null'); 
        } else if (type === EPrimitiveTypes.function) {
            return `${type}: ${smth.constructor.name}`
        } else if (type === EPrimitiveTypes.undefined) {
            return EPrimitiveTypes.undefined;
        } else if (getTypeOf(smth.map) === EPrimitiveTypes.function) {
            let items = smth.map((smth: any, i: number) => {
                return `${i}: ${inspect(smth, maxDeep, (deep + 1))}`;
            });
            return `${type}: [${items.join(',')}]`;
        } else if (type === EPrimitiveTypes.error && getTypeOf(smth.message) === EPrimitiveTypes.string){
            return `${type}: {${smth.message}}`;
        } else if (type === EPrimitiveTypes.object || typeof smth === 'object') {
            let properties = [];
            for (let prop in smth){
                properties.push(`${prop}: ${inspect(smth[prop], maxDeep, (deep + 1))}`);
            }
            return `${type}: {${properties.join(',')}}`;
        } else if (getTypeOf(smth.toString) === EPrimitiveTypes.function) {
            return `${type}: ${smth.toString()}`;
        } else {
            return `${type}`;
        }
        
    } catch(e){
        return `Error during detection of type (${(typeof smth)}): ${e.message}.`;
    }
}