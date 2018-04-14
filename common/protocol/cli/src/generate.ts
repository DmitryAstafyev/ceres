import { Builder } from '../../src/protocol.builder';

type TArgumentDescription = { description: string, hasParameter: boolean, args: Array<string>, errors: {[key:string]:string}};

const ERRORS = {
    noParameter: 'noParameter',
    doubleParameter: 'doubleParameter'
};

const COMMANDS = {
    output  : 'output',
    source  : 'source',
    help    : 'help',
};

const ARGUMENTS : {[key:string]: TArgumentDescription } = {
    [COMMANDS.output]  : { 
        description: 'Definition of output file. Format: ts (TypeScript)',
        hasParameter: true,     
        args: ['-o', '--outout', '--out'], 
        errors: { [ERRORS.noParameter]: 'Key "-o" (--output, --out) expected file name after.', [ERRORS.doubleParameter]: 'Key "-o" (--output, --out) can be defined twice.'}
    },
    [COMMANDS.source]  : { 
        description: 'Definition of input file. Expected format is JSON',
        hasParameter: true,     
        args: ['-s', '--source', '--src'], 
        errors: { [ERRORS.noParameter]: 'Key "-s" (--source, --src) expected file name after.', [ERRORS.doubleParameter]: 'Key "-s" (--source, --src) can be defined twice.'}
    },
    [COMMANDS.help]    : { 
        description: 'Show this message',
        hasParameter: false,    
        args: ['-h', '--help'], 
        errors: {} 
    }
};

function isItArgument(smth: string): boolean {
    let result = false;
    Object.keys(ARGUMENTS).forEach((command: string) => {
        let description: TArgumentDescription = ARGUMENTS[command];
        description.args.forEach((_arg: string)=>{
            if (smth === _arg){
                result = true;
            }
        });
    });
    return result;
}

const OUTPUTS = {
    help: () => {
        console.log(`Supported commands: \n${Object.keys(ARGUMENTS).map((command: string)=>{
            let description: TArgumentDescription = ARGUMENTS[command];
            return `${description.args.join(' | ')} - ${description.description};`;
        }).join('\n')}`)
    }
};

if (process.argv instanceof Array){
    let commands : { [key: string]: string} = {};
    let error = false;
    let started = (new Date()).getTime();
    try {
        process.argv.forEach((arg: string, index: number)=>{
            Object.keys(ARGUMENTS).forEach((command: string)=>{
                let description: TArgumentDescription = ARGUMENTS[command];
                description.args.forEach((_arg: string)=>{
                    if (_arg === arg){
                        if (description.hasParameter){
                            if (process.argv[index + 1] !== void 0){
                                if (!isItArgument(process.argv[index + 1]) && process.argv[index + 1].trim() !== ''){
                                    if (commands[command] === void 0){
                                        commands[command] = process.argv[index + 1];
                                    } else {
                                        console.log(description.errors[ERRORS.doubleParameter]);
                                        throw ERRORS.doubleParameter;
                                    }
                                } else {
                                    console.log(description.errors[ERRORS.noParameter]);
                                    throw ERRORS.noParameter;
                                }
                            } else {
                                console.log(description.errors[ERRORS.noParameter]);
                                throw ERRORS.noParameter;
                            }
                        }
                    }
                });
            });
        });
    } catch (e){
        if (typeof e !== 'string'){
            throw e;
        } else {
            error = true;
        }
    }

    if (!error){
        if (Object.keys(commands).length > 0){
            if (~Object.keys(commands).indexOf(COMMANDS.help)){
                OUTPUTS.help();
            } else if (~Object.keys(commands).indexOf(COMMANDS.source) && ~Object.keys(commands).indexOf(COMMANDS.output)){
                try {
                    let builder = new Builder(commands[COMMANDS.source]);
                    builder.build(commands[COMMANDS.output])
                        .then(()=>{
                            let finished = (new Date()).getTime();
                            console.log(`File "${commands[COMMANDS.output]}" generated for ${((finished - started) / 1000).toFixed(2)} s.`);
                        })
                        .catch((e)=>{
                            console.log(e.message);
                        });
                } catch (e){
                    console.log(e.message);
                }
            }
        } else {
            OUTPUTS.help();
        }
    }
    
}
