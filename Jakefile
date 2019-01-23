const path = require('path');
const colors = require('colors/safe');
const fs = require('fs');

const sh = function(taskOrCallback, path, ...commands){
    return new Promise((resolve) => {
        const jake = require('jake');
        jake.exec(commands.map((command) => {
            return `(cd ${path} && ${command})`;
        }), { printStdout: true, printStderr: true }, () => {
            if (taskOrCallback !== null && taskOrCallback !== undefined && typeof taskOrCallback.complete === 'function') {
                taskOrCallback.complete();
            } else if (typeof taskOrCallback === 'function') {
                taskOrCallback();
            }
            resolve();
        });
    });
};

const shNotBreakble = function(task, path, ...commands){
    const jake = require('jake');
    jake.exec(commands.map((command) => {
        return `(cd ${path} && ${command})`;
    }), { printStdout: true, printStderr: true, breakOnError: false }, () => {
        task.complete();
    });
};


class FSController {

    constructor() {
        this._EEntityTypes = {
            file: Symbol(),
            folder: Symbol(),
            all: Symbol()
        };
    }

    getEntities(folder, type) {
        if (!fs.existsSync(folder)) {
            return [];
        }
        const entities = fs.readdirSync(folder);
        if (!(entities instanceof Array)) {
            return [];
        }
        type = typeof type === 'undefined' ? this._EEntityTypes.all : type;
        if (type === this._EEntityTypes.all) {
            return entities;
        }
        const results = [];
        entities.forEach((entity) => {
            const stat = fs.statSync(path.resolve(folder, entity));
            if ((type === this._EEntityTypes.file && !stat.isDirectory()) || (type === this._EEntityTypes.folder && stat.isDirectory())) {
                results.push(entity);
            }
        });
        return results;
    }

    getFiles(folder) {
        return this.getEntities(folder, this._EEntityTypes.file);
    }

    getFolders(folder) {
        return this.getEntities(folder, this._EEntityTypes.folder);
    }

    isFileInFolder(file, folder) {
        return fs.existsSync(path.normalize(path.resolve(folder, file)));
    }
}

const fsController = new FSController();

const COMMON_PATH = 'common';
const PLATFORM_FOLDERS = ['platform', 'protocol', 'protocols'];

const PLATFORM_EXCEPTION_FOLDERS = [
    'platform',
    'protocol',
    'protocols',
    'common',
    'node_modules',
    'playground',
    'build',
    'dist',
    'transports'
];
const PROJECTS_EXCEPTION_FOLDERS = [
    'node_modules',
    'build',
    'dist'
];
const LOGO_FILE = 'logo.ascii';

function findAllProjects(target, exceptions, journal = {}) {
    const JOURNAL_EXCEPTIONS = ['server'];
    exceptions = exceptions instanceof Array ? exceptions : [];
    const folders = fsController.getFolders(target);
    const projects = [];
    folders.forEach((folder) => {
        if (exceptions.indexOf(folder) !== -1) {
            return;
        }
        const nested = findAllProjects(path.normalize(path.resolve(target, folder)), exceptions, journal);
        projects.push(...nested);
        if (fsController.isFileInFolder(path.normalize(path.resolve(target, folder, 'package.json')))) {
            if (journal[path.basename(folder)] === void 0 || JOURNAL_EXCEPTIONS.indexOf(folder) !== -1) {
                projects.push(path.normalize(path.resolve(target, folder)));
                journal[path.basename(folder)] = true;
            }
        }
    });
    return projects;
}

function logo(){
    if (logo.__show !== void 0) { 
        return;
    }
    const file = path.resolve(__dirname, LOGO_FILE);
    if (!fs.existsSync(file)) {
        return;
    }
    const buffer = fs.readFileSync(file);
    return console.log(colors.yellow(buffer.toString('utf8')));
}
function echo(msg) {
    return `echo "${msg}"`;
}

function echoDec(msg, filler = '*', colorFunc = null) {
    msg = `${filler.repeat(2)} ${msg} ${filler.repeat(2)} `;
    if (colorFunc !== null) {
        return `echo "${colorFunc(`\n${filler.repeat(msg.length - 1)}\n${msg}\n${filler.repeat(msg.length - 1)}\n`)}"` ;
    } else {
        return `echo "\n${filler.repeat(msg.length - 1)}\n${msg}\n${filler.repeat(msg.length - 1)}\n"` ;
    }
}

