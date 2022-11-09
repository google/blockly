
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.declareModuleId('Blockly.test.mutator');

import {sharedTestSetup, sharedTestTeardown} from './test_helpers/setup_teardown.js';
import {createRenderedBlock, defineMutatorBlocks} from './test_helpers/block_definitions.js';
import {assertEventFired, assertEventNotFired} from './test_helpers/events.js';


suite('Mutator', function() {
  setup(function() {
    sharedTestSetup.call(this);
  });

  suite('Firing change event', function() {
    setup(function() {
      this.workspace = Blockly.inject('blocklyDiv', {});
      defineMutatorBlocks();
    });

    teardown(function() {
      Blockly.Extensions.unregister('xml_mutator');
      Blockly.Extensions.unregister('jso_mutator');
      sharedTestTeardown.call(this);
    });

    test('No change', function() {
      const block = createRenderedBlock(this.workspace, 'xml_block');
      block.mutator.setVisible(true);
      const mutatorWorkspace = block.mutator.getWorkspace();
      // Trigger mutator change listener.
      createRenderedBlock(mutatorWorkspace, 'checkbox_block');
      assertEventNotFired(this.eventsFireStub, Blockly.Events.BlockChange,
        {element: 'mutation'});
    });

    test('XML', function() {
      const block = createRenderedBlock(this.workspace, 'xml_block');
      block.mutator.setVisible(true);
      const mutatorWorkspace = block.mutator.getWorkspace();
      mutatorWorkspace.getBlockById('check_block')
          .setFieldValue('TRUE', 'CHECK');
      chai.assert.isTrue(
          this.eventsFireStub.getCalls().some(
              ({args}) =>
                args[0].type === Blockly.Events.BLOCK_CHANGE &&
                args[0].element === 'mutation' &&
                /<mutation.*><\/mutation>/.test(args[0].newValue)));
    });

    test('JSO', function() {
      const block = createRenderedBlock(this.workspace, 'jso_block');
      block.mutator.setVisible(true);
      const mutatorWorkspace = block.mutator.getWorkspace();
      mutatorWorkspace.getBlockById('check_block')
          .setFieldValue('TRUE', 'CHECK');
      assertEventFired(this.eventsFireStub, Blockly.Events.BlockChange,
        {
          element: 'mutation',
          newValue: '{"hasInput":true}',
        }, this.workspace.id, block.id);
    });
  });
});
