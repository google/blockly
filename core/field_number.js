/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Number input field
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.FieldNumber');

goog.require('Blockly.fieldRegistry');
goog.require('Blockly.FieldTextInput');
goog.require('Blockly.utils.aria');
goog.require('Blockly.utils.object');


/**
 * Class for an editable number field.
 * @param {string|number=} opt_value The initial value of the field. Should cast
 *    to a number. Defaults to 0.
 * @param {?(string|number)=} opt_min Minimum value.
 * @param {?(string|number)=} opt_max Maximum value.
 * @param {?(string|number)=} opt_precision Precision for value.
 * @param {?Function=} opt_validator A function that is called to validate
 *    changes to the field's value. Takes in a number & returns a validated
 *    number, or null to abort the change.
 * @param {Object=} opt_config A map of options used to configure the field.
 *    See the [field creation documentation]{@link https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/number#creation}
 *    for a list of properties this parameter supports.
 * @extends {Blockly.FieldTextInput}
 * @constructor
 */
Blockly.FieldNumber = function(opt_value, opt_min, opt_max, opt_precision,
    opt_validator, opt_config) {

  /**
   * The minimum value this number field can contain.
   * @type {number}
   * @protected
   */
  this.min_ = -Infinity;

  /**
   * The maximum value this number field can contain.
   * @type {number}
   * @protected
   */
  this.max_ = Infinity;

  /**
   * The multiple to which this fields value is rounded.
   * @type {number}
   * @protected
   */
  this.precision_ = 0;

  /**
   * The number of decimal places to allow, or null to allow any number of
   * decimal digits.
   * @type {?number}
   * @private
   */
  this.decimalPlaces_ = null;

  Blockly.FieldNumber.superClass_.constructor.call(
      this, opt_value || 0, opt_validator, opt_config);

  if (!opt_config) {  // Only do one kind of configuration or the other.
    this.setConstraints(opt_min, opt_max, opt_precision);
  }
};
Blockly.utils.object.inherits(Blockly.FieldNumber, Blockly.FieldTextInput);

/**
 * Construct a FieldNumber from a JSON arg object.
 * @param {!Object} options A JSON object with options (value, min, max, and
 *                          precision).
 * @return {!Blockly.FieldNumber} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldNumber.fromJson = function(options) {
  return new Blockly.FieldNumber(options['value'],
      undefined, undefined, undefined, undefined, options);
};

/**
 * Serializable fields are saved by the XML renderer, non-serializable fields
 * are not. Editable fields should also be serializable.
 * @type {boolean}
 */
Blockly.FieldNumber.prototype.SERIALIZABLE = true;

/**
 * Configure the field based on the given map of options.
 * @param {!Object} config A map of options to configure the field based on.
 * @private
 */
Blockly.FieldNumber.prototype.configure_ = function(config) {
  Blockly.FieldNumber.superClass_.configure_.call(this, config);
  this.setMinInternal_(config['min']);
  this.setMaxInternal_(config['max']);
  this.setPrecisionInternal_(config['precision']);
};

/**
 * Set the maximum, minimum and precision constraints on this field.
 * Any of these properties may be undefined or NaN to be disabled.
 * Setting precision (usually a power of 10) enforces a minimum step between
 * values. That is, the user's value will rounded to the closest multiple of
 * precision. The least significant digit place is inferred from the precision.
 * Integers values can be enforces by choosing an integer precision.
 * @param {?(number|string|undefined)} min Minimum value.
 * @param {?(number|string|undefined)} max Maximum value.
 * @param {?(number|string|undefined)} precision Precision for value.
 */
Blockly.FieldNumber.prototype.setConstraints = function(min, max, precision) {
  this.setMinInternal_(min);
  this.setMaxInternal_(max);
  this.setPrecisionInternal_(precision);
  this.setValue(this.getValue());
};

/**
 * Sets the minimum value this field can contain. Updates the value to reflect.
 * @param {?(number|string|undefined)} min Minimum value.
 */
Blockly.FieldNumber.prototype.setMin = function(min) {
  this.setMinInternal_(min);
  this.setValue(this.getValue());
};

/**
 * Sets the minimum value this field can contain. Called internally to avoid
 * value updates.
 * @param {?(number|string|undefined)} min Minimum value.
 * @private
 */
Blockly.FieldNumber.prototype.setMinInternal_ = function(min) {
  if (min == null) {
    this.min_ = -Infinity;
  } else {
    min = Number(min);
    if (!isNaN(min)) {
      this.min_ = min;
    }
  }
};

/**
 * Returns the current minimum value this field can contain. Default is
 * -Infinity.
 * @return {number} The current minimum value this field can contain.
 */
Blockly.FieldNumber.prototype.getMin = function() {
  return this.min_;
};

