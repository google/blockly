var gulp = require('gulp');
gulp.shell = require('gulp-shell')
gulp.concat = require('gulp-concat')

gulp.task('build', gulp.shell.task([
    'python build.py'
  ])
);

gulp.task('js', function() {
  	return gulp.src([
  		'blockly_compressed.js',
  		'blocks_compressed.js',
  		'javascript_compressed.js',
      'msg/js/en.js',
      'expose.js'
  	])
  	.pipe(gulp.concat('blockly.js'))
  	.pipe(gulp.dest(''))
})

gulp.task('watch', function() {
	// if you change any of the blocks...
  gulp.watch('blocks/*.js', ['build']);
	// or the code the blocks compile into, Rebuild
	gulp.watch('generators/javascript/*.js', ['build']);

});

gulp.task('default', ['watch', 'build']);
