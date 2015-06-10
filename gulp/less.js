/***************************** EXTERNAL IMPORTS ******************************/

var path        = require('path');
var rimraf      = require('rimraf');
var less        = require('gulp-less');
var sourcemaps  = require('gulp-sourcemaps');
var minify      = require('gulp-minify-css');
var livereload  = require('gulp-livereload');
var plumber     = require('gulp-plumber');
var gulpif      = require('gulp-if');

/***************************** INTERNAL IMPORTS ******************************/

var config      = require('./config.js');
var package     = require('../package.json');

/********************************* HELPERS ***********************************/

// The project base directory
var basedir     = path.join(__dirname, '..');

/************************** GULP MODULE DEFINITION ***************************/

module.exports = function(gulp) {
    // Clears the compiled CSS from the build directory
    gulp.task('less:clean', 'Clears compiled less (css) from the build directory', function() {
        try {
            rimraf.sync(path.join(basedir, 'demo', 'dist', 'css'));
            rimraf.sync(path.join(basedir, 'lib', 'css'));
        } catch(err) {
            // Swallow dat exception
        }
    });

    // Builds application stylesheets
    gulp.task('less:demo', 'Builds the application stylesheets', ['less:lib'], function() {
        gulp.src(path.join(basedir, 'demo', 'src', 'less', 'demo.less'))
            .pipe(plumber())
            .pipe(gulpif(!config.production, sourcemaps.init()))
            .pipe(less())
            .pipe(gulpif(!config.production, sourcemaps.write()))
            .pipe(gulpif(config.production, minify({
                compatibility: 'ie8'
            })))
            .pipe(gulp.dest(path.join(basedir, 'demo', 'dist', 'css')))
            .pipe(gulpif(!config.production, livereload()));
    });

    gulp.task('less:lib', 'Builds the application stylesheets', function() {
        gulp.src(path.join(basedir, 'src', 'less', 'alloy.less'))
            .pipe(plumber())
            .pipe(less())
            .pipe(gulp.dest(path.join(basedir, 'lib', 'css')))
            .pipe(gulpif(!config.production, livereload()));
    });

    // Watches all less files, updates on change
    gulp.task('less:watch', 'Watches less files and compiles them on change', function() {
        if (!config.production) {
            gulp.watch(path.join(basedir, 'demo', 'src', 'less', '**', '*'), ['less:demo']);
            gulp.watch(path.join(basedir, 'src', 'less', '**', '*'), ['less:demo']);
            // Start the livereload server
            livereload.listen();
        }
    });

    // Catch-all LESS task
    gulp.task('less', 'Performs all LESS tasks', ['less:clean', 'less:demo', 'less:watch']);
};
