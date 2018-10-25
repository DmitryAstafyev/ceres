const path = require('path');
const colors = require('colors/safe');
const fs = require('fs');

const sh = function(task, path, ...commands){
    const jake = require('jake');
    jake.exec(commands.map((command) => {
        return `(cd ${path} && ${command})`;
    }), { printStdout: true, printStderr: true }, () => {
        task.complete();
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
    'dist'
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
