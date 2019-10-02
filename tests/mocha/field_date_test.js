/**
 * @license
 * Copyright 2019 Google LLC
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

/* If you want to run date tests add the date picker here:
 * https://github.com/google/blockly/blob/master/core/blockly.js#L41
 * before unskipping.
 */
suite.skip('Date Fields', function() {
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
    test('Undefined', function() {
      var dateField = new Blockly.FieldDate(undefined);
      assertValueDefault(dateField);
    });
    test('Non-Parsable String', function() {
      var dateField = new Blockly.FieldDate('bad');
      assertValueDefault(dateField);
    });
    test('2020-02-20', function() {
      var dateField = new Blockly.FieldDate('2020-02-20');
      assertValue(dateField, '2020-02-20');
    });
    test('Invalid Date - Month(2020-13-20)', function() {
      var dateField = new Blockly.FieldDate('2020-13-20');
      assertValueDefault(dateField);
    });
    test('Invalid Date - Day(2020-02-32)', function() {
      var dateField = new Blockly.FieldDate('2020-02-32');
      assertValueDefault(dateField);
    });
  });
  suite('fromJson', function() {
    test('Empty', function() {
      var dateField = Blockly.FieldDate.fromJson({});
      assertValueDefault(dateField);
    });
    test('Undefined', function() {
      var dateField = Blockly.FieldDate.fromJson({ date: undefined });
      assertValueDefault(dateField);
    });
    test('Non-Parsable String', function() {
      var dateField = Blockly.FieldDate.fromJson({ date: 'bad' });
      assertValueDefault(dateField);
    });
    test('2020-02-20', function() {
      var dateField = Blockly.FieldDate.fromJson({ date: '2020-02-20' });
      assertValue(dateField, '2020-02-20');
    });
    test('Invalid Date - Month(2020-13-20)', function() {
      var dateField = Blockly.FieldDate.fromJson({ date: '2020-13-20' });
      assertValueDefault(dateField);
    });
    test('Invalid Date - Day(2020-02-32)', function() {
      var dateField = Blockly.FieldDate.fromJson({ date: '2020-02-32' });
      assertValueDefault(dateField);
    });
  });
  suite('setValue', function() {
    suite('Empty -> New Value', function() {
      setup(function() {
        this.dateField = new Blockly.FieldDate();
      });
      test('Null', function() {
        this.dateField.setValue(null);
        assertValueDefault(this.dateField);
      });
      test('Undefined', function() {
        this.dateField.setValue(undefined);
        assertValueDefault(this.dateField);
      });
      test('Non-Parsable String', function() {
        this.dateField.setValue('bad');
        assertValueDefault(this.dateField);
      });
      test('Invalid Date - Month(2020-13-20)', function() {
        this.dateField.setValue('2020-13-20');
        assertValueDefault(this.dateField);
      });
      test('Invalid Date - Day(2020-02-32)', function() {
        this.dateField.setValue('2020-02-32');
        assertValueDefault(this.dateField);
      });
      test('3030-03-30', function() {
        this.dateField.setValue('3030-03-30');
        assertValue(this.dateField, '3030-03-30');
      });
    });
    suite('Value -> New Value', function() {
      setup(function() {
        this.dateField = new Blockly.FieldDate('2020-02-20');
      });
      test('Null', function() {
        this.dateField.setValue(null);
        assertValue(this.dateField, '2020-02-20');
      });
      test('Undefined', function() {
        this.dateField.setValue(undefined);
        assertValue(this.dateField, '2020-02-20');
      });
      test('Non-Parsable String', function() {
        this.dateField.setValue('bad');
        assertValue(this.dateField, '2020-02-20');
      });
      test('Invalid Date - Month(2020-13-20)', function() {
        this.dateField.setValue('2020-13-20');
        assertValue(this.dateField, '2020-02-20');
      });
      test('Invalid Date - Day(2020-02-32)', function() {
        this.dateField.setValue('2020-02-32');
        assertValue(this.dateField, '2020-02-20');
      });
      test('3030-03-30', function() {
        this.dateField.setValue('3030-03-30');
        assertValue(this.dateField, '3030-03-30');
      });
    });
  });
  suite('Validators', function() {
    setup(function() {
      this.dateField = new Blockly.FieldDate('2020-02-20');
    });
    teardown(function() {
      this.dateField.setValidator(null);
    });
    suite('Null Validator', function() {
      setup(function() {
        this.dateField.setValidator(function() {
          return null;
        });
      });
      test('New Value', function() {
        this.dateField.setValue('3030-03-30');
        assertValue(this.dateField, '2020-02-20');
      });
    });
    suite('Force Day 20s Validator', function() {
      setup(function() {
        this.dateField.setValidator(function(newValue) {
          return newValue.substr(0, 8) + '2' + newValue.substr(9, 1);
        });
      });
      test('New Value', function() {
        this.dateField.setValue('3030-03-30');
        assertValue(this.dateField, '3030-03-20');
      });
    });
    suite('Returns Undefined Validator', function() {
      setup(function() {
        this.dateField.setValidator(function() {});
      });
      test('New Value', function() {
        this.dateField.setValue('3030-03-30');
        assertValue(this.dateField, '3030-03-30');
      });
    });
  });
});
