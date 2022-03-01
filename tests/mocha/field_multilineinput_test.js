/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.module('Blockly.test.fieldMultiline');

const {assertFieldValue, runConstructorSuiteTests, runFromJsonSuiteTests, runSetValueTests} = goog.require('Blockly.test.helpers.fields');
const {createTestBlock, defineRowBlock} = goog.require('Blockly.test.helpers.blockDefinitions');
const {sharedTestSetup, sharedTestTeardown, workspaceTeardown} = goog.require('Blockly.test.helpers.setupTeardown');
const {runCodeGenerationTestSuites} = goog.require('Blockly.test.helpers.codeGeneration');


suite('Multiline Input Fields', function() {
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
  ];
  /**
   * Configuration for field tests with valid values.
   * @type {!Array<!FieldCreationTestCase>}
   */
  const validValueTestCases = [
    {title: 'Empty string', value: '', expectedValue: ''},
    {title: 'String no newline', value: 'value', expectedValue: 'value'},
    {title: 'String with newline', value: 'bark bark\n bark bark bark\n bark bar bark bark\n', expectedValue: 'bark bark\n bark bark bark\n bark bar bark bark\n'},
    {title: 'Boolean true', value: true, expectedValue: 'true'},
    {title: 'Boolean false', value: false, expectedValue: 'false'},
    {title: 'Number (Truthy)', value: 1, expectedValue: '1'},
    {title: 'Number (Falsy)', value: 0, expectedValue: '0'},
    {title: 'NaN', value: NaN, expectedValue: 'NaN'},
  ];
  const addArgsAndJson = function(testCase) {
    testCase.args = [testCase.value];
    testCase.json = {'text': testCase.value};
  };
  invalidValueTestCases.forEach(addArgsAndJson);
  validValueTestCases.forEach(addArgsAndJson);

  /**
   * The expected default value for the field being tested.
   * @type {*}
   */
  const defaultFieldValue = '';
  /**
   * Asserts that the field property values are set to default.
   * @param {!Blockly.FieldMultilineInput} field The field to check.
   */
  const assertFieldDefault = function(field) {
    assertFieldValue(field, defaultFieldValue);
  };
  /**
   * Asserts that the field properties are correct based on the test case.
   * @param {!Blockly.FieldMultilineInput} field The field to check.
   * @param {!FieldValueTestCase} testCase The test case.
   */
  const validTestCaseAssertField = function(field, testCase) {
    assertFieldValue(field, testCase.expectedValue);
  };

  runConstructorSuiteTests(
      Blockly.FieldMultilineInput, validValueTestCases, invalidValueTestCases,
      validTestCaseAssertField, assertFieldDefault);

  runFromJsonSuiteTests(
      Blockly.FieldMultilineInput, validValueTestCases, invalidValueTestCases,
      validTestCaseAssertField, assertFieldDefault);

  suite('setValue', function() {
    suite('Empty -> New Value', function() {
      setup(function() {
        this.field = new Blockly.FieldMultilineInput();
      });
      runSetValueTests(
          validValueTestCases, invalidValueTestCases, defaultFieldValue);
      test('With source block', function() {
        this.field.setSourceBlock(createTestBlock());
        this.field.setValue('value');
        assertFieldValue(this.field, 'value');
      });
    });
    suite('Value -> New Value', function() {
      const initialValue = 'oldValue';
      setup(function() {
        this.field = new Blockly.FieldMultilineInput(initialValue);
      });
      runSetValueTests(
          validValueTestCases, invalidValueTestCases, initialValue);
      test('With source block', function() {
        this.field.setSourceBlock(createTestBlock());
        this.field.setValue('value');
        assertFieldValue(this.field, 'value');
      });
    });
  });

  suite('blockToCode', function() {
    setup(function() {
      this.workspace = new Blockly.Workspace();
    });
    const createBlockFn = (value) => {
      return (workspace) => {
        const block = workspace.newBlock('text_multiline');
        const textField = block.getField('TEXT');
        textField.setValue(value);
        return block;
      };
    };

    /**
     * Test suites for code generation tests.s
     * @type {Array<CodeGenerationTestSuite>}
     */
    const testSuites = [
      {title: 'Dart', generator: Blockly.Dart,
        testCases: [
          {title: 'Empty string', expectedCode: '\'\'',
            createBlock: createBlockFn('')},
          {title: 'String with newline', expectedCode: '\'bark bark\' + \'\\n\' + \n\' bark bark bark\' + \'\\n\' + \n\' bark bar bark bark\' + \'\\n\' + \n\'\'',
            createBlock: createBlockFn('bark bark\n bark bark bark\n bark bar bark bark\n')},
        ]},
      {title: 'JavaScript', generator: Blockly.JavaScript,
        testCases: [
          {title: 'Empty string', expectedCode: '\'\'',
            createBlock: createBlockFn('')},
          {title: 'String with newline', expectedCode: '\'bark bark\' + \'\\n\' +\n\' bark bark bark\' + \'\\n\' +\n\' bark bar bark bark\' + \'\\n\' +\n\'\'',
            createBlock: createBlockFn('bark bark\n bark bark bark\n bark bar bark bark\n')},
        ]},
      {title: 'Lua', generator: Blockly.Lua,
        testCases: [
          {title: 'Empty string', expectedCode: '\'\'',
            createBlock: createBlockFn('')},
          {title: 'String with newline', expectedCode: '\'bark bark\' .. \'\\n\' ..\n\' bark bark bark\' .. \'\\n\' ..\n\' bark bar bark bark\' .. \'\\n\' ..\n\'\'',
            createBlock: createBlockFn('bark bark\n bark bark bark\n bark bar bark bark\n')},
        ]},
      {title: 'PHP', generator: Blockly.PHP,
        testCases: [
          {title: 'Empty string', expectedCode: '\'\'',
            createBlock: createBlockFn('')},
          {title: 'String with newline', expectedCode: '\'bark bark\' . "\\n" .\n\' bark bark bark\' . "\\n" .\n\' bark bar bark bark\' . "\\n" .\n\'\'',
            createBlock: createBlockFn('bark bark\n bark bark bark\n bark bar bark bark\n')},
        ]},
      {title: 'Python', generator: Blockly.Python,
        testCases: [
          {title: 'Empty string', expectedCode: '\'\'',
            createBlock: createBlockFn('')},
          {title: 'String with newline', expectedCode: '\'bark bark\' + \'\\n\' + \n\' bark bark bark\' + \'\\n\' + \n\' bark bar bark bark\' + \'\\n\' + \n\'\'',
            createBlock: createBlockFn('bark bark\n bark bark bark\n bark bar bark bark\n')},
        ]},
    ];
    runCodeGenerationTestSuites(testSuites);
  });

  suite('Serialization', function() {
    setup(function() {
      this.workspace = new Blockly.Workspace();
      defineRowBlock();
      
      this.assertValue = (value) => {
        const block = this.workspace.newBlock('row_block');
        const field = new Blockly.FieldMultilineInput(value);
        block.getInput('INPUT').appendField(field, 'MULTILINE');
        const jso = Blockly.serialization.blocks.save(block);
        chai.assert.deepEqual(jso['fields'], {'MULTILINE': value});
      };
    });

    teardown(function() {
      workspaceTeardown.call(this, this.workspace);
    });

    test('Single line', function() {
      this.assertValue('this is a single line');
    });

    test('Multiple lines', function() {
      this.assertValue('this\nis\n  multiple\n    lines');
    });
  });
});
