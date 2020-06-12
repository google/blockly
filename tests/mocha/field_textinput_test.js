/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('Text Input Fields', function() {
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
      Blockly.FieldTextInput, validValueTestCases, invalidValueTestCases,
      validTestCaseAssertField, assertFieldDefault);

  testHelpers.runFromJsonSuiteTests(
      Blockly.FieldTextInput, validValueTestCases,invalidValueTestCases,
      validTestCaseAssertField, assertFieldDefault);

  suite('setValue', function() {
    suite('Empty -> New Value', function() {
      setup(function() {
        this.field = new Blockly.FieldTextInput();
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
        this.field = new Blockly.FieldTextInput(initialValue);
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

  suite('Validators', function() {
    setup(function() {
      this.field = new Blockly.FieldTextInput('value');
      this.field.htmlInput_ = Object.create(null);
      this.field.htmlInput_.oldValue_ = 'value';
      this.field.htmlInput_.untypedDefaultValue_ = 'value';
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
        value: 'newValue', expectedValue: 'value'},
      {title: 'Remove \'a\' Validator',
        validator:
            function(newValue) {
              return newValue.replace(/a/g, '');
            },
        value: 'bbbaaa', expectedValue: 'bbb'},
      {title: 'Returns Undefined Validator', validator: function() {},
        value: 'newValue', expectedValue: 'newValue', expectedText: 'newValue'},
    ];
    testSuites.forEach(function(suiteInfo) {
      suite(suiteInfo.title, function() {
        setup(function() {
          this.field.setValidator(suiteInfo.validator);
        });
        test('When Editing', function() {
          this.field.isBeingEdited_ = true;
          this.field.htmlInput_.value = suiteInfo.value;
          this.field.onHtmlInputChange_(null);
          testHelpers.assertFieldValue(
              this.field, suiteInfo.expectedValue, suiteInfo.value);
        });
        test('When Not Editing', function() {
          this.field.setValue(suiteInfo.value);
          testHelpers.assertFieldValue(this.field, suiteInfo.expectedValue);
        });
      });
    });
  });

  suite('Customization', function() {
    suite('Spellcheck', function() {
      setup(function() {
        this.prepField = function(field) {
          var workspace = {
            getScale: function() {
              return 1;
            },
            getRenderer: function() { return {
              getClassName: function() { return ''; }
            }; },
            getTheme: function() { return {
              getClassName: function() { return ''; }
            }; },
            markFocused: function() {}
          };
          field.sourceBlock_ = {
            workspace: workspace
          };
          field.constants_ = {
            FIELD_TEXT_FONTSIZE: 11,
            FIELD_TEXT_FONTWEIGHT: 'normal',
            FIELD_TEXT_FONTFAMILY: 'sans-serif'
          };
          field.clickTarget_ = document.createElement('div');
          Blockly.mainWorkspace = workspace;
          Blockly.WidgetDiv.DIV = document.createElement('div');
          this.stub = sinon.stub(field, 'resizeEditor_');
        };

        this.assertSpellcheck = function(field, value) {
          this.prepField(field);
          field.showEditor_();
          chai.assert.equal(field.htmlInput_.getAttribute('spellcheck'),
              value.toString());
        };
      });
      teardown(function() {
        if (this.stub) {
          this.stub.restore();
        }
      });
      test('Default', function() {
        var field = new Blockly.FieldTextInput('test');
        this.assertSpellcheck(field, true);
      });
      test('JS Constructor', function() {
        var field = new Blockly.FieldTextInput('test', null, {
          spellcheck: false
        });
        this.assertSpellcheck(field, false);
      });
      test('JSON Definition', function() {
        var field = Blockly.FieldTextInput.fromJson({
          text: 'test',
          spellcheck: false
        });
        this.assertSpellcheck(field, false);
      });
      test('setSpellcheck Editor Hidden', function() {
        var field = new Blockly.FieldTextInput('test');
        field.setSpellcheck(false);
        this.assertSpellcheck(field, false);
      });
      test('setSpellcheck Editor Shown', function() {
        var field = new Blockly.FieldTextInput('test');
        this.prepField(field);
        field.showEditor_();
        field.setSpellcheck(false);
        chai.assert.equal(field.htmlInput_.getAttribute('spellcheck'), 'false');
      });
    });
  });
});
