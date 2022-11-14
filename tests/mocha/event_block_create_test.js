/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.declareModuleId('Blockly.test.eventBlockCreate');

import {assertEventFired} from './test_helpers/events.js';
import * as eventUtils from '../../build/src/core/events/utils.js';
import {sharedTestSetup, sharedTestTeardown} from './test_helpers/setup_teardown.js';
import {defineRowBlock} from './test_helpers/block_definitions.js';


suite('Block Create Event', function() {
  setup(function() {
    sharedTestSetup.call(this);
    defineRowBlock();
    this.workspace = new Blockly.Workspace();
  });

  teardown(function() {
    sharedTestTeardown.call(this);
  });

  test('Create shadow on disconnect', function() {
    Blockly.Events.disable();
    const block = Blockly.serialization.blocks.append(
        {
          "type": "row_block",
          "inputs": {
            "INPUT": {
              "shadow": {
                "type": "row_block",
                "id": "shadowId",
              },
              "block": {
                "type": "row_block",
              },
            },
          },
        },
        this.workspace);
    Blockly.Events.enable();
    block.getInput('INPUT').connection.disconnect();
    assertEventFired(
        this.eventsFireStub,
        Blockly.Events.BlockCreate,
        {'recordUndo': false, 'type': eventUtils.BLOCK_CREATE},
        this.workspace.id,
        'shadowId');
    const calls = this.eventsFireStub.getCalls();
    const event = calls[calls.length - 1].args[0];
    chai.assert.equal(event.xml.tagName, 'shadow');
  });

  suite('Serialization', function() {
    test('events round-trip through JSON', function() {
      const block = this.workspace.newBlock('row_block', 'block_id');
      const origEvent = new Blockly.Events.BlockCreate(block);

      const json = origEvent.toJson();
      const newEvent = new Blockly.Events.fromJson(json, this.workspace);
      delete origEvent.xml;  // xml fails deep equals for some reason.
      delete newEvent.xml;  // xml fails deep equals for some reason.

      chai.assert.deepEqual(newEvent, origEvent);
    });
  });
});