namespace('build', function() {
    namespace('client', function() {
        task('all', function() {
            logo();
            const paths = {
                consumer: path.normalize(path.join(__dirname, '/client/consumer')),
                longpoll: path.normalize(path.join(__dirname, '/client/transports/http.longpoll')),
                ws: path.normalize(path.join(__dirname, '/client/transports/ws'))
            };
            const tasks = [
                `npm run build-ts --prefix ${paths.consumer}`,
                `rm -rf ${path.normalize(path.join(paths.consumer, '/etc'))} & exit 0`,
                `npm install --prod --prefix ${paths.longpoll}`,
                `unlink ${path.normalize(path.join(paths.longpoll, '/node_modules/ceres.client.consumer'))} & exit 0`,
                `mkdir ${path.normalize(path.join(paths.longpoll, '/node_modules'))} & exit 0`,
                `ln -s ${paths.consumer} ${path.normalize(path.join(paths.longpoll, '/node_modules/ceres.client.consumer'))}`,
                `rm -rf ${path.normalize(path.join(paths.longpoll, '/etc'))} & exit 0`,
                `npm install --prod --prefix ${paths.ws}`,
                `unlink ${path.normalize(path.join(paths.ws, '/node_modules/ceres.client.consumer'))} & exit 0`,
                `mkdir ${path.normalize(path.join(paths.ws, '/node_modules'))} & exit 0`,
                `ln -s ${paths.consumer} ${path.normalize(path.join(paths.ws, '/node_modules/ceres.client.consumer'))}`,
                `rm -rf ${path.normalize(path.join(paths.ws, '/etc'))} & exit 0`,
            ];
            sh(this, '.', ...tasks);
        }, {async: true});
    });
    namespace('server', function() {
        task('all', function() {
            logo();
            const paths = {
                provider: path.normalize(path.join(__dirname, '/server/provider')),
                longpoll: path.normalize(path.join(__dirname, '/server/transports/http.longpoll')),
                ws: path.normalize(path.join(__dirname, '/server/transports/ws'))
            };
            const tasks = [
                `npm run build --prefix ${paths.provider}`,
                `rm -rf ${path.normalize(path.join(paths.provider, '/etc'))} & exit 0`,
                `npm install --prod --prefix ${paths.longpoll}`,
                `unlink ${path.normalize(path.join(paths.longpoll, '/node_modules/ceres.server.provider'))} & exit 0`,
                `mkdir ${path.normalize(path.join(paths.longpoll, '/node_modules'))} & exit 0`,
                `ln -s ${paths.provider} ${path.normalize(path.join(paths.longpoll, '/node_modules/ceres.server.provider'))}`,
                `rm -rf ${path.normalize(path.join(paths.longpoll, '/etc'))} & exit 0`,
                `npm install --prod --prefix ${paths.ws}`,
                `unlink ${path.normalize(path.join(paths.ws, '/node_modules/ceres.server.provider'))} & exit 0`,
                `mkdir ${path.normalize(path.join(paths.ws, '/node_modules'))} & exit 0`,
                `ln -s ${paths.provider} ${path.normalize(path.join(paths.ws, '/node_modules/ceres.server.provider'))}`,
                `rm -rf ${path.normalize(path.join(paths.ws, '/etc'))} & exit 0`,
            ];
            sh(this, '.', ...tasks);
        }, {async: true});
    });
    namespace('playground', function() {
        task('all', function() {
            logo();
            const paths = {
                provider: path.normalize(path.join(__dirname, '/server/provider')),
                consumer: path.normalize(path.join(__dirname, '/client/consumer')),
                sLongpoll: path.normalize(path.join(__dirname, '/server/transports/http.longpoll')),
                sWs: path.normalize(path.join(__dirname, '/server/transports/ws')),
                cLongpoll: path.normalize(path.join(__dirname, '/client/transports/http.longpoll')),
                cWs: path.normalize(path.join(__dirname, '/client/transports/ws')),
                pgClient0: path.normalize(path.join(__dirname, '/playground/client.0')),
                pgClient1: path.normalize(path.join(__dirname, '/playground/client.1')),
                pgServer: path.normalize(path.join(__dirname, '/playground/server')),
            };
            const tasks = [
                `unlink ${path.normalize(path.join(paths.pgClient0, '/node_modules/ceres.client.consumer'))} & exit 0`,
                `mkdir ${path.normalize(path.join(paths.pgClient0, '/node_modules'))} & exit 0`,
                `ln -s ${paths.consumer} ${path.normalize(path.join(paths.pgClient0, '/node_modules/ceres.client.consumer'))}`,
                `unlink ${path.normalize(path.join(paths.pgClient0, '/node_modules/ceres.client.transport.httplongpoll'))} & exit 0`,
                `ln -s ${paths.cLongpoll} ${path.normalize(path.join(paths.pgClient0, '/node_modules/ceres.client.transport.httplongpoll'))}`,
                `unlink ${path.normalize(path.join(paths.pgClient0, '/node_modules/ceres.client.transport.ws'))} & exit 0`,
                `ln -s ${paths.cWs} ${path.normalize(path.join(paths.pgClient0, '/node_modules/ceres.client.transport.ws'))}`,

                `unlink ${path.normalize(path.join(paths.pgClient1, '/node_modules/ceres.client.consumer'))} & exit 0`,
                `mkdir ${path.normalize(path.join(paths.pgClient1, '/node_modules'))} & exit 0`,
                `ln -s ${paths.consumer} ${path.normalize(path.join(paths.pgClient1, '/node_modules/ceres.client.consumer'))}`,
                `unlink ${path.normalize(path.join(paths.pgClient1, '/node_modules/ceres.client.transport.httplongpoll'))} & exit 0`,
                `ln -s ${paths.cLongpoll} ${path.normalize(path.join(paths.pgClient1, '/node_modules/ceres.client.transport.httplongpoll'))}`,
                `unlink ${path.normalize(path.join(paths.pgClient1, '/node_modules/ceres.client.transport.ws'))} & exit 0`,
                `ln -s ${paths.cWs} ${path.normalize(path.join(paths.pgClient1, '/node_modules/ceres.client.transport.ws'))}`,

                `unlink ${path.normalize(path.join(paths.pgServer, '/node_modules/ceres.server.provider'))} & exit 0`,
                `mkdir ${path.normalize(path.join(paths.pgServer, '/node_modules'))} & exit 0`,
                `ln -s ${paths.provider} ${path.normalize(path.join(paths.pgServer, '/node_modules/ceres.server.provider'))}`,
                `unlink ${path.normalize(path.join(paths.pgServer, '/node_modules/ceres.server.transport.httplongpoll'))} & exit 0`,
                `ln -s ${paths.sLongpoll} ${path.normalize(path.join(paths.pgServer, '/node_modules/ceres.server.transport.httplongpoll'))}`,
                `unlink ${path.normalize(path.join(paths.pgServer, '/node_modules/ceres.server.transport.ws'))} & exit 0`,
                `ln -s ${paths.sWs} ${path.normalize(path.join(paths.pgServer, '/node_modules/ceres.server.transport.ws'))}`,

            ];
            sh(this, '.', ...tasks);
        }, {async: true});
    });
    namespace('protocol', function() {
        task('all', function() {
            logo();
            const paths = {
                cli: path.normalize(path.join(__dirname, '/common/protocol/cli/src/generate.ts')),
                protocolSrc: path.normalize(path.join(__dirname, '/common/protocols/connection/src/protocol.connection.json')),
                protocolDest: path.normalize(path.join(__dirname, '/common/protocols/connection/protocol.connection.ts')),
                wsSrc: path.normalize(path.join(__dirname, '/common/protocols/transports/ws/src/protocol.transport.ws.json')),
                wsDest: path.normalize(path.join(__dirname, '/common/protocols/transports/ws/protocol.transport.ws.ts')),
                wsPath: path.normalize(path.join(__dirname, '/common/protocols/transports/ws')),
                longpollSrc: path.normalize(path.join(__dirname, '/common/protocols/transports/httt.longpoll/src/protocol.transport.longpoll.json')),
                longpollDest: path.normalize(path.join(__dirname, '/common/protocols/transports/httt.longpoll/protocol.transport.longpoll.ts')),
                longpollPath: path.normalize(path.join(__dirname, '/common/protocols/transports/httt.longpoll')),
                sLongpoll: path.normalize(path.join(__dirname, '/server/transports/http.longpoll')),
                sWs: path.normalize(path.join(__dirname, '/server/transports/ws')),
                cLongpoll: path.normalize(path.join(__dirname, '/client/transports/http.longpoll')),
                cWs: path.normalize(path.join(__dirname, '/client/transports/ws')),
            };
            const tasks = [
                `ts-node ${paths.cli} -s ${paths.protocolSrc} -o ${paths.protocolDest} -r`,
                `ts-node ${paths.cli} -s ${paths.wsSrc} -o ${paths.wsDest} -r`,
                `ts-node ${paths.cli} -s ${paths.longpollSrc} -o ${paths.longpollDest} -r`,

                `unlink ${path.normalize(path.join(paths.cWs, '/src/protocols'))} & exit 0`,
                `rm -rf ${path.normalize(path.join(paths.cWs, '/src/protocols'))} & exit 0`,
                `ln -s ${paths.wsPath} ${path.normalize(path.join(paths.cWs, '/src/protocols'))}`,
                `rm -rf ${path.normalize(path.join(paths.cWs, '/etc'))} & exit 0`,

                `unlink ${path.normalize(path.join(paths.cLongpoll, '/src/protocols'))} & exit 0`,
                `rm -rf ${path.normalize(path.join(paths.cLongpoll, '/src/protocols'))} & exit 0`,
                `ln -s ${paths.longpollPath} ${path.normalize(path.join(paths.cLongpoll, '/src/protocols'))}`,
                `rm -rf ${path.normalize(path.join(paths.cLongpoll, '/etc'))} & exit 0`,

                `unlink ${path.normalize(path.join(paths.sWs, '/src/protocols'))} & exit 0`,
                `rm -rf ${path.normalize(path.join(paths.sWs, '/src/protocols'))} & exit 0`,
                `ln -s ${paths.wsPath} ${path.normalize(path.join(paths.sWs, '/src/protocols'))}`,
                `rm -rf ${path.normalize(path.join(paths.sWs, '/etc'))} & exit 0`,

                `unlink ${path.normalize(path.join(paths.sLongpoll, '/src/protocols'))} & exit 0`,
                `rm -rf ${path.normalize(path.join(paths.sLongpoll, '/src/protocols'))} & exit 0`,
                `ln -s ${paths.longpollPath} ${path.normalize(path.join(paths.sLongpoll, '/src/protocols'))}`,
                `rm -rf ${path.normalize(path.join(paths.sLongpoll, '/etc'))} & exit 0`,
            ];
            sh(this, '.', ...tasks);
        }, {async: true});
    });

    task('all', ['build:protocol:all', 'build:client:all', 'build:server:all', 'build:playground:all']);

    /**
ts-node ./cli/src/generate.ts -s ../protocols/connection/src/protocol.transport.longpoll.json -o ../protocols/connection/protocol.transport.longpoll.ts -r     * 
     */
});

