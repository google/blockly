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

suite ('Date Fields', function() {
  function assertValue(dateField, expectedValue) {
    var actualValue = dateField.getValue();
    var actualText = dateField.getText();
    assertEquals(actualValue, expectedValue);
    assertEquals(actualText, expectedValue);
  }
  function assertValueDefault(dateField) {
    var today = new goog.date.Date().toIsoString(true);
    assertValue(dateField, today);
  }
  suite('Constructor', function() {
    test('Empty', function() {
      var dateField = new Blockly.FieldDate();
      assertValueDefault(dateField);
    });
    test('Null', function() {
      var dateField = new Blockly.FieldDate(null);
      assertValueDefault(dateField);
    });
    test('Undefined', function() {
      var dateField = new Blockly.FieldDate(undefined);
      assertValueDefault(dateField);
    });
    test.skip('Non-Parsable String', function() {
      var dateField = new Blockly.FieldDate('bad');
      assertValueDefault(dateField);
    });
    test('2020-02-20', function() {
      var dateField = new Blockly.FieldDate('2020-02-20');
      assertValue(dateField, '2020-02-20');
    });
    test.skip('Invalid Date - Month(2020-13-20)', function() {
      var dateField = new Blockly.FieldDate('2020-13-20');
      assertValueDefault(dateField);
    });
    test.skip('Invalid Date - Day(2020-02-32)', function() {
      var dateField = new Blockly.FieldDate('2020-02-32');
      assertValueDefault(dateField);
    });
  });
  suite('fromJson', function() {
    test('Empty', function() {
      var dateField = Blockly.FieldDate.fromJson({});
      assertValueDefault(dateField);
    });
    test('Null', function() {
      var dateField = Blockly.FieldDate.fromJson({ date: null });
      assertValueDefault(dateField);
    });
    test('Undefined', function() {
      var dateField = Blockly.FieldDate.fromJson({ date: undefined });
      assertValueDefault(dateField);
    });
    test.skip('Non-Parsable String', function() {
      var dateField = Blockly.FieldDate.fromJson({ date: 'bad' });
      assertValueDefault(dateField);
    });
    test('2020-02-20', function() {
      var dateField = Blockly.FieldDate.fromJson({ date: '2020-02-20' });
      assertValue(dateField, '2020-02-20');
    });
    test.skip('Invalid Date - Month(2020-13-20)', function() {
      var dateField = Blockly.FieldDate.fromJson({ date: '2020-13-20' });
      assertValueDefault(dateField);
    });
    test.skip('Invalid Date - Day(2020-02-32)', function() {
      var dateField = Blockly.FieldDate.fromJson({ date: '2020-02-32' });
      assertValueDefault(dateField);
    });
  });
  suite('setValue', function() {
    suite('Empty -> New Value', function() {
      var dateField;
      setup(function() {
        dateField = new Blockly.FieldDate();
      });
      test.skip('Null', function() {
        dateField.setValue(null);
        assertValueDefault(dateField);
      });
      test.skip('Undefined', function() {
        dateField.setValue(undefined);
        assertValueDefault(dateField);
      });
      test.skip('Non-Parsable String', function() {
        dateField.setValue('bad');
        assertValueDefault(dateField);
      });
      test.skip('Invalid Date - Month(2020-13-20)', function() {
        dateField.setValue('2020-13-20');
        assertValueDefault(dateField);
      });
      test.skip('Invalid Date - Day(2020-02-32)', function() {
        dateField.setValue('2020-02-32');
        assertValueDefault(dateField);
      });
      test('3030-03-30', function() {
        dateField.setValue('3030-03-30');
        assertValue(dateField, '3030-03-30');
      });
    });
    suite('Value -> New Value', function() {
      var dateField;
      setup(function() {
        dateField = new Blockly.FieldDate('2020-02-20');
      });
      test.skip('Null', function() {
        dateField.setValue(null);
        assertValue(dateField, '2020-02-20');
      });
      test.skip('Undefined', function() {
        dateField.setValue(undefined);
        assertValue(dateField, '2020-02-20');
      });
      test.skip('Non-Parsable String', function() {
        dateField.setValue('bad');
        assertValue(dateField, '2020-02-20');
      });
      test.skip('Invalid Date - Month(2020-13-20)', function() {
        dateField.setValue('2020-13-20');
        assertValue(dateField, '2020-02-20');
      });
      test.skip('Invalid Date - Day(2020-02-32)', function() {
        dateField.setValue('2020-02-32');
        assertValue(dateField, '2020-02-20');
      });
      test('3030-03-30', function() {
        dateField.setValue('3030-03-30');
        assertValue(dateField, '3030-03-30');
      });
    });
  });
  suite.skip('Validators', function() {
    var dateField;
    setup(function() {
      dateField = new Blockly.FieldDate('2020-02-20');
    });
    suite('Null Validator', function() {
      setup(function() {
        dateField.setValidator(function() {
          return null;
        });
      });
      test('New Value', function() {
        dateField.setValue('3030-03-30');
        assertValue(dateField, '2020-02-20');
      });
    });
    suite('Force Day 20s Validator', function() {
      setup(function() {
        dateField.setValidator(function(newValue) {
          return newValue.substr(0, 8) + '2' + newValue.substr(9, 1);
        });
      });
      test('New Value', function() {
        dateField.setValue('3030-03-30');
        assertValue(dateField, '3030-03-20');
      });
    });
  });
});
