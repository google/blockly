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
 * @throws If any error occurs when attempting to run the tests.
 */
function runJsUnitTestsInBrowser() {
  var options = {
      desiredCapabilities: {
          browserName: 'chrome'
      }
  };

  //TODO: change pause to waitunitl
  var browser = webdriverio
      .remote(options)
      .init()
      .url('file://' + __dirname + '/index.html').pause(5000);


  browser
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
    if ( parseInt(numOfFailure) !== 0) {
      console.log(result);
      process.exit(1);
    }
  })
}

module.exports = runJsUnitTestsInBrowser;

if (require.main === module) {
  try {
    runJsUnitTestsInBrowser();
  } catch(errorStr) {
    console.error(errorStr);
    process.exit(1);
  }
}
