/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Node.js script to run Automated tests in Chrome, via webdriver.
 */

const chai = require('chai');
const {
  testSetup,
  testFileLocations,
  getSelectedBlockElement,
  switchRTL,
  dragBlockTypeFromFlyout,
  screenDirection,
} = require('./test_setup');
const {Key} = require('webdriverio');

suite('Testing Field Edits', function (done) {
  // Setting timeout to unlimited as the webdriver takes a longer time to run than most mocha test
  this.timeout(0);

  // Setup Selenium for all of the tests
  suiteSetup(async function () {
    this.browser = await testSetup(testFileLocations.PLAYGROUND);
  });

  test('Testing Field Edits LTR', async function () {
    await testFieldEdits(this.browser, screenDirection.LTR);
  });

  test('Testing Field Edits RTL', async function () {
    await switchRTL(this.browser);
    await testFieldEdits(this.browser, screenDirection.RTL);
  });
});

async function testFieldEdits(browser, delta) {
  const mathNumber = await dragBlockTypeFromFlyout(
    browser,
    'Math',
    'math_number',
    50 * delta,
    20,
  );
  await browser.pause(200);

  // Click on the field to change the value
  const numeric = await getSelectedBlockElement(browser);
  await numeric.doubleClick();
  await browser.keys([Key.Delete]);
  await numeric.doubleClick();
  await browser.keys(['1093']);
  // Click on the workspace
  const workspace = await browser.$('#blocklyDiv > div > svg.blocklySvg > g');
  await workspace.click();
  await browser.pause(200);
  // Get value of the number
  const numericText = await browser
    .$(
      '#blocklyDiv > div > svg.blocklySvg > g > g.blocklyBlockCanvas > g.blocklyDraggable > g > text',
    )
    .getHTML();

  chai.assert.isTrue(numericText.includes('1093'));
}
