/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('Number Fields', function() {
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
  var invalidValueTestCases = [
    {title: 'Undefined', value: undefined},
    {title: 'Null', value: null},
    {title: 'NaN', value: NaN},
    {title: 'Non-Parsable String', value: 'bad'},
  ];
  /**
   * Configuration for field tests with valid values.
   * @type {!Array<!FieldCreationTestCase>}
   */
  var validValueTestCases = [
    {title: 'Integer', value: 1, expectedValue: 1},
    {title: 'Float', value: 1.5, expectedValue: 1.5},
    {title: 'Integer String', value: '1', expectedValue: 1},
    {title: 'Float String', value: '1.5', expectedValue: 1.5},
    {title: 'Infinity', value: Infinity, expectedValue: Infinity},
    {title: 'Negative Infinity', value: -Infinity, expectedValue: -Infinity},
    {title: 'Infinity String', value: 'Infinity', expectedValue: Infinity},
    {title: 'Negative Infinity String', value: '-Infinity',
      expectedValue: -Infinity},
  ];
  var addArgsAndJson = function(testCase) {
    testCase.args = Array(4).fill(testCase.value);
    testCase.json = {'value': testCase.value, 'min': testCase.value,
      'max': testCase.value, 'precision': testCase.value};
  };
  invalidValueTestCases.forEach(addArgsAndJson);
  validValueTestCases.forEach(addArgsAndJson);

  /**
   * The expected default value for the field being tested.
   * @type {*}
   */
  var defaultFieldValue = 0;
  /**
   * Asserts that the field property values are as expected.
   * @param {!Blockly.FieldNumber} field The field to check.
   * @param {!number} expectedMin The expected min.
   * @param {!number} expectedMax The expected max.
   * @param {!number} expectedPrecision The expected precision.
   * @param {!number} expectedValue The expected value.
   */
  function assertNumberField(field, expectedMin, expectedMax,
      expectedPrecision, expectedValue) {
    testHelpers.assertFieldValue(field, expectedValue);
    chai.assert.equal(field.getMin(), expectedMin, 'Min');
    chai.assert.equal(field.getMax(), expectedMax, 'Max');
    chai.assert.equal(
        field.getPrecision(), expectedPrecision, 'Precision');
  }
  /**
   * Asserts that the field property values are set to default.
   * @param {!Blockly.FieldNumber} field The field to check.
   */
  var assertFieldDefault = function(field) {
    assertNumberField(field, -Infinity, Infinity, 0, defaultFieldValue);
  };
  /**
   * Asserts that the field properties are correct based on the test case.
   * @param {!Blockly.FieldNumber} field The field to check.
   * @param {!FieldValueTestCase} testCase The test case.
   */
  var validTestCaseAssertField = function(field, testCase) {
    assertNumberField(
        field, testCase.expectedValue, testCase.expectedValue,
        testCase.expectedValue, testCase.expectedValue);
  };

  testHelpers.runConstructorSuiteTests(
      Blockly.FieldNumber, validValueTestCases, invalidValueTestCases,
      validTestCaseAssertField, assertFieldDefault);

  testHelpers.runFromJsonSuiteTests(
      Blockly.FieldNumber, validValueTestCases,invalidValueTestCases,
      validTestCaseAssertField, assertFieldDefault);

  suite('setValue', function() {
    suite('Empty -> New Value', function() {
      setup(function() {
        this.field = new Blockly.FieldNumber();
      });
      testHelpers.runSetValueTests(
          validValueTestCases, invalidValueTestCases, defaultFieldValue);
    });
    suite('Value -> New Value', function() {
      var initialValue = 1;
      setup(function() {
        this.field = new Blockly.FieldNumber(initialValue);
      });
      testHelpers.runSetValueTests(
          validValueTestCases, invalidValueTestCases, initialValue);
    });
    suite('Constraints', function() {
      var testCases = [
        {title: 'Float', json: {}, value: 123.456, expectedValue: 123.456},
        {title: '0.01', json: {precision: .01}, value: 123.456,
          expectedValue: 123.46},
        {title: '1e-7', json: {precision: .0000001}, value: 123.00000456,
          expectedValue: 123.0000046},
        {title: '0.5', json: {precision: .5}, value: 123.456,
          expectedValue: 123.5},
        {title: '1', json: {precision: 1}, value: 123.456,
          expectedValue: 123},
        {title: '1.5', json: {precision: 1.5}, value: 123.456,
          expectedValue: 123},
      ];
      suite('Precision', function() {
        testHelpers.runTestCases(testCases, function(testCase) {
          return function() {
            var field = Blockly.FieldNumber.fromJson(testCase.json);
            field.setValue(testCase.value);
            testHelpers.assertFieldValue(field, testCase.expectedValue);
          };
        });
        test('Null', function() {
          var field = Blockly.FieldNumber.fromJson({precision: null});
          chai.assert.equal(field.getPrecision(), 0);
        });
      });
      var setValueBoundsTestFn = function(testCase) {
        return function() {
          var field = Blockly.FieldNumber.fromJson(testCase.json);
          testCase.values.forEach(function(value, i) {
            field.setValue(value);
            testHelpers.assertFieldValue(
                field, testCase.expectedValues[i]);
          });
        };
      };
      suite('Min', function() {
        var testCases = [
          {title: '-10', json: {min: -10}, values: [-20, 0, 20],
            expectedValues: [-10, 0, 20]},
          {title: '0', json: {min: 0}, values: [-20, 0, 20],
            expectedValues: [0, 0, 20]},
          {title: '+10', json: {min: 10}, values: [-20, 0, 20],
            expectedValues: [10, 10, 20]},
        ];
        testHelpers.runTestCases(testCases, setValueBoundsTestFn);
        test('Null', function() {
          var field = Blockly.FieldNumber.fromJson({min: null});
          chai.assert.equal(field.getMin(), -Infinity);
        });
      });
      suite('Max', function() {
        var testCases = [
          {title: '-10', json: {max: -10}, values: [-20, 0, 20],
            expectedValues: [-20, -10, -10]},
          {title: '0', json: {max: 0}, values: [-20, 0, 20],
            expectedValues: [-20, 0, 0]},
          {title: '+10', json: {max: 10}, values: [-20, 0, 20],
            expectedValues: [-20, 0, 10]},
        ];
        testHelpers.runTestCases(testCases, setValueBoundsTestFn);
        test('Null', function() {
          var field = Blockly.FieldNumber.fromJson({max: null});
          chai.assert.equal(field.getMax(), Infinity);
        });
      });
    });
  });
  suite('Validators', function() {
    setup(function() {
      this.field = new Blockly.FieldNumber(1);
      this.field.htmlInput_ = Object.create(null);
      this.field.htmlInput_.oldValue_ = '1';
      this.field.htmlInput_.untypedDefaultValue_ = 1;
      this.stub = sinon.stub(this.field, 'resizeEditor_');
    });
    teardown(function() {
      sinon.restore();
    });
    var testSuites = [
      {title: 'Null Validator',
        validator:
            function() {
              return null;
            },
        value: 2, expectedValue: 1},
      {title: 'Force End with 6 Validator',
        validator:
            function(newValue) {
              return String(newValue).replace(/.$/, '6');
            },
        value: 25, expectedValue: 26},
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
          testHelpers.assertFieldValue(
              this.field, suiteInfo.expectedValue, String(suiteInfo.value));
        });
        test('When Not Editing', function() {
          this.field.setValue(suiteInfo.value);
          testHelpers.assertFieldValue(this.field, suiteInfo.expectedValue);
        });
      });
    });
  });
  suite('Customizations', function() {
    suite('Min', function() {
      test('JS Constructor', function() {
        var field = new Blockly.FieldNumber(0, -10);
        assertNumberField(field, -10, Infinity, 0, 0);
      });
      test('JSON Definition', function() {
        var field = Blockly.FieldNumber.fromJson({
          min: -10,
        });
        assertNumberField(field, -10, Infinity, 0, 0);
      });
      test('Set Constraints', function() {
        var field = new Blockly.FieldNumber();
        field.setConstraints(-10);
        assertNumberField(field, -10, Infinity, 0, 0);
      });
      test('Set Min', function() {
        var field = new Blockly.FieldNumber();
        field.setMin(-10);
        assertNumberField(field, -10, Infinity, 0, 0);
      });
      test('JS Configuration - Simple', function() {
        var field = new Blockly.FieldNumber(
            undefined, undefined, undefined, undefined, undefined, {
              min: -10
            });
        assertNumberField(field, -10, Infinity, 0, 0);
      });
      test('JS Configuration - Ignore', function() {
        var field = new Blockly.FieldNumber(
            undefined, -1, undefined, undefined, undefined, {
              min: -10
            });
        assertNumberField(field, -10, Infinity, 0, 0);
      });
    });
    suite('Max', function() {
      test('JS Constructor', function() {
        var field = new Blockly.FieldNumber(0, undefined, 10);
        assertNumberField(field, -Infinity, 10, 0, 0);
      });
      test('JSON Definition', function() {
        var field = Blockly.FieldNumber.fromJson({
          max: 10,
        });
        assertNumberField(field, -Infinity, 10, 0, 0);
      });
      test('Set Constraints', function() {
        var field = new Blockly.FieldNumber();
        field.setConstraints(undefined, 10);
        assertNumberField(field, -Infinity, 10, 0, 0);
      });
      test('Set Max', function() {
        var field = new Blockly.FieldNumber();
        field.setMax(10);
        assertNumberField(field, -Infinity, 10, 0, 0);
      });
      test('JS Configuration - Simple', function() {
        var field = new Blockly.FieldNumber(
            undefined, undefined, undefined, undefined, undefined, {
              max: 10
            });
        assertNumberField(field, -Infinity, 10, 0, 0);
      });
      test('JS Configuration - Ignore', function() {
        var field = new Blockly.FieldNumber(
            undefined, undefined, 1, undefined, undefined, {
              max: 10
            });
        assertNumberField(field, -Infinity, 10, 0, 0);
      });
    });
    suite('Precision', function() {
      test('JS Constructor', function() {
        var field = new Blockly.FieldNumber(0, undefined, undefined, 1);
        assertNumberField(field, -Infinity, Infinity, 1, 0);
      });
      test('JSON Definition', function() {
        var field = Blockly.FieldNumber.fromJson({
          precision: 1,
        });
        assertNumberField(field, -Infinity, Infinity, 1, 0);
      });
      test('Set Constraints', function() {
        var field = new Blockly.FieldNumber();
        field.setConstraints(undefined, undefined, 1);
        assertNumberField(field, -Infinity, Infinity, 1, 0);
      });
      test('Set Precision', function() {
        var field = new Blockly.FieldNumber();
        field.setPrecision(1);
        assertNumberField(field, -Infinity, Infinity, 1, 0);
      });
      test('JS Configuration - Simple', function() {
        var field = new Blockly.FieldNumber(
            undefined, undefined, undefined, undefined, undefined, {
              precision: 1
            });
        assertNumberField(field, -Infinity, Infinity, 1, 0);
      });
      test('JS Configuration - Ignore', function() {
        var field = new Blockly.FieldNumber(
            undefined, undefined, undefined, .5, undefined, {
              precision: 1
            });
        assertNumberField(field, -Infinity, Infinity, 1, 0);
      });
    });
  });
});
