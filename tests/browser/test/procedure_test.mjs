/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Node.js script to run Automated tests in Chrome, via webdriver.
 */

import * as chai from 'chai';
import {
  connect,
  getBlockTypeFromCategory,
  getNthBlockOfCategory,
  getSelectedBlockElement,
  PAUSE_TIME,
  testFileLocations,
  testSetup,
} from './test_setup.mjs';

suite('Testing Connecting Blocks', function (done) {
  // Setting timeout to unlimited as the webdriver takes a longer time to run than most mocha test
  this.timeout(0);

  // Setup Selenium for all of the tests
  suiteSetup(async function () {
    this.browser = await testSetup(testFileLocations.CODE_DEMO);
    // Prevent WebDriver from suppressing alerts
    // https://github.com/webdriverio/webdriverio/issues/13610#issuecomment-2357768103
    this.browser.on('dialog', (dialog) => {});
  });

  test('Testing Procedure', async function () {
    // Drag out first function
    let proceduresDefReturn = await getBlockTypeFromCategory(
      this.browser,
      'Functions',
      'procedures_defreturn',
    );
    await proceduresDefReturn.dragAndDrop({x: 50, y: 20});
    const doSomething = await getSelectedBlockElement(this.browser);

    // Drag out second function.
    proceduresDefReturn = await getBlockTypeFromCategory(
      this.browser,
      'Functions',
      'procedures_defreturn',
    );
    await proceduresDefReturn.dragAndDrop({x: 300, y: 200});
    const doSomething2 = await getSelectedBlockElement(this.browser);

    // Drag out numeric
    const mathNumeric = await getBlockTypeFromCategory(
      this.browser,
      'Math',
      'math_number',
    );
    await mathNumeric.dragAndDrop({x: 50, y: 20});
    const numeric = await getSelectedBlockElement(this.browser);

    // Connect numeric to first procedure
    await connect(this.browser, numeric, 'OUTPUT', doSomething, 'RETURN');

    // Drag out doSomething caller from flyout.
    const doSomethingFlyout = await getNthBlockOfCategory(
      this.browser,
      'Functions',
      3,
    );
    await doSomethingFlyout.dragAndDrop({x: 50, y: 20});
    const doSomethingCaller = await getSelectedBlockElement(this.browser);

    // Connect the doSomething caller to doSomething2
    await connect(
      this.browser,
      doSomethingCaller,
      'OUTPUT',
      doSomething2,
      'RETURN',
    );

    // Drag out print from flyout.
    const printFlyout = await getBlockTypeFromCategory(
      this.browser,
      'Text',
      'text_print',
    );
    await printFlyout.dragAndDrop({x: 50, y: 20});
    const print = await getSelectedBlockElement(this.browser);

    // Drag out doSomething2 caller from flyout.
    const doSomething2Flyout = await getNthBlockOfCategory(
      this.browser,
      'Functions',
      4,
    );
    await doSomething2Flyout.dragAndDrop({x: 130, y: 20});
    const doSomething2Caller = await getSelectedBlockElement(this.browser);

    // Connect doSomething2 caller with print.
    await connect(this.browser, doSomething2Caller, 'OUTPUT', print, 'TEXT');

    // Click run button and verify the number is 123
    const runButton = await this.browser.$('#runButton');
    runButton.click();
    await this.browser.pause(PAUSE_TIME);
    const alertText = await this.browser.getAlertText(); // get the alert text
    chai.assert.equal(alertText, '123');
    await this.browser.acceptAlert();
  });
});
