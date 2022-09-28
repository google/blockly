/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.module('Blockly.test.commentDeserialization');

const {sharedTestSetup, sharedTestTeardown} = goog.require('Blockly.test.helpers.setupTeardown');
const {simulateClick} = goog.require('Blockly.test.helpers.userInput');


suite('Comment Deserialization', function() {
  setup(function() {
    sharedTestSetup.call(this);
    Blockly.defineBlocksWithJsonArray([
      {
        "type": "empty_block",
        "message0": "",
        "args0": [],
      },
    ]);
    const toolboxXml = `
    <xml>
      <category name="test">
        <block type="empty_block">
          <comment pinned="true" h="80" w="160">test toolbox text</comment>
        </block>
      </category>
    </xml>
    `;
    this.workspace = Blockly.inject('blocklyDiv', {
      comments: true,
      scrollbars: true,
      trashcan: true,
      maxTrashcanContents: Infinity,
      toolbox: Blockly.Xml.textToDom(toolboxXml),
    });
  });
  teardown(function() {
    sharedTestTeardown.call(this);
  });
  suite('Pattern', function() {
    teardown(function() {
      // Delete all blocks.
      this.workspace.clear();
    });
    function createBlock(workspace) {
      const block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
        '<block type="empty_block"/>'
      ), workspace);
      block.setCommentText('test text');
      return block;
    }
    function assertComment(workspace, text) {
      // Show comment.
      const block = workspace.getAllBlocks()[0];
      block.comment.setVisible(true);
      // Check comment bubble size.
      const comment = block.getCommentIcon();
      const bubbleSize = comment.getBubbleSize();
      chai.assert.isNotNaN(bubbleSize.width);
      chai.assert.isNotNaN(bubbleSize.height);
      // Check comment text.
      chai.assert.equal(comment.textarea_.value, text);
    }
    test('Trashcan', function() {
      // Create block.
      this.block = createBlock(this.workspace);
      // Delete block.
      this.block.checkAndDelete();
      chai.assert.equal(this.workspace.getAllBlocks().length, 0);
      // Open trashcan.
      simulateClick(this.workspace.trashcan.svgGroup_);
      // Place from trashcan.
      simulateClick(this.workspace.trashcan.flyout.svgGroup_.querySelector('.blocklyDraggable'));
      chai.assert.equal(this.workspace.getAllBlocks().length, 1);
      // Check comment.
      assertComment(this.workspace, 'test text');
    });
    test('Undo', function() {
      // Create block.
      this.block = createBlock(this.workspace);
      // Delete block.
      this.block.checkAndDelete();
      chai.assert.equal(this.workspace.getAllBlocks().length, 0);
      // Undo.
      this.workspace.undo(false);
      chai.assert.equal(this.workspace.getAllBlocks().length, 1);
      // Check comment.
      assertComment(this.workspace, 'test text');
    });
    test('Redo', function() {
      // Create block.
      this.block = createBlock(this.workspace);
      // Undo & undo.
      this.workspace.undo(false);
      this.workspace.undo(false);
      chai.assert.equal(this.workspace.getAllBlocks().length, 0);
      // Redo & redo.
      this.workspace.undo(true);
      this.workspace.undo(true);
      chai.assert.equal(this.workspace.getAllBlocks().length, 1);
      // Check comment.
      assertComment(this.workspace, 'test text');
    });
    test('Toolbox', function() {
      // Place from toolbox.
      const toolbox = this.workspace.getToolbox();
      simulateClick(toolbox.HtmlDiv.querySelector('.blocklyTreeRow'));
      simulateClick(toolbox.getFlyout().svgGroup_.querySelector('.blocklyDraggable'));
      chai.assert.equal(this.workspace.getAllBlocks().length, 1);
      // Check comment.
      assertComment(this.workspace, 'test toolbox text');
    });
  });
});
