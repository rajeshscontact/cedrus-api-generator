var gulp = require('gulp');
var gutil = require('gulp-util');
var del = require('del');
var rename = require('gulp-rename');
var install = require('gulp-install');
var zip = require('gulp-zip');
var AWS = require('aws-sdk');
var fs = require('fs');
var runSequence = require('run-sequence');

var awsLocation = './aws';
var zipFileName = 'lambda.zip';

// First we need to clean out and remove the compiled zip file.
gulp.task('clean', function(cb) {
  del(awsLocation,
    del('./'+zipFileName, cb)
  );
});

gulp.task('npm', function() {
  gulp.src('./package.json')
    .pipe(gulp.dest(awsLocation+'/'))
    .pipe(install({production: true}));
});

gulp.task('js', function() {
  gulp.src('index.js')
    .pipe(gulp.dest(awsLocation+'/'))
});

gulp.task('zip', function() {
  gulp.src([awsLocation+'/**/*'])
    .pipe(zip(zipFileName))
    .pipe(gulp.dest('./'));
});
