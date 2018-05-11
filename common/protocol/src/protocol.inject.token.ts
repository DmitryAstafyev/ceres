
export function getToken(smth: any): string | Error {
    if (typeof smth === 'string') {
        try {
            smth = JSON.parse(smth);
        } catch (e){
            return e;
        }
    }
    if (typeof smth.getToken === 'function') {
        const token = smth.getToken();
        return typeof token === 'string' ? token.trim() : new Error('Wrong type of token.');
    }
    if (typeof smth.__token === 'string') {
        return smth.__token.trim();
    }
    return new Error(`No token found.`);
}
