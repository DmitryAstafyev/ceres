/**
 * Returns primitive GUID in format XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 * @returns {string} GUID
 */
export default function GUID() {
    const lengths = [4, 4, 4, 8];
    let result = '';
    for (let i = lengths.length - 1; i >= 0; i -= 1){
        result += (Math.round(Math.random() * Math.random() * Math.pow(10, lengths[i] * 2))
                    .toString(16)
                    .substr(0, lengths[i])
                    .toUpperCase() + '-');
    }
    result += ((new Date()).getTime() * (Math.random() * 100))
                .toString(16)
                .substr(0, 12)
                .toUpperCase();
    return result;
}