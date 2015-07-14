/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
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
 * @fileoverview Checkbox field.  Checked or not checked.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.FieldCheckbox');

goog.require('Blockly.Field');


/**
 * Class for a checkbox field.
 * @param {string} state The initial state of the field ('TRUE' or 'FALSE').
 * @param {Function=} opt_changeHandler A function that is executed when a new
 *     option is selected.  Its sole argument is the new checkbox state.  If
 *     it returns a value, this becomes the new checkbox state, unless the
 *     value is null, in which case the change is aborted.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldCheckbox = function(state, opt_changeHandler) {
  Blockly.FieldCheckbox.superClass_.constructor.call(this, '');

  this.setChangeHandler(opt_changeHandler);
  // Set the initial state.
  this.setValue(state);
};
goog.inherits(Blockly.FieldCheckbox, Blockly.Field);

/**
 * Clone this FieldCheckbox.
 * @return {!Blockly.FieldCheckbox} The result of calling the constructor again
 *   with the current values of the arguments used during construction.
 */
Blockly.FieldCheckbox.prototype.clone = function() {
  return new Blockly.FieldCheckbox(this.getValue(), this.changeHandler_);
};

/**
 * Mouse cursor style when over the hotspot that initiates editability.
 */
Blockly.FieldCheckbox.prototype.CURSOR = 'default';

/**
 * Install this checkbox on a block.
 * @param {!Blockly.Block} block The block containing this text.
 */
Blockly.FieldCheckbox.prototype.init = function(block) {
  if (this.sourceBlock_) {
    // Checkbox has already been initialized once.
    return;
  }
  Blockly.FieldCheckbox.superClass_.init.call(this, block);
  // The checkbox doesn't use the inherited text element.
  // Instead it uses a custom checkmark element that is either visible or not.
  this.checkElement_ = Blockly.createSvgElement('text',
      {'class': 'blocklyText', 'x': -3}, this.fieldGroup_);
  var textNode = document.createTextNode('\u2713');
  this.checkElement_.appendChild(textNode);
  this.checkElement_.style.display = this.state_ ? 'block' : 'none';
};

/**
 * Return 'TRUE' if the checkbox is checked, 'FALSE' otherwise.
 * @return {string} Current state.
 */
Blockly.FieldCheckbox.prototype.getValue = function() {
  return String(this.state_).toUpperCase();
};

/**
 * Set the checkbox to be checked if strBool is 'TRUE', unchecks otherwise.
 * @param {string} strBool New state.
 */
Blockly.FieldCheckbox.prototype.setValue = function(strBool) {
  var newState = (strBool == 'TRUE');
  if (this.state_ !== newState) {
    this.state_ = newState;
    if (this.checkElement_) {
      this.checkElement_.style.display = newState ? 'block' : 'none';
    }
    if (this.sourceBlock_ && this.sourceBlock_.rendered) {
      this.sourceBlock_.workspace.fireChangeEvent();
    }
  }
};

/**
 * Toggle the state of the checkbox.
 * @private
 */
Blockly.FieldCheckbox.prototype.showEditor_ = function() {
  var newState = !this.state_;
  if (this.sourceBlock_ && this.changeHandler_) {
    // Call any change handler, and allow it to override.
    var override = this.changeHandler_(newState);
    if (override !== undefined) {
      newState = override;
    }
  }
  if (newState !== null) {
    this.setValue(String(newState).toUpperCase());
  }
};
