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
  getNthBlockOfCategory,
  getBlockTypeFromCategory,
  connect,
} = require('./test_setup');

let browser;
suite('Testing Field Edits', function (done) {
  // Setting timeout to unlimited as the webdriver takes a longer time to run than most mocha test
  this.timeout(0);

  // Setup Selenium for all of the tests
  suiteSetup(async function () {
    browser = await testSetup(testFileLocations.playground);
    // Drag out first function
  });

  test('Testing Field Edits', async function () {
    let mathNumber = await getBlockTypeFromCategory(
      browser,
      'Math',
      'math_number'
    );
    await mathNumber.dragAndDrop({x: 50, y: 20});
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec

    //Click on the field to change the value
    const numeric = await getSelectedBlockElement(browser);
    await numeric.click();
    await numeric.click();
    await browser.keys(['2']);

    //Cick on the workspace
    const workspace = await browser.$('#blocklyDiv > div > svg.blocklySvg > g');
    await workspace.click();
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec
    //Get value of the
    const numericText = await browser
      .$(
        '#blocklyDiv > div > svg.blocklySvg > g > g.blocklyBlockCanvas > g.blocklyDraggable > g > text'
      )
      .getHTML();

    console.log(numericText);

    chai.assert.isTrue(numericText.includes('1223'));
  });

  // Teardown entire suite after test are done running
  suiteTeardown(async function () {
    await browser.deleteSession();
  });
});
