/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {EventType} from '../../build/src/core/events/type.js';
import {assert} from '../../node_modules/chai/chai.js';
import {defineBasicBlockWithField} from './test_helpers/block_definitions.js';
import {assertEventFired, assertEventNotFired} from './test_helpers/events.js';
import {
  sharedTestSetup,
  sharedTestTeardown,
} from './test_helpers/setup_teardown.js';
import {dispatchPointerEvent} from './test_helpers/user_input.js';

suite('Gesture', function () {
  function testGestureIsFieldClick(block, isFieldClick, eventsFireStub) {
    const field = block.getField('NAME');
    const eventTarget = field.getClickTarget_();
    assert.exists(eventTarget, 'Precondition: missing click target for field');

    eventsFireStub.resetHistory();
    dispatchPointerEvent(eventTarget, 'pointerdown');

    const fieldWorkspace = field.sourceBlock_.workspace;
    // Gestures triggered on flyouts are stored on targetWorkspace.
    const gestureWorkspace = fieldWorkspace.targetWorkspace || fieldWorkspace;
    const gesture = gestureWorkspace.currentGesture_;
    assert.exists(gesture, 'Gesture exists after pointerdown.');
    const isFieldClickSpy = sinon.spy(gesture, 'isFieldClick');

    dispatchPointerEvent(eventTarget, 'pointerup');
    dispatchPointerEvent(eventTarget, 'click');

    sinon.assert.called(isFieldClickSpy);
    assert.isTrue(isFieldClickSpy.alwaysReturned(isFieldClick));

    assertEventFired(
      eventsFireStub,
      Blockly.Events.Selected,
      {newElementId: block.id, type: EventType.SELECTED},
      fieldWorkspace.id,
    );
    assertEventNotFired(eventsFireStub, Blockly.Events.Click, {
      type: EventType.CLICK,
    });
  }

  function getTopFlyoutBlock(flyout) {
    return flyout.workspace_.getTopBlocks(false)[0];
  }

  setup(function () {
    sharedTestSetup.call(this);
    defineBasicBlockWithField();
    const toolbox = document.getElementById('gesture-test-toolbox');
    this.workspace = Blockly.inject('blocklyDiv', {toolbox: toolbox});
  });

  teardown(function () {
    sharedTestTeardown.call(this);
  });

  test('Constructor', function () {
    const e = {id: 'dummy_test_event'};
    const gesture = new Blockly.Gesture(e, this.workspace);
    assert.equal(gesture.mostRecentEvent, e);
    assert.equal(gesture.creatorWorkspace, this.workspace);
  });

  test('Field click - Click in workspace', function () {
    const block = this.workspace.newBlock('test_field_block');
    block.initSvg();
    block.render();

    testGestureIsFieldClick(block, true, this.eventsFireStub);
  });

  test('Field click - Auto close flyout', function () {
    const flyout = this.workspace.getFlyout(true);
    assert.exists(flyout, 'Precondition: missing flyout');
    flyout.autoClose = true;

    const block = getTopFlyoutBlock(flyout);
    testGestureIsFieldClick(block, false, this.eventsFireStub);
  });

  test('Field click - Always open flyout', function () {
    const flyout = this.workspace.getFlyout(true);
    assert.exists(flyout, 'Precondition: missing flyout');
    flyout.autoClose = false;

    const block = getTopFlyoutBlock(flyout);
    testGestureIsFieldClick(block, true, this.eventsFireStub);
  });
});
