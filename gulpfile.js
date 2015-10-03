var gulp = require('gulp'),
    spawn = require('child_process').spawn,
    run = require('gulp-run');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');

var name = 'd3.flextree';


gulp.task('default', ['make-module'], function() {
  return gulp.src(name + '.js')
    .pipe(uglify())
    .pipe(concat(name + '.min.js'))
    .pipe(gulp.dest('./'));
});

gulp.task('make-module', [], function (cb) {
  run("node make-module.js").exec();
});