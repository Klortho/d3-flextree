var concat = require('gulp-concat'),
    del = require('del'),
    gulp = require('gulp'),
    rename = require('gulp-rename'),
    run = require('gulp-run'),
    spawn = require('child_process').spawn,
    uglify = require('gulp-uglify');

var name = 'd3-flextree',
    build = 'build';

gulp.task('default', ['clean', 'make-module', 'js']);

gulp.task('clean', function () {
  return del([
    build
  ]);
});

gulp.task('js', function() {
  return gulp.src(name + '.js')
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(build));
});

gulp.task('make-module', [], function (cb) {
  run("node make-module.js").exec();
});

