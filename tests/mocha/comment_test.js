/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2019 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

suite('Comments', function() {
  setup(function() {
    Blockly.defineBlocksWithJsonArray([
      {
        "type": "empty_block",
        "message0": "",
        "args0": []
      },
    ]);

    this.workspace = Blockly.inject('blocklyDiv', {comments: true});
    this.block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
        '<block type="empty_block"/>'
    ), this.workspace);
    this.comment = new Blockly.Comment(this.block);
    this.comment.computeIconLocation();
  });
  teardown(function() {
    delete Blockly.Blocks['empty_block'];
    this.workspace.dispose();
  });
  suite('Set/Get Bubble Size', function() {
    function assertBubbleSize(comment, height, width) {
      var size = comment.getBubbleSize();
      chai.assert.equal(size.height, height);
      chai.assert.equal(size.width, width);
    }
    function assertBubbleSizeDefault(comment) {
      assertBubbleSize(comment, 80, 160);
    }
    test('Set Size While Visible', function() {
      this.comment.setVisible(true);
      var bubbleSizeSpy = sinon.spy(this.comment.bubble_, 'setBubbleSize');

      assertBubbleSizeDefault(this.comment);
      this.comment.setBubbleSize(100, 100);
      assertBubbleSize(this.comment, 100, 100);
      chai.assert(bubbleSizeSpy.calledOnce);

      this.comment.setVisible(false);
      assertBubbleSize(this.comment, 100, 100);

      bubbleSizeSpy.restore();
    });
    test('Set Size While Invisible', function() {
      assertBubbleSizeDefault(this.comment);
      this.comment.setBubbleSize(100, 100);
      assertBubbleSize(this.comment, 100, 100);

      this.comment.setVisible(true);
      assertBubbleSize(this.comment, 100, 100);
    });
  });
  suite('Set/Get Text', function() {
    test('Set Text While Visible', function() {
      this.comment.setVisible(true);
      var eventSpy = sinon.spy(Blockly.Events, 'fire');

      // Going with initially null for now.
      chai.assert.equal(this.comment.getText(), null);
      this.comment.setText('test text');
      chai.assert.equal(this.comment.getText(), 'test text');
      chai.assert(eventSpy.calledOnce);
      var event = eventSpy.getCall(0).args[0];
      chai.assert.equal(event.type, Blockly.Events.BLOCK_CHANGE);
      chai.assert.equal(event.element, 'comment');
      chai.assert.equal(event.newValue, 'test text');

      this.comment.setVisible(false);
      chai.assert.equal(this.comment.getText(), 'test text');

      eventSpy.restore();
    });
    test('Set Text While Invisible', function() {
      var eventSpy = sinon.spy(Blockly.Events, 'fire');

      // Going with initially null for now.
      chai.assert.equal(this.comment.getText(), null);
      this.comment.setText('test text');
      chai.assert.equal(this.comment.getText(), 'test text');
      chai.assert(eventSpy.calledOnce);
      var event = eventSpy.getCall(0).args[0];
      chai.assert.equal(event.type, Blockly.Events.BLOCK_CHANGE);
      chai.assert.equal(event.element, 'comment');
      chai.assert.equal(event.newValue, 'test text');

      this.comment.setVisible(true);
      chai.assert.equal(this.comment.getText(), 'test text');

      eventSpy.restore();
    });
    test('Get Text While Editing', function() {
      this.comment.setVisible(true);
      this.comment.textarea_.value = 'test text';
      this.comment.textarea_.dispatchEvent(new Event('input'));

      chai.assert.equal(this.comment.getText(), 'test text');
    });
  });
  suite('Editability', function() {
    setup(function() {
      this.editableStub = sinon.stub(this.block, 'isEditable').returns(true);
    });
    teardown(function() {
      this.editableStub.restore();
    });
    function assertEditable(comment) {
      chai.assert.isOk(comment.textarea_);
      chai.assert.equal(comment.textarea_.value, 'test text');
    }
    function assertNonEditable(comment) {
      chai.assert.isOk(comment.bubble_);
      var displayText = comment.bubble_.content_
          .firstChild.firstChild.nodeValue;
      chai.assert.equal(displayText, 'test text');
    }
    test('Editable', function() {
      this.comment.setText('test text');
      this.comment.setVisible(true);
      assertEditable(this.comment);
    });
    test('Non-Editable', function() {
      this.editableStub.returns(false);
      this.comment.setText('test text');
      this.comment.setVisible(true);
    });
    test('True -> False While Open', function() {
      this.comment.setText('test text');
      this.comment.setVisible(true);
      assertEditable(this.comment);

      this.editableStub.returns(false);
      this.comment.updateEditable();
      assertNonEditable(this.comment);
    });
    test('False -> True While Open', function() {
      this.editableStub.returns(false);
      this.comment.setText('test text');
      this.comment.setVisible(true);
      assertNonEditable(this.comment);

      this.editableStub.returns(true);

      this.comment.setText('test text');
      this.comment.updateEditable();
      assertEditable(this.comment);
    });
    test('True -> False While Editing', function() {
      this.comment.setVisible(true);
      this.comment.textarea_.value = 'test text';
      this.comment.textarea_.dispatchEvent(new Event('input'));
      assertEditable(this.comment);

      this.editableStub.returns(false);
      this.comment.updateEditable();
      assertNonEditable(this.comment);
    });
  });
});
