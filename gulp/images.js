/***************************** EXTERNAL IMPORTS ******************************/

var path        = require('path');
var rimraf      = require('rimraf');
var imagemin    = require('gulp-imagemin');
var gulpif      = require('gulp-if');

/***************************** INTERNAL IMPORTS ******************************/

var config      = require('./config.js');

/********************************* HELPERS ***********************************/

// The project base directory
var basedir     = path.join(__dirname, '..');

/************************** GULP MODULE DEFINITION ***************************/

module.exports = function(gulp) {
    // Clears copied images assets from the build directory
    gulp.task('images:clean', 'Clears copied images from the build directory', function() {
        try {
            rimraf.sync(path.join(basedir, 'demo', 'dist', 'img'));
        } catch(err) {
            // Swallow dat exception
        }
    });

    // Copies images into build directory
    gulp.task('images:copy', 'Copies images assets into build directory', function() {
        gulp.src(path.join(basedir, 'demo', 'src', 'img', '**', '*'))
            .pipe(gulpif(config.production, imagemin({
                progressive: true
            })))
            .pipe(gulp.dest(path.join(basedir, 'demo', 'dist', 'img')));
    });

    // Catch-all images task
    gulp.task('images', 'Performs all image tasks', ['images:clean', 'images:copy']);
};
