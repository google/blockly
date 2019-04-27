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

/**
 * @fileoverview Turtle field demo blocks..
 * @author bekawestberg@gmail.com (Beka Westberg)
 */

Blockly.Blocks['turtle_basic'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('simple turtle');
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_CENTRE)
        .appendField(new CustomFields.FieldTurtle(), 'TURTLE');
    this.setStyle('loop_blocks');
    this.setCommentText('Demonstrates a turtle field with no validator.');
  }
};

Blockly.Blocks['turtle_nullifier'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('no trademarks');
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_CENTRE)
        .appendField(new CustomFields.FieldTurtle(null, null, null, this.validate)
            , 'TURTLE');
    this.setStyle('loop_blocks');
    this.setCommentText('Validates combinations of names and hats to null' +
      ' (invalid) if they could be considered infringe-y. This turns the' +
      ' turtle field red. Infringe-y combinations are: (Leonardo, Mask),' +
      ' (Yertle, Crown), and (Franklin, Propeller).');
  },

  validate: function(newValue) {
    if ((newValue.turtleName == 'Leonardo' && newValue.hat == 'Mask') ||
        (newValue.turtleName == 'Yertle' && newValue.hat == 'Crown') ||
        (newValue.turtleName == 'Franklin') && newValue.hat == 'Propeller') {
      return null;
    }
    return newValue;
  }
};

Blockly.Blocks['turtle_changer'] = {
  init: function() {
    this.appendDummyInput()
      .setAlign(Blockly.ALIGN_CENTRE)
        .appendField('no matching');
    this.appendDummyInput()
        .appendField(new CustomFields.FieldTurtle(
            'Dots', 'Stovepipe', 'Yertle',  this.validate), 'TURTLE1')
        .appendField(new CustomFields.FieldTurtle(
            'Stripes', 'Propeller', 'Leonardo', this.validate), 'TURTLE2');
    this.setStyle('loop_blocks');
    this.setCommentText('Validates the input so that the two turtles may' +
      ' never have the same hat, pattern, or name.');
  },

  validate: function(newValue) {
    var oldValue = this.getValue();
    var otherField = (this.name == 'TURTLE1') ?
        this.getSourceBlock().getField('TURTLE2') :
        this.getSourceBlock().getField('TURTLE1');
    var otherValue = otherField.getValue();

    newValue.pattern = this.getSourceBlock().getValidValue(
        newValue.pattern, oldValue.pattern, otherValue.pattern,
        CustomFields.FieldTurtle.PATTERNS);
    newValue.hat = this.getSourceBlock().getValidValue(
      newValue.hat, oldValue.hat, otherValue.hat,
      CustomFields.FieldTurtle.HATS);
    newValue.turtleName = this.getSourceBlock().getValidValue(
      newValue.turtleName, oldValue.turtleName, otherValue.turtleName,
      CustomFields.FieldTurtle.NAMES);

    return newValue;
  },

  getValidValue: function(newValue, oldValue, otherValue, array) {
    if (newValue == otherValue) {
      var newValueIndex = array.indexOf(newValue);
      var endwardIndex = newValueIndex + 1;
      if (endwardIndex == array.length) {
        endwardIndex = 0;
      }
      var startwardIndex = newValueIndex - 1;
      if (startwardIndex < 0) {
        startwardIndex = array.length - 1;
      }

      newValue = array[endwardIndex];
      if (newValue == oldValue) {
        newValue = array[startwardIndex];
      }
    }
    return newValue;
  }
};
