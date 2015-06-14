/***************************** EXTERNAL IMPORTS ******************************/

var fs          = require('fs');
var path        = require('path');
var rimraf      = require('rimraf');
var minify      = require('gulp-minify-html');
var livereload  = require('gulp-livereload');
var plumber     = require('gulp-plumber');
var replace     = require('gulp-replace');
var gulpif      = require('gulp-if');

/***************************** INTERNAL IMPORTS ******************************/

var config      = require('./config.js');

/********************************* HELPERS ***********************************/

// The project base directory
var basedir     = path.join(__dirname, '..');

/************************** GULP MODULE DEFINITION ***************************/

module.exports = function(gulp) {
    // Clears the HTML from the build folder
    gulp.task('html:clean', 'Clears compiled HTML from the build directory', function() {
        try {
            fs.unlinkSync(path.join(basedir, 'demo', 'dist', 'index.html'));
        } catch(err) {
            // Swallow dat exception
        }
    });

    // Builds application HTML
    gulp.task('html:compile', 'Builds the application HTML', function() {
        gulp.src(path.join(basedir, 'demo', 'src', 'index.html'))
            .pipe(plumber())
            .pipe(gulpif(!config.production, replace('</body>', '\t<script src="http://localhost:35729/livereload.js"></script>\n</body>')))
            .pipe(gulpif(config.production, minify()))
            .pipe(gulp.dest(path.join(basedir, 'demo', 'dist')))
            .pipe(gulpif(!config.production, livereload()));
    });

    // Builds application HTML
    gulp.task('html:watch', 'Watches the HTML', function() {
        gulp.watch(path.join(basedir, 'demo', 'src', '*.html'), ['html:compile']);
    });

    // Catch-all HTML task
    gulp.task('html', 'Performs all HTML tasks', ['html:clean', 'html:compile', 'html:watch']);
};
