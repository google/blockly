var sauceBrowsers = require('./sauce_browsers.json');

function getBrowserName(browserCap) {
  var name = browserCap.browserName == 'internet explorer' ?
      'ie' :
      browserCap.browserName;
  var version = browserCap.version || '-latest';
  return name + version;
}

function getJobName(browserCap) {
  var browserName = getBrowserName(browserCap);

  return process.env.TRAVIS_PULL_REQUEST == 'false' ?
      'CO-' + process.env.TRAVIS_BRANCH + '-' + browserName :
      'PR-' + process.env.TRAVIS_PULL_REQUEST + '-' + browserName + '-' +
          process.env.TRAVIS_BRANCH;
}

function getBrowserCapabilities(browsers) {
  var caps = [];
  for (var i = 0; i < browsers.length; i++) {
    var b = browsers[i];
    b['tunnel-identifier'] = process.env.TRAVIS_JOB_NUMBER;
    b['build'] = process.env.TRAVIS_BUILD_NUMBER;
    b['name'] = getJobName(b);
    caps.push(b);
  }
  return caps;
}

module.exports = getBrowserCapabilities(sauceBrowsers);
