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

suite('Label Serializable Fields', function() {
  function assertValue(labelField, expectedValue) {
    var actualValue = labelField.getValue();
    var actualText = labelField.getText();
    assertEquals(actualValue, expectedValue);
    assertEquals(actualText, expectedValue);
  }
  function assertValueDefault(labelField) {
    assertValue(labelField, '');
  }
  function assertHasClass(labelField, cssClass) {
    labelField.fieldGroup_ = Blockly.utils.dom.createSvgElement('g', {}, null);
    labelField.constants_ = {
      FIELD_TEXT_BASELINE_Y: 13
    };
    labelField.initView();
    chai.assert.isTrue(Blockly.utils.dom.hasClass(
        labelField.textElement_, cssClass));
  }
  function assertDoesNotHaveClass(labelField, cssClass) {
    labelField.fieldGroup_ = Blockly.utils.dom.createSvgElement('g', {}, null);
    labelField.constants_ = {
      FIELD_TEXT_BASELINE_Y: 13
    };
    labelField.initView();
    chai.assert.isFalse(Blockly.utils.dom.hasClass(
        labelField.textElement_, cssClass));
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
    suite('Empty -> New Value', function() {
      setup(function() {
        this.labelField = new Blockly.FieldLabelSerializable();
      });
      test('Null', function() {
        this.labelField.setValue(null);
        assertValueDefault(this.labelField);
      });
      test('Undefined', function() {
        this.labelField.setValue(undefined);
        assertValueDefault(this.labelField);
      });
      test('New String', function() {
        this.labelField.setValue('newValue');
        assertValue(this.labelField, 'newValue');
      });
      test('Number (Truthy)', function() {
        this.labelField.setValue(1);
        assertValue(this.labelField, '1');
      });
      test('Number (Falsy)', function() {
        this.labelField.setValue(0);
        assertValue(this.labelField, '0');
      });
      test('Boolean True', function() {
        this.labelField.setValue(true);
        assertValue(this.labelField, 'true');
      });
      test('Boolean False', function() {
        this.labelField.setValue(false);
        assertValue(this.labelField, 'false');
      });
    });
    suite('Value -> New Value', function() {
      setup(function() {
        this.labelField = new Blockly.FieldLabelSerializable('value');
      });
      test('Null', function() {
        this.labelField.setValue(null);
        assertValue(this.labelField, 'value');
      });
      test('Undefined', function() {
        this.labelField.setValue(undefined);
        assertValue(this.labelField, 'value');
      });
      test('New String', function() {
        this.labelField.setValue('newValue');
        assertValue(this.labelField, 'newValue');
      });
      test('Number (Truthy)', function() {
        this.labelField.setValue(1);
        assertValue(this.labelField, '1');
      });
      test('Number (Falsy)', function() {
        this.labelField.setValue(0);
        assertValue(this.labelField, '0');
      });
      test('Boolean True', function() {
        this.labelField.setValue(true);
        assertValue(this.labelField, 'true');
      });
      test('Boolean False', function() {
        this.labelField.setValue(false);
        assertValue(this.labelField, 'false');
      });
    });
  });
  suite('Customizations', function() {
    test('JS Constructor', function() {
      var field = new Blockly.FieldLabelSerializable('text', 'testClass');
      assertHasClass(field, 'testClass');
    });
    test('JSON Definition', function() {
      var field = Blockly.FieldLabelSerializable.fromJson({
        class: 'testClass'
      });
      assertHasClass(field, 'testClass');
    });
    test('JS Configuration - Simple', function() {
      var field = new Blockly.FieldLabelSerializable('text', null, {
        class: 'testClass'
      });
      assertHasClass(field, 'testClass');
    });
    test('JS Configuration - Ignore', function() {
      var field = new Blockly.FieldLabelSerializable('text', 'paramClass', {
        class: 'configClass'
      });
      assertDoesNotHaveClass(field, 'paramClass');
      assertHasClass(field, 'configClass');
    });
    test('JS Configuration - Ignore - \'\'', function() {
      var field = new Blockly.FieldLabelSerializable('text', '', {
        class: 'configClass'
      });
      assertHasClass(field, 'configClass');
    });
    test('JS Configuration - Ignore - Config \'\'', function() {
      var field = new Blockly.FieldLabelSerializable('text', 'paramClass', {
        class: ''
      });
      assertDoesNotHaveClass(field, 'paramClass');
    });
    suite('setClass', function() {
      test('setClass', function() {
        var field = new Blockly.FieldLabelSerializable();
        field.fieldGroup_ = Blockly.utils.dom.createSvgElement('g', {}, null);
        field.constants_ = {
          FIELD_TEXT_BASELINE_Y: 13
        };
        field.initView();
        field.setClass('testClass');
        // Don't call assertHasClass b/c we don't want to re-initialize.
        chai.assert.isTrue(Blockly.utils.dom.hasClass(
            field.textElement_, 'testClass'));
      });
      test('setClass Before Initialization', function() {
        var field = new Blockly.FieldLabelSerializable();
        field.setClass('testClass');
        assertHasClass(field, 'testClass');
      });
      test('Remove Class', function() {
        var field = new Blockly.FieldLabelSerializable('text', null, {
          class: 'testClass'
        });
        assertHasClass(field, 'testClass');
        field.setClass(null);
        chai.assert.isFalse(Blockly.utils.dom.hasClass(
            field.textElement_, 'testClass'));
      });
    });
  });
});
