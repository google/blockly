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
  getSelectedBlockElement,
  getNthBlockOfCategory,
  getBlockTypeFromCategory,
  connect,
  switchRTL,
} = require('./test_setup');

let browser;
suite('Testing undo block movement', function (done) {
  // Setting timeout to unlimited as the webdriver takes a longer time to run than most mocha test
  this.timeout(0);

  // Setup Selenium for all of the tests
  suiteSetup(async function () {
    browser = await testSetup(testFileLocations.playground);
  });

  test('Undoing Block Movement LTR', async function () {
    await testUndoBlock(1);
  });

  test('Undoing Block Movement RTL', async function () {
    await switchRTL(browser);
    await testUndoBlock(-1);
  });

  // Teardown entire suite after test are done running
  suiteTeardown(async function () {
    await browser.deleteSession();
  });
});

async function testUndoBlock(delta) {
  // Drag out first function
  const proceduresDefReturn = await getBlockTypeFromCategory(
    browser,
    'Functions',
    'procedures_defreturn'
  );

  // undo the block drag out
  await proceduresDefReturn.dragAndDrop({x: 50 * delta, y: 20 * delta});
  await browser.keys([Key.Ctrl, 'z']);

  const blockOnWorkspace = await browser.execute(() => {
    const workspaceBlockCheck =
      Blockly.getMainWorkspace().getAllBlocks(false)[0];
    if (workspaceBlockCheck) {
      return true;
    } else {
      return false;
    }
  });

  chai.assert.isFalse(blockOnWorkspace);
}
