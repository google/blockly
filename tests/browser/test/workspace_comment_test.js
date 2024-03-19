/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const chai = require('chai');
const sinon = require('sinon');
const {
  testSetup,
  testFileLocations,
  getAllBlocks,
  dragNthBlockFromFlyout,
} = require('./test_setup');

suite('Workspace comments', function () {
  // Setting timeout to unlimited as the webdriver takes a longer time
  // to run than most mocha test
  this.timeout(0);

  // Setup Selenium for all of the tests
  suiteSetup(async function () {
    this.browser = await testSetup(
      testFileLocations.PLAYGROUND + '?toolbox=test-blocks',
    );
  });

  teardown(async function () {
    sinon.restore();

    await this.browser.execute(() => {
      Blockly.getMainWorkspace().clear();
    });
  });

  async function createComment(browser) {
    return await browser.execute(() => {
      const comment = new Blockly.comments.RenderedWorkspaceComment(
        Blockly.getMainWorkspace(),
      );
      return comment.id;
    });
  }

  async function hasClass(elem, className) {
    return (await elem.getAttribute('class')).split(' ').includes(className);
  }

  suite('Collapsing and uncollapsing', function () {
    async function isCommentCollapsed(browser, id) {
      return await browser.execute(
        (id) => Blockly.getMainWorkspace().getCommentById(id).isCollapsed(),
        id,
      );
    }

    suite('Collapsing', function () {
      test('collapsing updates the collapse value', async function () {
        const commentId = await createComment(this.browser);

        const foldout = await this.browser.$(
          '.blocklyComment .blocklyFoldoutIcon',
        );
        await foldout.click();

        chai.assert.isTrue(await isCommentCollapsed(this.browser, commentId));
      });

      test('collapsing adds the css class', async function () {
        await createComment(this.browser);

        const foldout = await this.browser.$(
          '.blocklyComment .blocklyFoldoutIcon',
        );
        await foldout.click();

        const comment = await this.browser.$('.blocklyComment');
        chai.assert.isTrue(await hasClass(comment, 'blocklyCollapsed'));
      });
    });

    suite('Uncollapsing', function () {
      async function collapseComment(browser, id) {
        await browser.execute((id) => {
          Blockly.getMainWorkspace().getCommentById(id).setCollapsed(true);
        }, id);
      }

      test('collapsing updates the collapse value', async function () {
        const commentId = await createComment(this.browser);
        await collapseComment(this.browser, commentId);

        const foldout = await this.browser.$(
          '.blocklyComment .blocklyFoldoutIcon',
        );
        await foldout.click();

        chai.assert.isFalse(await isCommentCollapsed(this.browser, commentId));
      });

      test('collapsing adds the css class', async function () {
        const commentId = await createComment(this.browser);
        await collapseComment(this.browser, commentId);

        const foldout = await this.browser.$(
          '.blocklyComment .blocklyFoldoutIcon',
        );
        await foldout.click();

        const comment = await this.browser.$('.blocklyComment');
        chai.assert.isFalse(await hasClass(comment, 'blocklyCollapsed'));
      });
    });
  });
});
