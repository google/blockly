/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Number input field
 */
'use strict';

/**
 * Number input field
 * @class
 */
goog.module('Blockly.FieldNumber');

const aria = goog.require('Blockly.utils.aria');
const fieldRegistry = goog.require('Blockly.fieldRegistry');
const {Field} = goog.require('Blockly.Field');
const {FieldTextInput} = goog.require('Blockly.FieldTextInput');
/* eslint-disable-next-line no-unused-vars */
const {Sentinel} = goog.requireType('Blockly.utils.Sentinel');


/**
 * Class for an editable number field.
 * @extends {FieldTextInput}
 * @alias Blockly.FieldNumber
 */
class FieldNumber extends FieldTextInput {
  /**
   * @param {(string|number|!Sentinel)=} opt_value The initial value of
   *     the field. Should cast to a number. Defaults to 0.
   *     Also accepts Field.SKIP_SETUP if you wish to skip setup (only used by
   *     subclasses that want to handle configuration and setting the field
   *     value after their own constructors have run).
   * @param {?(string|number)=} opt_min Minimum value. Will only be used if
   *     opt_config is not provided.
   * @param {?(string|number)=} opt_max Maximum value. Will only be used if
   *     opt_config is not provided.
   * @param {?(string|number)=} opt_precision Precision for value. Will only be
   *     used if opt_config is not provided.
   * @param {?Function=} opt_validator A function that is called to validate
   *     changes to the field's value. Takes in a number & returns a validated
   *     number, or null to abort the change.
   * @param {Object=} opt_config A map of options used to configure the field.
   *     See the [field creation documentation]{@link
   *     https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/number#creation}
   *     for a list of properties this parameter supports.
   */
  constructor(
      opt_value, opt_min, opt_max, opt_precision, opt_validator, opt_config) {
    // Pass SENTINEL so that we can define properties before value validation.
    super(Field.SKIP_SETUP);

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

    /**
     * Serializable fields are saved by the serializer, non-serializable fields
     * are not. Editable fields should also be serializable.
     * @type {boolean}
     */
    this.SERIALIZABLE = true;

    if (opt_value === Field.SKIP_SETUP) return;
    if (opt_config) {
      this.configure_(opt_config);
    } else {
      this.setConstraints(opt_min, opt_max, opt_precision);
    }
    this.setValue(opt_value);
    if (opt_validator) this.setValidator(opt_validator);
  }

  /**
   * Configure the field based on the given map of options.
   * @param {!Object} config A map of options to configure the field based on.
   * @protected
   * @override
   */
  configure_(config) {
    super.configure_(config);
    this.setMinInternal_(config['min']);
    this.setMaxInternal_(config['max']);
    this.setPrecisionInternal_(config['precision']);
  }

  /**
   * Set the maximum, minimum and precision constraints on this field.
   * Any of these properties may be undefined or NaN to be disabled.
   * Setting precision (usually a power of 10) enforces a minimum step between
   * values. That is, the user's value will rounded to the closest multiple of
   * precision. The least significant digit place is inferred from the
   * precision. Integers values can be enforces by choosing an integer
   * precision.
   * @param {?(number|string|undefined)} min Minimum value.
   * @param {?(number|string|undefined)} max Maximum value.
   * @param {?(number|string|undefined)} precision Precision for value.
   */
  setConstraints(min, max, precision) {
    this.setMinInternal_(min);
    this.setMaxInternal_(max);
    this.setPrecisionInternal_(precision);
    this.setValue(this.getValue());
  }

  /**
   * Sets the minimum value this field can contain. Updates the value to
   * reflect.
   * @param {?(number|string|undefined)} min Minimum value.
   */
  setMin(min) {
    this.setMinInternal_(min);
    this.setValue(this.getValue());
  }

  /**
   * Sets the minimum value this field can contain. Called internally to avoid
   * value updates.
   * @param {?(number|string|undefined)} min Minimum value.
   * @private
   */
  setMinInternal_(min) {
    if (min == null) {
      this.min_ = -Infinity;
    } else {
      min = Number(min);
      if (!isNaN(min)) {
        this.min_ = min;
      }
    }
  }

  /**
   * Returns the current minimum value this field can contain. Default is
   * -Infinity.
   * @return {number} The current minimum value this field can contain.
   */
  getMin() {
    return this.min_;
  }

  /**
   * Sets the maximum value this field can contain. Updates the value to
   * reflect.
   * @param {?(number|string|undefined)} max Maximum value.
   */
  setMax(max) {
    this.setMaxInternal_(max);
    this.setValue(this.getValue());
  }

