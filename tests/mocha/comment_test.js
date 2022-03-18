/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.module('Blockly.test.comments');

const {assertEventFired} = goog.require('Blockly.test.helpers.events');
const eventUtils = goog.require('Blockly.Events.utils');
const {sharedTestSetup, sharedTestTeardown} = goog.require('Blockly.test.helpers.setupTeardown');
const {simulateClick} = goog.require('Blockly.test.helpers.userInput');


suite('Comments', function() {
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
    this.block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
        '<block type="empty_block"/>'
    ), this.workspace);
    this.comment = new Blockly.Comment(this.block);
    this.comment.computeIconLocation();
  });
  teardown(function() {
    sharedTestTeardown.call(this);
  });
  suite('Visibility and Editability', function() {
    setup(function() {
      this.block.setCommentText('test text');
    });

    function assertEditable(comment) {
      chai.assert.isNotOk(comment.paragraphElement_);
      chai.assert.isOk(comment.textarea_);
      chai.assert.equal(comment.textarea_.value, 'test text');
    }
    function assertNotEditable(comment) {
      chai.assert.isNotOk(comment.textarea_);
      chai.assert.isOk(comment.paragraphElement_);
      chai.assert.equal(comment.paragraphElement_.firstChild.textContent,
          'test text');
    }
    test('Editable', function() {
      this.comment.setVisible(true);
      chai.assert.isTrue(this.comment.isVisible());
      assertEditable(this.comment);
      assertEventFired(
          this.eventsFireStub, Blockly.Events.BubbleOpen,
          {bubbleType: 'comment', isOpen: true, type: eventUtils.BUBBLE_OPEN}, this.workspace.id,
          this.block.id);
    });
    test('Not Editable', function() {
      sinon.stub(this.block, 'isEditable').returns(false);

      this.comment.setVisible(true);

      chai.assert.isTrue(this.comment.isVisible());
      assertNotEditable(this.comment);
      assertEventFired(
          this.eventsFireStub, Blockly.Events.BubbleOpen,
          {bubbleType: 'comment', isOpen: true, type: eventUtils.BUBBLE_OPEN},
          this.workspace.id, this.block.id);
    });
    test('Editable -> Not Editable', function() {
      this.comment.setVisible(true);
      sinon.stub(this.block, 'isEditable').returns(false);

      this.comment.updateEditable();

      chai.assert.isTrue(this.comment.isVisible());
      assertNotEditable(this.comment);
      assertEventFired(
          this.eventsFireStub, Blockly.Events.BubbleOpen,
          {bubbleType: 'comment', isOpen: true, type: eventUtils.BUBBLE_OPEN},
          this.workspace.id, this.block.id);
    });
    test('Not Editable -> Editable', function() {
      const editableStub = sinon.stub(this.block, 'isEditable').returns(false);

      this.comment.setVisible(true);

      editableStub.returns(true);

      this.comment.updateEditable();
      chai.assert.isTrue(this.comment.isVisible());
      assertEditable(this.comment);
      assertEventFired(
          this.eventsFireStub, Blockly.Events.BubbleOpen,
          {bubbleType: 'comment', isOpen: true, type: eventUtils.BUBBLE_OPEN},
          this.workspace.id, this.block.id);
    });
  });
  suite('Set/Get Bubble Size', function() {
    teardown(function() {
      sinon.restore();
    });
    function assertBubbleSize(comment, height, width) {
      const size = comment.getBubbleSize();
      chai.assert.equal(size.height, height);
      chai.assert.equal(size.width, width);
    }
    function assertBubbleSizeDefault(comment) {
      assertBubbleSize(comment, 80, 160);
    }
    test('Set Size While Visible', function() {
      this.comment.setVisible(true);
      const bubbleSizeSpy = sinon.spy(this.comment.bubble_, 'setBubbleSize');

      assertBubbleSizeDefault(this.comment);
      this.comment.setBubbleSize(100, 100);
      assertBubbleSize(this.comment, 100, 100);
      sinon.assert.calledOnce(bubbleSizeSpy);

      this.comment.setVisible(false);
      assertBubbleSize(this.comment, 100, 100);
    });
    test('Set Size While Invisible', function() {
      assertBubbleSizeDefault(this.comment);
      this.comment.setBubbleSize(100, 100);
      assertBubbleSize(this.comment, 100, 100);

      this.comment.setVisible(true);
      assertBubbleSize(this.comment, 100, 100);
    });
  });
  suite('Restore Comment', function() {
    setup(function() {
      this.blockCount = this.workspace.getAllBlocks().length;
      this.tempBlock = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
        '<block type="empty_block"/>'
      ), this.workspace);
      this.tempBlock.setCommentText('test temp text');
    });
    function assertComment(workspace, text) {
      const count = workspace.getAllBlocks().length;
      // Show comment.
      const tempBlock = workspace.getAllBlocks()[count - 1];
      tempBlock.comment.setVisible(true);
      // Check comment bubble size.
      const comment = tempBlock.getCommentIcon();
      const bubbleSize = comment.getBubbleSize();
      chai.assert.isNotNaN(bubbleSize.width);
      chai.assert.isNotNaN(bubbleSize.height);
      chai.assert.equal(comment.textarea_.value, text);
    }
    test('Trashcan', function() {
      // Delete block.
      this.tempBlock.checkAndDelete();
      chai.assert.equal(this.workspace.getAllBlocks().length, this.blockCount);
      // Open trashcan.
      simulateClick(this.workspace.trashcan.svgGroup_);
      // Place from trashcan.
      simulateClick(this.workspace.trashcan.flyout.svgGroup_.querySelector('.blocklyDraggable'));
      chai.assert.equal(this.workspace.getAllBlocks().length, this.blockCount + 1);
      // Check comment.
      assertComment(this.workspace, 'test temp text');
    });
    test('Undo', function() {
      // Delete block.
      this.tempBlock.checkAndDelete();
      chai.assert.equal(this.workspace.getAllBlocks().length, this.blockCount);
      // Undo.
      this.workspace.undo(false);
      chai.assert.equal(this.workspace.getAllBlocks().length, this.blockCount + 1);
      // Check comment.
      assertComment(this.workspace, 'test temp text');
    });
    test('Redo', function() {
      // Undo & undo.
      this.workspace.undo(false);
      this.workspace.undo(false);
      chai.assert.equal(this.workspace.getAllBlocks().length, this.blockCount);
      // Redo & redo.
      this.workspace.undo(true);
      this.workspace.undo(true);
      chai.assert.equal(this.workspace.getAllBlocks().length, this.blockCount + 1);
      // Check comment.
      assertComment(this.workspace, 'test temp text');
    });
    test('Toolbox', function() {
      // Delete temp block.
      this.tempBlock.checkAndDelete();
      chai.assert.equal(this.workspace.getAllBlocks().length, this.blockCount);
      // Place from toolbox.
      const toolbox = this.workspace.getToolbox();
      simulateClick(toolbox.HtmlDiv.querySelector('.blocklyTreeRow'));
      simulateClick(toolbox.getFlyout().svgGroup_.querySelector('.blocklyDraggable'));
      chai.assert.equal(this.workspace.getAllBlocks().length, this.blockCount + 1);
      // Check comment.
      assertComment(this.workspace, 'test toolbox text');
    });
  });
});
