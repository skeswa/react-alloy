/***************************** EXTERNAL IMPORTS ******************************/

var path    = require('path');
var express = require('express');
var gutil   = require('gulp-util');

/***************************** INTERNAL IMPORTS ******************************/

var config      = require('./config.js');

/********************************* HELPERS ***********************************/

// The project base directory
var basedir     = path.join(__dirname, '..');

/************************** GULP MODULE DEFINITION ***************************/

module.exports = function(gulp) {
    // Starts the dev web server
    gulp.task('server:start', 'Starts the demo web server', function(done) {
        // Start the socket server
        var app = express();
        app.use('/static', express.static(path.join(basedir, 'demo', 'dist')));
        app.get('/', function(_, res) {
            res.sendFile(path.join(basedir, 'demo', 'dist', 'index.html'));
        });
        app.listen(3000, done);
        gutil.log('Dev server is listening on port 3000');
    });

    // Catch-all server task
    gulp.task('server', 'Performs all server tasks', ['server:start']);
};
