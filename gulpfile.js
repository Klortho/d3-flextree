var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');

var name = 'd3.flextree';

gulp.task('default', function() {
  return gulp.src(name + '.js')
    .pipe(uglify())
    .pipe(concat(name + '.min.js'))
    .pipe(gulp.dest('./'));
});
