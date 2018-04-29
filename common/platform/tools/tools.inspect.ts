import * as Tools from '../../platform/tools/index';

const DEFAULT_MAX_DEEP = 4;

function renderPrimitive(type: string, value: string){
    return `<${type}>: ${value}`; 

}

export default function inspect(smth: any, maxDeep = DEFAULT_MAX_DEEP, deep = 0): string {
    try {
        const type = Tools.getTypeOf(smth);
    
        maxDeep <= 0 && (maxDeep = DEFAULT_MAX_DEEP);
        
        if (deep >= maxDeep){
            return `maximum deep reached (${maxDeep})`;
        }
    
        if (~[Tools.EPrimitiveTypes.number, Tools.EPrimitiveTypes.boolean].indexOf(type)){
            return renderPrimitive(type, smth); 
        } else if (type === Tools.EPrimitiveTypes.string) {
            return renderPrimitive(type, `"${smth}"`); 
        } else if (type === Tools.EPrimitiveTypes.array) {
            let items = smth.map((smth: any, i: number) => {
                return `${i}: ${inspect(smth, maxDeep, (deep + 1))}`;
            });
            return `${type}[${smth.length}]: [${items.join(',')}]`;
        } else if (type === Tools.EPrimitiveTypes.null) {
            return renderPrimitive(type, 'null'); 
        } else if (type === Tools.EPrimitiveTypes.function) {
            return `${type}: ${smth.constructor.name}`
        } else if (type === Tools.EPrimitiveTypes.undefined) {
            return Tools.EPrimitiveTypes.undefined;
        } else if (Tools.getTypeOf(smth.map) === Tools.EPrimitiveTypes.function) {
            let items = smth.map((smth: any, i: number) => {
                return `${i}: ${inspect(smth, maxDeep, (deep + 1))}`;
            });
            return `${type}: [${items.join(',')}]`;
        } else if (type === Tools.EPrimitiveTypes.error && Tools.getTypeOf(smth.message) === Tools.EPrimitiveTypes.string){
            return `${type}: {${smth.message}}`;
        } else if (type === Tools.EPrimitiveTypes.object || typeof smth === 'object') {
            let properties = [];
            for (let prop in smth){
                properties.push(`${prop}: ${inspect(smth[prop], maxDeep, (deep + 1))}`);
            }
            return `${type}: {${properties.join(',')}}`;
        } else if (Tools.getTypeOf(smth.toString) === Tools.EPrimitiveTypes.function) {
            return `${type}: ${smth.toString()}`;
        } else {
            return `${type}`;
        }
        
    } catch(e){
        return `Error during detection of type (${(typeof smth)}): ${e.message}.`;
    }
}