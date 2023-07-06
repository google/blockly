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

suite('Testing Connecting Blocks', function (done) {
  // Setting timeout to unlimited as the webdriver takes a longer time to run than most mocha test
  this.timeout(0);

  // Setup Selenium for all of the tests
  suiteSetup(async function () {
    browser = await testSetup(testFileLocations.code);
  });

  test('Testing Procedure', async function () {
    // Drag out first function
    let proceduresDefReturn = await getBlockTypeFromCategory(
      browser,
      'Functions',
      'procedures_defreturn'
    );
    await proceduresDefReturn.dragAndDrop({x: 50, y: 20});
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec
    const doSomething = await getSelectedBlockElement(browser);

    // Drag out second function.
    proceduresDefReturn = await getBlockTypeFromCategory(
      browser,
      'Functions',
      'procedures_defreturn'
    );
    await proceduresDefReturn.dragAndDrop({x: 300, y: 200});
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec
    const doSomething2 = await getSelectedBlockElement(browser);

    // Drag out numeric
    const mathNumeric = await getBlockTypeFromCategory(
      browser,
      'Math',
      'math_number'
    );
    await mathNumeric.dragAndDrop({x: 50, y: 20});
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec
    const numeric = await getSelectedBlockElement(browser);

    // Connect numeric to first procedure
    await connect(browser, numeric, 'OUTPUT', doSomething, 'RETURN');

    // Drag out doSomething caller from flyout.
    const doSomethingFlyout = await getNthBlockOfCategory(
      browser,
      'Functions',
      3
    );
    await doSomethingFlyout.dragAndDrop({x: 50, y: 20});
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec
    const doSomethingCaller = await getSelectedBlockElement(browser);

    // Connect the doSomething caller to doSomething2
    await connect(browser, doSomethingCaller, 'OUTPUT', doSomething2, 'RETURN');

    // Drag out print from flyout.
    const printFlyout = await getBlockTypeFromCategory(
      browser,
      'Text',
      'text_print'
    );
    await printFlyout.dragAndDrop({x: 50, y: 0});
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec
    const print = await getSelectedBlockElement(browser);

    // Drag out doSomething2 caller from flyout.
    const doSomething2Flyout = await getNthBlockOfCategory(
      browser,
      'Functions',
      4
    );
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec
    await doSomething2Flyout.dragAndDrop({x: 130, y: 20});
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec
    const doSomething2Caller = await getSelectedBlockElement(browser);

    // Connect doSomething2 caller with print.
    await connect(browser, doSomething2Caller, 'OUTPUT', print, 'TEXT');

    // Click run button and verify the number is 123
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec
    const runButton = await browser.$('#runButton');
    runButton.click();
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec
    const alertText = await browser.getAlertText(); // get the alert text
    chai.assert.equal(alertText, '123');
  });

  // Teardown entire suite after test are done running
  suiteTeardown(async function () {
    await browser.deleteSession();
  });
});
