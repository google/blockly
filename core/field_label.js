/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Non-editable, non-serializable text field.  Used for titles,
 *    labels, etc.
 */
'use strict';

/**
 * Non-editable, non-serializable text field.  Used for titles,
 *    labels, etc.
 * @class
 */
goog.module('Blockly.FieldLabel');

const dom = goog.require('Blockly.utils.dom');
const fieldRegistry = goog.require('Blockly.fieldRegistry');
const parsing = goog.require('Blockly.utils.parsing');
const {Field} = goog.require('Blockly.Field');
/* eslint-disable-next-line no-unused-vars */
const {Sentinel} = goog.requireType('Blockly.utils.Sentinel');


/**
 * Class for a non-editable, non-serializable text field.
 * @extends {Field}
 * @alias Blockly.FieldLabel
 */
class FieldLabel extends Field {
  /**
   * @param {(string|!Sentinel)=} opt_value The initial value of the
   *     field. Should cast to a string. Defaults to an empty string if null or
   *     undefined.
   *     Also accepts Field.SKIP_SETUP if you wish to skip setup (only used by
   *     subclasses that want to handle configuration and setting the field
   *     value after their own constructors have run).
   * @param {string=} opt_class Optional CSS class for the field's text.
   * @param {Object=} opt_config A map of options used to configure the field.
   *    See the [field creation documentation]{@link
   * https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/label#creation}
   *    for a list of properties this parameter supports.
   */
  constructor(opt_value, opt_class, opt_config) {
    super(Field.SKIP_SETUP);

    /**
     * The html class name to use for this field.
     * @type {?string}
     * @private
     */
    this.class_ = null;

    /**
     * Editable fields usually show some sort of UI indicating they are
     * editable. This field should not.
     * @type {boolean}
     */
    this.EDITABLE = false;

    if (opt_value === Field.SKIP_SETUP) return;
    if (opt_config) {
      this.configure_(opt_config);
    } else {
      this.class_ = opt_class || null;
    }
    this.setValue(opt_value);
  }

  /**
   * @override
   */
  configure_(config) {
    super.configure_(config);
    this.class_ = config['class'];
  }

  /**
   * Create block UI for this label.
   * @package
   */
  initView() {
    this.createTextElement_();
    if (this.class_) {
      dom.addClass(
          /** @type {!SVGTextElement} */ (this.textElement_), this.class_);
    }
  }

  /**
   * Ensure that the input value casts to a valid string.
   * @param {*=} opt_newValue The input value.
   * @return {?string} A valid string, or null if invalid.
   * @protected
   */
  doClassValidation_(opt_newValue) {
    if (opt_newValue === null || opt_newValue === undefined) {
      return null;
    }
    return String(opt_newValue);
  }

  /**
   * Set the CSS class applied to the field's textElement_.
   * @param {?string} cssClass The new CSS class name, or null to remove.
   */
  setClass(cssClass) {
    if (this.textElement_) {
      // This check isn't necessary, but it's faster than letting removeClass
      // figure it out.
      if (this.class_) {
        dom.removeClass(this.textElement_, this.class_);
      }
      if (cssClass) {
        dom.addClass(this.textElement_, cssClass);
      }
    }
    this.class_ = cssClass;
  }

  /**
   * Construct a FieldLabel from a JSON arg object,
   * dereferencing any string table references.
   * @param {!Object} options A JSON object with options (text, and class).
   * @return {!FieldLabel} The new field instance.
   * @package
   * @nocollapse
   */
  static fromJson(options) {
    const text = parsing.replaceMessageReferences(options['text']);
    // `this` might be a subclass of FieldLabel if that class doesn't override
    // the static fromJson method.
    return new this(text, undefined, options);
  }
}

/**
 * The default value for this field.
 * @type {*}
 * @protected
 */
FieldLabel.prototype.DEFAULT_VALUE = '';

fieldRegistry.register('field_label', FieldLabel);

exports.FieldLabel = FieldLabel;