  /**
   * Sets the maximum value this field can contain. Called internally to avoid
   * value updates.
   * @param {?(number|string|undefined)} max Maximum value.
   * @private
   */
  setMaxInternal_(max) {
    if (max == null) {
      this.max_ = Infinity;
    } else {
      max = Number(max);
      if (!isNaN(max)) {
        this.max_ = max;
      }
    }
  }

  /**
   * Returns the current maximum value this field can contain. Default is
   * Infinity.
   * @return {number} The current maximum value this field can contain.
   */
  getMax() {
    return this.max_;
  }

  /**
   * Sets the precision of this field's value, i.e. the number to which the
   * value is rounded. Updates the field to reflect.
   * @param {?(number|string|undefined)} precision The number to which the
   *    field's value is rounded.
   */
  setPrecision(precision) {
    this.setPrecisionInternal_(precision);
    this.setValue(this.getValue());
  }

  /**
   * Sets the precision of this field's value. Called internally to avoid
   * value updates.
   * @param {?(number|string|undefined)} precision The number to which the
   *    field's value is rounded.
   * @private
   */
  setPrecisionInternal_(precision) {
    this.precision_ = Number(precision) || 0;
    let precisionString = String(this.precision_);
    if (precisionString.indexOf('e') !== -1) {
      // String() is fast.  But it turns .0000001 into '1e-7'.
      // Use the much slower toLocaleString to access all the digits.
      precisionString =
          this.precision_.toLocaleString('en-US', {maximumFractionDigits: 20});
    }
    const decimalIndex = precisionString.indexOf('.');
    if (decimalIndex === -1) {
      // If the precision is 0 (float) allow any number of decimals,
      // otherwise allow none.
      this.decimalPlaces_ = precision ? 0 : null;
    } else {
      this.decimalPlaces_ = precisionString.length - decimalIndex - 1;
    }
  }

  /**
   * Returns the current precision of this field. The precision being the
   * number to which the field's value is rounded. A precision of 0 means that
   * the value is not rounded.
   * @return {number} The number to which this field's value is rounded.
   */
  getPrecision() {
    return this.precision_;
  }

  /**
   * Ensure that the input value is a valid number (must fulfill the
   * constraints placed on the field).
   * @param {*=} opt_newValue The input value.
   * @return {?number} A valid number, or null if invalid.
   * @protected
   * @override
   */
  doClassValidation_(opt_newValue) {
    if (opt_newValue === null) {
      return null;
    }
    // Clean up text.
    let newValue = String(opt_newValue);
    // TODO: Handle cases like 'ten', '1.203,14', etc.
    // 'O' is sometimes mistaken for '0' by inexperienced users.
    newValue = newValue.replace(/O/ig, '0');
    // Strip out thousands separators.
    newValue = newValue.replace(/,/g, '');
    // Ignore case of 'Infinity'.
    newValue = newValue.replace(/infinity/i, 'Infinity');

    // Clean up number.
    let n = Number(newValue || 0);
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
    if (this.decimalPlaces_ !== null) {
      n = Number(n.toFixed(this.decimalPlaces_));
    }
    return n;
  }

  /**
   * Create the number input editor widget.
   * @return {!HTMLElement} The newly created number input editor.
   * @protected
   * @override
   */
  widgetCreate_() {
    const htmlInput = super.widgetCreate_();

    // Set the accessibility state
    if (this.min_ > -Infinity) {
      aria.setState(htmlInput, aria.State.VALUEMIN, this.min_);
    }
    if (this.max_ < Infinity) {
      aria.setState(htmlInput, aria.State.VALUEMAX, this.max_);
    }
    return htmlInput;
  }

  /**
   * Construct a FieldNumber from a JSON arg object.
   * @param {!Object} options A JSON object with options (value, min, max, and
   *                          precision).
   * @return {!FieldNumber} The new field instance.
   * @package
   * @nocollapse
   * @override
   */
  static fromJson(options) {
    // `this` might be a subclass of FieldNumber if that class doesn't override
    // the static fromJson method.
    return new this(
        options['value'], undefined, undefined, undefined, undefined, options);
  }
}

/**
 * The default value for this field.
 * @type {*}
 * @protected
 */
FieldNumber.prototype.DEFAULT_VALUE = 0;

fieldRegistry.register('field_number', FieldNumber);

exports.FieldNumber = FieldNumber;
