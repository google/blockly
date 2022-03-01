/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.module('Blockly.test.gesture');

const {assertEventFired, assertEventNotFired} = goog.require('Blockly.test.helpers.events');
const {defineBasicBlockWithField} = goog.require('Blockly.test.helpers.blockDefinitions');
const {dispatchPointerEvent} = goog.require('Blockly.test.helpers.userInput');
const eventUtils = goog.require('Blockly.Events.utils');
const {sharedTestSetup, sharedTestTeardown} = goog.require('Blockly.test.helpers.setupTeardown');


suite('Gesture', function() {
  function testGestureIsFieldClick(block, isFieldClick, eventsFireStub) {
    const field = block.getField('NAME');
    const eventTarget = field.getClickTarget_();
    chai.assert.exists(eventTarget,
        'Precondition: missing click target for field');

    eventsFireStub.resetHistory();
    dispatchPointerEvent(eventTarget, 'pointerdown');

    const fieldWorkspace = field.sourceBlock_.workspace;
    // Gestures triggered on flyouts are stored on targetWorkspace.
    const gestureWorkspace = fieldWorkspace.targetWorkspace || fieldWorkspace;
    const gesture = gestureWorkspace.currentGesture_;
    chai.assert.exists(gesture, 'Gesture exists after pointerdown.');
    const isFieldClickSpy = sinon.spy(gesture, 'isFieldClick_');

    dispatchPointerEvent(eventTarget, 'pointerup');
    dispatchPointerEvent(eventTarget, 'click');

    sinon.assert.called(isFieldClickSpy);
    chai.assert.isTrue(isFieldClickSpy.alwaysReturned(isFieldClick));


    assertEventFired(eventsFireStub, Blockly.Events.Selected,
        {oldElementId: null, newElementId: block.id, type: eventUtils.SELECTED}, fieldWorkspace.id);
    assertEventNotFired(eventsFireStub, Blockly.Events.Click, {type: eventUtils.CLICK});
  }

  function getTopFlyoutBlock(flyout) {
    return flyout.workspace_.topBlocks_[0];
  }

  setup(function() {
    sharedTestSetup.call(this);
    defineBasicBlockWithField();
    const toolbox = document.getElementById('gesture-test-toolbox');
    this.workspace = Blockly.inject('blocklyDiv', {toolbox: toolbox});
  });

  teardown(function() {
    sharedTestTeardown.call(this);
  });

  test('Constructor', function() {
    const e = {id: 'dummy_test_event'};
    const gesture = new Blockly.Gesture(e, this.workspace);
    chai.assert.equal(gesture.mostRecentEvent_, e);
    chai.assert.equal(gesture.creatorWorkspace_, this.workspace);
  });

  test('Field click - Click in workspace', function() {
    const block = this.workspace.newBlock('test_field_block');
    block.initSvg();
    block.render();

    testGestureIsFieldClick(block, true, this.eventsFireStub);
  });

  test('Field click - Auto close flyout', function() {
    const flyout = this.workspace.flyout_;
    chai.assert.exists(this.workspace.flyout_,
        'Precondition: missing flyout');
    flyout.autoClose = true;

    const block = getTopFlyoutBlock(flyout);
    testGestureIsFieldClick(block, false, this.eventsFireStub);
  });

  test('Field click - Always open flyout', function() {
    const flyout = this.workspace.flyout_;
    chai.assert.exists(this.workspace.flyout_,
        'Precondition: missing flyout');
    flyout.autoClose = false;

    const block = getTopFlyoutBlock(flyout);
    testGestureIsFieldClick(block, true, this.eventsFireStub);
  });
});
