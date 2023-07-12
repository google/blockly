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

async function getIsCollapsed(browser, blockId) {
  return await browser.execute((blockId) => {
    return Blockly.getMainWorkspace().getBlockById(blockId).isCollapsed();
  }, blockId);
}

async function getIsEnabled(browser, blockId) {
  return await browser.execute((blockId) => {
    return Blockly.getMainWorkspace().getBlockById(blockId).isEnabled();
  }, blockId);
}

async function getCommentText(browser, blockId) {
  return await browser.execute((blockId) => {
    return Blockly.getMainWorkspace().getBlockById(blockId).getCommentText();
  }, blockId);
}

let browser;
suite('Testing Connecting Blocks', function (done) {
  // Setting timeout to unlimited as the webdriver takes a longer time to run than most mocha test
  this.timeout(0);

  // Setup Selenium for all of the tests
  suiteSetup(async function () {
    browser = await testSetup(testFileLocations.PLAYGROUND);
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

/**
 * These tests have to run together. Each test acts on the state left by the
 * previous test, and each test has a single assertion.
 */
suite('Right Clicking on Blocks', function (done) {
  // Setting timeout to unlimited as the webdriver takes a longer time to run than most mocha test
  this.timeout(0);

  // Setup Selenium for all of the tests
  suiteSetup(async function () {
    browser = await testSetup(testFileLocations.PLAYGROUND);
    this.block = await dragNthBlockFromFlyout(browser, 'Loops', 0, 20, 20);
    this.blockId = this.block.id;
  });

  test('clicking the collapse option collapses the block', async function () {
    await contextMenuSelect(browser, this.block, 'Collapse Block');
    const isCollapsed = await getIsCollapsed(browser, this.blockId);
    chai.assert.isTrue(isCollapsed);
  });

  // Assumes that
  test('clicking the expand option expands the block', async function () {
    await contextMenuSelect(browser, this.block, 'Expand Block');
    const isCollapsed = await getIsCollapsed(browser, this.blockId);
    chai.assert.isFalse(isCollapsed);
  });

  test('clicking the disable option disables the block', async function () {
    await contextMenuSelect(browser, this.block, 'Disable Block');
    const isEnabled = await getIsEnabled(browser, this.blockId);
    chai.assert.isFalse(isEnabled);
  });

  test('clicking the enable option enables the block', async function () {
    await contextMenuSelect(browser, this.block, 'Enable Block');
    const isEnabled = await getIsEnabled(browser, this.block.id);
    chai.assert.isTrue(isEnabled);
  });

  test('clicking the add comment option adds a comment to the block', async function () {
    await contextMenuSelect(browser, this.block, 'Add Comment');
    const commentText = await getCommentText(browser, this.block.id);
    chai.assert.equal(commentText, '');
  });

  test('clicking the remove comment option removes a comment from the block', async function () {
    await contextMenuSelect(browser, this.block, 'Remove Comment');
    const commentText = await getCommentText(browser, this.block.id);
    chai.assert.isNull(commentText);
  });

  // Teardown entire suite after test are done running
  suiteTeardown(async function () {
    await browser.deleteSession();
  });
});
