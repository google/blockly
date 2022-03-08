/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.module('Blockly.test.zoomControls');

const {assertEventFired, assertEventNotFired} = goog.require('Blockly.test.helpers.events');
const eventUtils = goog.require('Blockly.Events.utils');
const {sharedTestSetup, sharedTestTeardown} = goog.require('Blockly.test.helpers.setupTeardown');
const {simulateClick} = goog.require('Blockly.test.helpers.userInput');


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
      simulateClick(this.zoomControls.zoomInGroup_);

      assertEventFired(
          this.eventsFireStub, Blockly.Events.Click,
          {targetType: 'zoom_controls', type: eventUtils.CLICK}, this.workspace.id, null);
      assertEventNotFired(
          this.eventsFireStub, Blockly.Events.Click,
          {targetType: 'workspace', type: eventUtils.CLICK});
      chai.assert.closeTo(this.workspace.getScale(), 1.2, 0.05);
    });
    test("Zoom out", function() {
      simulateClick(this.zoomControls.zoomOutGroup_);

      assertEventFired(
          this.eventsFireStub, Blockly.Events.Click,
          {targetType: 'zoom_controls', type: eventUtils.CLICK}, this.workspace.id, null);
      assertEventNotFired(
          this.eventsFireStub, Blockly.Events.Click,
          {targetType: 'workspace', type: eventUtils.CLICK});
      chai.assert.closeTo(this.workspace.getScale(), 0.8, 0.05);
    });
    test("Reset zoom", function() {
      simulateClick(this.zoomControls.zoomResetGroup_);

      assertEventFired(
          this.eventsFireStub, Blockly.Events.Click,
          {targetType: 'zoom_controls', type: eventUtils.CLICK}, this.workspace.id, null);
      assertEventNotFired(
          this.eventsFireStub, Blockly.Events.Click,
          {targetType: 'workspace', type: eventUtils.CLICK});
      chai.assert.equal(this.workspace.getScale(), 1);
    });
  });
});
