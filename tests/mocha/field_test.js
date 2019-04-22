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

suite ('Abstract Fields', function() {
  suite ('Is Serializable', function() {
    // Both EDITABLE and SERIALIZABLE are default.
    function FieldDefault() {
      this.name = 'NAME';
    }
    FieldDefault.prototype = Object.create(Blockly.Field.prototype);
    // EDITABLE is false and SERIALIZABLE is default.
    function FieldFalseDefault() {
      this.name = 'NAME';
    }
    FieldFalseDefault.prototype = Object.create(Blockly.Field.prototype);
    FieldFalseDefault.prototype.EDITABLE = false;
    // EDITABLE is default and SERIALIZABLE is true.
    function FieldDefaultTrue() {
      this.name = 'NAME';
    }
    FieldDefaultTrue.prototype = Object.create(Blockly.Field.prototype);
    FieldDefaultTrue.prototype.SERIALIZABLE = true;
    // EDITABLE is false and SERIALIZABLE is true.
    function FieldFalseTrue() {
      this.name = 'NAME';
    }
    FieldFalseTrue.prototype = Object.create(Blockly.Field.prototype);
    FieldFalseTrue.prototype.EDITABLE = false;
    FieldFalseTrue.prototype.SERIALIZABLE = true;

    /* Test Backwards Compatibility*/
    test('Editable Default(true), Serializable Default(false)', function() {
      // An old default field should be serialized.
      var field = new FieldDefault();
      console.log('You should receive a warning after this message');
      assertEquals(true, field.isSerializable());
    });
    test('Editable False, Serializable Default(false)', function() {
      // An old non-editable field should not be serialized.
      var field = new FieldFalseDefault();
      assertEquals(false, field.isSerializable());
    });
    /* Test Other Cases */
    test('Editable Default(true), Serializable True', function() {
      // A field that is both editable and serializable should be serialized.
      var field = new FieldDefaultTrue();
      assertEquals(true, field.isSerializable());
    });
    test('Editable False, Serializable True', function() {
      // A field that is not editable, but overrides serializable to true
      // should be serialized (e.g. field_label_serializable)
      var field = new FieldFalseTrue();
      assertEquals(true, field.isSerializable());
    });
  });
});
