/***************************** EXTERNAL IMPORTS ******************************/

var gutil   = require('gulp-util');
var gulp    = require('gulp-help')(require('gulp'), {
    afterPrintCallback: function() {
        console.log(gutil.colors.blue.bold('To build for production'), 'use the --production flag on any gulp task\n');
    }
});

/******************************* GULP MODULES ********************************/

require('./gulp/browserify')(gulp);
require('./gulp/less')(gulp);
require('./gulp/html')(gulp);
require('./gulp/images')(gulp);
require('./gulp/server')(gulp);

/******************************** GULP TASKS *********************************/

gulp.task('default', 'Builds all web application assets; when not in production, deploys server and watches for changes', ['less', 'images', 'js', 'html', 'server']);
