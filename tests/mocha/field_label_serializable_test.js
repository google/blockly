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

suite ('Label Serializable Fields', function() {
  function assertValue(labelField, expectedValue) {
    var actualValue = labelField.getValue();
    var actualText = labelField.getText();
    assertEquals(actualValue, expectedValue);
    assertEquals(actualText, expectedValue);
  }
  function assertValueDefault(labelField) {
    assertValue(labelField, '');
  }
  suite('Constructor', function() {
    test('Empty', function() {
      var labelField = new Blockly.FieldLabelSerializable();
      assertValueDefault(labelField);
    });
    test('Null', function() {
      var labelField = new Blockly.FieldLabelSerializable(null);
      assertValueDefault(labelField);
    });
    test('Undefined', function() {
      var labelField = new Blockly.FieldLabelSerializable(undefined);
      assertValueDefault(labelField);
    });
    test('String', function() {
      var labelField = new Blockly.FieldLabelSerializable('value');
      assertValue(labelField, 'value');
    });
    test('Number (Truthy)', function() {
      var labelField = new Blockly.FieldLabelSerializable(1);
      assertValue(labelField, '1');
    });
    test('Number (Falsy)', function() {
      var labelField = new Blockly.FieldLabelSerializable(0);
      assertValue(labelField, '0');
    });
    test('Boolean True', function() {
      var labelField = new Blockly.FieldLabelSerializable(true);
      assertValue(labelField, 'true');
    });
    test('Boolean False', function() {
      var labelField = new Blockly.FieldLabelSerializable(false);
      assertValue(labelField, 'false');
    });
  });
  suite('fromJson', function() {
    test('Empty', function() {
      var labelField = new Blockly.FieldLabelSerializable.fromJson({});
      assertValueDefault(labelField);
    });
    test('Null', function() {
      var labelField = new Blockly.FieldLabelSerializable
          .fromJson({ text:null });
      assertValueDefault(labelField);
    });
    test('Undefined', function() {
      var labelField = new Blockly.FieldLabelSerializable
          .fromJson({ text:undefined });
      assertValueDefault(labelField);
    });
    test('String', function() {
      var labelField = Blockly.FieldLabelSerializable
          .fromJson({ text:'value' });
      assertValue(labelField, 'value');
    });
    test('Number (Truthy)', function() {
      var labelField = Blockly.FieldLabelSerializable.fromJson({ text:1 });
      assertValue(labelField, '1');
    });
    test('Number (Falsy)', function() {
      var labelField = Blockly.FieldLabelSerializable.fromJson({ text:0 });
      assertValue(labelField, '0');
    });
    test('Boolean True', function() {
      var labelField = Blockly.FieldLabelSerializable.fromJson({ text:true });
      assertValue(labelField, 'true');
    });
    test('Boolean False', function() {
      var labelField = Blockly.FieldLabelSerializable.fromJson({ text:false });
      assertValue(labelField, 'false');
    });
  });
  suite('setValue', function() {
    var labelField;
    setup(function() {
      labelField = new Blockly.FieldLabelSerializable('value');
    });
    test('Null', function() {
      labelField.setValue(null);
      assertValue(labelField, 'value');
    });
    test.skip('Undefined', function() {
      labelField.setValue(undefined);
      assertValue(labelField, 'value');
    });
    test('New String', function() {
      labelField.setValue('newValue');
      assertValue(labelField, 'newValue');
    });
    test('Number (Truthy)', function() {
      labelField.setValue(1);
      assertValue(labelField, '1');
    });
    test('Number (Falsy)', function() {
      labelField.setValue(0);
      assertValue(labelField, '0');
    });
    test('Boolean True', function() {
      labelField.setValue(true);
      assertValue(labelField, 'true');
    });
    test('Boolean False', function() {
      labelField.setValue(false);
      assertValue(labelField, 'false');
    });
  });
});
