/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2019 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

suite ('Number Fields', function() {
  function assertValue(numberField, expectedValue, opt_expectedText) {
    var actualValue = numberField.getValue();
    var actualText = numberField.getText();
    opt_expectedText = opt_expectedText || String(expectedValue);
    assertEquals(String(actualValue), String(expectedValue));
    assertEquals(parseFloat(actualValue), expectedValue);
    assertEquals(actualText, opt_expectedText);
  }
  function assertValueDefault(numberFieldField) {
    assertValue(numberFieldField, 0);
  }
  function assertNumberField(numberField, expectedMin, expectedMax,
      expectedPrecision, expectedValue) {
    assertValue(numberField, expectedValue);
    assertEquals(numberField.min_, expectedMin);
    assertEquals(numberField.max_, expectedMax);
    assertEquals(numberField.precision_, expectedPrecision);
  }
  function assertNumberFieldDefault(numberField) {
    assertNumberField(numberField, -Infinity, Infinity, 0, 0);
  }
  function createNumberFieldSameValuesConstructor(value) {
    return new Blockly.FieldNumber(value, value, value, value);
  }
  function createNumberFieldSameValuesJson(value) {
    return Blockly.FieldNumber.fromJson(
        { 'value': value, min: value, max: value, precision: value });
  }
  function assertNumberFieldSameValues(numberField, value) {
    assertNumberField(numberField,  value, value, value, value);
  }
  suite('Constructor', function() {
    test('Empty', function() {
      var numberField = new Blockly.FieldNumber();
      assertNumberFieldDefault(numberField);
    });
    test('Null', function() {
      var numberField = createNumberFieldSameValuesConstructor(null);
      assertNumberFieldDefault(numberField);
    });
    test('Undefined', function() {
      var numberField = createNumberFieldSameValuesConstructor(undefined);
      assertNumberFieldDefault(numberField);
    });
    test('Non-Parsable String', function() {
      var numberField = createNumberFieldSameValuesConstructor('bad');
      assertNumberFieldDefault(numberField);
    });
    test('NaN', function() {
      var numberField = createNumberFieldSameValuesConstructor(NaN);
      assertNumberFieldDefault(numberField);
    });
    test('Integer', function() {
      var numberField = createNumberFieldSameValuesConstructor(1);
      assertNumberFieldSameValues(numberField, 1);
    });
    test('Float', function() {
      var numberField = createNumberFieldSameValuesConstructor(1.5);
      assertNumberFieldSameValues(numberField, 1.5);
    });
    test('Integer String', function() {
      var numberField = createNumberFieldSameValuesConstructor('1');
      assertNumberFieldSameValues(numberField, 1);
    });
    test('Float String', function() {
      var numberField = createNumberFieldSameValuesConstructor('1.5');
      assertNumberFieldSameValues(numberField, 1.5);
    });
  });
  suite('fromJson', function() {
    test('Empty', function() {
      var numberField = Blockly.FieldNumber.fromJson({});
      assertNumberFieldDefault(numberField);
    });
    test('Null', function() {
      var numberField = createNumberFieldSameValuesJson(null);
      assertNumberFieldDefault(numberField);
    });
    test('Undefined', function() {
      var numberField = createNumberFieldSameValuesJson(undefined);
      assertNumberFieldDefault(numberField);
    });
    test('Non-Parsable String', function() {
      var numberField = createNumberFieldSameValuesJson('bad');
      assertNumberFieldDefault(numberField);
    });
    test('NaN', function() {
      var numberField = createNumberFieldSameValuesJson(NaN);
      assertNumberFieldDefault(numberField);
    });
    test('Integer', function() {
      var numberField = createNumberFieldSameValuesJson(1);
      assertNumberFieldSameValues(numberField, 1);
    });
    test('Float', function() {
      var numberField = createNumberFieldSameValuesJson(1.5);
      assertNumberFieldSameValues(numberField, 1.5);
    });
    test('Integer String', function() {
      var numberField = createNumberFieldSameValuesJson('1');
      assertNumberFieldSameValues(numberField, 1);
    });
    test('Float String', function() {
      var numberField = createNumberFieldSameValuesJson('1.5');
      assertNumberFieldSameValues(numberField, 1.5);
    });
  });
  suite('setValue', function() {
    suite('Value Types', function() {
      test('Empty -> Null', function() {
        var numberField = new Blockly.FieldNumber();
        numberField.setValue(null);
        assertValueDefault(numberField);
      });
      test('Value -> Null', function() {
        var numberField = new Blockly.FieldNumber(1);
        numberField.setValue(null);
        assertValue(numberField, 1);
      });
      test.skip('Empty -> Undefined', function() {
        var numberField = new Blockly.FieldNumber();
        numberField.setValue(undefined);
        assertValueDefault(numberField);
      });
      test.skip('Value -> Undefined', function() {
        var numberField = new Blockly.FieldNumber(1);
        numberField.setValue(undefined);
        assertValue(numberField, 1);
      });
      test.skip('Empty -> Non-Parsable String', function() {
        var numberField = new Blockly.FieldNumber();
        numberField.setValue('bad');
        assertValueDefault(numberField);
      });
      test.skip('Value -> Non-Parsable String', function() {
        var numberField = new Blockly.FieldNumber(1);
        numberField.setValue('bad');
        assertValue(numberField, 1);
      });
      test.skip('Empty -> NaN', function() {
        var numberField = new Blockly.FieldNumber();
        numberField.setValue(NaN);
        assertValueDefault(numberField);
      });
      test.skip('Value -> NaN', function() {
        var numberField = new Blockly.FieldNumber(1);
        numberField.setValue(NaN);
        assertValue(numberField, 1);
      });
      test('Empty -> Integer', function() {
        var numberField = new Blockly.FieldNumber();
        numberField.setValue(2);
        assertValue(numberField, 2);
      });
      test('Value -> Integer', function() {
        var numberField = new Blockly.FieldNumber(1);
        numberField.setValue(2);
        assertValue(numberField, 2);
      });
      test('Empty -> Float', function() {
        var numberField = new Blockly.FieldNumber();
        numberField.setValue(2.5);
        assertValue(numberField, 2.5);
      });
      test('Value -> Float', function() {
        var numberField = new Blockly.FieldNumber(1);
        numberField.setValue(2.5);
        assertValue(numberField, 2.5);
      });
      test('Empty -> Integer String', function() {
        var numberField = new Blockly.FieldNumber();
        numberField.setValue('2');
        assertValue(numberField, 2);
      });
      test('Value -> Integer String', function() {
        var numberField = new Blockly.FieldNumber(1);
        numberField.setValue('2');
        assertValue(numberField, 2);
      });
      test('Empty -> Float', function() {
        var numberField = new Blockly.FieldNumber();
        numberField.setValue('2.5');
        assertValue(numberField, 2.5);
      });
      test('Value -> Float', function() {
        var numberField = new Blockly.FieldNumber(1);
        numberField.setValue('2.5');
        assertValue(numberField, 2.5);
      });
    });
    suite('Constraints', function() {
      suite('Precision', function() {
        test('Float', function() {
          var numberField = new Blockly.FieldNumber();
          numberField.setValue(123.456);
          assertValue(numberField, 123.456);
        });
        test('0.01', function() {
          var numberField = new Blockly.FieldNumber
              .fromJson({ precision: .01 });
          numberField.setValue(123.456);
          assertValue(numberField, 123.46);
        });
        test('0.5', function() {
          var numberField = new Blockly.FieldNumber
              .fromJson({ precision: .5 });
          numberField.setValue(123.456);
          assertValue(numberField, 123.5);
        });
        test('1', function() {
          var numberField = new Blockly.FieldNumber
              .fromJson({ precision: 1 });
          numberField.setValue(123.456);
          assertValue(numberField, 123);
        });
        test('1.5', function() {
          var numberField = new Blockly.FieldNumber
              .fromJson({ precision: 1.5 });
          numberField.setValue(123.456);

          var actualValue = numberField.getValue();
          var actualText = numberField.getText();
          assertEquals(String(actualValue), '123.0');
          assertEquals(parseFloat(actualValue), 123);
          assertEquals(actualText, '123.0');
        });
      });
      suite('Min', function() {
        test('-10', function() {
          var numberField = new Blockly.FieldNumber.fromJson({ min: -10 });
          numberField.setValue(-20);
          assertValue(numberField, -10);
          numberField.setValue(0);
          assertValue(numberField, 0);
          numberField.setValue(20);
          assertValue(numberField, 20);
        });
        test('0', function() {
          var numberField = new Blockly.FieldNumber.fromJson({ min: 0 });
          numberField.setValue(-20);
          assertValue(numberField, 0);
          numberField.setValue(0);
          assertValue(numberField, 0);
          numberField.setValue(20);
          assertValue(numberField, 20);
        });
        test('+10', function() {
          var numberField = new Blockly.FieldNumber.fromJson({ min: 10 });
          numberField.setValue(-20);
          assertValue(numberField, 10);
          numberField.setValue(0);
          assertValue(numberField, 10);
          numberField.setValue(20);
          assertValue(numberField, 20);
        });
      });
      suite('Max', function() {
        test('-10', function() {
          var numberField = new Blockly.FieldNumber.fromJson({ max: -10 });
          numberField.setValue(-20);
          assertValue(numberField, -20);
          numberField.setValue(0);
          assertValue(numberField, -10);
          numberField.setValue(20);
          assertValue(numberField, -10);
        });
        test('0', function() {
          var numberField = new Blockly.FieldNumber.fromJson({ max: 0 });
          numberField.setValue(-20);
          assertValue(numberField, -20);
          numberField.setValue(0);
          assertValue(numberField, 0);
          numberField.setValue(20);
          assertValue(numberField, 0);
        });
        test('+10', function() {
          var numberField = new Blockly.FieldNumber.fromJson({ max: 10 });
          numberField.setValue(-20);
          assertValue(numberField, -20);
          numberField.setValue(0);
          assertValue(numberField, 0);
          numberField.setValue(20);
          assertValue(numberField, 10);
        });
      });
    });
  });
  suite.skip('Validators', function() {
    var numberFieldField;
    setup(function() {
      numberFieldField = new Blockly.FieldNumber(1);
      Blockly.FieldTextInput.htmlInput_ = Object.create(null);
      Blockly.FieldTextInput.htmlInput_.oldValue_ = '1';
      Blockly.FieldTextInput.htmlInput_.untypedDefaultValue_ = 1;
    });
    suite('Null Validator', function() {
      setup(function() {
        numberFieldField.setValidator(function() {
          return null;
        });
      });
      test('When Editing', function() {
        numberFieldField.isBeingEdited_ = true;
        Blockly.FieldTextInput.htmlInput_.value = '2';
        numberFieldField.onHtmlInputChange_(null);
        assertValue(numberFieldField, 1, '2');
        numberFieldField.isBeingEdited_ = false;
      });
      test('When Not Editing', function() {
        numberFieldField.setValue(2);
        assertValue(numberFieldField, 1);
      });
    });
    suite('Force End with 6 Validator', function() {
      setup(function() {
        numberFieldField.setValidator(function(newValue) {
          return String(newValue).replace(/.$/, "6");
        });
      });
      test('When Editing', function() {
        numberFieldField.isBeingEdited_ = true;
        Blockly.FieldTextInput.htmlInput_.value = '25';
        numberFieldField.onHtmlInputChange_(null);
        assertValue(numberFieldField, 26, '25');
        numberFieldField.isBeingEdited_ = false;
      });
      test('When Not Editing', function() {
        numberFieldField.setValue(25);
        assertValue(numberFieldField, 26);
      });
    });
  });
});
