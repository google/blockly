/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  sharedTestSetup,
  sharedTestTeardown,
} from './test_helpers/setup_teardown.js';

suite('Field Intermediate Change Event', function () {
  setup(function () {
    sharedTestSetup.call(this);
    this.workspace = new Blockly.Workspace();
  });

  teardown(function () {
    sharedTestTeardown.call(this);
  });

  suite('Serialization', function () {
    test('events round-trip through JSON', function () {
      const block = this.workspace.newBlock('text', 'block_id');
      const origEvent = new Blockly.Events.BlockFieldIntermediateChange(
        block,
        'TEXT',
        'old value',
        'new value',
      );

      const json = origEvent.toJson();
      const newEvent = new Blockly.Events.fromJson(json, this.workspace);

      chai.assert.deepEqual(newEvent, origEvent);
    });
  });

  suite('Change Value', function () {
    test("running forward changes the block's value to new value", function () {
      const block = this.workspace.newBlock('text', 'block_id');
      const origEvent = new Blockly.Events.BlockFieldIntermediateChange(
        block,
        'TEXT',
        'old value',
        'new value',
      );
      origEvent.run(true);

      chai.assert.deepEqual(
        block.getField(origEvent.name).getValue(),
        'new value',
      );
    });

    test("running backward changes the block's value to old value", function () {
      const block = this.workspace.newBlock('text', 'block_id');
      const origEvent = new Blockly.Events.BlockFieldIntermediateChange(
        block,
        'TEXT',
        'old value',
        'new value',
      );
      origEvent.run(false);

      chai.assert.deepEqual(
        block.getField(origEvent.name).getValue(),
        'old value',
      );
    });
  });
});
