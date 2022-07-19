/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.module('Blockly.test.fieldLabel');

const {assertFieldValue, runConstructorSuiteTests, runFromJsonSuiteTests, runSetValueTests} = goog.require('Blockly.test.helpers.fields');
const {sharedTestSetup, sharedTestTeardown} = goog.require('Blockly.test.helpers.setupTeardown');
const {createTestBlock} = goog.require('Blockly.test.helpers.blockDefinitions');


suite('Label Fields', function() {
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
    {title: 'String', value: 'value', expectedValue: 'value'},
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
   * @param {!Blockly.FieldLabel} field The field to check.
   */
  const assertFieldDefault = function(field) {
    assertFieldValue(field, defaultFieldValue);
  };
  /**
   * Asserts that the field properties are correct based on the test case.
   * @param {!Blockly.FieldLabel} field The field to check.
   * @param {!FieldValueTestCase} testCase The test case.
   */
  const validTestCaseAssertField = function(field, testCase) {
    assertFieldValue(field, testCase.expectedValue);
  };

  runConstructorSuiteTests(
      Blockly.FieldLabel, validValueTestCases, invalidValueTestCases,
      validTestCaseAssertField, assertFieldDefault);

  runFromJsonSuiteTests(
      Blockly.FieldLabel, validValueTestCases, invalidValueTestCases,
      validTestCaseAssertField, assertFieldDefault);

  suite('setValue', function() {
    suite('Empty -> New Value', function() {
      setup(function() {
        this.field = new Blockly.FieldLabel();
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
        this.field = new Blockly.FieldLabel(initialValue);
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

  suite('Customizations', function() {
    function assertHasClass(labelField, cssClass) {
      labelField.fieldGroup_ = Blockly.utils.dom.createSvgElement(
          Blockly.utils.Svg.G, {}, null);
      labelField.constants_ = {
        FIELD_TEXT_BASELINE_Y: 13,
      };
      labelField.initView();
      chai.assert.isTrue(Blockly.utils.dom.hasClass(
          labelField.textElement_, cssClass));
    }
    function assertDoesNotHaveClass(labelField, cssClass) {
      labelField.fieldGroup_ = Blockly.utils.dom.createSvgElement(
          Blockly.utils.Svg.G, {}, null);
      labelField.constants_ = {
        FIELD_TEXT_BASELINE_Y: 13,
      };
      labelField.initView();
      chai.assert.isFalse(Blockly.utils.dom.hasClass(
          labelField.textElement_, cssClass));
    }

    test('JS Constructor', function() {
      const field = new Blockly.FieldLabel('text', 'testClass');
      assertHasClass(field, 'testClass');
    });
    test('JSON Definition', function() {
      const field = Blockly.FieldLabel.fromJson({
        class: 'testClass',
      });
      assertHasClass(field, 'testClass');
    });
    test('JS Configuration - Simple', function() {
      const field = new Blockly.FieldLabel('text', null, {
        class: 'testClass',
      });
      assertHasClass(field, 'testClass');
    });
    test('JS Configuration - Ignore', function() {
      const field = new Blockly.FieldLabel('text', 'paramClass', {
        class: 'configClass',
      });
      assertDoesNotHaveClass(field, 'paramClass');
      assertHasClass(field, 'configClass');
    });
    test('JS Configuration - Ignore - \'\'', function() {
      const field = new Blockly.FieldLabel('text', '', {
        class: 'configClass',
      });
      assertHasClass(field, 'configClass');
    });
    test('JS Configuration - Ignore - Config \'\'', function() {
      const field = new Blockly.FieldLabel('text', 'paramClass', {
        class: '',
      });
      assertDoesNotHaveClass(field, 'paramClass');
    });
    suite('setClass', function() {
      test('setClass', function() {
        const field = new Blockly.FieldLabel();
        field.fieldGroup_ = Blockly.utils.dom.createSvgElement(
            Blockly.utils.Svg.G, {}, null);
        field.constants_ = {
          FIELD_TEXT_BASELINE_Y: 13,
        };
        field.initView();
        field.setClass('testClass');
        // Don't call assertHasClass b/c we don't want to re-initialize.
        chai.assert.isTrue(Blockly.utils.dom.hasClass(
            field.textElement_, 'testClass'));
      });
      test('setClass Before Initialization', function() {
        const field = new Blockly.FieldLabel();
        field.setClass('testClass');
        assertHasClass(field, 'testClass');
      });
      test('Remove Class', function() {
        const field = new Blockly.FieldLabel('text', null, {
          class: 'testClass',
        });
        assertHasClass(field, 'testClass');
        field.setClass(null);
        chai.assert.isFalse(Blockly.utils.dom.hasClass(
            field.textElement_, 'testClass'));
      });
    });
  });
});
