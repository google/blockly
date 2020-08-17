/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

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
          this.eventsFireStub, Blockly.Events.Ui,
          {element: 'zoom', oldValue: 1, newValue: closeToMatcher(1.2, 0.05)},
          this.workspace.id, null);
      assertEventNotFired(
          this.eventsFireStub, Blockly.Events.Ui, {element: 'click'});
    });
    test("Zoom out", function() {
      simulateClick(this.zoomControls.zoomOutGroup_);

      assertEventFired(
          this.eventsFireStub, Blockly.Events.Ui,
          {element: 'zoom', oldValue: 1, newValue: closeToMatcher(0.8, 0.05)},
          this.workspace.id, null);
      assertEventNotFired(
          this.eventsFireStub, Blockly.Events.Ui, {element: 'click'});
    });
    test("Reset zoom", function() {
      simulateClick(this.zoomControls.zoomResetGroup_);

      assertEventFired(
          this.eventsFireStub, Blockly.Events.Ui,
          {element: 'zoom', oldValue: 1, newValue: 1},
          this.workspace.id, null);
      assertEventNotFired(
          this.eventsFireStub, Blockly.Events.Ui, {element: 'click'});
    });
  });
});
