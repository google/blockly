/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('Tooltip', function() {

  setup(function() {
    sharedTestSetup.call(this);
    this.workspace = new Blockly.Workspace();
  });

  teardown(function() {
    sharedTestTeardown.call(this);
  });

  suite('set/getTooltip', function() {
    setup(function() {
      Blockly.defineBlocksWithJsonArray([
        {
          "type": "test_block",
          "message0": "%1",
          "args0": [
            {
              "type": "field_input",
              "name": "FIELD"
            }
          ]
        }
      ]);
    });

    teardown(function() {
      delete Blockly.Blocks["test_block"];
    });

    var tooltipText = 'testTooltip';

    function assertTooltip(obj) {
      chai.assert.equal(obj.getTooltip(), tooltipText);
    }

    function setStringTooltip(obj) {
      obj.setTooltip(tooltipText);
    }

    function setFunctionTooltip(obj) {
      obj.setTooltip(() => tooltipText);
    }

    function setNestedFunctionTooltip(obj) {
      function nestFunction(fn, count) {
        if (!count) {
          return fn;
        }
        return () => nestFunction(fn, --count);
      }
      obj.setTooltip(nestFunction(() => tooltipText, 5));
    }

    function setFunctionReturningObjectTooltip(obj) {
      obj.setTooltip(() => {
        return {
          tooltip: tooltipText
        };
      });
    }

    function setObjectTooltip(obj) {
      obj.setTooltip({tooltip: tooltipText});
    }

    suite('Headless Blocks', function() {
      setup(function() {
        this.block = this.workspace.newBlock('test_block');
      });

      test('String', function() {
        setStringTooltip(this.block);
        assertTooltip(this.block);
      });

      test('Function', function() {
        setFunctionTooltip(this.block);
        assertTooltip(this.block);
      });

      test('Nested Function', function() {
        setNestedFunctionTooltip(this.block);
        assertTooltip(this.block);
      });

      test('Function returning object', function() {
        setFunctionReturningObjectTooltip(this.block);
        chai.assert.throws(this.block.getTooltip.bind(this.block),
            'Tooltip function must return a string.');
      });

      test('Object', function() {
        setObjectTooltip(this.block);
        assertTooltip(this.block);
      });
    });

    suite('Rendered Blocks', function() {
      setup(function() {
        this.renderedWorkspace = Blockly.inject('blocklyDiv');
        this.block = this.renderedWorkspace.newBlock('test_block');
        this.block.initSvg();
        this.block.render();
      });

      teardown(function() {
        workspaceTeardown.call(this, this.renderedWorkspace);
      });

      test('String', function() {
        setStringTooltip(this.block);
        assertTooltip(this.block);
      });

      test('Function', function() {
        setFunctionTooltip(this.block);
        assertTooltip(this.block);
      });

      test('Nested Function', function() {
        setNestedFunctionTooltip(this.block);
        assertTooltip(this.block);
      });

      test('Function returning object', function() {
        setFunctionReturningObjectTooltip(this.block);
        chai.assert.throws(this.block.getTooltip.bind(this.block),
            'Tooltip function must return a string.');
      });

      test('Object', function() {
        setObjectTooltip(this.block);
        assertTooltip(this.block);
      });
    });

    suite('Headless Fields', function() {
      setup(function() {
        this.block = this.workspace.newBlock('test_block');
        this.field = this.block.getField('FIELD');
      });

      test('String', function() {
        setStringTooltip(this.field);
        assertTooltip(this.field);
      });

      test('Function', function() {
        setFunctionTooltip(this.field);
        assertTooltip(this.field);
      });

      test('Nested Function', function() {
        setNestedFunctionTooltip(this.field);
        assertTooltip(this.field);
      });

      test('Function returning object', function() {
        setFunctionReturningObjectTooltip(this.field);
        chai.assert.throws(this.field.getTooltip.bind(this.field),
            'Tooltip function must return a string.');
      });

      test('Object', function() {
        setObjectTooltip(this.field);
        assertTooltip(this.field);
      });

      test('Null', function() {
        setStringTooltip(this.block);
        this.field.setTooltip(null);
        assertTooltip(this.field);
      });
    });

    suite('Rendered Fields', function() {
      setup(function() {
        this.renderedWorkspace = Blockly.inject('blocklyDiv');
        this.block = this.renderedWorkspace.newBlock('test_block');
        this.block.initSvg();
        this.block.render();
        this.field = this.block.getField('FIELD');
      });

      teardown(function() {
        workspaceTeardown.call(this, this.renderedWorkspace);
      });

      test('String', function() {
        setStringTooltip(this.field);
        assertTooltip(this.field);
      });

      test('Function', function() {
        setFunctionTooltip(this.field);
        assertTooltip(this.field);
      });

      test('Nested Function', function() {
        setNestedFunctionTooltip(this.field);
        assertTooltip(this.field);
      });

      test('Function returning object', function() {
        setFunctionReturningObjectTooltip(this.field);
        chai.assert.throws(this.field.getTooltip.bind(this.field),
            'Tooltip function must return a string.');
      });

      test('Object', function() {
        setObjectTooltip(this.field);
        assertTooltip(this.field);
      });

      test('Null', function() {
        setStringTooltip(this.block);
        this.field.setTooltip(null);
        assertTooltip(this.field);
      });
    });
  });
});
