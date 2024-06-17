/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {assert} from '../../node_modules/chai/chai.js';
import {defineRowBlock} from './test_helpers/block_definitions.js';
import {
  sharedTestSetup,
  sharedTestTeardown,
} from './test_helpers/setup_teardown.js';

suite('Marker Move Event', function () {
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
      const block1 = this.workspace.newBlock('row_block', 'test_id1');
      const block2 = this.workspace.newBlock('row_block', 'test_id2');
      const node1 = new Blockly.ASTNode(Blockly.ASTNode.types.BLOCK, block1);
      const node2 = new Blockly.ASTNode(Blockly.ASTNode.types.BLOCK, block2);
      const origEvent = new Blockly.Events.MarkerMove(
        block2,
        false,
        node1,
        node2,
      );

      const json = origEvent.toJson();
      const newEvent = new Blockly.Events.fromJson(json, this.workspace);

      assert.deepEqual(newEvent, origEvent);
    });
  });
});
