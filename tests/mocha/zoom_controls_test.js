/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.declareModuleId('Blockly.test.zoomControls');

import {assertEventFired, assertEventNotFired} from './test_helpers/events.js';
import * as eventUtils from '../../build/src/core/events/utils.js';
import {sharedTestSetup, sharedTestTeardown} from './test_helpers/setup_teardown.js';
import {simulateClick} from './test_helpers/user_input.js';


suite("Zoom Controls", function() {
  setup(function() {
    sharedTestSetup.call(this);
    this.workspace = Blockly.inject('blocklyDiv',
        {'zoom': {'controls': true}});
    this.zoomControls = this.workspace.zoomControls_;
  });
  teardown(function() {
    sharedTestTeardown.call(this);
  });

  suite("Events", function() {
    function closeToMatcher(expectedValue, delta) {
      return sinon.match(function(value) {
        return Math.abs(value - expectedValue) <= delta;
      });
    }
    test("Zoom in", function() {
      simulateClick(this.zoomControls.zoomInGroup);

      assertEventFired(
          this.eventsFireStub, Blockly.Events.Click,
          {targetType: 'zoom_controls', type: eventUtils.CLICK}, this.workspace.id, undefined);
      assertEventNotFired(
          this.eventsFireStub, Blockly.Events.Click,
          {targetType: 'workspace', type: eventUtils.CLICK});
      chai.assert.closeTo(this.workspace.getScale(), 1.2, 0.05);
    });
    test("Zoom out", function() {
      simulateClick(this.zoomControls.zoomOutGroup);

      assertEventFired(
          this.eventsFireStub, Blockly.Events.Click,
          {targetType: 'zoom_controls', type: eventUtils.CLICK}, this.workspace.id, undefined);
      assertEventNotFired(
          this.eventsFireStub, Blockly.Events.Click,
          {targetType: 'workspace', type: eventUtils.CLICK});
      chai.assert.closeTo(this.workspace.getScale(), 0.8, 0.05);
    });
    test("Reset zoom", function() {
      simulateClick(this.zoomControls.zoomResetGroup);

      assertEventFired(
          this.eventsFireStub, Blockly.Events.Click,
          {targetType: 'zoom_controls', type: eventUtils.CLICK}, this.workspace.id, undefined);
      assertEventNotFired(
          this.eventsFireStub, Blockly.Events.Click,
          {targetType: 'workspace', type: eventUtils.CLICK});
      chai.assert.equal(this.workspace.getScale(), 1);
    });
  });
});
