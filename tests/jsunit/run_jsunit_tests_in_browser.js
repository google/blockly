/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Node.js script to run JsUnit tests in Chrome, via webdriver.
 */
var webdriverio = require('webdriverio');

/**
 * Runs the JsUnit tests in this directory in Chrome. It uses webdriverio to
 * launch Chrome and load index.html. Outputs a summary of the test results
 * to the console.
 * @return the Thenable managing the processing of the browser tests.
 */
function runJsUnitTestsInBrowser() {
  var options = {
      desiredCapabilities: {
          browserName: 'chrome'
      }
  };

  var url = 'file://' + __dirname + '/index.html';
  console.log('Starting webdriverio...');
  return webdriverio
      .remote(options)
      .init()
      .then(function() {
        console.log('Initialized.\nLoading url: ' + url);
      })
      .url(url)
      .then(function() {
        console.log('Loaded.\nPausing to allow processing.');
      })
      .pause(5000) //TODO: change pause to waitunitl
      .then(function() {
        console.log('Retrieving results...');
      })
      .getHTML('#closureTestRunnerLog')
      .then(function(result) {
        // call js to parse html
        var regex = /[\d]+\spassed,\s([\d]+)\sfailed./i;
        var numOfFailure = regex.exec(result)[1];
        var regex2 = /Unit Tests for Blockly .*]/;
        var testStatus = regex2.exec(result)[0];
        console.log('============Blockly Unit Test Summary=================');
        console.log(testStatus);
        var regex3 = /\d+ passed,\s\d+ failed/;
        var detail = regex3.exec(result)[0];
        console.log(detail);
        console.log('============Blockly Unit Test Summary=================');
        if (parseInt(numOfFailure) !== 0) {
          console.log(result);
          process.exit(1);
        }
      })
      .catch(function(e) {
        console.error('Error: ', e);

        if (require.main === module) {
          // .catch() doesn't seem to work in the calling code,
          // even if the error is rethrown. To ensure the script
          // exit code is non-zero, shutdown the process here.
          process.exit(1);
        }

        // WARNING: Catching this outside of runJsUnitTestsInBrowser() is not
        // working. However, killing the process doesn't seem good, either.
        throw e;
      });
}

module.exports = runJsUnitTestsInBrowser;

if (require.main === module) {
  try {
    runJsUnitTestsInBrowser()
    .catch(function(e) {
      // TODO: Never called during errors. Fix.
      console.error('Error: ' + e);
      process.exit(1);
    })
    .endAll()
    .then(function() {
      console.log('JSUnit tests completed');
      process.exit(0);
    });
  } catch(e) {
    console.error('Uncaught error: ', e);
    process.exit(1);
  }
}
