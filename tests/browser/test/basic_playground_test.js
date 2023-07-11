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
  dragBlockTypeFromFlyout,
  connect,
  contextMenuSelect,
} = require('./test_setup');

async function getIsCollapsed(browser, blockId) {
  return await browser.execute((blockId) => {
    return Blockly.getMainWorkspace().getBlockById(blockId).isCollapsed();
  }, blockId);
}

async function getIsDisabled(browser, blockId) {
  return await browser.execute((blockId) => {
    const block = Blockly.getMainWorkspace().getBlockById(blockId);
    return !block.isEnabled() || block.getInheritedDisabled();
  }, blockId);
}

async function getCommentText(browser, blockId) {
  return await browser.execute((blockId) => {
    return Blockly.getMainWorkspace().getBlockById(blockId).getCommentText();
  }, blockId);
}

let browser;
suite('Testing Connecting Blocks', function () {
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
suite('Right Clicking on Blocks', function () {
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
    const isDisabled = await getIsDisabled(browser, this.blockId);
    chai.assert.isTrue(isDisabled);
  });

  test('clicking the enable option enables the block', async function () {
    await contextMenuSelect(browser, this.block, 'Enable Block');
    const isDisabled = await getIsDisabled(browser, this.block.id);
    chai.assert.isFalse(isDisabled);
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

suite('Disabling', function () {
  // Setting timeout to unlimited as the webdriver takes a longer
  // time to run than most mocha tests.
  this.timeout(0);

  suiteSetup(async function () {
    browser = await testSetup(testFileLocations.playground);
  });

  setup(async function () {
    await browser.refresh();
  });

  test(
    'children connected to value inputs are disabled when the ' +
      'parent is diabled',
    async function () {
      const parent = await dragBlockTypeFromFlyout(
        browser,
        'Logic',
        'controls_if',
        10,
        10
      );
      const child = await dragBlockTypeFromFlyout(
        browser,
        'Logic',
        'logic_boolean',
        110,
        110
      );
      await connect(browser, child, 'OUTPUT', parent, 'IF0');

      await contextMenuSelect(browser, parent, 'Disable Block');

      chai.assert.isTrue(await getIsDisabled(browser, child.id));
    }
  );

  test(
    'children connected to statement inputs are disabled when the ' +
      'parent is disabled',
    async function () {
      const parent = await dragBlockTypeFromFlyout(
        browser,
        'Logic',
        'controls_if',
        10,
        10
      );
      const child = await dragBlockTypeFromFlyout(
        browser,
        'Logic',
        'controls_if',
        110,
        110
      );
      await connect(browser, child, 'PREVIOUS', parent, 'IF0');

      await contextMenuSelect(browser, parent, 'Disable Block');

      chai.assert.isTrue(await getIsDisabled(browser, child.id));
    }
  );

  test(
    'children connected to next connections are not disabled when the ' +
      'parent is disabled',
    async function () {
      const parent = await dragBlockTypeFromFlyout(
        browser,
        'Logic',
        'controls_if',
        10,
        10
      );
      const child = await dragBlockTypeFromFlyout(
        browser,
        'Logic',
        'controls_if',
        110,
        110
      );
      await connect(browser, child, 'PREVIOUS', parent, 'NEXT');

      await contextMenuSelect(browser, parent, 'Disable Block');

      chai.assert.isFalse(await getIsDisabled(browser, child.id));
    }
  );

  suiteTeardown(async function () {
    await browser.deleteSession();
  });
});
