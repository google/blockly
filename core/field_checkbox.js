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

goog.require('Blockly.Events');
goog.require('Blockly.Events.BlockChange');
goog.require('Blockly.Field');
goog.require('Blockly.utils.dom');


/**
 * Class for a checkbox field.
 * @param {string|boolean=} opt_value The initial value of the field. Should
 *    either be 'TRUE', 'FALSE' or a boolean. Defaults to 'FALSE'.
 * @param {Function=} opt_validator  A function that is called to validate
 *    changes to the field's value. Takes in a value ('TRUE' or 'FALSE') &
 *    returns a validated value ('TRUE' or 'FALSE'), or null to abort the
 *    change.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldCheckbox = function(opt_value, opt_validator) {
  opt_value = this.doClassValidation_(opt_value);
  if (opt_value === null) {
    opt_value = 'FALSE';
  }
  Blockly.FieldCheckbox.superClass_.constructor.call(this, opt_value, opt_validator);
  this.size_.width = Blockly.FieldCheckbox.WIDTH;
};
goog.inherits(Blockly.FieldCheckbox, Blockly.Field);

/**
 * Construct a FieldCheckbox from a JSON arg object.
 * @param {!Object} options A JSON object with options (checked).
 * @return {!Blockly.FieldCheckbox} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldCheckbox.fromJson = function(options) {
  return new Blockly.FieldCheckbox(options['checked']);
};

/**
 * The width of a checkbox field.
 * @type {number}
 * @const
 */
Blockly.FieldCheckbox.WIDTH = 5;

/**
 * Character for the checkmark.
 * @type {string}
 * @const
 */
Blockly.FieldCheckbox.CHECK_CHAR = '\u2713';

/**
 * Used to correctly position the check mark.
 * @type {number}
 * @const
 */
Blockly.FieldCheckbox.CHECK_X_OFFSET = -3;

/**
 * Used to correctly position the check mark.
 * @type {number}
 * @const
 */
Blockly.FieldCheckbox.CHECK_Y_OFFSET = 14;

/**
 * Serializable fields are saved by the XML renderer, non-serializable fields
 * are not. Editable fields should also be serializable.
 * @type {boolean}
 * @const
 */
Blockly.FieldCheckbox.prototype.SERIALIZABLE = true;

/**
 * Mouse cursor style when over the hotspot that initiates editability.
 */
Blockly.FieldCheckbox.prototype.CURSOR = 'default';

/**
 * Used to tell if the field needs to be rendered the next time the block is
 * rendered. Checkbox fields are statically sized, and only need to be
 * rendered at initialization.
 * @type {boolean}
 * @private
 */
Blockly.FieldCheckbox.prototype.isDirty_ = false;

/**
 * Create the block UI for this checkbox.
 * @package
 */
Blockly.FieldCheckbox.prototype.initView = function() {
  Blockly.FieldCheckbox.superClass_.initView.call(this);

  this.textElement_.setAttribute('x', Blockly.FieldCheckbox.CHECK_X_OFFSET);
  this.textElement_.setAttribute('y', Blockly.FieldCheckbox.CHECK_Y_OFFSET);
  Blockly.utils.dom.addClass(this.textElement_, 'blocklyCheckbox');

  var textNode = document.createTextNode(Blockly.FieldCheckbox.CHECK_CHAR);
  this.textElement_.appendChild(textNode);
  this.textElement_.style.display = this.value_ ? 'block' : 'none';
};

/**
 * Toggle the state of the checkbox on click.
 * @protected
 */
Blockly.FieldCheckbox.prototype.showEditor_ = function() {
  this.setValue(!this.value_);
};

/**
 * Ensure that the input value is valid ('TRUE' or 'FALSE').
 * @param {string|boolean=} newValue The input value.
 * @return {?string} A valid value ('TRUE' or 'FALSE), or null if invalid.
 * @protected
 */
Blockly.FieldCheckbox.prototype.doClassValidation_ = function(newValue) {
  if (newValue === true || newValue === 'TRUE') {
    return 'TRUE';
  }
  if (newValue === false || newValue === 'FALSE') {
    return 'FALSE';
  }
  return null;
};

/**
 * Update the value of the field, and update the checkElement.
 * @param {string} newValue The new value ('TRUE' or 'FALSE') of the field.
 * @protected
 */
Blockly.FieldCheckbox.prototype.doValueUpdate_ = function(newValue) {
  this.value_ = this.convertValueToBool_(newValue);
  // Update visual.
  if (this.textElement_) {
    this.textElement_.style.display = this.value_ ? 'block' : 'none';
  }
};

/**
 * Get the value of this field, either 'TRUE' or 'FALSE'.
 * @return {string} The value of this field.
 */
Blockly.FieldCheckbox.prototype.getValue = function() {
  return this.value_ ? 'TRUE' : 'FALSE';
};

/**
 * Get the boolean value of this field.
 * @return {string} The boolean value of this field.
 */
Blockly.FieldCheckbox.prototype.getValueBoolean = function() {
  return this.value_;
};

/**
 * Get the text of this field. Used when the block is collapsed.
 * @return {string} Text representing the value of this field
 *    ('true' or 'false').
 */
Blockly.FieldCheckbox.prototype.getText = function() {
  return String(this.convertValueToBool_(this.value_));
};

/**
 * Convert a value into a pure boolean.
 *
 * Converts 'TRUE' to true and 'FALSE' to false correctly, everything else
 * is cast to a boolean.
 * @param {*} value The value to convert.
 * @return {boolean} The converted value.
 * @private
 */
Blockly.FieldCheckbox.prototype.convertValueToBool_ = function(value) {
  if (typeof value == 'string') {
    return value == 'TRUE';
  } else {
    return !!value;
  }
};

Blockly.Field.register('field_checkbox', Blockly.FieldCheckbox);
