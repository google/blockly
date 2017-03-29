module.exports = function(config) {

  // On Travis CI, we can only run in Chrome.
  if (process.env.TRAVIS) {
    config.browsers = ['travisChrome'];
  }

  if (!config.browsers.length) {
    config.browsers = ['Chrome', 'Firefox'];
  }

  config.set({
    basePath: '..',
    frameworks: ['qunit'],

    files: [
      'node_modules/video.js/dist/video-js.css',
      'node_modules/video.js/dist/video.js',
      'node_modules/dashjs/dist/dash.all.debug.js',
      'dist/videojs-dash.js',
      'test/integration.test.js',
      'test/globals.test.js',
      'test/dashjs.test.js',
      'tmp/browserify.test.js',
      'tmp/webpack.test.js'
    ],
    customLaunchers: {
      travisChrome: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    },
    reporters: ['dots'],
    port: 9876,
    colors: true,
    autoWatch: false,
    singleRun: true,
    concurrency: Infinity,

    browserDisconnectTolerance: 3,
    captureTimeout: 300000,
    browserNoActivityTimeout: 300000,
    browserConsoleLogOptions: {
      level: 'error',
      terminal: false
    }
  });
};
