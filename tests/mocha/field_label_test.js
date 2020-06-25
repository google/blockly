/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('Label Fields', function() {
  /**
   * Configuration for field tests with invalid values.
   * @type {!Array<!FieldCreationTestCase>}
   */
  var invalidValueTestCases = [
    {title: 'Undefined', value: undefined},
    {title: 'Null', value: null},
  ];
  /**
   * Configuration for field tests with valid values.
   * @type {!Array<!FieldCreationTestCase>}
   */
  var validValueTestCases = [
    {title: 'String', value: 'value', expectedValue: 'value'},
    {title: 'Boolean true', value: true, expectedValue: 'true'},
    {title: 'Boolean false', value: false, expectedValue: 'false'},
    {title: 'Number (Truthy)', value: 1, expectedValue: '1'},
    {title: 'Number (Falsy)', value: 0, expectedValue: '0'},
    {title: 'NaN', value: NaN, expectedValue: 'NaN'},
  ];
  var addArgsAndJson = function(testCase) {
    testCase.args = [testCase.value];
    testCase.json = {'text': testCase.value};
  };
  invalidValueTestCases.forEach(addArgsAndJson);
  validValueTestCases.forEach(addArgsAndJson);

  /**
   * The expected default value for the field being tested.
   * @type {*}
   */
  var defaultFieldValue = '';
  /**
   * Asserts that the field property values are set to default.
   * @param {!Blockly.FieldNumber} field The field to check.
   */
  var assertFieldDefault = function(field) {
    testHelpers.assertFieldValue(field, defaultFieldValue);
  };
  /**
   * Asserts that the field properties are correct based on the test case.
   * @param {!Blockly.FieldNumber} field The field to check.
   * @param {!FieldValueTestCase} testCase The test case.
   */
  var validTestCaseAssertField = function(field, testCase) {
    testHelpers.assertFieldValue(field, testCase.expectedValue);
  };

  testHelpers.runConstructorSuiteTests(
      Blockly.FieldLabel, validValueTestCases, invalidValueTestCases,
      validTestCaseAssertField, assertFieldDefault);

  testHelpers.runFromJsonSuiteTests(
      Blockly.FieldLabel, validValueTestCases,invalidValueTestCases,
      validTestCaseAssertField, assertFieldDefault);

  suite('setValue', function() {
    suite('Empty -> New Value', function() {
      setup(function() {
        this.field = new Blockly.FieldLabel();
      });
      testHelpers.runSetValueTests(
          validValueTestCases, invalidValueTestCases, defaultFieldValue);
      test('With source block', function() {
        this.field.setSourceBlock(createTestBlock());
        this.field.setValue('value');
        testHelpers.assertFieldValue(this.field, 'value');
      });
    });
    suite('Value -> New Value', function() {
      var initialValue = 'oldValue';
      setup(function() {
        this.field = new Blockly.FieldLabel(initialValue);
      });
      testHelpers.runSetValueTests(
          validValueTestCases, invalidValueTestCases, initialValue);
      test('With source block', function() {
        this.field.setSourceBlock(createTestBlock());
        this.field.setValue('value');
        testHelpers.assertFieldValue(this.field, 'value');
      });
    });
  });

  suite('Customizations', function() {
    function assertHasClass(labelField, cssClass) {
      labelField.fieldGroup_ =
          Blockly.utils.dom.createSvgElement('g', {}, null);
      labelField.constants_ = {
        FIELD_TEXT_BASELINE_Y: 13
      };
      labelField.initView();
      chai.assert.isTrue(Blockly.utils.dom.hasClass(
          labelField.textElement_, cssClass));
    }
    function assertDoesNotHaveClass(labelField, cssClass) {
      labelField.fieldGroup_ =
          Blockly.utils.dom.createSvgElement('g', {}, null);
      labelField.constants_ = {
        FIELD_TEXT_BASELINE_Y: 13
      };
      labelField.initView();
      chai.assert.isFalse(Blockly.utils.dom.hasClass(
          labelField.textElement_, cssClass));
    }

    test('JS Constructor', function() {
      var field = new Blockly.FieldLabel('text', 'testClass');
      assertHasClass(field, 'testClass');
    });
    test('JSON Definition', function() {
      var field = Blockly.FieldLabel.fromJson({
        class: 'testClass'
      });
      assertHasClass(field, 'testClass');
    });
    test('JS Configuration - Simple', function() {
      var field = new Blockly.FieldLabel('text', null, {
        class: 'testClass'
      });
      assertHasClass(field, 'testClass');
    });
    test('JS Configuration - Ignore', function() {
      var field = new Blockly.FieldLabel('text', 'paramClass', {
        class: 'configClass'
      });
      assertDoesNotHaveClass(field, 'paramClass');
      assertHasClass(field, 'configClass');
    });
    test('JS Configuration - Ignore - \'\'', function() {
      var field = new Blockly.FieldLabel('text', '', {
        class: 'configClass'
      });
      assertHasClass(field, 'configClass');
    });
    test('JS Configuration - Ignore - Config \'\'', function() {
      var field = new Blockly.FieldLabel('text', 'paramClass', {
        class: ''
      });
      assertDoesNotHaveClass(field, 'paramClass');
    });
    suite('setClass', function() {
      test('setClass', function() {
        var field = new Blockly.FieldLabel();
        field.fieldGroup_ = Blockly.utils.dom.createSvgElement('g', {}, null);
        field.constants_ = {
          FIELD_TEXT_BASELINE_Y: 13
        };
        field.initView();
        field.setClass('testClass');
        // Don't call assertHasClass b/c we don't want to re-initialize.
        chai.assert.isTrue(Blockly.utils.dom.hasClass(
            field.textElement_, 'testClass'));
      });
      test('setClass Before Initialization', function() {
        var field = new Blockly.FieldLabel();
        field.setClass('testClass');
        assertHasClass(field, 'testClass');
      });
      test('Remove Class', function() {
        var field = new Blockly.FieldLabel('text', null, {
          class: 'testClass'
        });
        assertHasClass(field, 'testClass');
        field.setClass(null);
        chai.assert.isFalse(Blockly.utils.dom.hasClass(
            field.textElement_, 'testClass'));
      });
    });
  });
});
