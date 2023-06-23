/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Node.js script to run Automated tests in Chrome, via webdriver.
 */

const chai = require('chai');
const {testSetup, testFileLocations} = require('./test_setup');

let browser;
suite('Testing Connecting Blocks', function (done) {
  // Setting timeout to unlimited as the webdriver takes a longer time to run than most mocha test
  this.timeout(0);

  // Setup Selenium for all of the tests
  suiteSetup(async function () {
    browser = await testSetup(testFileLocations.playground);
  });

  test('Testing Block Flyout', async function () {
    const logicButton = await browser.$('#blockly-0');
    logicButton.click();
    const ifDoBlock = await browser.$(
      '#blocklyDiv > div > svg:nth-child(7) > g > g.blocklyBlockCanvas > g:nth-child(3)'
    );
    await ifDoBlock.dragAndDrop({x: 20, y: 20});
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec
    const blockOnWorkspace = await browser.execute(() => {
      const newBlock = Blockly.getMainWorkspace().getAllBlocks(false)[0];
      if (newBlock.id) {
        return true;
      } else {
        return false;
      }
    });

    chai.assert.isTrue(blockOnWorkspace);
  });

  // Teardown entire suite after test are done running
  suiteTeardown(async function () {
    await browser.deleteSession();
  });
});
