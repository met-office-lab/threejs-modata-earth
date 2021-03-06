'use strict';

var gulp = require('gulp');
var runSequence = require('run-sequence');

var del = require('del');

var htmlmin = require('gulp-htmlmin');
var sass = require('gulp-sass');

var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var browserify = require('browserify');

var browserSync = require('browser-sync').create();

const BUILD_DEST = "./build";


//CLEAN
gulp.task('clean', function () {
    return del([BUILD_DEST]);
});
gulp.task('clean:html', function () {
    return del([BUILD_DEST + "/*.html"]);
});

gulp.task('clean:js', function () {
    return del([BUILD_DEST + "/js/*.*"]);
});
gulp.task('clean:css', function () {
    return del([BUILD_DEST + "/css/**/*.*"]);
});


//BUILD
gulp.task('build:static', function() {
    return gulp.src('./src/static/**/*')
        .pipe(gulp.dest(BUILD_DEST));
});
gulp.task('build:html', function () {
    return gulp.src('./src/html/*.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(BUILD_DEST));
});

gulp.task('build:js', function () {
    // set up the browserify instance on a task basis
    var b = browserify({
        entries: './src/js/main.js'
    });

    return b.bundle()
        .pipe(source('app.min.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(BUILD_DEST+'/js/'));
});

gulp.task('build:css', function () {
    return gulp.src('./src/sass/styles.scss')
        //.pipe(sass({outputStyle: 'compressed'}))        //minified
        .pipe(sass())
        .pipe(gulp.dest(BUILD_DEST + '/css'));
});

gulp.task('build', function() {
    runSequence('clean', ['build:static', 'build:html', 'build:css', 'build:js']);
});

gulp.task('build:prod', function() {
    runSequence('clean', ['build:html', 'build:css', 'build:js']);
});

//SERVE
gulp.task('serve', ['watch'], function() {
    browserSync.init({
        server: {
            baseDir: BUILD_DEST
        },
        reloadDelay: 2000,
        notify:false
    });
});


//WATCH
gulp.task('watch:css', function() {
    gulp.watch('./src/sass/**/*', ['clean:css', 'build:css']).on('change', browserSync.reload);
});
gulp.task('watch:js', function() {
    gulp.watch('./src/js/**/*', ['clean:js', 'build:js']).on('change', browserSync.reload);
});
gulp.task('watch:html', function() {
    gulp.watch('./src/html/**/*', ['clean:html', 'build:html']).on('change', browserSync.reload);
});
gulp.task('watch', function() {
    runSequence('build', ['watch:html', 'watch:css', 'watch:js']);
});


gulp.task('default', function () {
    console.log('Useage is as follows with one or more of the configured tasks:\n' +
        '$ gulp <task> [<task2> ...] \n' +
        'available options:\n' +
        '\t* clean - cleans the built project\n' +
        '\t\t-clean:html - cleans just the html\n' +
        '\t\t-clean:css - cleans just the css\n' +
        '\t\t-clean:js - cleans just the js\n' +
        '\t* build - build the project\n' +
        '\t\t-build:html - builds just the html\n' +
        '\t\t-build:css - builds just the css\n' +
        '\t\t-build:js - builds just the js\n');
});