
/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.declareModuleId('Blockly.test.eventTrashcanOpen');

import {sharedTestSetup, sharedTestTeardown} from './test_helpers/setup_teardown.js';


suite('Trashcan Open Event', function() {
  setup(function() {
    sharedTestSetup.call(this);
    this.workspace = new Blockly.Workspace();
  });

  teardown(function() {
    sharedTestTeardown.call(this);
  });

  suite('Serialization', function() {
    test('events round-trip through JSON', function() {
      const origEvent =
          new Blockly.Events.TrashcanOpen(true, this.workspace.id);

      const json = origEvent.toJson();
      const newEvent = new Blockly.Events.fromJson(json, this.workspace);

      chai.assert.deepEqual(newEvent, origEvent);
    });
  });
});
