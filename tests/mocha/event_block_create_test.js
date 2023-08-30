/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {assertEventFired} from './test_helpers/events.js';
import * as eventUtils from '../../build/src/core/events/utils.js';
import {
  sharedTestSetup,
  sharedTestTeardown,
} from './test_helpers/setup_teardown.js';
import {defineRowBlock} from './test_helpers/block_definitions.js';

suite('Block Create Event', function () {
  setup(function () {
    sharedTestSetup.call(this);
    defineRowBlock();
    this.workspace = new Blockly.Workspace();
  });

  teardown(function () {
    sharedTestTeardown.call(this);
  });

  test('Create shadow on disconnect', function () {
    Blockly.Events.disable();
    const block = Blockly.serialization.blocks.append(
      {
        'type': 'row_block',
        'inputs': {
          'INPUT': {
            'shadow': {
              'type': 'row_block',
              'id': 'shadowId',
            },
            'block': {
              'type': 'row_block',
            },
          },
        },
      },
      this.workspace,
    );
    Blockly.Events.enable();
    block.getInput('INPUT').connection.disconnect();
    assertEventFired(
      this.eventsFireStub,
      Blockly.Events.BlockCreate,
      {'recordUndo': false, 'type': eventUtils.BLOCK_CREATE},
      this.workspace.id,
      'shadowId',
    );
    const calls = this.eventsFireStub.getCalls();
    const event = calls[calls.length - 1].args[0];
    chai.assert.equal(event.xml.tagName, 'shadow');
  });

  test('Does not create extra shadow blocks', function () {
    const shadowId = 'shadow_block';
    const blockJson = {
      'type': 'math_arithmetic',
      'id': 'parent_with_shadow',
      'fields': {'OP': 'ADD'},
      'inputs': {
        'A': {
          'shadow': {
            'type': 'math_number',
            'id': shadowId,
            'fields': {'NUM': 1},
          },
        },
      },
    };

    // If there is a shadow block on the workspace and then we get
    // a block create event with the same ID as the shadow block,
    // this represents a block that had been covering a shadow block
    // being removed.
    Blockly.serialization.blocks.append(blockJson, this.workspace);
    const shadowBlock = this.workspace.getBlockById(shadowId);
    const blocksBefore = this.workspace.getAllBlocks();

    const event = new Blockly.Events.BlockCreate(shadowBlock);
    event.run(true);

    const blocksAfter = this.workspace.getAllBlocks();
    chai.assert.deepEqual(
      blocksAfter,
      blocksBefore,
      'No new blocks should be created from an event that only creates shadow blocks',
    );
  });

  suite('Serialization', function () {
    test('events round-trip through JSON', function () {
      const block = this.workspace.newBlock('row_block', 'block_id');
      const origEvent = new Blockly.Events.BlockCreate(block);

      const json = origEvent.toJson();
      const newEvent = new Blockly.Events.fromJson(json, this.workspace);
      delete origEvent.xml; // xml fails deep equals for some reason.
      delete newEvent.xml; // xml fails deep equals for some reason.

      chai.assert.deepEqual(newEvent, origEvent);
    });
  });
});
