function ok(func: any){
    return new Promise((resolve, reject) => {
        try {
            func();
            resolve();
        } catch(e) {
            reject(e);
        }
    });
}

ok(() => { 
    console.log('');
    throw 'errr'; 
    return; 
}).then(() => {
    console.log('then 1');
}).catch((e) => {
    console.log('catch 1');
}).then(() => {
    console.log('then 2');
})