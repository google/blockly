var historyFallback = require('connect-history-api-fallback');
var log = require('connect-logger');
var yargs = require('yargs');
var sync = require('browser-sync').create();
var defaultOpenPath = '';

yargs.option('files', {
  describe: 'array of file paths to watch',
  type: 'array'
});

var argv = yargs.argv;
var openPath = getOpenPath();
var indexFile = argv.indexFile || 'index.html'
var options =
  {
    openPath: openPath,
    files: argv.files ? argv.files : [
      openPath + '/**/*.html',
      openPath + '/**/*.css',
      openPath + '/**/*.js'
    ],
    baseDir: argv.baseDir || './',
    fallback: '/' + openPath + '/' + indexFile
  };

if (argv.verbose) {
  console.log('options', options);
}

function getOpenPath() {
  var src = argv.open || defaultOpenPath;
  if (!src) {
    return '.'
  }
  return src;
}

sync.init({
  port: argv.port || 3000,
  server: {
    baseDir: options.baseDir,
    middleware: [
      log(),
      historyFallback({ index: options.fallback })
    ]
  },
  files: options.files,
});
