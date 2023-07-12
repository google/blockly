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

  teardown(async function () {
    await browser.execute(() => {
      Blockly.getMainWorkspace().clear();
    });
  });

  test('Collapse', async function () {
    const block = await dragNthBlockFromFlyout(browser, 'Loops', 0, 20, 20);

    const blockId = block.id;
    let isCollapsed = await getIsCollapsed(browser, blockId);
    chai.assert.isFalse(isCollapsed);

    await contextMenuSelect(browser, block, 'Collapse Block');

    isCollapsed = await getIsCollapsed(browser, blockId);

    chai.assert.isTrue(isCollapsed);
  });

  test('Expand', async function () {
    const block = await dragNthBlockFromFlyout(browser, 'Loops', 0, 20, 20);

    await contextMenuSelect(browser, block, 'Collapse Block');
    await contextMenuSelect(browser, block, 'Expand Block');

    const blockId = block.id;
    const isCollapsed = await getIsCollapsed(browser, blockId);
    chai.assert.isFalse(isCollapsed);
  });

  test('Disable', async function () {
    const block = await dragNthBlockFromFlyout(browser, 'Loops', 0, 20, 20);

    const blockId = block.id;
    let isEnabled = await getIsEnabled(browser, blockId);
    chai.assert.isTrue(isEnabled);

    await contextMenuSelect(browser, block, 'Disable Block');

    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec

    isEnabled = await getIsEnabled(browser, blockId);
    chai.assert.isFalse(isEnabled);
  });

  test('Enable', async function () {
    const block = await dragNthBlockFromFlyout(browser, 'Loops', 0, 20, 20);

    const blockId = block.id;
    await contextMenuSelect(browser, block, 'Disable Block');
    await contextMenuSelect(browser, block, 'Enable Block');

    const isEnabled = await getIsEnabled(browser, blockId);
    chai.assert.isTrue(isEnabled);
  });

  test('Add Comment', async function () {
    const block = await dragNthBlockFromFlyout(browser, 'Loops', 0, 20, 20);

    const blockId = block.id;
    await contextMenuSelect(browser, block, 'Add Comment');

    const commentText = await getCommentText(browser, blockId);
    chai.assert.equal(commentText, '');
  });

  test('Remove Comment', async function () {
    const block = await dragNthBlockFromFlyout(browser, 'Loops', 0, 20, 20);

    const blockId = block.id;
    await contextMenuSelect(browser, block, 'Add Comment');
    await contextMenuSelect(browser, block, 'Remove Comment');

    const commentText = await getCommentText(browser, blockId);
    chai.assert.isNull(commentText);
  });

  // Teardown entire suite after test are done running
  suiteTeardown(async function () {
    await browser.deleteSession();
  });
});
