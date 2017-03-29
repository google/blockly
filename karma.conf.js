// Karma configuration
// Generated on Mon Mar 27 2017 15:14:49 GMT-0700 (PDT)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    //basePath: './',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine','closure'],


    // list of files / patterns to load in the browser
    files: [
      '../closure-library/closure/goog/base.js',
      // include files - tests and blockly_uncompressed.js
      'blockly_uncompressed.js',
      'core/*.js',
      'tests/jsunit/index.html',
      'tests/jsunit/*.js',
      // external deps
      {pattern: '../closure-library/closure/goog/deps.js', included: false, served: false},
      {pattern: '../closure-library/closure/goog/**/*.js', included: false},
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'tests/jsunit/*.js': ['closure'],
      'blockly_uncompressed.js':['closure'],
      'core/*.js':['closure'],
      '../closure-library/closure/goog/**/*.js':['closure'],
      '../closure-library/closure/goog/deps.js':['closure-deps']
    },
    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })

}
