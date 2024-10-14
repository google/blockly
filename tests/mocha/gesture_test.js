/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {assertEventFired, assertEventNotFired} from './test_helpers/events.js';
import {defineBasicBlockWithField} from './test_helpers/block_definitions.js';
import {dispatchPointerEvent} from './test_helpers/user_input.js';
import * as eventUtils from '../../build/src/core/events/utils.js';
import {
  sharedTestSetup,
  sharedTestTeardown,
} from './test_helpers/setup_teardown.js';

suite('Gesture', function () {
  function testGestureIsFieldClick(block, isFieldClick, eventsFireStub) {
    const field = block.getField('NAME');
    const eventTarget = field.getClickTarget_();
    chai.assert.exists(
      eventTarget,
      'Precondition: missing click target for field',
    );

    eventsFireStub.resetHistory();
    dispatchPointerEvent(eventTarget, 'pointerdown');

    const fieldWorkspace = field.sourceBlock_.workspace;
    // Gestures triggered on flyouts are stored on targetWorkspace.
    const gestureWorkspace = fieldWorkspace.targetWorkspace || fieldWorkspace;
    const gesture = gestureWorkspace.currentGesture_;
    chai.assert.exists(gesture, 'Gesture exists after pointerdown.');
    const isFieldClickSpy = sinon.spy(gesture, 'isFieldClick');

    dispatchPointerEvent(eventTarget, 'pointerup');
    dispatchPointerEvent(eventTarget, 'click');

    sinon.assert.called(isFieldClickSpy);
    chai.assert.isTrue(isFieldClickSpy.alwaysReturned(isFieldClick));

    assertEventFired(
      eventsFireStub,
      Blockly.Events.Selected,
      {newElementId: block.id, type: eventUtils.SELECTED},
      fieldWorkspace.id,
    );
    assertEventNotFired(eventsFireStub, Blockly.Events.Click, {
      type: eventUtils.CLICK,
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
    chai.assert.equal(gesture.mostRecentEvent, e);
    chai.assert.equal(gesture.creatorWorkspace, this.workspace);
  });

  test('Field click - Click in workspace', function () {
    const block = this.workspace.newBlock('test_field_block');
    block.initSvg();
    block.render();

    testGestureIsFieldClick(block, true, this.eventsFireStub);
  });

  test('Field click - Auto close flyout', function () {
    const flyout = this.workspace.getFlyout(true);
    chai.assert.exists(flyout, 'Precondition: missing flyout');
    flyout.autoClose = true;

    const block = getTopFlyoutBlock(flyout);
    testGestureIsFieldClick(block, false, this.eventsFireStub);
  });

  test('Field click - Always open flyout', function () {
    const flyout = this.workspace.getFlyout(true);
    chai.assert.exists(flyout, 'Precondition: missing flyout');
    flyout.autoClose = false;

    const block = getTopFlyoutBlock(flyout);
    testGestureIsFieldClick(block, true, this.eventsFireStub);
  });
});
