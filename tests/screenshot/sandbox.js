/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2019 Google Inc.
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
 * @fileoverview Node.js script to run Mocha tests in Chrome, via webdriver.
 */
var webdriverio = require('webdriverio');
var fs = require('fs');

module.exports = runMochaTestsInBrowser;

/**
 * Runs the Mocha tests in this directory in Chrome. It uses webdriverio to
 * launch Chrome and load index.html. Outputs a summary of the test results
 * to the console.
 * @return 0 on success, 1 on failure.
 */
async function runMochaTestsInBrowser() {
  var options = {
      capabilities: {
          browserName: 'chrome'
      }
  };

  // TODOs:
  // - open the test cases folder
  // - iterate over all files in the test cases folder
  // - use the input file name for the output file names
  // - remove mocha references
  var prefix = './tests/screenshot/';
  var xml_url = prefix + 'test_cases/math_addition';
  var xml = fs.readFileSync(xml_url, 'utf8');
  var url = 'file://' + __dirname + '/playground_new.html';
  console.log('Starting webdriverio...');
  const browser = await webdriverio.remote(options);
  await browser.setWindowSize(1000, 1000);
  console.log('Initialized.\nLoading url: ' + url);
  await browser.url(url);

  var doStuffFn = function(xml_text) {
    workspace.clear();
    var xml = Blockly.Xml.textToDom(xml_text);
    Blockly.Xml.domToWorkspace(xml, workspace);
  };
  await browser.execute(doStuffFn, xml);
  await browser.saveScreenshot(prefix + '/outputs/new/my_screenshot.png');
 await browser.deleteSession();

  var url = 'file://' + __dirname + '/playground_old.html';
  const browser2 = await webdriverio.remote(options);
  await browser2.setWindowSize(1000, 1000);
  console.log('Initialized.\nLoading url: ' + url);
  await browser2.url(url);
  await browser2.execute(doStuffFn, xml);
  await browser2.saveScreenshot(prefix + '/outputs/old/my_screenshot.png');
  await browser2.deleteSession();

  return 0;
}

if (require.main === module) {
  runMochaTestsInBrowser().catch(e => {
    console.error(e);
    process.exit(1);
  }).then(function(result) {
    if (result) {
      console.log('Mocha tests failed');
      process.exit(1);
    } else {
      console.log('Mocha tests passed');
      process.exit(0);
    }
  });
}
