/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.declareModuleId('Blockly.test.eventBlockChange');

import {
  sharedTestSetup,
  sharedTestTeardown,
} from './test_helpers/setup_teardown.js';
import {
  defineBasicBlockWithField,
  defineMutatorBlocks
} from './test_helpers/block_definitions.js';

suite('Block Change Event', function () {
  setup(function () {
    sharedTestSetup.call(this);
    this.workspace = new Blockly.Workspace();
  });

  teardown(function () {
    sharedTestTeardown.call(this);
  });

  suite('Undo and Redo', function () {
    suite('Mutation', function () {
      setup(function () {
        defineMutatorBlocks();
      });

      teardown(function () {
        Blockly.Extensions.unregister('xml_mutator');
        Blockly.Extensions.unregister('jso_mutator');
      });

      suite('XML', function () {
        test('Undo', function () {
          const block = this.workspace.newBlock('xml_block', 'block_id');
          block.domToMutation(
            Blockly.utils.xml.textToDom('<mutation hasInput="true"/>')
          );
          const blockChange = new Blockly.Events.BlockChange(
            block,
            'mutation',
            null,
            '',
            '<mutation hasInput="true"/>'
          );
          blockChange.run(false);
          chai.assert.isFalse(block.hasInput);
        });

        test('Redo', function () {
          const block = this.workspace.newBlock('xml_block', 'block_id');
          const blockChange = new Blockly.Events.BlockChange(
            block,
            'mutation',
            null,
            '',
            '<mutation hasInput="true"/>'
          );
          blockChange.run(true);
          chai.assert.isTrue(block.hasInput);
        });
      });

      suite('JSO', function () {
        test('Undo', function () {
          const block = this.workspace.newBlock('jso_block', 'block_id');
          block.loadExtraState({hasInput: true});
          const blockChange = new Blockly.Events.BlockChange(
            block,
            'mutation',
            null,
            '',
            '{"hasInput":true}'
          );
          blockChange.run(false);
          chai.assert.isFalse(block.hasInput);
        });

        test('Redo', function () {
          const block = this.workspace.newBlock('jso_block', 'block_id');
          const blockChange = new Blockly.Events.BlockChange(
            block,
            'mutation',
            null,
            '',
            '{"hasInput":true}'
          );
          blockChange.run(true);
          chai.assert.isTrue(block.hasInput);
        });
      });
    });
  });

  suite('isNull', function () {
    setup(function () {
      defineBasicBlockWithField();
    });

    test('isNull is false when values are different', function() {
      const block = this.workspace.newBlock('test_field_block', 'block_id');
      const blockChange = new Blockly.Events.BlockChange(
          block, 'field', 'NAME', 'old value', 'new value');
      chai.assert.isFalse(blockChange.isNull());
    });

    test('isNull is true when values are the same', function() {
      const block = this.workspace.newBlock('test_field_block', 'block_id');
      const blockChange = new Blockly.Events.BlockChange(
          block, 'field', 'NAME', 'same value', 'same value');
      chai.assert.isTrue(blockChange.isNull());
    });

    test('isNull is false for complete input regardless of values', function() {
      const block = this.workspace.newBlock('test_field_block', 'block_id');
      const blockChange = new Blockly.Events.BlockChange(
          block,
          'field',
          'NAME',
          'same value',
          'same value',
          'complete_user_input');
      chai.assert.isFalse(blockChange.isNull());
    });
  });

  suite('Serialization', function () {
    setup(function () {
      defineMutatorBlocks();
    });

    teardown(function () {
      Blockly.Extensions.unregister('xml_mutator');
      Blockly.Extensions.unregister('jso_mutator');
    });

    test('events round-trip through JSON', function () {
      const block = this.workspace.newBlock('xml_block', 'block_id');
      block.domToMutation(
        Blockly.utils.xml.textToDom('<mutation hasInput="true"/>')
      );
      const origEvent = new Blockly.Events.BlockChange(
        block,
        'mutation',
        null,
        '',
        '<mutation hasInput="true"/>'
      );

      const json = origEvent.toJson();
      const newEvent = new Blockly.Events.fromJson(json, this.workspace);

      chai.assert.deepEqual(newEvent, origEvent);
    });
  });
});
