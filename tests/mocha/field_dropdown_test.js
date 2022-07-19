/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.module('Blockly.test.fieldDropdown');

const {assertFieldValue, runConstructorSuiteTests, runFromJsonSuiteTests, runSetValueTests} = goog.require('Blockly.test.helpers.fields');
const {createTestBlock, defineRowBlock} = goog.require('Blockly.test.helpers.blockDefinitions');
const {sharedTestSetup, sharedTestTeardown, workspaceTeardown} = goog.require('Blockly.test.helpers.setupTeardown');


suite('Dropdown Fields', function() {
  setup(function() {
    sharedTestSetup.call(this);

    // Invalid value test are expected to log errors.
    const nativeConsoleError = console.error;
    this.nativeConsoleError = nativeConsoleError;
    console.error = function(msg) {
      if (!msg.includes('Each FieldDropdown option')) {
        nativeConsoleError.call(this, ...arguments);
      }
    };
  });
  teardown(function() {
    console.error = this.nativeConsoleError;
    sharedTestTeardown.call(this);
  });
  /**
   * Configuration for field tests with invalid values.
   * @type {!Array<!FieldCreationTestCase>}
   */
  const invalidValueCreationTestCases = [
    {title: 'Undefined', args: [undefined]},
    {title: 'Array Items not Arrays', args: [undefined]},
    {title: 'Array Items with Invalid IDs',
      args: [[['1', 1], ['2', 2], ['3', 3]]]},
    {title: 'Array Items with Invalid Content',
      args: [[[1, '1'], [2, '2'], [3, '3']]]},
  ];
  /**
   * Configuration for field tests with valid values.
   * @type {!Array<!FieldCreationTestCase>}
   */
  const validValueCreationTestCases = [
    {title: 'Text Dropdown', value: 'A', expectedValue: 'A', expectedText: 'a',
      args: [[['a', 'A'], ['b', 'B'], ['c', 'C']]]},
    {title: 'Image Dropdown', value: 'A', expectedValue: 'A', expectedText: 'a',
      args: [[
        [{src: 'scrA', alt: 'a'}, 'A'],
        [{src: 'scrB', alt: 'b'}, 'B'],
        [{src: 'scrC', alt: 'c'}, 'C']]]},
    {title: 'Dynamic Text Dropdown', value: 'A', expectedValue: 'A', expectedText: 'a',
      args: [() => {
        return [['a', 'A'], ['b', 'B'], ['c', 'C']];
      }]},
    {title: 'Dynamic Image Dropdown', value: 'A', expectedValue: 'A', expectedText: 'a',
      args: [() => {
        return [
          [{src: 'scrA', alt: 'a'}, 'A'],
          [{src: 'scrB', alt: 'b'}, 'B'],
          [{src: 'scrC', alt: 'c'}, 'C']];
      }]},
  ];
  const addJson = function(testCase) {
    testCase.json = {'options': testCase.args[0]};
  };
  invalidValueCreationTestCases.forEach(addJson);
  validValueCreationTestCases.forEach(addJson);

  /**
   * Asserts that the field properties are correct based on the test case.
   * @param {!Blockly.FieldDropdown} field The field to check.
   * @param {!FieldValueTestCase} testCase The test case.
   */
  const validTestCaseAssertField = function(field, testCase) {
    assertFieldValue(field, testCase.expectedValue, testCase.expectedText);
  };

  runConstructorSuiteTests(
      Blockly.FieldDropdown, validValueCreationTestCases,
      invalidValueCreationTestCases, validTestCaseAssertField);

  runFromJsonSuiteTests(
      Blockly.FieldDropdown, validValueCreationTestCases,
      invalidValueCreationTestCases, validTestCaseAssertField);

  /**
   * Configuration for field tests with invalid values.
   * @type {!Array<!FieldCreationTestCase>}
   */
  const invalidValueSetValueTestCases = [
    {title: 'Null', value: null},
    {title: 'Undefined', value: undefined},
    {title: 'Invalid ID', value: 'bad'},
  ];
  /**
   * Configuration for field tests with valid values.
   * @type {!Array<!FieldValueTestCase>}
   */
  const validValueSetValueTestCases = [
    {title: 'Valid ID', value: 'B', expectedValue: 'B', expectedText: 'b'},
  ];

  suite('setValue', function() {
    setup(function() {
      this.field = new Blockly.FieldDropdown(
          [['a', 'A'], ['b', 'B'], ['c', 'C']]);
    });
    runSetValueTests(
        validValueSetValueTestCases, invalidValueSetValueTestCases, 'A', 'a');
    test('With source block', function() {
      this.field.setSourceBlock(createTestBlock());
      this.field.setValue('B');
      assertFieldValue(this.field, 'B', 'b');
    });
  });

  suite('Validators', function() {
    setup(function() {
      this.dropdownField = new Blockly.FieldDropdown([
        ["1a", "1A"], ["1b", "1B"], ["1c", "1C"],
        ["2a", "2A"], ["2b", "2B"], ["2c", "2C"]]);
    });
    teardown(function() {
      this.dropdownField.setValidator(null);
    });
    suite('Null Validator', function() {
      setup(function() {
        this.dropdownField.setValidator(function() {
          return null;
        });
      });
      test('New Value', function() {
        this.dropdownField.setValue('1B');
        assertFieldValue(this.dropdownField, '1A', '1a');
      });
    });
    suite('Force 1s Validator', function() {
      setup(function() {
        this.dropdownField.setValidator(function(newValue) {
          return '1' + newValue.charAt(1);
        });
      });
      test('New Value', function() {
        this.dropdownField.setValue('2B');
        assertFieldValue(this.dropdownField, '1B', '1b');
      });
    });
    suite('Returns Undefined Validator', function() {
      setup(function() {
        this.dropdownField.setValidator(function() {});
      });
      test('New Value', function() {
        this.dropdownField.setValue('1B');
        assertFieldValue(this.dropdownField, '1B', '1b');
      });
    });
  });

  suite('Serialization', function() {
    setup(function() {
      this.workspace = new Blockly.Workspace();
      defineRowBlock();

      
      this.assertValue = (value, field) => {
        const block = this.workspace.newBlock('row_block');
        field.setValue(value);
        block.getInput('INPUT').appendField(field, 'DROPDOWN');
        const jso = Blockly.serialization.blocks.save(block);
        chai.assert.deepEqual(jso['fields'], {'DROPDOWN': value});
      };
    });

    teardown(function() {
      workspaceTeardown.call(this, this.workspace);
    });

    test('Simple', function() {
      const field = new Blockly.FieldDropdown(
          [['apple', 'A'], ['ball', 'B'], ['carrot', 'C']]);
      this.assertValue('C', field);
    });

    test('Dynamic', function() {
      const field = new Blockly.FieldDropdown(
          () => [['apple', 'A'], ['ball', 'B'], ['carrot', 'C']]);
      this.assertValue('C', field);
    });
  });
});
