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

suite ('Dropdown Fields', function() {
  function assertValue(dropdownField, expectedValue, expectedText) {
    var actualValue = dropdownField.getValue();
    var actualText = dropdownField.getText();
    assertEquals(actualValue, expectedValue);
    assertEquals(actualText, expectedText);
  }
  suite('Constructor', function() {
    test('Empty', function() {
      chai.assert.throws(function() {
        new Blockly.FieldDropdown();
      });
    });
    test('Null', function() {
      chai.assert.throws(function() {
        new Blockly.FieldDropdown(null);
      });
    });
    test('Undefined', function() {
      chai.assert.throws(function() {
        new Blockly.FieldDropdown(undefined);
      });
    });
    test('Array Items not Arrays', function() {
      console.log('You should see three console warnings after this message.');
      chai.assert.throws(function() {
        new Blockly.FieldDropdown([1, 2, 3]);
      });
    });
    test('Array Items with Invalid IDs', function() {
      console.log('You should see three console warnings after this message.');
      chai.assert.throws(function() {
        new Blockly.FieldDropdown([['1', 1], ['2', 2], ['3', 3]]);
      });
    });
    test('Array Items with Invalid Content', function() {
      console.log('You should see three console warnings after this message.');
      chai.assert.throws(function() {
        new Blockly.FieldDropdown([[1, '1'], [2, '2'], [3, '3']]);
      });
    });
    test('Text Dropdown', function() {
      var dropdownField = new Blockly.FieldDropdown(
          [['a', 'A'], ['b', 'B'], ['c', 'C']]);
      assertValue(dropdownField, 'A', 'a');
    });
    test('Image Dropdown', function() {
      var dropdownField = new Blockly.FieldDropdown([
        [{ src:'scrA', alt:'a' }, 'A'],
        [{ src:'scrB', alt:'b' }, 'B'],
        [{ src:'scrC', alt:'c' }, 'C']]);
      assertValue(dropdownField, 'A', 'a');
    });
    test('Dynamic Dropdown Text', function() {
      var dynamicDropdownFunc = function() {
        return [['a', 'A'], ['b', 'B'], ['c', 'C']];
      };
      var dropdownField = new Blockly.FieldDropdown(dynamicDropdownFunc);
      assertValue(dropdownField, 'A', 'a');
    });
    test('Dynamic Dropdown Image', function() {
      var dynamicDropdownFunc = function() {
        return [
          [{ src:'scrA', alt:'a' }, 'A'],
          [{ src:'scrB', alt:'b' }, 'B'],
          [{ src:'scrC', alt:'c' }, 'C']
        ];
      };
      var dropdownField = new Blockly.FieldDropdown(dynamicDropdownFunc);
      assertValue(dropdownField, 'A', 'a');
    });
  });
  suite('fromJson', function() {
    test('Empty', function() {
      chai.assert.throws(function() {
        Blockly.FieldDropdown.fromJson({});
      });
    });
    test('Null', function() {
      chai.assert.throws(function() {
        Blockly.FieldDropdown.fromJson({ options: null });
      });
    });
    test('Undefined', function() {
      chai.assert.throws(function() {
        Blockly.FieldDropdown.fromJson({ options: undefined });
      });
    });
    test('Array Items not Arrays', function() {
      console.log('You should see three console warnings after this message.');
      chai.assert.throws(function() {
        Blockly.FieldDropdown.fromJson({ options: [1, 2, 3] });
      });
    });
    test('Array Items with Invalid IDs', function() {
      console.log('You should see three console warnings after this message.');
      chai.assert.throws(function() {
        Blockly.FieldDropdown.fromJson(
            { options:[['1', 1], ['2', 2], ['3', 3]] });
      });
    });
    test('Array Items with Invalid Content', function() {
      console.log('You should see three console warnings after this message.');
      chai.assert.throws(function() {
        Blockly.FieldDropdown.fromJson(
            { options:[[1, '1'], [2, '2'], [3, '3']] });
      });
    });
    test('Text Dropdown', function() {
      var dropdownField = Blockly.FieldDropdown.fromJson(
          { options:[['a', 'A'], ['b', 'B'], ['c', 'C']] });
      assertValue(dropdownField, 'A', 'a');
    });
    test('Image Dropdown', function() {
      var dropdownField = Blockly.FieldDropdown.fromJson({ options:[
        [{ src:'scrA', alt:'a' }, 'A'],
        [{ src:'scrB', alt:'b' }, 'B'],
        [{ src:'scrC', alt:'c' }, 'C']] });
      assertValue(dropdownField, 'A', 'a');
    });
  });
  suite('setValue', function() {
    var dropdownField;
    setup(function() {
      dropdownField = new Blockly.FieldDropdown(
          [['a', 'A'], ['b', 'B'], ['c', 'C']]);
    });
    test('Null', function() {
      dropdownField.setValue(null);
      assertValue(dropdownField, 'A', 'a');
    });
    test.skip('Undefined', function() {
      dropdownField.setValue(undefined);
      assertValue(dropdownField, 'A', 'a');
    });
    test.skip('Invalid ID', function() {
      dropdownField.setValue('bad');
      assertValue(dropdownField, 'A', 'a');
    });
    test('Valid ID', function() {
      dropdownField.setValue('B');
      assertValue(dropdownField, 'B', 'b');
    });
  });
  suite.skip('Validators', function() {
    var dropdownField;
    setup(function() {
      dropdownField = new Blockly.FieldDropdown([
        ["1a","1A"], ["1b","1B"], ["1c","1C"],
        ["2a","2A"], ["2b","2B"], ["2c","2C"]]);
    });
    suite('Null Validator', function() {
      setup(function() {
        dropdownField.setValidator(function() {
          return null;
        });
      });
      test('New Value', function() {
        dropdownField.setValue('1B');
        assertValue(dropdownField, '1A', '1a');
      });
    });
    suite('Force 1s Validator', function() {
      setup(function() {
        dropdownField.setValidator(function(newValue) {
          return '1' + newValue.charAt(1);
        });
      });
      test('New Value', function() {
        dropdownField.setValue('2B');
        assertValue(dropdownField, '1B', '1b');
      });
    });
  });
});
