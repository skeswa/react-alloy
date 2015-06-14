/***************************** EXTERNAL IMPORTS ******************************/

var path        = require('path');
var express     = require('express');
var gutil       = require('gulp-util');
var livereload  = require('gulp-livereload');

/***************************** INTERNAL IMPORTS ******************************/

var config      = require('./config.js');

/********************************* HELPERS ***********************************/

// The project base directory
var basedir     = path.join(__dirname, '..');

/************************** GULP MODULE DEFINITION ***************************/

module.exports = function(gulp) {
    // Starts livereload
    gulp.task('server:livereload', 'Starts liverelaod for the demo web server', function(done) {
        if (!config.production) {
            livereload.listen();
        }
    });
    // Starts the dev web server
    gulp.task('server:start', 'Starts the demo web server', function(done) {
        if (!config.production) {
            // Start the socket server
            var app = express();
            app.use(express.static(path.join(basedir, 'demo', 'dist')));
            app.get('/', function(_, res) {
                res.sendFile(path.join(basedir, 'demo', 'dist', 'index.html'));
            });
            gutil.log('Dev server is listening on port 3000');
            app.listen(3000, done);
        }
    });

    // Catch-all server task
    gulp.task('server', 'Performs all server tasks', ['server:livereload', 'server:start']);
};
