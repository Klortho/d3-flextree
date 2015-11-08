var concat = require('gulp-concat'),
    del = require('del'),
    gulp = require('gulp'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify');

var exec = require("gulp-exec");
var install = require("gulp-install");
var mkdir = require('mkdir-p');
 
var make_plugin = require("./make-plugin.js");


var name = 'd3-flextree',
    dist = 'dist';

gulp.task('default', ['js']);

gulp.task('all', [
  'clean', 
  'd3-npm-install',
  "d3-make",
  "d3-test",
  'make-plugin', 
  'js'
]);

gulp.task('clean', function () {
  return del([
    dist,
    "d3-flextree.js",
    "d3/node_modules",
    "d3/d3.js",
    "d3/d3.min.js"
  ]);
});

// Does `npm install` in the D3 submodule
gulp.task('d3-npm-install', function() {
  return gulp.src(['d3/bower.json', 'd3/package.json'])
    .pipe(gulp.dest('./d3'))
    .pipe(install());
});

// Does `make` in the D3 submodule, creating the d3.js and d3.min.js files there
gulp.task('d3-make', ['d3-npm-install'], function() {
  return gulp.src('d3')
    .pipe(exec('cd d3 && make'))
    .pipe(exec.reporter());
});

// Runs the tests in the D3 submodule
gulp.task('d3-test', ['d3-make'], function() {
  return gulp.src('d3')
    .pipe(exec('cd d3 && make test'))
    .pipe(exec.reporter());
});

// Make the d3-flextree.js plugin from the d3/src/layout/tree.js source.
// This returns a Promise to make sure the next task waits.
// FIXME: as a learning exercise, rewrite make-plugin.js as a stream-based
// gulp plugin, see http://www.pixeldonor.com/2014/feb/20/writing-tasks-gulpjs/
gulp.task('make-plugin', function () {
  mkdir.sync(dist);
  return make_plugin.exec();
});

// Minify
gulp.task('js', ['make-plugin'], function() {
  return gulp.src("./dist/" + name + '.js')
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(dist));
});

