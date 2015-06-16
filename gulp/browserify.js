/***************************** EXTERNAL IMPORTS ******************************/

var fs          = require('fs');
var path        = require('path');
var rimraf      = require('rimraf');
var browserify  = require('browserify');
var watchify    = require('watchify');
var babelify    = require('babelify');
var babel       = require('gulp-babel');
var gutil       = require('gulp-util');
var source      = require('vinyl-source-stream');
var livereload  = require('gulp-livereload');
var gulpif      = require('gulp-if');
var buffer      = require('vinyl-buffer');
var uglify      = require('gulp-uglify');
var _           = require('underscore');

/***************************** INTERNAL IMPORTS ******************************/

var config      = require('./config.js');
var package     = require('../package.json');

/********************************* HELPERS ***********************************/

// The project base directory
var basedir         = path.join(__dirname, '..');

// The react.js reference directory


// Handles browserify errors
function handleError(err) {
    gutil.log(gutil.colors.red('Browserify Error:'), err.message);
    this.emit('end');
}

// Used for application re-bundling
function bundleShare(b, gulp) {
    return b.bundle()
        .on('error', handleError)
        .pipe(source('demo.js'))
        .pipe(gulpif(config.production, buffer()))
        .pipe(gulpif(config.production, uglify()))
        .pipe(gulp.dest((path.join(basedir, 'demo', 'dist'))))
        .pipe(gulpif(!config.production, livereload()));
}

/************************** GULP MODULE DEFINITION ***************************/

module.exports = function(gulp) {
    // Clears the js from the build directory
    gulp.task('js:clean', 'Clears compiled js from the build directory', function() {
        try {
            fs.unlinkSync(path.join(basedir, 'demo', 'dist', 'demo.js'));
            rimraf.sync(path.join(basedir, 'lib', 'js'));
        } catch(err) {
            // Swallow dat error
        }
    });

    // Builds the demo application bundle
    gulp.task('js:demo', 'Builds the demo js bundle', ['js:lib'], function() {
        var b = browserify({
            cache:          {},
            debug:          (!config.production),
            packageCache:   {},
            fullPaths:      true,
            extensions:     ['.js', '.jsx'],
            paths:          [
                path.join(basedir, 'src', 'node_modules'),  // For node modules
                path.join(basedir, 'demo', 'src', 'js')     // The js source directory
            ]
        });
        // Browserify transforms
        b.transform(babelify);  // Babel handles ES6+ -> ES5 compilation and JSX compilation for react
        // Use watchify if not in production
        if (!config.production) {
            // Configure watchify
            b = watchify(b);
            b.on('update', function() {
                gutil.log('Watchify detected change -> Rebuilding bundle...');
                return bundleShare(b, gulp);
            });
        }
        // Bind error handler
        b.on('error', handleError);
        // The application entry point
        b.add(path.join(basedir, 'demo', 'src', 'js', 'demo.js'));
        // Perform bundling
        return bundleShare(b, gulp);
    });

    // Builds the library folder
    gulp.task('js:lib', 'Builds the alloy library', function() {
         gulp.src(path.join(basedir, 'src', 'js', '**', '*'))
            .pipe(babel())
            .pipe(gulp.dest(path.join(basedir, 'lib', 'js')))
    });

    // Watches library js files
    gulp.task('js:lib:watch', 'Watches alloy library scripts', function() {
        if (!config.production) {
            gulp.watch(path.join(basedir, 'src', 'js', '**', '*'), ['js:lib']);
        }
    });

    // Catch-all js task
    gulp.task('js', 'Perform all JS tasks', ['js:clean', 'js:lib', 'js:demo', 'js:lib:watch']);
};
