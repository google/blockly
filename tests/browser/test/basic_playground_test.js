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
  dragNthBlockFromFlyout,
  contextMenuSelect,
} = require('./test_setup');

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

suite('Right Clicking on Blocks', function (done) {
  // Setting timeout to unlimited as the webdriver takes a longer time to run than most mocha test
  this.timeout(0);

  // Setup Selenium for all of the tests
  suiteSetup(async function () {
    browser = await testSetup(testFileLocations.playground);
  });

  test('Collapse', async function () {
    await browser.refresh();
    const block = await dragNthBlockFromFlyout(browser, 'Loops', 0, 20, 20);

    const blockId = block.id;
    let isCollapsed = await browser.execute((blockId) => {
      return Blockly.getMainWorkspace().getBlockById(blockId).isCollapsed();
    }, blockId);
    chai.assert.isFalse(isCollapsed);

    await contextMenuSelect(browser, block, 'Collapse Block');

    isCollapsed = await browser.execute((blockId) => {
      return Blockly.getMainWorkspace().getBlockById(blockId).isCollapsed();
    }, blockId);

    chai.assert.isTrue(isCollapsed);
  });

  test('Expand', async function () {
    await browser.refresh();
    const block = await dragNthBlockFromFlyout(browser, 'Loops', 0, 20, 20);

    await contextMenuSelect(browser, block, 'Collapse Block');
    await contextMenuSelect(browser, block, 'Expand Block');

    // Verify.
    const blockId = block.id;
    const isCollapsed = await browser.execute((blockId) => {
      return Blockly.getMainWorkspace().getBlockById(blockId).isCollapsed();
    }, blockId);
    chai.assert.isFalse(isCollapsed);
  });

  test('Disable', async function () {
    await browser.refresh();
    const block = await dragNthBlockFromFlyout(browser, 'Loops', 0, 20, 20);

    const blockId = block.id;
    let isEnabled = await browser.execute((blockId) => {
      return Blockly.getMainWorkspace().getBlockById(blockId).isEnabled();
    }, blockId);
    chai.assert.isTrue(isEnabled);

    await contextMenuSelect(browser, block, 'Disable Block');

    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec

    isEnabled = await browser.execute((blockId) => {
      return Blockly.getMainWorkspace().getBlockById(blockId).isEnabled();
    }, blockId);
    chai.assert.isFalse(isEnabled);
  });

  test('Enable', async function () {
    await browser.refresh();
    const block = await dragNthBlockFromFlyout(browser, 'Loops', 0, 20, 20);

    const blockId = block.id;
    await contextMenuSelect(browser, block, 'Disable Block');
    await contextMenuSelect(browser, block, 'Enable Block');

    const isEnabled = await browser.execute((blockId) => {
      return Blockly.getMainWorkspace().getBlockById(blockId).isEnabled();
    }, blockId);

    chai.assert.isTrue(isEnabled);
  });

  // Teardown entire suite after test are done running
  suiteTeardown(async function () {
    await browser.deleteSession();
  });
});