namespace('solution', function() {
    task('unlink', function() {
        logo();
        const projects = findAllProjects(path.normalize(__dirname), PLATFORM_EXCEPTION_FOLDERS);
        console.log(`Found ${projects.length} projects:\n\t- ${projects.join('\n\t- ')}`);
        const tasks = [];
        projects.forEach((folder) => {
            PLATFORM_FOLDERS.forEach((platformFolder) => {
                const target = path.normalize(path.resolve(folder, 'src', platformFolder));
                if (!fs.existsSync(target)) {
                    return;
                }
                tasks.push(`unlink ${target} & exit 0`);
            });
        });
        if (tasks.length === 0) {
            console.log(`Nothing to unlink. All projects arn't bound`);
            return this.complete();
        }
        console.log(`Found ${tasks.length / 2} bound projects. Projects will be unlinked`);
        sh(this, '.', ...tasks);
    }, {async: true});

    task('link', function() {
        logo();
        const projects = findAllProjects(path.normalize(__dirname), PLATFORM_EXCEPTION_FOLDERS);
        console.log(`Found ${projects.length} projects:\n\t- ${projects.join('\n\t- ')}`);
        const tasks = [];
        projects.forEach((folder) => {
            PLATFORM_FOLDERS.forEach((platformFolder) => {
                const source = path.normalize(path.resolve(__dirname, COMMON_PATH, platformFolder));
                const target = path.normalize(path.resolve(folder, 'src', platformFolder));
                if (fs.existsSync(target)) {
                    console.log(`Project ${folder} is already linked. It will be unlinked before to be linked again.`);
                    tasks.push(`unlink ${target} & exit 0`);
                }
                tasks.push(`ln -s ${source} ${target}`);
            });
        });
        sh(this, '.', ...tasks);
    }, {async: true});

    task('clear', function() {
        logo();
        const projects = findAllProjects(path.normalize(__dirname), PROJECTS_EXCEPTION_FOLDERS);
        console.log(`Found ${projects.length} projects:\n\t- ${projects.join('\n\t- ')}`);
        const tasks = [];
        projects.forEach((folder) => {
            const target = path.normalize(path.resolve(folder, 'node_modules'));
            const etc = path.normalize(path.resolve(folder, 'etc'));
            if (fs.existsSync(target)) {
                tasks.push(echo(colors.green(`Clearing: ${target}`)));
                tasks.push(`rm -rf ${target}`);
            }
            if (fs.existsSync(etc)) {
                tasks.push(echo(colors.green(`Fix after NPM for: ${target}`)));
                tasks.push(`rm -r ${etc}`);
            }
        });
        if (tasks.length === 0) {
            console.log(`No projects to be uninstalled`);
            this.complete();
        }
        console.log(`Will be uninstalled ${tasks.length} projects.`);
        sh(this, '.', ...tasks);
    }, {async: true});

    task('npm-install', function() {
        logo();
        const projects = findAllProjects(path.normalize(__dirname), PROJECTS_EXCEPTION_FOLDERS);
        console.log(`Found ${projects.length} projects:\n\t- ${projects.join('\n\t- ')}`);
        const tasks = [];
        projects.forEach((folder) => {
            const target = path.normalize(path.resolve(folder, 'node_modules'));
            fs.existsSync(target) && tasks.push(`rm -rf ${target}`);
            tasks.push(echoDec(`Start install: ${folder}`, '*', colors.green));
            tasks.push(`npm install --prefix ${folder}`);
        });
        if (tasks.length === 0) {
            console.log(`No projects to be installed`);
            this.complete();
        }
        sh(this, '.', ...tasks);
    }, {async: true});

    task('fix-npm-etc', function() {
        const projects = findAllProjects(path.normalize(__dirname), PROJECTS_EXCEPTION_FOLDERS);
        console.log(`Found ${projects.length} projects:\n\t- ${projects.join('\n\t- ')}`);
        const tasks = [];
        projects.forEach((folder) => {
            const target = path.normalize(path.resolve(folder, 'etc'));
            fs.existsSync(target) && tasks.push(`rm -rf ${target}`);
        });
        if (tasks.length === 0) {
            console.log(`No projects to be installed`);
            this.complete();
        }
        sh(this, '.', ...tasks);
    }, {async: true});
    
    task('install', ['solution:npm-install', 'solution:fix-npm-etc']);

    task('upgrade', function() {
        logo();
        const projects = findAllProjects(path.normalize(__dirname), PROJECTS_EXCEPTION_FOLDERS);
        console.log(`Found ${projects.length} projects:\n\t- ${projects.join('\n\t- ')}`);
        const tasks = [];
        projects.forEach((folder) => {
            const packageJson = path.normalize(path.resolve(folder, 'package.json'));
            tasks.push(echoDec(`Checking: ${packageJson}`, '*', colors.green));
            tasks.push(`./node_modules/.bin/npm-check ${folder} -y --no-emoji`);
        });
        if (tasks.length === 0) {
            console.log(`No projects to be upgraded`);
            this.complete();
        }
        sh(this, '.', ...tasks);
    }, {async: true});

    task('actuality', function() {
        logo();
        const projects = findAllProjects(path.normalize(__dirname), PROJECTS_EXCEPTION_FOLDERS);
        console.log(`Found ${projects.length} projects:\n\t- ${projects.join('\n\t- ')}`);
        const tasks = [];
        projects.forEach((folder) => {
            const packageJson = path.normalize(path.resolve(folder, 'package.json'));
            tasks.push(echoDec(`Checking: ${packageJson}`, '*', colors.green));
            tasks.push(`./node_modules/.bin/npm-check ${folder} --no-emoji`);
        });
        if (tasks.length === 0) {
            console.log(`No projects to be upgraded`);
            this.complete();
        }
        shNotBreakble(this, '.', ...tasks);
    }, {async: true});

});
