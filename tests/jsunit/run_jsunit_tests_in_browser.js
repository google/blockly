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

module.exports = runJsUnitTestsInBrowser;

/**
 * Runs the JsUnit tests in this directory in Chrome. It uses webdriverio to
 * launch Chrome and load index.html. Outputs a summary of the test results
 * to the console.
 * @return 0 on success, 1 on failure.
 */
async function runJsUnitTestsInBrowser() {
  var options = {
      capabilities: {
          browserName: 'chrome'
      }
  };

  var url = 'file://' + __dirname + '/index.html';
  console.log('Starting webdriverio...');
  const browser = await webdriverio.remote(options);
  console.log('Initialized.\nLoading url: ' + url);
  await browser.url(url);

  const elem = await browser.$('#closureTestRunnerLog')
  const result = await elem.getHTML();

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
    await browser.deleteSession();
    return 1;
  }
  await browser.deleteSession();
  return 0;
}

if (require.main === module) {
  runJsUnitTestsInBrowser().catch(e => {
    console.error(e);
    process.exit(1);
  }).then(function(result) {
    if (result) {
      console.log('JSUnit tests failed');
      process.exit(1);
    } else {
      console.log('JSUnit tests passed');
      process.exit(0);
    }
  });
}
