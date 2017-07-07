'use strict';

/* eslint global-require: 0, no-path-concat:0 */

/**
 * Module dependencies
 */
var gulp = require('gulp'),
    plugins = require('gulp-load-plugins')(),
    runSequence = require('run-sequence');

var jsFiles = [
    '*.js',
    'src/*.js',
    'src/**/*.js'
];

var testSuiteFiles = ['specs/*.js', 'specs/**/*.js']

// Local settings
var changedTestFiles = [];

// Set NODE_ENV to 'test'
gulp.task('env:test', function () {
    process.env.NODE_ENV = 'test';
});

// Set NODE_ENV to 'development'
gulp.task('env:dev', function () {
    process.env.NODE_ENV = 'development';
});

// Set NODE_ENV to 'production'
gulp.task('env:prod', function () {
    process.env.NODE_ENV = 'production';
});

// Nodemon task
gulp.task('nodemon', function () {
    return plugins.nodemon({
        script: 'index.js',
        ext: 'js',
        watch: jsFiles
    });
});

// Nodemon debug task
gulp.task('nodemon-debug', function () {
    return plugins.nodemon({
        script: 'index.js',
        nodeArgs: ['--inspect'],
        ext: 'js',
        verbose: true,
        watch: jsFiles
    });
});

// ESLint JS linting task
gulp.task('eslint', function () {
    return gulp.src(jsFiles)
        .pipe(plugins.eslint())
        .pipe(plugins.eslint.format());
});

// Mocha tests task
gulp.task('mocha', function (done) {
    var testSuites = changedTestFiles.length ? changedTestFiles : testSuiteFiles;
    var error;

    // Run the tests
    gulp.src(testSuites)
        .pipe(plugins.mocha({
            reporter: 'spec',
            timeout: 10000
        }))
        .on('error', function (err) {
            // If an error occurs, save it
            error = err;
        })
        .on('end', function () {
        });
});

// Prepare istanbul coverage test
gulp.task('pre-test', function () {

    // Display coverage for all server JavaScript files
    return gulp.src(jsFiles)
    // Covering files
        .pipe(plugins.istanbul())
        // Force `require` to return covered files
        .pipe(plugins.istanbul.hookRequire());
});

// Run istanbul test and write report
gulp.task('mocha:coverage', ['pre-test', 'mocha'], function () {
    var testSuites = changedTestFiles.length ? changedTestFiles : testSuiteFiles;

    return gulp.src(testSuites)
        .pipe(plugins.istanbul.writeReports({
            reportOpts: { dir: './coverage/server' }
        }));
});

// Lint CSS and JavaScript files.
gulp.task('lint', function (done) {
    runSequence('eslint', done);
});

// Lint project files and minify them into two production files.
gulp.task('build', function (done) {
    runSequence('env:dev', 'lint', done);
});

// Run the project tests
gulp.task('test', function (done) {
    runSequence('env:test', 'test:server', done);
});

gulp.task('test:server', function (done) {
    runSequence('env:test', 'lint', 'mocha', done);
});

gulp.task('test:coverage', function (done) {
    runSequence('env:test', 'lint', 'mocha:coverage', done);
});

// Run the project in development mode
gulp.task('default', function (done) {
    runSequence('env:dev', 'lint', 'nodemon', done);
});

// Run the project in debug mode
gulp.task('debug', function (done) {
    runSequence('env:dev', 'lint', 'nodemon-debug', done);
});

// Run the project in production mode
gulp.task('prod', function (done) {
    runSequence('build', 'env:prod', 'lint', 'nodemon', done);
});
