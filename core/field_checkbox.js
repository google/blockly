/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Checkbox field.  Checked or not checked.
 */
'use strict';

/**
 * Checkbox field.  Checked or not checked.
 * @class
 */
goog.module('Blockly.FieldCheckbox');

const dom = goog.require('Blockly.utils.dom');
const fieldRegistry = goog.require('Blockly.fieldRegistry');
const {Field} = goog.require('Blockly.Field');
/* eslint-disable-next-line no-unused-vars */
const {Sentinel} = goog.requireType('Blockly.utils.Sentinel');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.BlockChange');


/**
 * Class for a checkbox field.
 * @extends {Field}
 * @alias Blockly.FieldCheckbox
 */
class FieldCheckbox extends Field {
  /**
   * @param {(string|boolean|!Sentinel)=} opt_value The initial value of
   *     the field. Should either be 'TRUE', 'FALSE' or a boolean. Defaults to
   *     'FALSE'.
   *     Also accepts Field.SKIP_SETUP if you wish to skip setup (only used by
   *     subclasses that want to handle configuration and setting the field
   *     value after their own constructors have run).
   * @param {Function=} opt_validator  A function that is called to validate
   *     changes to the field's value. Takes in a value ('TRUE' or 'FALSE') &
   *     returns a validated value ('TRUE' or 'FALSE'), or null to abort the
   *     change.
   * @param {Object=} opt_config A map of options used to configure the field.
   *     See the [field creation documentation]{@link
   *     https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/checkbox#creation}
   *     for a list of properties this parameter supports.
   */
  constructor(opt_value, opt_validator, opt_config) {
    super(Field.SKIP_SETUP);

    /**
     * Character for the check mark. Used to apply a different check mark
     * character to individual fields.
     * @type {string}
     * @private
     */
    this.checkChar_ = FieldCheckbox.CHECK_CHAR;

    /**
     * Serializable fields are saved by the serializer, non-serializable fields
     * are not. Editable fields should also be serializable.
     * @type {boolean}
     */
    this.SERIALIZABLE = true;

    /**
     * Mouse cursor style when over the hotspot that initiates editability.
     * @type {string}
     */
    this.CURSOR = 'default';

    if (opt_value === Field.SKIP_SETUP) return;
    if (opt_config) this.configure_(opt_config);
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
    if (config['checkCharacter']) {
      this.checkChar_ = config['checkCharacter'];
    }
  }

  /**
   * Saves this field's value.
   * @return {*} The boolean value held by this field.
   * @override
   * @package
   */
  saveState() {
    const legacyState = this.saveLegacyState(FieldCheckbox);
    if (legacyState !== null) {
      return legacyState;
    }
    return this.getValueBoolean();
  }

  /**
   * Create the block UI for this checkbox.
   * @package
   */
  initView() {
    super.initView();

    dom.addClass(
        /** @type {!SVGTextElement} **/ (this.textElement_), 'blocklyCheckbox');
    this.textElement_.style.display = this.value_ ? 'block' : 'none';
  }

  /**
   * @override
   */
  render_() {
    if (this.textContent_) {
      this.textContent_.nodeValue = this.getDisplayText_();
    }
    this.updateSize_(this.getConstants().FIELD_CHECKBOX_X_OFFSET);
  }

  /**
   * @override
   */
  getDisplayText_() {
    return this.checkChar_;
  }

  /**
   * Set the character used for the check mark.
   * @param {?string} character The character to use for the check mark, or
   *    null to use the default.
   */
  setCheckCharacter(character) {
    this.checkChar_ = character || FieldCheckbox.CHECK_CHAR;
    this.forceRerender();
  }

  /**
   * Toggle the state of the checkbox on click.
   * @protected
   */
  showEditor_() {
    this.setValue(!this.value_);
  }

  /**
   * Ensure that the input value is valid ('TRUE' or 'FALSE').
   * @param {*=} opt_newValue The input value.
   * @return {?string} A valid value ('TRUE' or 'FALSE), or null if invalid.
   * @protected
   */
  doClassValidation_(opt_newValue) {
    if (opt_newValue === true || opt_newValue === 'TRUE') {
      return 'TRUE';
    }
    if (opt_newValue === false || opt_newValue === 'FALSE') {
      return 'FALSE';
    }
    return null;
  }

  /**
   * Update the value of the field, and update the checkElement.
   * @param {*} newValue The value to be saved. The default validator guarantees
   * that this is a either 'TRUE' or 'FALSE'.
   * @protected
   */
  doValueUpdate_(newValue) {
    this.value_ = this.convertValueToBool_(newValue);
    // Update visual.
    if (this.textElement_) {
      this.textElement_.style.display = this.value_ ? 'block' : 'none';
    }
  }

  /**
   * Get the value of this field, either 'TRUE' or 'FALSE'.
   * @return {string} The value of this field.
   */
  getValue() {
    return this.value_ ? 'TRUE' : 'FALSE';
  }

  /**
   * Get the boolean value of this field.
   * @return {boolean} The boolean value of this field.
   */
  getValueBoolean() {
    return /** @type {boolean} */ (this.value_);
  }

  /**
   * Get the text of this field. Used when the block is collapsed.
   * @return {string} Text representing the value of this field
   *    ('true' or 'false').
   */
  getText() {
    return String(this.convertValueToBool_(this.value_));
  }

  /**
   * Convert a value into a pure boolean.
   *
   * Converts 'TRUE' to true and 'FALSE' to false correctly, everything else
   * is cast to a boolean.
   * @param {*} value The value to convert.
   * @return {boolean} The converted value.
   * @private
   */
  convertValueToBool_(value) {
    if (typeof value === 'string') {
      return value === 'TRUE';
    } else {
      return !!value;
    }
  }

  /**
   * Construct a FieldCheckbox from a JSON arg object.
   * @param {!Object} options A JSON object with options (checked).
   * @return {!FieldCheckbox} The new field instance.
   * @package
   * @nocollapse
   */
  static fromJson(options) {
    // `this` might be a subclass of FieldCheckbox if that class doesn't
    // 'override' the static fromJson method.
    return new this(options['checked'], undefined, options);
  }
}

/**
 * The default value for this field.
 * @type {*}
 * @protected
 */
FieldCheckbox.prototype.DEFAULT_VALUE = false;

/**
 * Default character for the checkmark.
 * @type {string}
 * @const
 */
FieldCheckbox.CHECK_CHAR = '\u2713';

fieldRegistry.register('field_checkbox', FieldCheckbox);

exports.FieldCheckbox = FieldCheckbox;
