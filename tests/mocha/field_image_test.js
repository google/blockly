/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.module('Blockly.test.fieldImage');

const {assertFieldValue, runConstructorSuiteTests, runFromJsonSuiteTests, runSetValueTests} = goog.require('Blockly.test.helpers.fields');
const {sharedTestSetup, sharedTestTeardown} = goog.require('Blockly.test.helpers.setupTeardown');


suite('Image Fields', function() {
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
    {title: 'Undefined Src', value: undefined, args: [undefined, 1, 1]},
    {title: 'Undefined Size', value: 'src', args: ['src', undefined, undefined]},
    {title: 'Zero Size', value: 'src', args: ['src', 0, 0]},
    {title: 'Non-Parsable String for Size', value: 'src', args: ['src', 'bad', 'bad']},
  ];
  /**
   * Configuration for field tests with valid values.
   * @type {!Array<!FieldCreationTestCase>}
   */
  const validValueCreationTestCases = [
    {title: 'With Alt', value: 'src', expectedValue: 'src',
      args: ['src', 1, 1, 'alt'], expectedText: 'alt'},
    {title: 'Without Alt', value: 'src', expectedValue: 'src',
      args: ['src', 1, 1], expectedText: ''},
  ];
  /**
   * Adds json property to test cases based on args property.
   * @param {!Array<!FieldCreationTestCase>} testCase The test case to modify.
   */
  const addJson = function(testCase) {
    testCase.json = {'src': testCase.args[0], 'width': testCase.args[1],
      'height': testCase.args[2]};
    if (testCase.args[3]) {
      testCase.json['alt'] = testCase.args[3];
    }
  };
  invalidValueTestCases.forEach(addJson);
  validValueCreationTestCases.forEach(addJson);

  /**
   * Asserts that the field properties are correct based on the test case.
   * @param {!Blockly.FieldImage} field The field to check.
   * @param {!FieldValueTestCase} testCase The test case.
   */
  const validTestCaseAssertField = function(field, testCase) {
    assertFieldValue(field, testCase.expectedValue, testCase.expectedText);
  };

  runConstructorSuiteTests(
      Blockly.FieldImage, validValueCreationTestCases, invalidValueTestCases,
      validTestCaseAssertField);

  runFromJsonSuiteTests(
      Blockly.FieldImage, validValueCreationTestCases, invalidValueTestCases,
      validTestCaseAssertField);

  /**
   * Configuration for field tests with valid values.
   * @type {!Array<!FieldValueTestCase>}
   */
  const validValueSetValueTestCases = [
    {title: 'Good src', value: 'newSrc', expectedValue: 'newSrc',
      expectedText: 'alt'},
  ];

  suite('setValue', function() {
    setup(function() {
      this.field = new Blockly.FieldImage('src', 1, 1, 'alt');
    });
    runSetValueTests(
        validValueSetValueTestCases, invalidValueTestCases, 'src', 'alt');
  });

  suite('Customizations', function() {
    suite('On Click Handler', function() {
      setup(function() {
        this.onClick = function() {
          console.log('on click');
        };
      });
      test('JS Constructor', function() {
        const field = new Blockly.FieldImage('src', 10, 10, null, this.onClick);
        chai.assert.equal(field.clickHandler_, this.onClick);
      });
      test('setOnClickHandler', function() {
        const field = new Blockly.FieldImage('src', 10, 10);
        field.setOnClickHandler(this.onClick);
        chai.assert.equal(field.clickHandler_, this.onClick);
      });
      test('Remove Click Handler', function() {
        const field = new Blockly.FieldImage('src', 10, 10, null, this.onClick);
        field.setOnClickHandler(null);
        chai.assert.isNull(field.clickHandler_);
      });
    });
    suite('Alt', function() {
      test('JS Constructor', function() {
        const field = new Blockly.FieldImage('src', 10, 10, 'alt');
        chai.assert.equal(field.altText_, 'alt');
      });
      test('JSON Definition', function() {
        const field = Blockly.FieldImage.fromJson({
          src: 'src',
          width: 10,
          height: 10,
          alt: 'alt',
        });
        chai.assert.equal(field.altText_, 'alt');
      });
      suite('SetAlt', function() {
        setup(function() {
          this.imageField = new Blockly.FieldImage('src', 10, 10, 'alt');
        });
        test('Null', function() {
          this.imageField.setAlt(null);
          assertFieldValue(this.imageField, 'src', '');
        });
        test('Empty String', function() {
          this.imageField.setAlt('');
          assertFieldValue(this.imageField, 'src', '');
        });
        test('Good Alt', function() {
          this.imageField.setAlt('newAlt');
          assertFieldValue(this.imageField, 'src', 'newAlt');
        });
      });
      test('JS Configuration - Simple', function() {
        const field = new Blockly.FieldImage('src', 10, 10, null, null, null, {
          alt: 'alt',
        });
        chai.assert.equal(field.altText_, 'alt');
      });
      test('JS Configuration - Ignore', function() {
        const field = new Blockly.FieldImage('src', 10, 10, 'alt', null, null, {
          alt: 'configAlt',
        });
        chai.assert.equal(field.altText_, 'configAlt');
      });
      test('JS Configuration - Ignore - \'\'', function() {
        const field = new Blockly.FieldImage('src', 10, 10, '', null, null, {
          alt: 'configAlt',
        });
        chai.assert.equal(field.altText_, 'configAlt');
      });
      test('JS Configuration - Ignore - Config \'\'', function() {
        const field = new Blockly.FieldImage('src', 10, 10, 'alt', null, null, {
          alt: '',
        });
        chai.assert.equal(field.altText_, '');
      });
    });
    suite('Flip RTL', function() {
      test('JS Constructor', function() {
        const field = new Blockly.FieldImage('src', 10, 10, null, null, true);
        chai.assert.isTrue(field.getFlipRtl());
      });
      test('JSON Definition', function() {
        const field = Blockly.FieldImage.fromJson({
          src: 'src',
          width: 10,
          height: 10,
          flipRtl: true,
        });
        chai.assert.isTrue(field.getFlipRtl());
      });
      test('JS Configuration - Simple', function() {
        const field = new Blockly.FieldImage('src', 10, 10, null, null, null, {
          flipRtl: true,
        });
        chai.assert.isTrue(field.getFlipRtl());
      });
      test('JS Configuration - Ignore - True', function() {
        const field = new Blockly.FieldImage('src', 10, 10, null, null, true, {
          flipRtl: false,
        });
        chai.assert.isFalse(field.getFlipRtl());
      });
      test('JS Configuration - Ignore - False', function() {
        const field = new Blockly.FieldImage('src', 10, 10, null, null, false, {
          flipRtl: true,
        });
        chai.assert.isTrue(field.getFlipRtl());
      });
    });
  });
});
