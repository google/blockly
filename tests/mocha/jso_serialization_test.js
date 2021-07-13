/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite.only('JSO', function() {
  setup(function() {
    sharedTestSetup.call(this);
    this.workspace = new Blockly.Workspace();

    defineStackBlock();
    defineRowBlock();
    defineStatementBlock();

    createGenUidStubWithReturns(new Array(10).fill().map((_, i) => 'id' + i));
  });

  teardown(function() {
    workspaceTeardown.call(this, this.workspace);
    sharedTestTeardown.call(this);
  });

  suite('Blocks', function() {
    suite('Save Single Block', function() {

      function assertProperty(obj, property, value) {
        chai.assert.equal(obj[property], value);
      }

      test('Basic', function() {
        const block = this.workspace.newBlock('row_block');
        const jso = Blockly.serialization.blocks.save(block, true, false);
        assertProperty(jso, 'type', 'row_block');
        assertProperty(jso, 'id', 'id0');
      });

      suite('Attributes', function() {
        test('Collapsed', function() {
          const block = this.workspace.newBlock('row_block');
          block.setCollapsed(true);
          const jso = Blockly.serialization.blocks.save(block, true, false);
          assertProperty(jso, 'collapsed', true);
        });

        test('Disabled', function() {
          const block = this.workspace.newBlock('row_block');
          block.setDisabled(true);
          const jso = Blockly.serialization.blocks.save(block, true, false);
          assertProperty(jso, 'disabled', true);
        });

        test('Deletable', function() {
          const block = this.workspace.newBlock('row_block');
          block.setDeletable(false);
          const jso = Blockly.serialization.blocks.save(block, true, false);
          assertProperty(jso, 'deletable', false);
        });

        test('Movable', function() {
          const block = this.workspace.newBlock('row_block');
          block.setMovable(false);
          const jso = Blockly.serialization.blocks.save(block, true, false);
          assertProperty(jso, 'movable', false);
        });

        test('Editable', function() {
          const block = this.workspace.newBlock('row_block');
          block.setEditable(false);
          const jso = Blockly.serialization.blocks.save(block, true, false);
          assertProperty(jso, 'editable', false);
        });

        suite('Inline', function() {
          test('True', function() {
            const block = this.workspace.newBlock('statement_block');
            block.setInputsInline(true);
            const jso = Blockly.serialization.blocks.save(block, true, false);
            assertProperty(jso, 'inline', true);
          });

          test('False', function() {
            const block = this.workspace.newBlock('statement_block');
            block.setInputsInline(false);
            const jso = Blockly.serialization.blocks.save(block, true, false);
            assertProperty(jso, 'inline', false);
          });
        });
      });

      suite('Coords', function() {
        test('Simple', function() {
          const block = this.workspace.newBlock('statement_block');
          block.moveBy(42, 42);
          const jso = Blockly.serialization.blocks.save(block, true, true);
          assertProperty(jso, 'x', 42);
          assertProperty(jso, 'y', 42);
        });

        test('Negative', function() {
          const block = this.workspace.newBlock('statement_block');
          block.moveBy(-42, -42);
          const jso = Blockly.serialization.blocks.save(block, true, true);
          assertProperty(jso, 'x', -42);
          assertProperty(jso, 'y', -42);
        });

        test('Zero', function() {
          const block = this.workspace.newBlock('statement_block');
          const jso = Blockly.serialization.blocks.save(block, true, true);
          assertProperty(jso, 'x', 0);
          assertProperty(jso, 'y', 0);
        });
      });
    });
  });
});
