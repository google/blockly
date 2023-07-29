/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Node.js script to run Automated tests in Chrome, via webdriver.
 */

const chai = require('chai');
const {Key} = require('webdriverio');
const {
  testSetup,
  testFileLocations,
  switchRTL,
  dragBlockTypeFromFlyout,
  screenDirection,
} = require('./test_setup');

suite('Testing undo block movement', function (done) {
  // Setting timeout to unlimited as the webdriver takes a longer time to run than most mocha test
  this.timeout(0);

  // Setup Selenium for all of the tests
  suiteSetup(async function () {
    this.browser = await testSetup(testFileLocations.PLAYGROUND);
  });

  test('Undoing Block Movement LTR', async function () {
    await testUndoBlock(this.browser, screenDirection.LTR);
  });

  test('Undoing Block Movement RTL', async function () {
    await switchRTL(this.browser);
    await testUndoBlock(this.browser, screenDirection.RTL);
  });
});

async function testUndoBlock(browser, delta) {
  // Drag out first function
  const defReturnBlock = await dragBlockTypeFromFlyout(
    browser,
    'Functions',
    'procedures_defreturn',
    50 * delta,
    20,
  );

  await browser.keys([Key.Ctrl, 'z']);

  const blockOnWorkspace = await browser.execute(() => {
    return !!Blockly.getMainWorkspace().getAllBlocks(false)[0];
  });

  chai.assert.isFalse(blockOnWorkspace);
}
