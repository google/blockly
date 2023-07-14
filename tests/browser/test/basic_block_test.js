/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Node.js script to run Automated tests in Chrome, via
 * webdriver, of basic Blockly block functionality.
 */

const chai = require('chai');
const {
  testSetup,
  testFileLocations,
  getAllBlocks,
  getSelectedBlockElement,
  switchRTL,
  dragBlockTypeFromFlyout,
  screenDirection,
} = require('./test_setup');
const {Key} = require('webdriverio');

let browser;

suite('Basic block tests', function (done) {
  // Setting timeout to unlimited as the webdriver takes a longer time
  // to run than most mocha test
  this.timeout(0);

  // Setup Selenium for all of the tests
  suiteSetup(async function () {
    browser = await testSetup(
      testFileLocations.PLAYGROUND + '?toolbox=test-blocks'
    );
  });

  test('Drag three blocks into the workspace', async function () {
    for (let i = 1; i <= 3; i++) {
      await dragBlockTypeFromFlyout(
        browser,
        'Basic',
        'test_basic_empty',
        250,
        50 * i
      );
      chai.assert.equal((await getAllBlocks(browser)).length, i);
    }
  });

  // Teardown entire suite after test are done running
  suiteTeardown(async function () {
    await browser.deleteSession();
  });
});
