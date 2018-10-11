/**
 * Returns hash of string
 * @returns {string} hash
 */

/* tslint:disable */
export default function hash(input: string, abs: boolean = false) {
    let hash = 0, i, chr;
    if (input.length === 0) return input;
    for (i = 0; i < input.length; i++) {
        chr   = input.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; 
    }
    return (abs ? Math.abs(hash) : hash).toString(16).toUpperCase();
    //source of code of this method: http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
}
/* tslint:enable */
