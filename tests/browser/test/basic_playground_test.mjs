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
  contextMenuSelect,
  dragBlockTypeFromFlyout,
  dragNthBlockFromFlyout,
  PAUSE_TIME,
  testFileLocations,
  testSetup,
} from './test_setup.mjs';

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

suite('Testing Connecting Blocks', function () {
  // Setting timeout to unlimited as the webdriver takes a longer time to run than most mocha test
  this.timeout(0);

  // Setup Selenium for all of the tests
  suiteSetup(async function () {
    this.browser = await testSetup(testFileLocations.PLAYGROUND);
  });

  test('dragging a block from the flyout results in a block on the workspace', async function () {
    await dragBlockTypeFromFlyout(this.browser, 'Logic', 'controls_if', 20, 20);
    const blockCount = await this.browser.execute(() => {
      return Blockly.getMainWorkspace().getAllBlocks(false).length;
    });

    chai.assert.equal(blockCount, 1);
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
    this.browser = await testSetup(testFileLocations.PLAYGROUND);
    this.block = await dragNthBlockFromFlyout(this.browser, 'Loops', 0, 20, 20);
  });

  test('clicking the collapse option collapses the block', async function () {
    await contextMenuSelect(this.browser, this.block, 'Collapse Block');
    chai.assert.isTrue(await getIsCollapsed(this.browser, this.block.id));
  });

  // Assumes that
  test('clicking the expand option expands the block', async function () {
    await contextMenuSelect(this.browser, this.block, 'Expand Block');
    chai.assert.isFalse(await getIsCollapsed(this.browser, this.block.id));
  });

  test('clicking the disable option disables the block', async function () {
    await contextMenuSelect(this.browser, this.block, 'Disable Block');
    chai.assert.isTrue(await getIsDisabled(this.browser, this.block.id));
  });

  test('clicking the enable option enables the block', async function () {
    await contextMenuSelect(this.browser, this.block, 'Enable Block');
    chai.assert.isFalse(await getIsDisabled(this.browser, this.block.id));
  });

  test('clicking the add comment option adds a comment to the block', async function () {
    await contextMenuSelect(this.browser, this.block, 'Add Comment');
    chai.assert.equal(await getCommentText(this.browser, this.block.id), '');
  });

  test('clicking the remove comment option removes a comment from the block', async function () {
    await contextMenuSelect(this.browser, this.block, 'Remove Comment');
    chai.assert.isNull(await getCommentText(this.browser, this.block.id));
  });
});

suite('Disabling', function () {
  // Setting timeout to unlimited as the webdriver takes a longer
  // time to run than most mocha tests.
  this.timeout(0);

  suiteSetup(async function () {
    this.browser = await testSetup(testFileLocations.PLAYGROUND);
  });

  setup(async function () {
    await this.browser.refresh();
    // Pause to allow refresh time to work.
    await this.browser.pause(PAUSE_TIME + 150);
  });

  test(
    'children connected to value inputs are disabled when the ' +
      'parent is disabled',
    async function () {
      const parent = await dragBlockTypeFromFlyout(
        this.browser,
        'Logic',
        'controls_if',
        10,
        10,
      );
      const child = await dragBlockTypeFromFlyout(
        this.browser,
        'Logic',
        'logic_boolean',
        110,
        110,
      );
      await connect(this.browser, child, 'OUTPUT', parent, 'IF0');
      await this.browser.pause(PAUSE_TIME);
      await contextMenuSelect(this.browser, parent, 'Disable Block');

      chai.assert.isTrue(await getIsDisabled(this.browser, child.id));
    },
  );

  test(
    'children connected to statement inputs are disabled when the ' +
      'parent is disabled',
    async function () {
      const parent = await dragBlockTypeFromFlyout(
        this.browser,
        'Logic',
        'controls_if',
        10,
        10,
      );
      const child = await dragBlockTypeFromFlyout(
        this.browser,
        'Logic',
        'controls_if',
        110,
        110,
      );
      await connect(this.browser, child, 'PREVIOUS', parent, 'DO0');

      await contextMenuSelect(this.browser, parent, 'Disable Block');

      chai.assert.isTrue(await getIsDisabled(this.browser, child.id));
    },
  );

  test(
    'children connected to next connections are not disabled when the ' +
      'parent is disabled',
    async function () {
      const parent = await dragBlockTypeFromFlyout(
        this.browser,
        'Logic',
        'controls_if',
        10,
        10,
      );
      const child = await dragBlockTypeFromFlyout(
        this.browser,
        'Logic',
        'controls_if',
        110,
        110,
      );
      await connect(this.browser, child, 'PREVIOUS', parent, 'NEXT');

      await contextMenuSelect(this.browser, parent, 'Disable Block');

      chai.assert.isFalse(await getIsDisabled(this.browser, child.id));
    },
  );
});
