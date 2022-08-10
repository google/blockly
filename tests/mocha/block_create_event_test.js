/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.declareModuleId('Blockly.test.blockCreateEvent');

import {assertEventFired} from './test_helpers/events.js';
import * as eventUtils from '../../build/src/core/events/utils.js';
import {sharedTestSetup, sharedTestTeardown} from './test_helpers/setup_teardown.js';


suite('Block Create Event', function() {
  setup(function() {
    sharedTestSetup.call(this);
    this.workspace = new Blockly.Workspace();
  });

  teardown(function() {
    sharedTestTeardown.call(this);
  });

  test('Create shadow on disconnect', function() {
    Blockly.Events.disable();
    const block = Blockly.serialization.blocks.append(
        {
          "type": "text_print",
          "inputs": {
            "TEXT": {
              "shadow": {
                "type": "text",
                "id": "shadowId",
                "fields": {
                  "TEXT": "abc",
                },
              },
              "block": {
                "type": "text",
                "fields": {
                  "TEXT": "",
                },
              },
            },
          },
        },
        this.workspace);
    Blockly.Events.enable();
    block.getInput('TEXT').connection.disconnect();
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
});
