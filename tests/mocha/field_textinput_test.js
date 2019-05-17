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

suite ('Text Input Fields', function() {
  function assertValue(textInputField, expectedValue, opt_expectedText) {
    var actualValue = textInputField.getValue();
    var actualText = textInputField.getText();
    opt_expectedText = opt_expectedText || expectedValue;
    assertEquals(actualValue, expectedValue);
    assertEquals(actualText, opt_expectedText);
  }
  function assertValueDefault(textInputField) {
    assertValue(textInputField, '');
  }
  suite('Constructor', function() {
    test('Empty', function() {
      var textInputField = new Blockly.FieldTextInput();
      assertValueDefault(textInputField);
    });
    test('Null', function() {
      var textInputField = new Blockly.FieldTextInput(null);
      assertValueDefault(textInputField);
    });
    test('Undefined', function() {
      var textInputField = new Blockly.FieldTextInput(undefined);
      assertValueDefault(textInputField);
    });
    test('String', function() {
      var textInputField = new Blockly.FieldTextInput('value');
      assertValue(textInputField, 'value');
    });
    test('Number (Truthy)', function() {
      var textInputField = new Blockly.FieldTextInput(1);
      assertValue(textInputField, '1');
    });
    test('Number (Falsy)', function() {
      var textInputField = new Blockly.FieldTextInput(0);
      assertValue(textInputField, '0');
    });
    test('Boolean True', function() {
      var textInputField = new Blockly.FieldTextInput(true);
      assertValue(textInputField, 'true');
    });
    test('Boolean False', function() {
      var textInputField = new Blockly.FieldTextInput(false);
      assertValue(textInputField, 'false');
    });
  });
  suite('fromJson', function() {
    test('Empty', function() {
      var textInputField = new Blockly.FieldTextInput.fromJson({});
      assertValueDefault(textInputField);
    });
    test('Null', function() {
      var textInputField = new Blockly.FieldTextInput.fromJson({ text: null});
      assertValueDefault(textInputField);
    });
    test('Undefined', function() {
      var textInputField = new Blockly.FieldTextInput
          .fromJson({ text: undefined});
      assertValueDefault(textInputField);
    });
    test('String', function() {
      var textInputField = Blockly.FieldTextInput.fromJson({ text:'value' });
      assertValue(textInputField, 'value');
    });
    test('Number (Truthy)', function() {
      var textInputField = Blockly.FieldTextInput.fromJson({ text:1 });
      assertValue(textInputField, '1');
    });
    test('Number (Falsy)', function() {
      var textInputField = Blockly.FieldTextInput.fromJson({ text:0 });
      assertValue(textInputField, '0');
    });
    test('Boolean True', function() {
      var textInputField = Blockly.FieldTextInput.fromJson({ text:true });
      assertValue(textInputField, 'true');
    });
    test('Boolean False', function() {
      var textInputField = Blockly.FieldTextInput.fromJson({ text:false });
      assertValue(textInputField, 'false');
    });
  });
  suite('setValue', function() {
    var textInputField;
    setup(function() {
      textInputField = new Blockly.FieldTextInput('value');
    });
    test('Null', function() {
      textInputField.setValue(null);
      assertValue(textInputField, 'value');
    });
    test.skip('Undefined', function() {
      textInputField.setValue(undefined);
      assertValue(textInputField, 'value');
    });
    test('New String', function() {
      textInputField.setValue('newValue');
      assertValue(textInputField, 'newValue');
    });
    test('Number (Truthy)', function() {
      textInputField.setValue(1);
      assertValue(textInputField, '1');
    });
    test('Number (Falsy)', function() {
      textInputField.setValue(0);
      assertValue(textInputField, '0');
    });
    test('Boolean True', function() {
      textInputField.setValue(true);
      assertValue(textInputField, 'true');
    });
    test('Boolean False', function() {
      textInputField.setValue(false);
      assertValue(textInputField, 'false');
    });
  });
  suite.skip('Validators', function() {
    var textInputField;
    setup(function() {
      textInputField = new Blockly.FieldTextInput('value');
      Blockly.FieldTextInput.htmlInput_ = Object.create(null);
      Blockly.FieldTextInput.htmlInput_.oldValue_ = 'value';
      Blockly.FieldTextInput.htmlInput_.untypedDefaultValue_ = 'value';
    });
    suite('Null Validator', function() {
      setup(function() {
        textInputField.setValidator(function() {
          return null;
        });
      });
      test('When Editing', function() {
        textInputField.isBeingEdited_ = true;
        Blockly.FieldTextInput.htmlInput_.value = 'newValue';
        textInputField.onHtmlInputChange_(null);
        assertValue(textInputField, 'value', 'newValue');
        textInputField.isBeingEdited_ = false;
      });
      test('When Not Editing', function() {
        textInputField.setValue('newValue');
        assertValue(textInputField, 'value');
      });
    });
    suite('Remove \'a\' Validator', function() {
      setup(function() {
        textInputField.setValidator(function(newValue) {
          return newValue.replace(/a/g, '');
        });
      });
      test('When Editing', function() {
        textInputField.isBeingEdited_ = true;
        Blockly.FieldTextInput.htmlInput_.value = 'bbbaaa';
        textInputField.onHtmlInputChange_(null);
        assertValue(textInputField, 'bbb', 'bbbaaa');
        textInputField.isBeingEdited_ = false;
      });
      test('When Not Editing', function() {
        textInputField.setValue('bbbaaa');
        assertValue(textInputField, 'bbb');
      });
    });
  });
});