/**
 * Sets the maximum value this field can contain. Updates the value to reflect.
 * @param {?(number|string|undefined)} max Maximum value.
 */
Blockly.FieldNumber.prototype.setMax = function(max) {
  this.setMaxInternal_(max);
  this.setValue(this.getValue());
};

/**
 * Sets the maximum value this field can contain. Called internally to avoid
 * value updates.
 * @param {?(number|string|undefined)} max Maximum value.
 * @private
 */
Blockly.FieldNumber.prototype.setMaxInternal_ = function(max) {
  if (max == null) {
    this.max_ = Infinity;
  } else {
    max = Number(max);
    if (!isNaN(max)) {
      this.max_ = max;
    }
  }
};

/**
 * Returns the current maximum value this field can contain. Default is
 * Infinity.
 * @return {number} The current maximum value this field can contain.
 */
Blockly.FieldNumber.prototype.getMax = function() {
  return this.max_;
};

/**
 * Sets the precision of this field's value, i.e. the number to which the
 * value is rounded. Updates the field to reflect.
 * @param {?(number|string|undefined)} precision The number to which the
 *    field's value is rounded.
 */
Blockly.FieldNumber.prototype.setPrecision = function(precision) {
  this.setPrecisionInternal_(precision);
  this.setValue(this.getValue());
};

/**
 * Sets the precision of this field's value. Called internally to avoid
 * value updates.
 * @param {?(number|string|undefined)} precision The number to which the
 *    field's value is rounded.
 * @private
 */
Blockly.FieldNumber.prototype.setPrecisionInternal_ = function(precision) {
  if (precision == null) {
    // Number(precision) would also be 0, but set explicitly to be clear.
    this.precision_ = 0;
  } else {
    precision = Number(precision);
    if (!isNaN(precision)) {
      this.precision_ = precision;
    }
  }

  var precisionString = this.precision_.toString();
  var decimalIndex = precisionString.indexOf('.');
  if (decimalIndex == -1) {
    // If the precision is 0 (float) allow any number of decimals,
    // otherwise allow none.
    this.decimalPlaces_ = precision ? 0 : null;
  } else {
    this.decimalPlaces_ = precisionString.length - decimalIndex - 1;
  }
};

/**
 * Returns the current precision of this field. The precision being the
 * number to which the field's value is rounded. A precision of 0 means that
 * the value is not rounded.
 * @return {number} The number to which this field's value is rounded.
 */
Blockly.FieldNumber.prototype.getPrecision = function() {
  return this.precision_;
};

/**
 * Ensure that the input value is a valid number (must fulfill the
 * constraints placed on the field).
 * @param {*=} opt_newValue The input value.
 * @return {?number} A valid number, or null if invalid.
 * @protected
 * @override
 */
Blockly.FieldNumber.prototype.doClassValidation_ = function(opt_newValue) {
  if (opt_newValue === null) {
    return null;
  }
  // Clean up text.
  var newValue = String(opt_newValue);
  // TODO: Handle cases like 'ten', '1.203,14', etc.
  // 'O' is sometimes mistaken for '0' by inexperienced users.
  newValue = newValue.replace(/O/ig, '0');
  // Strip out thousands separators.
  newValue = newValue.replace(/,/g, '');
  // Ignore case of 'Infinity'.
  newValue = newValue.replace(/infinity/i, 'Infinity');

  // Clean up number.
  var n = Number(newValue || 0);
  if (isNaN(n)) {
    // Invalid number.
    return null;
  }
  // Get the value in range.
  n = Math.min(Math.max(n, this.min_), this.max_);
  // Round to nearest multiple of precision.
  if (this.precision_ && isFinite(n)) {
    n = Math.round(n / this.precision_) * this.precision_;
  }
  // Clean up floating point errors.
  if (this.decimalPlaces_ != null) {
    n = Number(n.toFixed(this.decimalPlaces_));
  }
  return n;
};

/**
 * Create the number input editor widget.
 * @return {!HTMLElement} The newly created number input editor.
 * @protected
 * @override
 */
Blockly.FieldNumber.prototype.widgetCreate_ = function() {
  var htmlInput = Blockly.FieldNumber.superClass_.widgetCreate_.call(this);

  // Set the accessibility state
  if (this.min_ > -Infinity) {
    Blockly.utils.aria.setState(htmlInput,
        Blockly.utils.aria.State.VALUEMIN, this.min_);
  }
  if (this.max_ < Infinity) {
    Blockly.utils.aria.setState(htmlInput,
        Blockly.utils.aria.State.VALUEMAX, this.max_);
  }
  return htmlInput;
};

Blockly.fieldRegistry.register('field_number', Blockly.FieldNumber);
