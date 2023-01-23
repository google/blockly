/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.declareModuleId('Blockly.test.renderManagement');
import {sharedTestSetup, sharedTestTeardown} from './test_helpers/setup_teardown.js';
import {defineStackBlock, defineStatementBlock} from './test_helpers/block_definitions.js';


suite('Render management', function() {
  setup(function() {
    sharedTestSetup.call(this, {fireEventsNow: false});
    this.workspace = new Blockly.WorkspaceSvg(new Blockly.Options({}));
    defineStackBlock();
    defineStatementBlock();
  });

  teardown(function() {
    sharedTestTeardown.call(this);
  });

  suite('BlockTree', function() {
    suite('Adding blocks', function() {
      test('adding a block adds all parent blocks', function() {
        const grandparent = this.workspace.newBlock('stack_block');
        const parent = this.workspace.newBlock('stack_block');
        const child = this.workspace.newBlock('stack_block');
        grandparent.nextConnection.connect(parent.previousConnection);
        parent.nextConnection.connect(child.previousConnection);
        const tree = new Blockly.renderManagement.BlockTree();

        tree.add(child);

        const root = tree.getRootNode();
        chai.assert.equal(
            root.children[0].block,
            grandparent,
            'Expected the root block to have the grandparent as a child');
        chai.assert.equal(
            root.children[0].children[0].block,
            parent,
            'Expected the tree to include the parent');
        chai.assert.equal(
            root.children[0].children[0].children[0].block,
            child,
            'Expected the tree to include the child');
      });

      test(
          'adding a block does not add duplicate nodes for parents that ' +
          'already exist',
          function() {
            const grandparent = this.workspace.newBlock('statement_block');
            const parent = this.workspace.newBlock('stack_block');
            const pibling = this.workspace.newBlock('stack_block');
            const child = this.workspace.newBlock('stack_block');
            grandparent.nextConnection.connect(parent.previousConnection);
            grandparent.getInput('NAME').connection
                .connect(pibling.previousConnection);
            parent.nextConnection.connect(child.previousConnection);
            const tree = new Blockly.renderManagement.BlockTree();

            tree.add(pibling);
            tree.add(child);

            const root = tree.getRootNode();
            chai.assert.equal(
                root.children.length,
                1,
                'Expected the grandparent block to only be added once');
          });
    });

    suite('Removing blocks', function() {
      test('removing a block removes all children', function() {
        const grandparent = this.workspace.newBlock('stack_block');
        const parent = this.workspace.newBlock('stack_block');
        const child = this.workspace.newBlock('stack_block');
        grandparent.nextConnection.connect(parent.previousConnection);
        parent.nextConnection.connect(child.previousConnection);
        const tree = new Blockly.renderManagement.BlockTree();
        tree.add(child);

        tree.remove(parent);

        chai.assert.isFalse(
            tree.has(child),
            'Expected the tree to not contain the child block');
      });
    });
  });
});
