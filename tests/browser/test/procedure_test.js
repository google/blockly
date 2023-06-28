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
    browser = await testSetup(testFileLocations.code);
  });

  test('Testing Procedure', async function () {
    // Drag out first function
    const functionCategory = await browser.$('#blockly-8');
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec
    functionCategory.click();
    let proceduresDefReturn = await browser.$(
      '#content_blocks > div > svg:nth-child(7) > g > g.blocklyBlockCanvas > g:nth-child(5)'
    );
    await proceduresDefReturn.dragAndDrop({x: 50, y: 20});

    // Drag out second function
    functionCategory.click();
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec
    proceduresDefReturn = await browser.$(
      '#content_blocks > div > svg:nth-child(7) > g > g.blocklyBlockCanvas > g:nth-child(5)'
    );
    await proceduresDefReturn.dragAndDrop({x: 300, y: 200});

    // Drag out numeric
    const mathCategory = await browser.$('#blockly-2');
    mathCategory.click();
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec
    const mathNumeric = await browser.$(
      '#content_blocks > div > svg:nth-child(7) > g > g.blocklyBlockCanvas > g:nth-child(3)'
    );
    await mathNumeric.dragAndDrop({x: 50, y: 20});
    // Connect numeric to first procedure
    const numericWorkspace = await browser.$(
      '#content_blocks > div > svg.blocklySvg > g > g.blocklyBlockCanvas > g.blocklyDraggable.blocklySelected'
    );
    const doSomething = await browser.$(
      '#content_blocks > div > svg.blocklySvg > g > g.blocklyBlockCanvas > g:nth-child(2)'
    );
    await numericWorkspace.dragAndDrop(doSomething);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec
    await numericWorkspace.dragAndDrop({x: 100, y: 25});
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec

    // Drag out doSomething from flyout and connect it to doSomething2
    const doSomething2 = await browser.$(
      '#content_blocks > div > svg.blocklySvg > g > g.blocklyBlockCanvas > g:nth-child(2)'
    );
    functionCategory.click();
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec
    const doSomethingFlyout = await browser.$(
      '#content_blocks > div > svg:nth-child(7) > g > g.blocklyBlockCanvas > g:nth-child(9)'
    );
    await doSomethingFlyout.dragAndDrop(doSomething2);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec
    const doSomethingFlyoutWorkspace = await browser.$(
      '#content_blocks > div > svg.blocklySvg > g > g.blocklyBlockCanvas > g.blocklyDraggable.blocklySelected'
    );
    await doSomethingFlyoutWorkspace.dragAndDrop({x: 130, y: 20});

    // Drag out print from flyout and connect it with doSomething 2
    const textButton = await browser.$('#blockly-3');
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec
    textButton.click();
    const printFlyout = await browser.$(
      '#content_blocks > div > svg:nth-child(7) > g > g.blocklyBlockCanvas > g:nth-child(23)'
    );
    await printFlyout.dragAndDrop({x: 50, y: 20});
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec
    functionCategory.click();
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec
    const doSomething2Flyout = await browser.$(
      '#content_blocks > div > svg:nth-child(7) > g > g.blocklyBlockCanvas > g:nth-child(11)'
    );
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec
    await doSomething2Flyout.dragAndDrop({x: 130, y: 20});
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec
    const doSomething2FlyoutWorkspace = await browser.$(
      '#content_blocks > div > svg.blocklySvg > g > g.blocklyBlockCanvas > g.blocklyDraggable.blocklySelected'
    );
    const printWorkSpace = await browser.$(
      '#content_blocks > div > svg.blocklySvg > g > g.blocklyBlockCanvas > g:nth-child(4)'
    );
    await doSomething2FlyoutWorkspace.dragAndDrop(printWorkSpace);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec
    await doSomething2FlyoutWorkspace.dragAndDrop({x: 65, y: 0});

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
