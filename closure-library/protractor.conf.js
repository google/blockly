// See https://github.com/angular/protractor/blob/master/docs/referenceConf.js
// for full protractor config reference.
var browserCapabilities = require('./browser_capabilities');

var SAUCE_ACCESS_KEY =
    process.env.SAUCE_ACCESS_KEY.split('').reverse().join('');

exports.config = {
  sauceUser: process.env.SAUCE_USERNAME,

  sauceKey: SAUCE_ACCESS_KEY,

  multiCapabilities: browserCapabilities,

  // Testing framework used for spec file.
  framework: 'jasmine2',

  // Relative path to spec (i.e., tests).
  specs: ['protractor_spec.js'],

  jasmineNodeOpts: {
    // Timeout in ms before a test fails.
    defaultTimeoutInterval: 30 * 60 * 1000
  }
};
