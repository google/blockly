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

/*
 * Notes
 * this.execute runs the code in the browser's context (which is what I want).
 * this is browser in most of the webdriverio examples.
 * tests currently fail because of CORS restrictions.  Oh, that's because it's
 * running in chrome.  let's try making it run in firefox before giving up and
 * figuring out how to start a server.
 * in firefox it pops up the alerts about it but also still works.  so uh...
 */
/**
 * Runs the JsUnit tests in this directory in Chrome. It uses webdriverio to
 * launch Chrome and load index.html. Outputs a summary of the test results
 * to the console.
 * @return the Thenable managing the processing of the browser tests.
 */
function runJsGeneratorTestsInBrowser() {
  var options = {
      desiredCapabilities: {
          browserName: 'firefox'
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
      .pause(1000)
      .then(function() {
        this.execute( function() {
          checkAll();
          loadSelected();
        })
        // var logs = this.log('browser')
        // console.log('============Start Browser Logs=================');
        // console.log(logs);
        // console.log('============End Browser Logs=================');
      })
      .pause(15000)
      .then(function() {
        this.execute(function() {
          toJavaScript();
          console.log('Code generated');
          eval(outputCode);
        })
      }) //TODO: change pause to waitunitl
      // .then(function() {
      //   console.log('Retrieving results...');
      // })
      // .getHTML('#closureTestRunnerLog')
      // .then(function(result) {
      //   // call js to parse html
      //   var regex = /[\d]+\spassed,\s([\d]+)\sfailed./i;
      //   var numOfFailure = regex.exec(result)[1];
      //   var regex2 = /Unit Tests for Blockly .*]/;
      //   var testStatus = regex2.exec(result)[0];
      //   console.log('============Blockly Unit Test Summary=================');
      //   console.log(testStatus);
      //   var regex3 = /\d+ passed,\s\d+ failed/;
      //   var detail = regex3.exec(result)[0];
      //   console.log(detail);
      //   console.log('============Blockly Unit Test Summary=================');
      //   if (parseInt(numOfFailure) !== 0) {
      //     console.log(result);
      //     process.exit(1);
      //   }
      // })
      .pause(10000)
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

module.exports = runJsGeneratorTestsInBrowser;

if (require.main === module) {
  try {
    runJsGeneratorTestsInBrowser()
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
