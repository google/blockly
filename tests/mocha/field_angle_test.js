/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.declareModuleId('Blockly.test.fieldAngle');

import * as Blockly from '../../build/src/core/blockly.js';
import {assertFieldValue, runConstructorSuiteTests, runFromJsonSuiteTests, runSetValueTests} from './test_helpers/fields.js';
import {createTestBlock, defineRowBlock} from './test_helpers/block_definitions.js';
import {sharedTestSetup, sharedTestTeardown, workspaceTeardown} from './test_helpers/setup_teardown.js';


suite('Angle Fields', function() {
  setup(function() {
    sharedTestSetup.call(this);
  });
  teardown(function() {
    sharedTestTeardown.call(this);
  });
  /**
   * Configuration for field tests with invalid values.
   * @type {!Array<!FieldCreationTestCase>}
   */
  const invalidValueTestCases = [
    {title: 'Undefined', value: undefined},
    {title: 'Null', value: null},
    {title: 'NaN', value: NaN},
    {title: 'Non-Parsable String', value: 'bad'},
    {title: 'Infinity', value: Infinity, expectedValue: Infinity},
    {title: 'Negative Infinity', value: -Infinity, expectedValue: -Infinity},
    {title: 'Infinity String', value: 'Infinity', expectedValue: Infinity},
    {title: 'Negative Infinity String', value: '-Infinity',
      expectedValue: -Infinity},
  ];
  /**
   * Configuration for field tests with valid values.
   * @type {!Array<!FieldCreationTestCase>}
   */

  const validValueTestCases = [
    {title: 'Integer', value: 1, expectedValue: 1},
    {title: 'Float', value: 1.5, expectedValue: 1.5},
    {title: 'Integer String', value: '1', expectedValue: 1},
    {title: 'Float String', value: '1.5', expectedValue: 1.5},
    {title: '> 360°', value: 362, expectedValue: 2},
  ];
  const addArgsAndJson = function(testCase) {
    testCase.args = [testCase.value];
    testCase.json = {'angle': testCase.value};
  };
  invalidValueTestCases.forEach(addArgsAndJson);
  validValueTestCases.forEach(addArgsAndJson);

  /**
   * The expected default value for the field being tested.
   * @type {*}
   */
  const defaultFieldValue = 0;
  /**
   * Asserts that the field property values are set to default.
   * @param {FieldTemplate} field The field to check.
   */
  const assertFieldDefault = function(field) {
    assertFieldValue(field, defaultFieldValue);
  };
  /**
   * Asserts that the field properties are correct based on the test case.
   * @param {!Blockly.FieldAngle} field The field to check.
   * @param {!FieldValueTestCase} testCase The test case.
   */
  const validTestCaseAssertField = function(field, testCase) {
    assertFieldValue(field, testCase.expectedValue);
  };

  runConstructorSuiteTests(
      Blockly.FieldAngle, validValueTestCases, invalidValueTestCases,
      validTestCaseAssertField, assertFieldDefault);

  runFromJsonSuiteTests(
      Blockly.FieldAngle, validValueTestCases, invalidValueTestCases,
      validTestCaseAssertField, assertFieldDefault);

  suite('setValue', function() {
    suite('Empty -> New Value', function() {
      setup(function() {
        this.field = new Blockly.FieldAngle();
      });
      runSetValueTests(
          validValueTestCases, invalidValueTestCases, defaultFieldValue);
      test('With source block', function() {
        this.field.setSourceBlock(createTestBlock());
        this.field.setValue(2.5);
        assertFieldValue(this.field, 2.5);
      });
    });
    suite('Value -> New Value', function() {
      const initialValue = 1;
      setup(function() {
        this.field = new Blockly.FieldAngle(initialValue);
      });
      runSetValueTests(
          validValueTestCases, invalidValueTestCases, initialValue);
      test('With source block', function() {
        this.field.setSourceBlock(createTestBlock());
        this.field.setValue(2.5);
        assertFieldValue(this.field, 2.5);
      });
    });
  });
  suite('Validators', function() {
    setup(function() {
      this.field = new Blockly.FieldAngle(1);
      this.field.htmlInput_ = document.createElement('input');
      this.field.htmlInput_.setAttribute('data-old-value', '1');
      this.field.htmlInput_.setAttribute('data-untyped-default-value', '1');
      this.stub = sinon.stub(this.field, 'resizeEditor_');
    });
    teardown(function() {
      sinon.restore();
    });
    const testSuites = [
      {title: 'Null Validator',
        validator:
            function() {
              return null;
            },
        value: 2, expectedValue: '1'},
      {title: 'Force Mult of 30 Validator',
        validator:
            function(newValue) {
              return Math.round(newValue / 30) * 30;
            },
        value: 25, expectedValue: 30},
      {title: 'Returns Undefined Validator', validator: function() {}, value: 2,
        expectedValue: 2},
    ];
    testSuites.forEach(function(suiteInfo) {
      suite(suiteInfo.title, function() {
        setup(function() {
          this.field.setValidator(suiteInfo.validator);
        });
        test('When Editing', function() {
          this.field.isBeingEdited_ = true;
          this.field.htmlInput_.value = String(suiteInfo.value);
          this.field.onHtmlInputChange_(null);
          assertFieldValue(
              this.field, suiteInfo.expectedValue, String(suiteInfo.value));
        });
        test('When Not Editing', function() {
          this.field.setValue(suiteInfo.value);
          assertFieldValue(this.field, +suiteInfo.expectedValue);
        });
      });
    });
  });
  suite('Customizations', function() {
    suite('Clockwise', function() {
      test('JS Configuration', function() {
        const field = new Blockly.FieldAngle(0, null, {
          clockwise: true,
        });
        chai.assert.isTrue(field.clockwise);
      });
      test('JSON Definition', function() {
        const field = Blockly.FieldAngle.fromJson({
          value: 0,
          clockwise: true,
        });
        chai.assert.isTrue(field.clockwise);
      });
      test('Constant', function() {
        // Note: Generally constants should be set at compile time, not
        // runtime (since they are constants) but for testing purposes we
        // can do this.
        Blockly.FieldAngle.CLOCKWISE = true;
        const field = new Blockly.FieldAngle();
        chai.assert.isTrue(field.clockwise);
      });
    });
    suite('Offset', function() {
      test('JS Configuration', function() {
        const field = new Blockly.FieldAngle(0, null, {
          offset: 90,
        });
        chai.assert.equal(field.offset, 90);
      });
      test('JSON Definition', function() {
        const field = Blockly.FieldAngle.fromJson({
          value: 0,
          offset: 90,
        });
        chai.assert.equal(field.offset, 90);
      });
      test('Constant', function() {
        // Note: Generally constants should be set at compile time, not
        // runtime (since they are constants) but for testing purposes we
        // can do this.
        Blockly.FieldAngle.OFFSET = 90;
        const field = new Blockly.FieldAngle();
        chai.assert.equal(field.offset, 90);
      });
      test('Null', function() {
        // Note: Generally constants should be set at compile time, not
        // runtime (since they are constants) but for testing purposes we
        // can do this.
        Blockly.FieldAngle.OFFSET = 90;
        const field = Blockly.FieldAngle.fromJson({
          value: 0,
          offset: null,
        });
        chai.assert.equal(field.offset, 90);
      });
    });
    suite('Wrap', function() {
      test('JS Configuration', function() {
        const field = new Blockly.FieldAngle(0, null, {
          wrap: 180,
        });
        chai.assert.equal(field.wrap, 180);
      });
      test('JSON Definition', function() {
        const field = Blockly.FieldAngle.fromJson({
          value: 0,
          wrap: 180,
        });
        chai.assert.equal(field.wrap, 180);
      });
      test('Constant', function() {
        // Note: Generally constants should be set at compile time, not
        // runtime (since they are constants) but for testing purposes we
        // can do this.
        Blockly.FieldAngle.WRAP = 180;
        const field = new Blockly.FieldAngle();
        chai.assert.equal(field.wrap, 180);
      });
      test('Null', function() {
        // Note: Generally constants should be set at compile time, not
        // runtime (since they are constants) but for testing purposes we
        // can do this.
        Blockly.FieldAngle.WRAP = 180;
        const field = Blockly.FieldAngle.fromJson({
          value: 0,
          wrap: null,
        });
        chai.assert.equal(field.wrap, 180);
      });
    });
    suite('Round', function() {
      test('JS Configuration', function() {
        const field = new Blockly.FieldAngle(0, null, {
          round: 30,
        });
        chai.assert.equal(field.round, 30);
      });
      test('JSON Definition', function() {
        const field = Blockly.FieldAngle.fromJson({
          value: 0,
          round: 30,
        });
        chai.assert.equal(field.round, 30);
      });
      test('Constant', function() {
        // Note: Generally constants should be set at compile time, not
        // runtime (since they are constants) but for testing purposes we
        // can do this.
        Blockly.FieldAngle.ROUND = 30;
        const field = new Blockly.FieldAngle();
        chai.assert.equal(field.round, 30);
      });
      test('Null', function() {
        // Note: Generally constants should be set at compile time, not
        // runtime (since they are constants) but for testing purposes we
        // can do this.
        Blockly.FieldAngle.ROUND = 30;
        const field = Blockly.FieldAngle.fromJson({
          value: 0,
          round: null,
        });
        chai.assert.equal(field.round, 30);
      });
    });
    suite('Mode', function() {
      suite('Compass', function() {
        test('JS Configuration', function() {
          const field = new Blockly.FieldAngle(0, null, {
            mode: 'compass',
          });
          chai.assert.equal(field.offset, 90);
          chai.assert.isTrue(field.clockwise);
        });
        test('JS Configuration', function() {
          const field = Blockly.FieldAngle.fromJson({
            value: 0,
            mode: 'compass',
          });
          chai.assert.equal(field.offset, 90);
          chai.assert.isTrue(field.clockwise);
        });
      });
      suite('Protractor', function() {
        test('JS Configuration', function() {
          const field = new Blockly.FieldAngle(0, null, {
            mode: 'protractor',
          });
          chai.assert.equal(field.offset, 0);
          chai.assert.isFalse(field.clockwise);
        });
        test('JS Configuration', function() {
          const field = Blockly.FieldAngle.fromJson({
            value: 0,
            mode: 'protractor',
          });
          chai.assert.equal(field.offset, 0);
          chai.assert.isFalse(field.clockwise);
        });
      });
    });
  });

  suite('Serialization', function() {
    setup(function() {
      this.workspace = new Blockly.Workspace();
      defineRowBlock();

      this.assertValue = (value) => {
        const block = this.workspace.newBlock('row_block');
        const field = new Blockly.FieldAngle(value);
        block.getInput('INPUT').appendField(field, 'ANGLE');
        const jso = Blockly.serialization.blocks.save(block);
        chai.assert.deepEqual(jso['fields'], {'ANGLE': value});
      };
    });

    teardown(function() {
      workspaceTeardown.call(this, this.workspace);
    });

    test('Simple', function() {
      this.assertValue(90);
    });

    test('Max precision', function() {
      this.assertValue(1.000000000000001);
    });

    test('Smallest number', function() {
      this.assertValue(5e-324);
    });
  });
});
