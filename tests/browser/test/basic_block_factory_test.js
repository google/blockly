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
    browser = await testSetup(testFileLocations.BLOCK_FACTORY);
  });

  test('Testing Block Drag', async function () {
    const startingBlock = await browser.$(
      '#blockly > div > svg.blocklySvg > g > g.blocklyBlockCanvas > g:nth-child(2)',
    );
    const blocklyCanvas = await browser.$(
      '#blockly > div > svg.blocklySvg > g > g.blocklyBlockCanvas',
    );
    const firstPostion = await blocklyCanvas.getAttribute('transform');
    await startingBlock.dragAndDrop({x: 20, y: 20});
    const secondPosition = await blocklyCanvas.getAttribute('transform');
    chai.assert.notEqual(firstPostion, secondPosition);
  });

  // Teardown entire suite after test are done running
  suiteTeardown(async function () {
    await browser.deleteSession();
  });
});
