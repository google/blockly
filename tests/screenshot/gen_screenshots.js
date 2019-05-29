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
 * @fileoverview Node.js script to generate screenshots in Chrome, via webdriver.
 */
var webdriverio = require('webdriverio');
var fs = require('fs');

module.exports = genScreenshots;

var filterText = process.argv[2] || '';

function checkAndCreateDir(dirname) {
  if (!fs.existsSync(dirname)){
    fs.mkdirSync(dirname);
  }
};

/**
 * Opens two different webdriverio browsers.  One uses the hosted version of
 * blockly_compressed.js; the other uses the local blockly_uncompressed.js.
 *
 * Each playground is a minimal Blockly instance.  This loads the same XML in
 * both playgrounds and saves a screenshot of each.
 */
async function genScreenshots() {
  var output_url = 'tests/screenshot/outputs'
  checkAndCreateDir(output_url)
  checkAndCreateDir(output_url + '/old');
  checkAndCreateDir(output_url + '/new');

  var url_prefix = 'file://' + __dirname + '/playground';
  var browser_new = await buildBrowser(url_prefix + '_new.html');
  var browser_old = await buildBrowser(url_prefix + '_old.html');

  var test_list = getTestList();

  for (var i = 0, testName; testName = test_list[i]; i++) {
    await genSingleScreenshot(browser_new, 'new', testName);
    if (!fs.existsSync(output_url + '/old/' + testName)) {
      await genSingleScreenshot(browser_old, 'old', testName);
    }
  }

  await cleanUp(browser_new, browser_old);
  return 0;
}

function getTestList() {
  var file = fs.readFileSync('tests/screenshot/test_cases/test_cases.json');
  var json = JSON.parse(file);
  var testSpecArr = json.tests;
  var testList = [];
  for (var i = 0, testSpec; testSpec = testSpecArr[i]; i++) {
    if (!testSpec.skip && testSpec.title.includes(filterText)) {
      testList.push(testSpec.title);
    }
  }
  return testList;
}

async function cleanUp(browser_new, browser_old) {
  await browser_new.deleteSession();
  await browser_old.deleteSession();
}

async function buildBrowser(url) {
  var options = {
    capabilities: {
      browserName: 'chrome'
    },
    logLevel: 'warn'
  };
  console.log('Starting webdriverio...');
  const browser = await webdriverio.remote(options);
  await browser.setWindowSize(500, 500);
  console.log('Initialized.\nLoading url: ' + url);
  await browser.url(url);
  return browser;
}

async function genSingleScreenshot(browser, dir, test_name) {
  var prefix = './tests/screenshot/';
  var xml_url = prefix + 'test_cases/' + test_name;
  var xml = fs.readFileSync(xml_url, 'utf8');

  var loadXmlFn = function(xml_text) {
    workspace.clear();
    var xml = Blockly.Xml.textToDom(xml_text);
    Blockly.Xml.domToWorkspace(xml, workspace);
  };
  await browser.execute(loadXmlFn, xml);
  await browser.saveScreenshot(prefix + '/outputs/' + dir + '/' + test_name + '.png');
}


if (require.main === module) {
  genScreenshots();
}
