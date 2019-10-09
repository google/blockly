/**
 * @license
 * Copyright 2019 Google LLC
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

var isCollapsed = false;
var filterText = '';
var isInsertionMarker = false;
var isRtl = false;
var inlineInputs = false;
var externalInputs = false;

function processArgs() {
  var args = process.argv;
  for (var i = 0; i < args.length; i++) {
    var arg = args[i];
    if (arg === '--collapsed') {
      isCollapsed = true;
    } else if (arg === '--name') {
      filterText = args[i + 1];
    } else if (arg === '--insertionMarker') {
      isInsertionMarker = true;
    } else if (arg === '--rtl') {
      isRtl = true;
    } else if (arg === '--inlineInputs') {
      inlineInputs = true
    } else if (arg === '--externalInputs') {
      externalInputs = true
    }
  }
}

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
  processArgs();
  checkAndCreateDir(output_url)
  checkAndCreateDir(output_url + '/old');
  checkAndCreateDir(output_url + '/new');

  var url_prefix = 'file://' + __dirname + '/playground';
  var browser_new = await buildBrowser(url_prefix + '_new.html', isRtl);
  var browser_old = await buildBrowser(url_prefix + '_old.html', isRtl);
  var test_list = getTestList();
  for (var i = 0, testName; testName = test_list[i]; i++) {
    await genSingleScreenshot(browser_new, 'new', testName, isCollapsed, isInsertionMarker, inlineInputs, externalInputs);
    if (!fs.existsSync(output_url + '/old/' + testName)) {
      await genSingleScreenshot(browser_old, 'old', testName, isCollapsed, isInsertionMarker, inlineInputs, externalInputs);
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

async function buildBrowser(url, isRtl) {
  var options = {
    capabilities: {
      browserName: 'chrome'
    },
    logLevel: 'warn'
  };
  // Run in headless mode on Travis.
  if (process.env.TRAVIS_CI) {
    options.capabilities['goog:chromeOptions'] = {
      args: ['--headless', '--no-sandbox', '--disable-dev-shm-usage']
    };
  }
  console.log('Starting webdriverio...');
  const browser = await webdriverio.remote(options);
  var injectBlockly = function(isRtl) {
    workspace = Blockly.inject('blocklyDiv',
    {
      comments: true,
      collapse: true,
      disable: true,

      horizontalLayout: false,
      maxBlocks: Infinity,
      maxInstances: {'test_basic_limit_instances': 3},
      media: '../../media/',
      oneBasedIndex: true,
      readOnly: false,
      rtl: isRtl,
      move: {
        scrollbars: false,
        drag: true,
        wheel: false,
      },
      toolboxPosition: 'start',
      zoom:
        {
          controls: false,
          wheel: true,
          startScale: 2.0,
          maxScale: 4,
          minScale: 0.25,
          scaleSpeed: 1.1
        }
    });
  }

  await browser.setWindowSize(500, 500);
  console.log('Initialized.\nLoading url: ' + url);
  await browser.url(url);
  await browser.execute(injectBlockly, isRtl);
  return browser;
}

async function genSingleScreenshot(browser, dir, test_name, isCollapsed, isInsertionMarker, inlineInputs, externalInputs) {
  var prefix = './tests/screenshot/';
  var xml_url = prefix + 'test_cases/' + test_name;
  var xml = fs.readFileSync(xml_url, 'utf8');

  var loadXmlFn = function(xml_text, isCollapsed, isInsertionMarker, inlineInputs, externalInputs) {
    workspace.clear();
    var xml = Blockly.Xml.textToDom(xml_text);
    Blockly.Xml.domToWorkspace(xml, workspace);
    if (isCollapsed || isInsertionMarker || inlineInputs || externalInputs) {
      var blocks = workspace.getAllBlocks(false);
      for (var i = 0, block; block = blocks[i]; i++) {
        block.setCollapsed(isCollapsed);
        block.setInsertionMarker(isInsertionMarker);
        if (inlineInputs) {
          block.setInputsInline(true);
        } else if (externalInputs) {
          block.setInputsInline(false);
        }
      }
    }
  };
  await browser.execute(loadXmlFn, xml, isCollapsed, isInsertionMarker, inlineInputs, externalInputs);
  await browser.saveScreenshot(prefix + '/outputs/' + dir + '/' + test_name + '.png');
}


if (require.main === module) {
  genScreenshots();
}
