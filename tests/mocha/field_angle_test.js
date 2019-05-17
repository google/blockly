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

suite ('Angle Fields', function() {
  function assertValue(angleField, expectedValue, opt_expectedText) {
    var actualValue = angleField.getValue();
    var actualText = angleField.getText();
    opt_expectedText = opt_expectedText || String(expectedValue);
    assertEquals(String(actualValue), String(expectedValue));
    assertEquals(parseFloat(actualValue), expectedValue);
    assertEquals(actualText, opt_expectedText);
  }
  function assertValueDefault(angleField) {
    assertValue(angleField, 0);
  }
  suite('Constructor', function() {
    test('Empty', function() {
      var angleField = new Blockly.FieldAngle();
      assertValueDefault(angleField);
    });
    test('Null', function() {
      var angleField = new Blockly.FieldAngle(null);
      assertValueDefault(angleField);
    });
    test('Undefined', function() {
      var angleField = new Blockly.FieldAngle(undefined);
      assertValueDefault(angleField);
    });
    test('Non-Parsable String', function() {
      var angleField = new Blockly.FieldAngle('bad');
      assertValueDefault(angleField);
    });
    test('NaN', function() {
      var angleField = new Blockly.FieldAngle(NaN);
      assertValueDefault(angleField);
    });
    test('Integer', function() {
      var angleField = new Blockly.FieldAngle(1);
      assertValue(angleField, 1);
    });
    test('Float', function() {
      var angleField = new Blockly.FieldAngle(1.5);
      assertValue(angleField, 1.5);
    });
    test('Integer String', function() {
      var angleField = new Blockly.FieldAngle('1');
      assertValue(angleField, 1);
    });
    test('Float String', function() {
      var angleField = new Blockly.FieldAngle('1.5');
      assertValue(angleField, 1.5);
    });
  });
  suite('fromJson', function() {
    test('Empty', function() {
      var angleField = Blockly.FieldAngle.fromJson({});
      assertValueDefault(angleField);
    });
    test('Null', function() {
      var angleField = Blockly.FieldAngle.fromJson({ angle:null });
      assertValueDefault(angleField);
    });
    test('Undefined', function() {
      var angleField = Blockly.FieldAngle.fromJson({ angle:undefined });
      assertValueDefault(angleField);
    });
    test('Non-Parsable String', function() {
      var angleField = Blockly.FieldAngle.fromJson({ angle:'bad' });
      assertValueDefault(angleField);
    });
    test('NaN', function() {
      var angleField = Blockly.FieldAngle.fromJson({ angle:NaN });
      assertValueDefault(angleField);
    });
    test('Integer', function() {
      var angleField = Blockly.FieldAngle.fromJson({ angle:1 });
      assertValue(angleField, 1);
    });
    test('Float', function() {
      var angleField = Blockly.FieldAngle.fromJson({ angle:1.5 });
      assertValue(angleField, 1.5);
    });
    test('Integer String', function() {
      var angleField = Blockly.FieldAngle.fromJson({ angle:'1' });
      assertValue(angleField, 1);
    });
    test('Float String', function() {
      var angleField = Blockly.FieldAngle.fromJson({ angle:'1.5' });
      assertValue(angleField, 1.5);
    });
  });
  suite('setValue', function() {
    test('Empty -> Null', function() {
      var angleField = new Blockly.FieldAngle();
      angleField.setValue(null);
      assertValueDefault(angleField);
    });
    test('Value -> Null', function() {
      var angleField = new Blockly.FieldAngle(1);
      angleField.setValue(null);
      assertValue(angleField, 1);
    });
    test('Empty -> Undefined', function() {
      var angleField = new Blockly.FieldAngle();
      angleField.setValue(undefined);
      assertValueDefault(angleField);
    });
    test.skip('Value -> Undefined', function() {
      var angleField = new Blockly.FieldAngle(1);
      angleField.setValue(undefined);
      assertValue(angleField, 1);
    });
    test.skip('Empty -> Non-Parsable String', function() {
      var angleField = new Blockly.FieldAngle();
      angleField.setValue('bad');
      assertValueDefault(angleField);
    });
    test.skip('Value -> Non-Parsable String', function() {
      var angleField = new Blockly.FieldAngle(1);
      angleField.setValue('bad');
      assertValue(angleField, 1);
    });
    test('Empty -> NaN', function() {
      var angleField = new Blockly.FieldAngle();
      angleField.setValue(NaN);
      assertValueDefault(angleField);
    });
    test.skip('Value -> NaN', function() {
      var angleField = new Blockly.FieldAngle(1);
      angleField.setValue(NaN);
      assertValue(angleField, 1);
    });
    test('Empty -> Integer', function() {
      var angleField = new Blockly.FieldAngle();
      angleField.setValue(2);
      assertValue(angleField, 2);
    });
    test('Value -> Integer', function() {
      var angleField = new Blockly.FieldAngle(1);
      angleField.setValue(2);
      assertValue(angleField, 2);
    });
    test('Empty -> Float', function() {
      var angleField = new Blockly.FieldAngle();
      angleField.setValue(2.5);
      assertValue(angleField, 2.5);
    });
    test('Value -> Float', function() {
      var angleField = new Blockly.FieldAngle(1);
      angleField.setValue(2.5);
      assertValue(angleField, 2.5);
    });
    test('Empty -> Integer String', function() {
      var angleField = new Blockly.FieldAngle();
      angleField.setValue('2');
      assertValue(angleField, 2);
    });
    test('Value -> Integer String', function() {
      var angleField = new Blockly.FieldAngle(1);
      angleField.setValue('2');
      assertValue(angleField, 2);
    });
    test('Empty -> Float', function() {
      var angleField = new Blockly.FieldAngle();
      angleField.setValue('2.5');
      assertValue(angleField, 2.5);
    });
    test('Value -> Float', function() {
      var angleField = new Blockly.FieldAngle(1);
      angleField.setValue('2.5');
      assertValue(angleField, 2.5);
    });
  });
  suite.skip('Validators', function() {
    var angleField;
    setup(function() {
      angleField = new Blockly.FieldAngle(1);
      Blockly.FieldTextInput.htmlInput_ = Object.create(null);
      Blockly.FieldTextInput.htmlInput_.oldValue_ = '1';
      Blockly.FieldTextInput.htmlInput_.untypedDefaultValue_ = 1;
    });
    teardown(function() {
      Blockly.FieldTextInput.htmlInput_ = null;
    });
    suite('Null Validator', function() {
      setup(function() {
        angleField.setValidator(function() {
          return null;
        });
      });
      test('When Editing', function() {
        angleField.isBeingEdited_ = true;
        Blockly.FieldTextInput.htmlInput_.value = '2';
        angleField.onHtmlInputChange_(null);
        assertValue(angleField, 1, '2');
        angleField.isBeingEdited_ = false;
      });
      test('When Not Editing', function() {
        angleField.setValue(2);
        assertValue(angleField, 1);
      });
    });
    suite('Force Mult of 30 Validator', function() {
      setup(function() {
        angleField.setValidator(function(newValue) {
          return Math.round(newValue / 30) * 30;
        });
      });
      test('When Editing', function() {
        angleField.isBeingEdited_ = true;
        Blockly.FieldTextInput.htmlInput_.value = '25';
        angleField.onHtmlInputChange_(null);
        assertValue(angleField, 30, '25');
        angleField.isBeingEdited_ = false;
      });
      test('When Not Editing', function() {
        angleField.setValue(25);
        assertValue(angleField, 30);
      });
    });
  });
});
