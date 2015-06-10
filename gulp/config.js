var argv = require('yargs').argv;

module.exports = {
    /********************************* FLAGS *********************************/

    // The --production flag will build for production instead of dev
    production: !!(argv.production),

    /***************************** FILES & FOLDERS ***************************/

    // Directory names
    dirs: {
        // The folder where compiled assets go
        build:  'demo/dist',
        // The folder where source code goes
        source: 'demo/src',
        // The folder where images go
        images: 'img',
        // The folder where html goes
        html:   'html',
        // The folder where LESS goes
        less:   'less',
        // The folder where CSS goes
        css:    'css',
        // The folder where js goes
        js:     'js',
        // The folder where vendor assets go
        vendor: 'vendor'
    },

    // File names
    files: {
        // Built file names
        build: {
            js: {
                // Compiled application bundle js
                app: 'app.js',
                // Compiled dependency bundle js
                dependencies: 'deps.js'
            },
            css: {
                // Compiled application styles
                app: 'app.css'
            },
            html: {
                // Compiled application html
                app: 'index.html'
            }
        },
        // Source file names
        source: {
            js: {
                // Application bundle js
                appEntryPoint: 'main.js'
            },
            less: {
                // Application styles
                appEntryPoint: 'main.less'
            },
            html: {
                // Application html
                appEntryPoint: 'index.html'
            }
        }
    }
};
