/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Google Inc.
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
 * @fileoverview Number input field
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.FieldNumber');

goog.require('Blockly.FieldTextInput');
goog.require('goog.math');

/**
 * Class for an editable number field.
 * @param {string} value The initial content of the field.
 * @param {Function=} opt_validator An optional function that is called
 *     to validate any constraints on what the user entered.  Takes the new
 *     text as an argument and returns either the accepted text, a replacement
 *     text, or null to abort the change.
 * @extends {Blockly.FieldTextInput}
 * @constructor
 */
Blockly.FieldNumber = function(value, opt_validator) {
  Blockly.FieldNumber.superClass_.constructor.call(this, value, opt_validator);
};
goog.inherits(Blockly.FieldNumber, Blockly.FieldTextInput);

/**
 * Steps between allowed numbers.
 * @private
 * @type {number}
 */
Blockly.FieldNumber.prototype.precision_ = 0;

/**
 * Minimum allowed value.
 * @private
 * @type {number}
 */
Blockly.FieldNumber.prototype.min_ = -Infinity;

/**
 * Maximum allowed value.
 * @private
 * @type {number}
 */
Blockly.FieldNumber.prototype.max_ = Infinity;

/**
 * Setting precision (usually a power of 10) enforces a minimum step between
 * values. That is, the user's value will rounded to the closest multiple of
 * precision. The least significant digit place is inferred from the precision.
 * Integers values can be enforces by choosing an integer precision.
 * @param {number|string|undefined} precision Precision for value.
 */
Blockly.FieldNumber.prototype.setPrecision = function(precision) {
  precision = parseFloat(precision);
  if (!isNaN(precision)) {
    this.precision_ = precision;
  }
};

/**
 * Set a maximum limit on this field's value.
 * @param {number|string|undefined} max Maximum value.
 */
Blockly.FieldNumber.prototype.setMin = function(min) {
  min = parseFloat(min);
  if (!isNaN(min)) {
    this.min_ = min;
  }
};

/**
 * Set a maximum limit on this field's value.
 * @param {number|string|undefined} max Minimum value.
 */
Blockly.FieldNumber.prototype.setMax = function(max) {
  max = parseFloat(max);
  if (!isNaN(max)) {
    this.max_ = max;
  }
};

/**
 * Sets a new change handler for number field.
 * @param {Function} handler New change handler, or null.
 */
Blockly.FieldNumber.prototype.setValidator = function(handler) {
  var wrappedHandler;
  if (handler) {
    // Wrap the user's change handler together with the angle validator.
    wrappedHandler = function(value) {
      var v1 = handler.call(this, value);
      if (v1 === null) {
        var v2 = v1;
      } else {
        if (v1 === undefined) {
          v1 = value;
        }
        var v2 = Blockly.FieldNumber.numberValidator.call(this, v1);
        if (v2 === undefined) {
          v2 = v1;
        }
      }
      return v2 === value ? undefined : v2;
    };
  } else {
    wrappedHandler = Blockly.FieldNumber.numberValidator;
  }
  Blockly.FieldNumber.superClass_.setValidator.call(this, wrappedHandler);
};

/**
 * Ensure that only a number in the correct range may be entered.
 * @param {string} text The user's text.
 * @return {?string} A string representing a valid number, or null if invalid.
 */
Blockly.FieldNumber.numberValidator = function(text) {
  if (text === null) {
    return null;
  }
  text = String(text);
  // TODO: Handle cases like 'ten', '1.203,14', etc.
  // 'O' is sometimes mistaken for '0' by inexperienced users.
  text = text.replace(/O/ig, '0');
  // Strip out thousands separators.
  text = text.replace(/,/g, '');
  var n = parseFloat(text || 0);
  if (isNaN(n)) {
    // Invalid number.
    return null;
  }
  // Round to nearest multiple of precision.
  if (this.precision_ && Number.isFinite(n)) {
    n = Math.round(n / this.precision_) * this.precision_;
  }
  // Get the value in range.
  n = goog.math.clamp(n, this.min_, this.max_);
  return String(n);
};
