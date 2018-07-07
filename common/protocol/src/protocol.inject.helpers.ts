
export function extractSignature(smth: any): string | Error {
    if ((typeof smth !== 'object' || smth === null) && typeof smth !== 'function') {
        return new Error('No protocol found. As protocol expecting: constructor or instance of protocol.');
    }
    if (typeof smth.getSignature !== 'function' || typeof smth.getSignature() !== 'string' || smth.getSignature().trim() === ''){
        return new Error('No sigature of protocol found');
    }
    return smth.getSignature();
}
