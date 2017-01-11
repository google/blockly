var gulp = require('gulp');
gulp.shell = require('gulp-shell')

gulp.task('build', gulp.shell.task([
    'python build.py'
  ])
);

gulp.task('watch', function() {
	// if you change any of the blocks...
  gulp.watch('blocks/*.js', ['build']);
	// or the code the blocks compile into, Rebuild
	gulp.watch('generators/javascript/*.js', ['build']);

});

gulp.task('default', ['watch', 'build']);
