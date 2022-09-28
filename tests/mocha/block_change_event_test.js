/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.module('Blockly.test.blockChangeEvent');

const {sharedTestSetup, sharedTestTeardown} = goog.require('Blockly.test.helpers.setupTeardown');
const {defineMutatorBlocks} = goog.require('Blockly.test.helpers.blockDefinitions');


suite('Block Change Event', function() {
  setup(function() {
    sharedTestSetup.call(this);
    this.workspace = new Blockly.Workspace();
  });

  teardown(function() {
    sharedTestTeardown.call(this);
  });

  suite('Undo and Redo', function() {
    suite('Mutation', function() {
      setup(function() {
        defineMutatorBlocks();
      });
  
      teardown(function() {
        Blockly.Extensions.unregister('xml_mutator');
        Blockly.Extensions.unregister('jso_mutator');
      });
      
      suite('XML', function() {
        test('Undo', function() {
          const block = this.workspace.newBlock('xml_block', 'block_id');
          block.domToMutation(
              Blockly.Xml.textToDom('<mutation hasInput="true"/>'));
          const blockChange = new Blockly.Events.BlockChange(
              block, 'mutation', null, '', '<mutation hasInput="true"/>');
          blockChange.run(false);
          chai.assert.isFalse(block.hasInput);
        });

        test('Redo', function() {
          const block = this.workspace.newBlock('xml_block', 'block_id');
          const blockChange = new Blockly.Events.BlockChange(
              block, 'mutation', null, '', '<mutation hasInput="true"/>');
          blockChange.run(true);
          chai.assert.isTrue(block.hasInput);
        });
      });

      suite('JSO', function() {
        test('Undo', function() {
          const block = this.workspace.newBlock('jso_block', 'block_id');
          block.loadExtraState({hasInput: true});
          const blockChange = new Blockly.Events.BlockChange(
              block, 'mutation', null, '', '{"hasInput":true}');
          blockChange.run(false);
          chai.assert.isFalse(block.hasInput);
        });

        test('Redo', function() {
          const block = this.workspace.newBlock('jso_block', 'block_id');
          const blockChange = new Blockly.Events.BlockChange(
              block, 'mutation', null, '', '{"hasInput":true}');
          blockChange.run(true);
          chai.assert.isTrue(block.hasInput);
        });
      });
    });
  });
});
