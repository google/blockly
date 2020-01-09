/**
 * @license
 * Copyright 2012 Google LLC
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
 * @fileoverview Boolean field.  Checked or not checked. Started as a copy of FieldCheckbox
 * @author ivan@shaperobotics.com (Ivan Mladenov)
 */
'use strict';

goog.provide('Blockly.FieldBoolean');

goog.require('Blockly.Events');
goog.require('Blockly.Events.BlockChange');
goog.require('Blockly.Field');
goog.require('Blockly.fieldRegistry');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.Size');

/**
 * Class for a checkbox field.
 * @param {string|boolean=} optValue The initial value of the field. Should
 *    either be 'TRUE', 'FALSE' or a boolean. Defaults to 'FALSE'.
 * @param {Function=} optValidator  A function that is called to validate
 *    changes to the field's value. Takes in a value ('TRUE' or 'FALSE') &
 *    returns a validated value ('TRUE' or 'FALSE'), or null to abort the
 *    change.
 * @param {Object=} optConfig A map of options used to configure the field.
 *    See the [field creation documentation]{@link https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/checkbox#creation}
 *    for a list of properties this parameter supports.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldBoolean = function (optValue, optValidator, optConfig) {
  /**
   * Character for the check mark. Used to apply a different check mark
   * character to individual fields.
   * @type {?string}
   * @private
   */
  if (!optValue) {
    optValue = 'FALSE';
  }
  Blockly.FieldBoolean.superClass_.constructor.call(
    this, optValue, optValidator, optConfig);

  this.size_.width = Blockly.FieldBoolean.WIDTH;
};
Blockly.utils.object.inherits(Blockly.FieldBoolean, Blockly.Field);

/**
 * Construct a FieldBoolean from a JSON arg object.
 * @param {!Object} options A JSON object with options (checked).
 * @return {!Blockly.FieldBoolean} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldBoolean.fromJson = function (options) {
  return new Blockly.FieldBoolean(options.checked, undefined, options);
};

/**
 * Used to correctly position the check mark.
 * @type {number}
 * @const
 */
Blockly.FieldBoolean.CHECK_X_OFFSET = Blockly.Field.DEFAULT_TEXT_OFFSET;

/**
 * Used to correctly position the check mark.
 * @type {number}
 * @const
 */
Blockly.FieldBoolean.CHECK_Y_OFFSET = 17.5;

/**
 * Serializable fields are saved by the XML renderer, non-serializable fields
 * are not. Editable fields should also be serializable.
 * @type {boolean}
 */
Blockly.FieldBoolean.prototype.SERIALIZABLE = true;

/**
 * Mouse cursor style when over the hotspot that initiates editability.
 */
Blockly.FieldBoolean.prototype.CURSOR = 'default';

Blockly.FieldBoolean.WIDTH = 40;

Blockly.FieldBoolean.ADDED_PADDING = 20;

Blockly.FieldBoolean.SEP_SPACE_X = 10;

/**
 * Used to tell if the field needs to be rendered the next time the block is
 * rendered. Checkbox fields are statically sized, and only need to be
 * rendered at initialization.
 * @type {boolean}
 * @protected
 */
Blockly.FieldBoolean.prototype.isDirty_ = false;

/**
 * Configure the field based on the given map of options.
 * @param {!Object} config A map of options to configure the field based on.
 * @private
 */
Blockly.FieldBoolean.prototype.configure_ = function (config) {
  Blockly.FieldBoolean.superClass_.configure_.call(this, config);
  if (config.checkCharacter) {
    this.checkChar_ = config.checkCharacter;
  }
};

Blockly.FieldBoolean.prototype.init = function () {
  if (this.fieldGroup_) {
    // Field has already been initialized once.
    return;
  }
  this.fieldGroup_ = Blockly.utils.dom.createSvgElement('g', {}, null);
  if (!this.isVisible()) {
    this.fieldGroup_.style.display = 'none';
  }
  this.sourceBlock_.getSvgRoot().appendChild(this.fieldGroup_);
  this.initView();
  this.updateEditable();
  this.setTooltip(this.tooltip_);
  this.bindEvents_();
  this.initModel();
};

/**
 * Create the block UI for this checkbox.
 * @package
 */
