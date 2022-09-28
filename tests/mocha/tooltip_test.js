/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.module('Blockly.test.tooltip');

const {sharedTestSetup, sharedTestTeardown, workspaceTeardown} = goog.require('Blockly.test.helpers.setupTeardown');


suite('Tooltip', function() {
  setup(function() {
    sharedTestSetup.call(this);
    this.workspace = new Blockly.Workspace();

    Blockly.defineBlocksWithJsonArray([
      {
        'type': 'test_block',
        'message0': '%1',
        'args0': [
          {
            'type': 'field_input',
            'name': 'FIELD',
          },
        ],
      },
    ]);
  });

  teardown(function() {
    delete Blockly.Blocks['test_block'];
    sharedTestTeardown.call(this);
  });

  suite('Custom Tooltip', function() {
    setup(function() {
      this.renderedWorkspace = Blockly.inject('blocklyDiv', {});
    });

    teardown(function() {
      workspaceTeardown.call(this, this.renderedWorkspace);
    });

    test('Custom function is called', function() {
      // Custom tooltip function is registered and should be called when mouse
      // events are fired.
      let wasCalled = false;
      const customFn = function() {
        wasCalled = true;
      };
      Blockly.Tooltip.setCustomTooltip(customFn);

      this.block = this.renderedWorkspace.newBlock('test_block');
      this.block.setTooltip('Test Tooltip');

      // Fire pointer events directly on the relevant SVG.
      // Note the 'pointerover', due to the events registered through
      // Blockly.browserEvents.bind being registered as pointer events rather
      // than mouse events. Mousemove event is registered directly on the
      // element rather than through browserEvents.
      this.block.pathObject.svgPath.dispatchEvent(
          new MouseEvent('pointerover'));
      this.block.pathObject.svgPath.dispatchEvent(new MouseEvent('mousemove'));
      this.clock.runAll();

      chai.assert.isTrue(
          wasCalled, 'Expected custom tooltip function to have been called');
    });
  });

  suite('set/getTooltip', function() {
    const tooltipText = 'testTooltip';

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
          tooltip: tooltipText,
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
        chai.assert.throws(
            this.block.getTooltip.bind(this.block),
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
        chai.assert.throws(
            this.block.getTooltip.bind(this.block),
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
        chai.assert.throws(
            this.field.getTooltip.bind(this.field),
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
        chai.assert.throws(
            this.field.getTooltip.bind(this.field),
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
