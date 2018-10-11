export function enumToString(name: string, instance: any) {
    let results = `enum ${name} {\n`;
    results += Object.keys(instance).map((key: string) => {
        return `\t${key} = ${(typeof instance[key] === 'string' ? `"${instance[key]}"` : instance[key])}`;
    }).join(',\n');
    return `${results}\n}`;
}

export function objectToString(declaretion: string, name: string, instance: any) {
    function objToStr(obj: any, level: number = 1) {
        let result = '';
        result += Object.keys(obj).map((key: string) => {
            return `${'\t'.repeat(level)}${key}: ${(typeof obj[key] === 'object' ? `{\n${objToStr(obj[key], level + 1)}\n${'\t'.repeat(level)}}` : (typeof obj[key] === 'string' ? `"${obj[key]}"` : obj[key]))}`;
        }).join(',\n');
        return result;
    }
    let results = `${declaretion} ${name} = {\n`;
    results += objToStr(instance);
    return `${results}\n}`;
}
