/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {assertEventFired} from './test_helpers/events.js';
import * as eventUtils from '../../build/src/core/events/utils.js';
import {
  sharedTestSetup,
  sharedTestTeardown,
} from './test_helpers/setup_teardown.js';

suite('Comments', function () {
  setup(function () {
    sharedTestSetup.call(this);
    Blockly.defineBlocksWithJsonArray([
      {
        'type': 'empty_block',
        'message0': '',
        'args0': [],
      },
    ]);
    this.workspace = Blockly.inject('blocklyDiv', {
      comments: true,
      scrollbars: true,
    });
    this.block = Blockly.Xml.domToBlock(
      Blockly.utils.xml.textToDom('<block type="empty_block"/>'),
      this.workspace,
    );
    this.comment = new Blockly.icons.CommentIcon(this.block);
  });
  teardown(function () {
    sharedTestTeardown.call(this);
  });
  suite('Visibility and Editability', function () {
    setup(function () {
      this.block.setCommentText('test text');
    });

    function assertEditable(comment) {
      chai.assert.isNotOk(comment.textBubble);
      chai.assert.isOk(comment.textInputBubble);
    }
    function assertNotEditable(comment) {
      chai.assert.isNotOk(comment.textInputBubble);
      chai.assert.isOk(comment.textBubble);
    }
    test('Editable', async function () {
      await this.comment.setBubbleVisible(true);
      chai.assert.isTrue(this.comment.bubbleIsVisible());
      assertEditable(this.comment);
      assertEventFired(
        this.eventsFireStub,
        Blockly.Events.BubbleOpen,
        {bubbleType: 'comment', isOpen: true, type: eventUtils.BUBBLE_OPEN},
        this.workspace.id,
        this.block.id,
      );
    });
    test('Not Editable', async function () {
      sinon.stub(this.block, 'isEditable').returns(false);

      await this.comment.setBubbleVisible(true);

      chai.assert.isTrue(this.comment.bubbleIsVisible());
      assertNotEditable(this.comment);
      assertEventFired(
        this.eventsFireStub,
        Blockly.Events.BubbleOpen,
        {bubbleType: 'comment', isOpen: true, type: eventUtils.BUBBLE_OPEN},
        this.workspace.id,
        this.block.id,
      );
    });
    test('Editable -> Not Editable', async function () {
      await this.comment.setBubbleVisible(true);
      sinon.stub(this.block, 'isEditable').returns(false);

      await this.comment.updateEditable();

      chai.assert.isTrue(this.comment.bubbleIsVisible());
      assertNotEditable(this.comment);
      assertEventFired(
        this.eventsFireStub,
        Blockly.Events.BubbleOpen,
        {bubbleType: 'comment', isOpen: true, type: eventUtils.BUBBLE_OPEN},
        this.workspace.id,
        this.block.id,
      );
    });
    test('Not Editable -> Editable', async function () {
      const editableStub = sinon.stub(this.block, 'isEditable').returns(false);

      await this.comment.setBubbleVisible(true);

      editableStub.returns(true);

      await this.comment.updateEditable();
      chai.assert.isTrue(this.comment.bubbleIsVisible());
      assertEditable(this.comment);
      assertEventFired(
        this.eventsFireStub,
        Blockly.Events.BubbleOpen,
        {bubbleType: 'comment', isOpen: true, type: eventUtils.BUBBLE_OPEN},
        this.workspace.id,
        this.block.id,
      );
    });
  });
  suite('Set/Get Bubble Size', function () {
    teardown(function () {
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
    test('Set Size While Visible', function () {
      this.comment.setBubbleVisible(true);

      assertBubbleSizeDefault(this.comment);
      this.comment.setBubbleSize(new Blockly.utils.Size(100, 100));
      assertBubbleSize(this.comment, 100, 100);

      this.comment.setBubbleVisible(false);
      assertBubbleSize(this.comment, 100, 100);
    });
    test('Set Size While Invisible', function () {
      assertBubbleSizeDefault(this.comment);
      this.comment.setBubbleSize(new Blockly.utils.Size(100, 100));
      assertBubbleSize(this.comment, 100, 100);

      this.comment.setBubbleVisible(true);
      assertBubbleSize(this.comment, 100, 100);
    });
  });
});
