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
 * Runs the generator tests in Chrome. It uses webdriverio to
 * launch Chrome and load index.html. Outputs a summary of the test results
 * to the console and outputs files for later validation.
 * @return the Thenable managing the processing of the browser tests.
 */
async function runGeneratorsInBrowser() {
  var options = {
    capabilities: {
      browserName: 'chrome',
    },
    logLevel: 'warn',
    services: ['selenium-standalone']
  };
  // Run in headless mode on Github Actions.
  if (process.env.CI) {
    options.capabilities['goog:chromeOptions'] = {
      args: ['--headless', '--no-sandbox', '--disable-dev-shm-usage', '--allow-file-access-from-files']
    };
  } else {
    // --disable-gpu is needed to prevent Chrome from hanging on Linux with
    // NVIDIA drivers older than v295.20. See 
    // https://github.com/google/blockly/issues/5345 for details.   
    options.capabilities['goog:chromeOptions'] = {
      args: ['--allow-file-access-from-files', '--disable-gpu']
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
