/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {defineRowBlock} from './test_helpers/block_definitions.js';
import {
  sharedTestSetup,
  sharedTestTeardown,
} from './test_helpers/setup_teardown.js';

suite('Click Event', function () {
  setup(function () {
    sharedTestSetup.call(this);
    defineRowBlock();
    this.workspace = new Blockly.Workspace();
  });

  teardown(function () {
    sharedTestTeardown.call(this);
  });

  suite('Serialization', function () {
    test('events round-trip through JSON', function () {
      const block = this.workspace.newBlock('row_block', 'block_id');
      const origEvent = new Blockly.Events.Click(
        block,
        undefined,
        Blockly.Events.ClickTarget.BLOCK,
      );

      const json = origEvent.toJson();
      const newEvent = new Blockly.Events.fromJson(json, this.workspace);

      chai.assert.deepEqual(newEvent, origEvent);
    });
  });
});
