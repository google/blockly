/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('Checkbox Fields', function() {
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
    {title: 'Integer', value: 1},
    {title: 'Float', value: 1.5},
    {title: 'String true', value: 'true'},
    {title: 'String false', value: 'false'},
  ];
  /**
   * Configuration for field tests with valid values.
   * @type {!Array<!FieldCreationTestCase>}
   */
  var validValueTestCases = [
    {title: 'Boolean true', value: true, expectedValue: 'TRUE'},
    {title: 'Boolean false', value: false, expectedValue: 'FALSE'},
    {title: 'String TRUE', value: 'TRUE', expectedValue: 'TRUE'},
    {title: 'String FALSE', value: 'FALSE', expectedValue: 'FALSE'},
  ];
  var addArgsAndJson = function(testCase) {
    testCase.args = [testCase.value];
    testCase.json = {'checked': testCase.value};
  };
  invalidValueTestCases.forEach(addArgsAndJson);
  validValueTestCases.forEach(addArgsAndJson);

  /**
   * The expected default value for the field being tested.
   * @type {*}
   */
  var defaultFieldValue = 'FALSE';
  /**
   * Asserts that the field property values are set to default.
   * @param {!Blockly.FieldNumber} field The field to check.
   */
  var assertFieldDefault = function(field) {
    testHelpers.assertFieldValue(
        field, defaultFieldValue, defaultFieldValue.toLowerCase());
  };
  /**
   * Asserts that the field properties are correct based on the test case.
   * @param {!Blockly.FieldNumber} field The field to check.
   * @param {!FieldValueTestCase} testCase The test case.
   */
  var validTestCaseAssertField = function(field, testCase) {
    testHelpers.assertFieldValue(
        field, testCase.expectedValue, testCase.expectedValue.toLowerCase());
  };

  testHelpers.runConstructorSuiteTests(
      Blockly.FieldCheckbox, validValueTestCases, invalidValueTestCases,
      validTestCaseAssertField, assertFieldDefault);

  testHelpers.runFromJsonSuiteTests(
      Blockly.FieldCheckbox, validValueTestCases,invalidValueTestCases,
      validTestCaseAssertField, assertFieldDefault);
  
  suite('setValue', function() {
    suite('True -> New Value', function() {
      setup(function() {
        this.checkboxField = new Blockly.FieldCheckbox('TRUE');
      });
      test('Null', function() {
        this.checkboxField.setValue(null);
        testHelpers.assertFieldValue(this.checkboxField, 'TRUE', 'true');
      });
      test('Undefined', function() {
        this.checkboxField.setValue(undefined);
        testHelpers.assertFieldValue(this.checkboxField, 'TRUE', 'true');
      });
      test('Non-Parsable String', function() {
        this.checkboxField.setValue('bad');
        testHelpers.assertFieldValue(this.checkboxField, 'TRUE', 'true');
      });
      test('False', function() {
        this.checkboxField.setValue('FALSE');
        testHelpers.assertFieldValue(this.checkboxField, 'FALSE', 'false');
      });
      test('With source block', function() {
        this.checkboxField.setSourceBlock(createTestBlock());
        this.checkboxField.setValue('FALSE');
        testHelpers.assertFieldValue(this.checkboxField, 'FALSE', 'false');
      });
    });
    suite('False -> New Value', function() {
      setup(function() {
        this.checkboxField = new Blockly.FieldCheckbox('FALSE');
      });
      test('Null', function() {
        this.checkboxField.setValue(null);
        testHelpers.assertFieldValue(this.checkboxField, 'FALSE', 'false');
      });
      test('Undefined', function() {
        this.checkboxField.setValue(undefined);
        testHelpers.assertFieldValue(this.checkboxField, 'FALSE', 'false');
      });
      test('Non-Parsable String', function() {
        this.checkboxField.setValue('bad');
        testHelpers.assertFieldValue(this.checkboxField, 'FALSE', 'false');
      });
      test('True', function() {
        this.checkboxField.setValue('TRUE');
        testHelpers.assertFieldValue(this.checkboxField, 'TRUE', 'true');
      });
    });
  });
  suite('Validators', function() {
    setup(function() {
      this.field = new Blockly.FieldCheckbox(true);
    });
    var testSuites = [
      {title: 'Null Validator',
        validator:
            function() {
              return null;
            },
        value: 'FALSE', expectedValue: 'TRUE'},
      {title: 'Always True Validator',
        validator:
            function() {
              return 'TRUE';
            },
        value: 'FALSE', expectedValue: 'TRUE'},
      {title: 'Always False Validator',
        validator:
            function() {
              return 'TRUE';
            },
        value: 'FALSE', expectedValue: 'TRUE'},
      {title: 'Returns Undefined Validator', validator: function() {},
        value: 'FALSE', expectedValue: 'FALSE'},
    ];
    testSuites.forEach(function(suiteInfo) {
      suite(suiteInfo.title, function() {
        setup(function() {
          this.field.setValidator(suiteInfo.validator);
        });
        test('New Value', function() {
          this.field.setValue(suiteInfo.value);
          testHelpers.assertFieldValue(
              this.field, suiteInfo.expectedValue,
              String(suiteInfo.expectedValue).toLowerCase());
        });
      });
    });
  });
  suite('Customizations', function() {
    suite('Check Character', function() {
      function assertCharacter(field, char) {
        field.fieldGroup_ = Blockly.utils.dom.createSvgElement(
            Blockly.utils.Svg.G, {}, null);
        field.sourceBlock_ = {
          RTL: false,
          rendered: true,
          workspace: {
            keyboardAccessibilityMode: false
          },
          render: function() { field.render_(); },
          bumpNeighbours: function() {}
        };
        field.constants_ = {
          FIELD_CHECKBOX_X_OFFSET: 2,
          FIELD_CHECKBOX_Y_OFFSET: 2,
          FIELD_BORDER_RECT_RADIUS: 4,
          FIELD_BORDER_RECT_HEIGHT: 16,
          FIELD_TEXT_BASELINE_CENTER: false,
          FIELD_TEXT_HEIGHT: 16,
          FIELD_TEXT_BASELINE: 13,
        };
        field.initView();
        field.render_();
        chai.assert(field.textContent_.nodeValue, char);
      }
      test('Constant', function() {
        var checkChar = Blockly.FieldCheckbox.CHECK_CHAR;
        // Note: Developers shouldn't actually do this. IMO they should change
        // the file and then recompile. But this is fine for testing.
        Blockly.FieldCheckbox.CHECK_CHAR = '\u2661';
        var field = new Blockly.FieldCheckbox(true);
        assertCharacter(field, '\u2661');
        Blockly.FieldCheckbox.CHECK_CHAR = checkChar;
      });
      test('JS Constructor', function() {
        var field = new Blockly.FieldCheckbox(true, null, {
          checkCharacter: '\u2661'
        });
        assertCharacter(field, '\u2661');
      });
      test('JSON Definition', function() {
        var field = Blockly.FieldCheckbox.fromJson({
          checkCharacter: '\u2661'
        });
        assertCharacter(field, '\u2661');
      });
      test('setCheckCharacter', function() {
        var field = new Blockly.FieldCheckbox();
        assertCharacter(field, Blockly.FieldCheckbox.CHECK_CHAR);
        field.setCheckCharacter('\u2661');
        // Don't call assertCharacter b/c we don't want to re-initialize.
        chai.assert.equal(field.textContent_.nodeValue, '\u2661');
      });
      test('setCheckCharacter Before Init', function() {
        var field = new Blockly.FieldCheckbox();
        field.setCheckCharacter('\u2661');
        assertCharacter(field, '\u2661');
      });
      test('Remove Custom Character', function() {
        var field = new Blockly.FieldCheckbox(true, null, {
          'checkCharacter': '\u2661'
        });
        assertCharacter(field, '\u2661');
        field.setCheckCharacter(null);
        chai.assert(field.textContent_.nodeValue,
            Blockly.FieldCheckbox.CHECK_CHAR);
      });
    });
  });
});
