/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.module('Blockly.test.gesture');

const {assertEventFired, assertEventNotFired, defineBasicBlockWithField, dispatchPointerEvent, sharedTestSetup, sharedTestTeardown} = goog.require('Blockly.test.helpers');


suite('Gesture', function() {
  function testGestureIsFieldClick(block, isFieldClick, eventsFireStub){
    let field = block.getField('NAME');
    let eventTarget = field.getClickTarget_();
    chai.assert.exists(eventTarget,
        'Precondition: missing click target for field');

    eventsFireStub.resetHistory();
    dispatchPointerEvent(eventTarget, 'pointerdown');

    let fieldWorkspace = field.sourceBlock_.workspace;
    // Gestures triggered on flyouts are stored on targetWorkspace.
    let gestureWorkspace = fieldWorkspace.targetWorkspace || fieldWorkspace;
    let gesture = gestureWorkspace.currentGesture_;
    chai.assert.exists(gesture, 'Gesture exists after pointerdown.');
    let isFieldClickSpy = sinon.spy(gesture, 'isFieldClick_');

    dispatchPointerEvent(eventTarget, 'pointerup');
    dispatchPointerEvent(eventTarget, 'click');

    sinon.assert.called(isFieldClickSpy);
    chai.assert.isTrue(isFieldClickSpy.alwaysReturned(isFieldClick));


    assertEventFired(eventsFireStub, Blockly.Events.Selected,
        {oldElementId: null, newElementId: block.id}, fieldWorkspace.id);
    assertEventNotFired(eventsFireStub, Blockly.Events.Click, {});
  }

  function getTopFlyoutBlock(flyout) {
    return flyout.workspace_.topBlocks_[0];
  }

  setup(function() {
    sharedTestSetup.call(this);
    defineBasicBlockWithField();
    let toolbox = document.getElementById('gesture-test-toolbox');
    this.workspace = Blockly.inject('blocklyDiv', {toolbox: toolbox});
  });

  teardown(function() {
    sharedTestTeardown.call(this);
  });

  test('Constructor', function() {
    let e = { id: 'dummy_test_event'};
    let gesture = new Blockly.Gesture(e, this.workspace);
    chai.assert.equal(gesture.mostRecentEvent_, e);
    chai.assert.equal(gesture.creatorWorkspace_, this.workspace);
  });

  test('Field click - Click in workspace', function() {
    let block = this.workspace.newBlock('test_field_block');
    block.initSvg();
    block.render();

    testGestureIsFieldClick(block, true, this.eventsFireStub);
  });

  test('Field click - Auto close flyout', function() {
    let flyout = this.workspace.flyout_;
    chai.assert.exists(this.workspace.flyout_,
        'Precondition: missing flyout');
    flyout.autoClose = true;

    let block = getTopFlyoutBlock(flyout);
    testGestureIsFieldClick(block, false, this.eventsFireStub);
  });

  test('Field click - Always open flyout', function() {
    let flyout = this.workspace.flyout_;
    chai.assert.exists(this.workspace.flyout_,
        'Precondition: missing flyout');
    flyout.autoClose = false;

    let block = getTopFlyoutBlock(flyout);
    testGestureIsFieldClick(block, true, this.eventsFireStub);
  });
});