Blockly.FieldBoolean.prototype.initView = function () {
  this.size_.height =
      Math.max(this.size_.height, Blockly.Field.BORDER_RECT_DEFAULT_HEIGHT);
  this.size_.width =
      Math.max(this.size_.width, Blockly.FieldBoolean.WIDTH);

  // Only initialize the path, don't actually draw until the text is inserted and its width can be calculated.
  this.borderRect_ = Blockly.utils.dom.createSvgElement('path',
    {
      x: -Blockly.FieldBoolean.SEP_SPACE_X / 2,
      y: -2,
      height: this.size_.height,
      width: this.size_.width
    }, this.fieldGroup_);

  var xOffset = this.borderRect_ ? Blockly.Field.DEFAULT_TEXT_OFFSET : 0;
  this.textElement_ = Blockly.utils.dom.createSvgElement('text',
    {
      class: 'blocklyText',
      // The y position is the baseline of the text.
      y: Blockly.Field.TEXT_DEFAULT_HEIGHT_POS,
      x: xOffset
    }, this.fieldGroup_);
  this.textContent_ = document.createTextNode('');
  this.textElement_.appendChild(this.textContent_);

  this.textElement_.setAttribute('x', Blockly.FieldBoolean.CHECK_X_OFFSET);
  this.textElement_.setAttribute('y', Blockly.FieldBoolean.CHECK_Y_OFFSET);
  Blockly.utils.dom.addClass(this.textElement_, 'blocklyText');

  this.doValueUpdate_(this.value_);
};

/**
 * Toggle the state of the checkbox on click.
 * @protected
 */
Blockly.FieldBoolean.prototype.showEditor_ = function () {
  this.setValue(!this.value_);
};

/**
 * Ensure that the input value is valid ('TRUE' or 'FALSE').
 * @param {*=} optNewValue The input value.
 * @return {?string} A valid value ('TRUE' or 'FALSE), or null if invalid.
 * @protected
 */
Blockly.FieldBoolean.prototype.doClassValidation_ = function (optNewValue) {
  if (optNewValue === true || optNewValue === 'TRUE') {
    return 'TRUE';
  }
  if (optNewValue === false || optNewValue === 'FALSE') {
    return 'FALSE';
  }
  return null;
};

/**
 * Update the value of the field, and update the checkElement.
 * @param {*} newValue The value to be saved. The default validator guarantees
 * that this is a either 'TRUE' or 'FALSE'.
 * @protected
 */
Blockly.FieldBoolean.prototype.doValueUpdate_ = function (newValue) {
  const oldVal = this.value_;
  this.value_ = this.convertValueToBool_(newValue);

  if (this.sourceBlock_ && Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.BlockChange(
      this.sourceBlock_, 'field', this.name, oldVal, this.value_));
  }

  // Update visual.
  if (this.textElement_) {
    this.textContent_.nodeValue = this.value_ ? Blockly.Msg.LOGIC_BOOLEAN_TRUE : Blockly.Msg.LOGIC_BOOLEAN_FALSE;
    this.updateSize_();
    // this.isDirty_ = true;
  }
};

Blockly.FieldBoolean.prototype.updateSize_ = function() {
  var textWidth = Blockly.utils.dom.getTextWidth(this.textElement_);

  if (textWidth === 0) {
    textWidth = 8 * this.textElement_.textContent.length;
  }

  var tempWidth = textWidth + Blockly.FieldBoolean.ADDED_PADDING;

  if (tempWidth < Blockly.FieldBoolean.WIDTH) {
    tempWidth = Blockly.FieldBoolean.WIDTH;
  }

  this.textElement_.setAttribute('x', (tempWidth - textWidth) / 2);

  if (this.borderRect_) {
    var padding = tempWidth / 2;
    var diagonalLength = ((this.size_.height - 5) / 2);
    var newPath = 'm 0,0 H ' + (textWidth / 2) +
                ' l ' + diagonalLength + ',' + diagonalLength + ' v 5 ' +
                ' l ' + (-diagonalLength) + ',' + diagonalLength +
                ' H ' + (-textWidth / 2) +
                ' l ' + (-diagonalLength) + ',' + (-diagonalLength) + ' v -5 ' +
                ' l ' + diagonalLength + ',' + (-diagonalLength) + ' z';
    this.borderRect_.setAttribute('d', newPath);
    this.borderRect_.setAttribute('transform', 'translate(' + padding + ',0)');
    this.borderRect_.setAttribute('width', textWidth);
  }

  // if (this.borderRect_) {
  //   this.borderRect_.setAttribute('width',
  //       width + Blockly.BlockSvg.SEP_SPACE_X);
  // }
  this.size_.width = textWidth + Blockly.FieldBoolean.ADDED_PADDING;
};

/**
 * Get the value of this field, either 'TRUE' or 'FALSE'.
 * @return {string} The value of this field.
 */
Blockly.FieldBoolean.prototype.getValue = function () {
  return this.value_ ? 'TRUE' : 'FALSE';
};

/**
 * Get the boolean value of this field.
 * @return {boolean} The boolean value of this field.
 */
Blockly.FieldBoolean.prototype.getValueBoolean = function () {
  return /** @type {boolean} */ (this.value_);
};

/**
 * Get the text of this field. Used when the block is collapsed.
 * @return {string} Text representing the value of this field
 *    ('true' or 'false').
 */
Blockly.FieldBoolean.prototype.getText = function () {
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
Blockly.FieldBoolean.prototype.convertValueToBool_ = function (value) {
  if (typeof value === 'string') {
    return value === 'TRUE';
  } else {
    return !!value;
  }
};

Blockly.fieldRegistry.register('field_boolean', Blockly.FieldBoolean);
