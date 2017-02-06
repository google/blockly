/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2017 Google Inc.
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

 /**
 * @fileoverview Tests for Blockly.Field
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

function test_field_isEditable_simple() {
  var field = new Blockly.Field("Dummy text");
  // EDITABLE is true by default, but without a source block a field can't be
  // edited.
  assertFalse('Field without a block is not editable',
      field.isCurrentlyEditable());
}

function test_field_isEditable_false() {
  // Setting EDITABLE to false doesn't matter.
  var field = new Blockly.Field("Dummy text");
  field.EDITABLE = false;
  assertFalse('Field without a block is not editable',
      field.isCurrentlyEditable());
}

function test_field_isEditable_editableBlock() {
  var editableBlock = {
    isEditable: function() {
      return true;
    }
  };

  var field = new Blockly.Field("Dummy text");
  field.sourceBlock_ = editableBlock;

  assertTrue('Editable field with editable block is editable',
      field.isCurrentlyEditable());
}

function test_field_isEditable_editableBlock_false() {
  var editableBlock = {
    isEditable: function() {
      return true;
    }
  };

  var field = new Blockly.Field("Dummy text");
  field.sourceBlock_ = editableBlock;
  field.EDITABLE = false;

  assertFalse('Non-editable field with editable block is not editable',
      field.isCurrentlyEditable());
}

function test_field_isEditable_nonEditableBlock() {
  var nonEditableBlock = {
    isEditable: function() {
      return false;
    }
  };

  var field = new Blockly.Field("Dummy text");
  field.sourceBlock_ = nonEditableBlock;

  assertFalse('Editable field with non-editable block is not editable',
      field.isCurrentlyEditable());
}

function test_field_isEditable_nonEditableBlock_false() {
  var nonEditableBlock = {
    isEditable: function() {
      return false;
    }
  };

  var field = new Blockly.Field("Dummy text");
  field.sourceBlock_ = nonEditableBlock;
  field.EDITABLE = false;

  assertFalse('Non-editable field with non-editable block is not editable',
      field.isCurrentlyEditable());
}
