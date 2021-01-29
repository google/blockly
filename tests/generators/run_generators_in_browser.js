/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Node.js script to run generator tests in Firefox, via webdriver.
 */
var webdriverio = require('webdriverio');
var fs = require('fs');

module.exports = runGeneratorsInBrowser;

/**
 * Run the generator for a given language and save the results to a file.
 * @param {Thenable} browser A Thenable managing the processing of the browser
 *     tests.
 * @param {string} filename Where to write the output file.
 * @param {Function} codegenFn The function to run for code generation for this
 *     language.
 */
async function runLangGeneratorInBrowser(browser, filename, codegenFn) {
  await browser.execute(codegenFn);
  var elem = await browser.$("#importExport");
  var result = await elem.getValue();
  fs.writeFile(filename, result, function(err) {
    if (err) {
      return console.log(err);
    }
  });
}

/**
 * Runs the generator tests in Firefox. It uses webdriverio to
 * launch Firefox and load index.html. Outputs a summary of the test results
 * to the console and outputs files for later validation.
 * @return the Thenable managing the processing of the browser tests.
 */
async function runGeneratorsInBrowser() {
  var options = {
    capabilities: {
      browserName: 'firefox'
    },
    path: '/wd/hub'
  };
  // Run in headless mode on Travis.
  if (process.env.TRAVIS_CI) {
    options.capabilities['moz:firefoxOptions'] = {
      args: ['-headless']
    };
  }

  var url = 'file://' + __dirname + '/index.html';
  var prefix = 'tests/generators/tmp/generated';

  console.log('Starting webdriverio...');
  const browser = await webdriverio.remote(options);
  console.log('Initialized.\nLoading url: ' + url);
  await browser.url(url);

  await browser.execute(function() {
    checkAll();
    loadSelected();
  });

  await runLangGeneratorInBrowser(browser, prefix + '.js',
      function() {
        toJavaScript();
      });
  await runLangGeneratorInBrowser(browser, prefix + '.py',
      function() {
        toPython();
      });
  await runLangGeneratorInBrowser(browser, prefix + '.dart',
      function() {
        toDart();
      });
  await runLangGeneratorInBrowser(browser, prefix + '.lua',
      function() {
        toLua();
      });
  await runLangGeneratorInBrowser(browser, prefix + '.php',
      function() {
        toPhp();
      });

  await browser.deleteSession();
}

if (require.main === module) {
  runGeneratorsInBrowser().catch(e => {
    console.error(e);
    process.exit(1);
  }).then(function(result) {
    if (result) {
      console.log('Generator tests failed');
      process.exit(1);
    } else {
      console.log('Generator tests passed');
      process.exit(0);
    }
  });
}
