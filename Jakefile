const path = require('path');
const util = require('util');

const sh = function(task, path, ...commands){
    const jake = require('jake');
    jake.exec(commands.map((command) => {
        return `(cd ${path} && ${command})`;
    }), { printStdout: true, printStderr: true }, () => {
        task.complete();
    });
};

namespace('client', function() {
    task('unlink', function(){
        sh(this, '.', 
            'unlink ./client/src/platform & exit 0', 
            'rm -r ./client/src/platform & exit 0'
        );
    }, {async: true});
    task('link', function(){
        sh(this, '.', 
            `ln -s ${path.normalize(__dirname + '/common/platform')} ${path.normalize(__dirname + '/client/src/platform')}`
        );
    }, {async: true});
    task('clear', function(){
        sh(this, '.', 
            'rm -rf ./client/node_modules & exit 0'
        );
    }, {async: true});
    task('install', function(){
        sh(this, './client', 
            'npm install'
        );
    }, {async: true});

});

namespace('server', function() {
    task('unlink', function() {
        sh(this, '.', 
            'unlink ./server/src/platform & exit 0', 
            'rm -r ./server/src/platform & exit 0'
        );
    }, {async: true});
    task('link', function() {
        sh(this, '.',
            `ln -s ${path.normalize(__dirname + '/common/platform')} ${path.normalize(__dirname + '/server/src/platform')}`
        );
    }, {async: true});
    task('clear', function() {
        sh(this, '.', 
            'rm -rf ./server/node_modules & exit 0'
        );
    }, {async: true});
    task('install', function(){
        sh(this, './server', 
            'npm install'
        );
    }, {async: true});

});

namespace('playground', function() {
    task('clear', function() {
        sh(this, '.', 
            'rm -rf ./playground/server/node_modules & exit 0',
            'rm -rf ./playground/client/node_modules & exit 0'
        );
    }, {async: true});
    namespace('client', function(){
        task('install', function(){
            sh(this, './playground/client', 
                'npm install'
            );
        }, {async: true});    
    });
    namespace('server', function(){
        task('install', function(){
            sh(this, './playground/server', 
                'npm install'
            );
        }, {async: true});    
    });

});

namespace('solution', function() {
    desc('Collection of installation/clearing tasks');
    
    task('setup', ['solution:clear', 'solution:unlink', 'solution:link', 'solution:install']);

    task('clear', ['client:clear', 'server:clear', 'playground:clear']);
    
    task('link', ['client:link', 'server:link']);
    
    task('unlink', ['client:unlink', 'server:unlink']);
    
    task('install', ['client:install', 'server:install', 'playground:client:install', 'playground:server:install']);
  
  });