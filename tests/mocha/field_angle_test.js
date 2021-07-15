/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

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
  var invalidValueTestCases = [
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

  var validValueTestCases = [
    {title: 'Integer', value: 1, expectedValue: 1},
    {title: 'Float', value: 1.5, expectedValue: 1.5},
    {title: 'Integer String', value: '1', expectedValue: 1},
    {title: 'Float String', value: '1.5', expectedValue: 1.5},
    {title: '> 360°', value: 362, expectedValue: 2},
  ];
  var addArgsAndJson = function(testCase) {
    testCase.args = [testCase.value];
    testCase.json = {'angle': testCase.value};
  };
  invalidValueTestCases.forEach(addArgsAndJson);
  validValueTestCases.forEach(addArgsAndJson);

  /**
   * The expected default value for the field being tested.
   * @type {*}
   */
  var defaultFieldValue = 0;
  /**
   * Asserts that the field property values are set to default.
   * @param {FieldTemplate} field The field to check.
   */
  var assertFieldDefault = function(field) {
    testHelpers.assertFieldValue(field, defaultFieldValue);
  };
  /**
   * Asserts that the field properties are correct based on the test case.
   * @param {!Blockly.FieldAngle} field The field to check.
   * @param {!FieldValueTestCase} testCase The test case.
   */
  var validTestCaseAssertField = function(field, testCase) {
    testHelpers.assertFieldValue(field, testCase.expectedValue);
  };

  testHelpers.runConstructorSuiteTests(
      Blockly.FieldAngle, validValueTestCases, invalidValueTestCases,
      validTestCaseAssertField, assertFieldDefault);

  testHelpers.runFromJsonSuiteTests(
      Blockly.FieldAngle, validValueTestCases,invalidValueTestCases,
      validTestCaseAssertField, assertFieldDefault);

  suite('setValue', function() {
    suite('Empty -> New Value', function() {
      setup(function() {
        this.field = new Blockly.FieldAngle();
      });
      testHelpers.runSetValueTests(
          validValueTestCases, invalidValueTestCases, defaultFieldValue);
      test('With source block', function() {
        this.field.setSourceBlock(createTestBlock());
        this.field.setValue(2.5);
        testHelpers.assertFieldValue(this.field, 2.5);
      });
    });
    suite('Value -> New Value', function() {
      var initialValue = 1;
      setup(function() {
        this.field = new Blockly.FieldAngle(initialValue);
      });
      testHelpers.runSetValueTests(
          validValueTestCases, invalidValueTestCases, initialValue);
      test('With source block', function() {
        this.field.setSourceBlock(createTestBlock());
        this.field.setValue(2.5);
        testHelpers.assertFieldValue(this.field, 2.5);
      });
    });
  });
  suite('Validators', function() {
    setup(function() {
      this.field = new Blockly.FieldAngle(1);
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
    suite('Clockwise', function() {
      test('JS Configuration', function() {
        var field = new Blockly.FieldAngle(0, null, {
          clockwise: true
        });
        chai.assert.isTrue(field.clockwise_);
      });
      test('JSON Definition', function() {
        var field = Blockly.FieldAngle.fromJson({
          value: 0,
          clockwise: true
        });
        chai.assert.isTrue(field.clockwise_);
      });
      test('Constant', function() {
        // Note: Generally constants should be set at compile time, not
        // runtime (since they are constants) but for testing purposes we
        // can do this.
        Blockly.FieldAngle.CLOCKWISE = true;
        var field = new Blockly.FieldAngle();
        chai.assert.isTrue(field.clockwise_);
      });
    });
    suite('Offset', function() {
      test('JS Configuration', function() {
        var field = new Blockly.FieldAngle(0, null, {
          offset: 90
        });
        chai.assert.equal(field.offset_, 90);
      });
      test('JSON Definition', function() {
        var field = Blockly.FieldAngle.fromJson({
          value: 0,
          offset: 90
        });
        chai.assert.equal(field.offset_, 90);
      });
      test('Constant', function() {
        // Note: Generally constants should be set at compile time, not
        // runtime (since they are constants) but for testing purposes we
        // can do this.
        Blockly.FieldAngle.OFFSET = 90;
        var field = new Blockly.FieldAngle();
        chai.assert.equal(field.offset_, 90);
      });
      test('Null', function() {
        // Note: Generally constants should be set at compile time, not
        // runtime (since they are constants) but for testing purposes we
        // can do this.
        Blockly.FieldAngle.OFFSET = 90;
        var field = Blockly.FieldAngle.fromJson({
          value: 0,
          offset: null
        });
        chai.assert.equal(field.offset_, 90);
      });
    });
    suite('Wrap', function() {
      test('JS Configuration', function() {
        var field = new Blockly.FieldAngle(0, null, {
          wrap: 180
        });
        chai.assert.equal(field.wrap_, 180);
      });
      test('JSON Definition', function() {
        var field = Blockly.FieldAngle.fromJson({
          value: 0,
          wrap: 180
        });
        chai.assert.equal(field.wrap_, 180);
      });
      test('Constant', function() {
        // Note: Generally constants should be set at compile time, not
        // runtime (since they are constants) but for testing purposes we
        // can do this.
        Blockly.FieldAngle.WRAP = 180;
        var field = new Blockly.FieldAngle();
        chai.assert.equal(field.wrap_, 180);
      });
      test('Null', function() {
        // Note: Generally constants should be set at compile time, not
        // runtime (since they are constants) but for testing purposes we
        // can do this.
        Blockly.FieldAngle.WRAP = 180;
        var field = Blockly.FieldAngle.fromJson({
          value: 0,
          wrap: null
        });
        chai.assert.equal(field.wrap_, 180);
      });
    });
    suite('Round', function() {
      test('JS Configuration', function() {
        var field = new Blockly.FieldAngle(0, null, {
          round: 30
        });
        chai.assert.equal(field.round_, 30);
      });
      test('JSON Definition', function() {
        var field = Blockly.FieldAngle.fromJson({
          value: 0,
          round: 30
        });
        chai.assert.equal(field.round_, 30);
      });
      test('Constant', function() {
        // Note: Generally constants should be set at compile time, not
        // runtime (since they are constants) but for testing purposes we
        // can do this.
        Blockly.FieldAngle.ROUND = 30;
        var field = new Blockly.FieldAngle();
        chai.assert.equal(field.round_, 30);
      });
      test('Null', function() {
        // Note: Generally constants should be set at compile time, not
        // runtime (since they are constants) but for testing purposes we
        // can do this.
        Blockly.FieldAngle.ROUND = 30;
        var field = Blockly.FieldAngle.fromJson({
          value: 0,
          round: null
        });
        chai.assert.equal(field.round_, 30);
      });
    });
    suite('Mode', function() {
      suite('Compass', function() {
        test('JS Configuration', function() {
          var field = new Blockly.FieldAngle(0, null, {
            mode: 'compass'
          });
          chai.assert.equal(field.offset_, 90);
          chai.assert.isTrue(field.clockwise_);
        });
        test('JS Configuration', function() {
          var field = Blockly.FieldAngle.fromJson({
            value: 0,
            mode: 'compass'
          });
          chai.assert.equal(field.offset_, 90);
          chai.assert.isTrue(field.clockwise_);
        });
      });
      suite('Protractor', function() {
        test('JS Configuration', function() {
          var field = new Blockly.FieldAngle(0, null, {
            mode: 'protractor'
          });
          chai.assert.equal(field.offset_, 0);
          chai.assert.isFalse(field.clockwise_);
        });
        test('JS Configuration', function() {
          var field = Blockly.FieldAngle.fromJson({
            value: 0,
            mode: 'protractor'
          });
          chai.assert.equal(field.offset_, 0);
          chai.assert.isFalse(field.clockwise_);
        });
      });
    });
  });
});
