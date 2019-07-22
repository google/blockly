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

suite('Checkbox Fields', function() {
  function assertValue(checkboxField, expectedValue, expectedText) {
    var actualValue = checkboxField.getValue();
    var actualText = checkboxField.getText();
    assertEquals(actualValue, expectedValue);
    assertEquals(actualText, expectedText);
  }
  function assertValueDefault(checkboxField) {
    assertValue(checkboxField, 'FALSE', 'false');
  }
  suite('Constructor', function() {
    test('Null', function() {
      var checkboxField = new Blockly.FieldCheckbox(null);
      assertValueDefault(checkboxField);
    });
    test('Undefined', function() {
      var checkboxField = new Blockly.FieldCheckbox(undefined);
      assertValueDefault(checkboxField);
    });
    test('Non-Parsable String', function() {
      var checkboxField = new Blockly.FieldCheckbox('bad');
      assertValueDefault(checkboxField);
    });
    test('True', function() {
      var checkboxField = new Blockly.FieldCheckbox(true);
      assertValue(checkboxField, 'TRUE', 'true');
    });
    test('False', function() {
      var checkboxField = new Blockly.FieldCheckbox(false);
      assertValue(checkboxField, 'FALSE', 'false');
    });
    test('String TRUE', function() {
      var checkboxField = new Blockly.FieldCheckbox('TRUE');
      assertValue(checkboxField, 'TRUE', 'true');
    });
    test('String FALSE', function() {
      var checkboxField = new Blockly.FieldCheckbox('FALSE');
      assertValue(checkboxField, 'FALSE', 'false');
    });
  });
  suite('fromJson', function() {
    test('Null', function() {
      var checkboxField = Blockly.FieldCheckbox.fromJson({ checked: null});
      assertValueDefault(checkboxField);
    });
    test('Undefined', function() {
      var checkboxField = Blockly.FieldCheckbox.fromJson({ checked: undefined});
      assertValueDefault(checkboxField);
    });
    test('Non-Parsable String', function() {
      var checkboxField = Blockly.FieldCheckbox.fromJson({ checked: 'bad'});
      assertValueDefault(checkboxField);
    });
    test('True', function() {
      var checkboxField = Blockly.FieldCheckbox.fromJson({ checked: true});
      assertValue(checkboxField, 'TRUE', 'true');
    });
    test('False', function() {
      var checkboxField = Blockly.FieldCheckbox.fromJson({ checked: false});
      assertValue(checkboxField, 'FALSE', 'false');
    });
    test('String TRUE', function() {
      var checkboxField = Blockly.FieldCheckbox.fromJson({ checked: 'TRUE'});
      assertValue(checkboxField, 'TRUE', 'true');
    });
    test('String FALSE', function() {
      var checkboxField = Blockly.FieldCheckbox.fromJson({ checked: 'FALSE'});
      assertValue(checkboxField, 'FALSE', 'false');
    });
  });
  suite('setValue', function() {
    suite('True -> New Value', function() {
      setup(function() {
        this.checkboxField = new Blockly.FieldCheckbox('TRUE');
      });
      test('Null', function() {
        this.checkboxField.setValue(null);
        assertValue(this.checkboxField, 'TRUE', 'true');
      });
      test('Undefined', function() {
        this.checkboxField.setValue(undefined);
        assertValue(this.checkboxField, 'TRUE', 'true');
      });
      test('Non-Parsable String', function() {
        this.checkboxField.setValue('bad');
        assertValue(this.checkboxField, 'TRUE', 'true');
      });
      test('False', function() {
        this.checkboxField.setValue('FALSE');
        assertValue(this.checkboxField, 'FALSE', 'false');
      });
    });
    suite('False -> New Value', function() {
      setup(function() {
        this.checkboxField = new Blockly.FieldCheckbox('FALSE');
      });
      test('Null', function() {
        this.checkboxField.setValue(null);
        assertValue(this.checkboxField, 'FALSE', 'false');
      });
      test('Undefined', function() {
        this.checkboxField.setValue(undefined);
        assertValue(this.checkboxField, 'FALSE', 'false');
      });
      test('Non-Parsable String', function() {
        this.checkboxField.setValue('bad');
        assertValue(this.checkboxField, 'FALSE', 'false');
      });
      test('True', function() {
        this.checkboxField.setValue('TRUE');
        assertValue(this.checkboxField, 'TRUE', 'true');
      });
    });
  });
  suite('Validators', function() {
    setup(function() {
      this.checkboxField = new Blockly.FieldCheckbox(true);
    });
    teardown(function() {
      this.checkboxField.setValidator(null);
    });
    suite('Null Validator', function() {
      setup(function() {
        this.checkboxField.setValidator(function() {
          return null;
        });
      });
      test('New Value', function() {
        this.checkboxField.setValue('FALSE');
        assertValue(this.checkboxField, 'TRUE', 'true');
      });
    });
    suite('Always True Validator', function() {
      setup(function() {
        this.checkboxField.setValidator(function() {
          return 'TRUE';
        });
      });
      test('New Value', function() {
        this.checkboxField.setValue('FALSE');
        assertValue(this.checkboxField, 'TRUE', 'true');
      });
    });
    suite('Always False Validator', function() {
      setup(function() {
        this.checkboxField.setValidator(function() {
          return 'FALSE';
        });
      });
      test('New Value', function() {
        this.checkboxField.setValue('TRUE');
        assertValue(this.checkboxField, 'FALSE', 'false');
      });
    });
    suite('Returns Undefined Validator', function() {
      setup(function() {
        this.checkboxField.setValidator(function() {});
      });
      test('New Value', function() {
        this.checkboxField.setValue('FALSE');
        assertValue(this.checkboxField, 'FALSE', 'false');
      });
    });
  });
});
