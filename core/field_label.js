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
const object = goog.require('Blockly.utils.object');
const parsing = goog.require('Blockly.utils.parsing');
const {Field} = goog.require('Blockly.Field');


/**
 * Class for a non-editable, non-serializable text field.
 * @param {string=} opt_value The initial value of the field. Should cast to a
 *    string. Defaults to an empty string if null or undefined.
 * @param {string=} opt_class Optional CSS class for the field's text.
 * @param {Object=} opt_config A map of options used to configure the field.
 *    See the [field creation documentation]{@link
 * https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/label#creation}
 *    for a list of properties this parameter supports.
 * @extends {Field}
 * @constructor
 * @alias Blockly.FieldLabel
 */
const FieldLabel = function(opt_value, opt_class, opt_config) {
  /**
   * The html class name to use for this field.
   * @type {?string}
   * @private
   */
  this.class_ = null;

  FieldLabel.superClass_.constructor.call(this, opt_value, null, opt_config);

  if (!opt_config) {  // If the config was not passed use old configuration.
    this.class_ = opt_class || null;
  }
};
object.inherits(FieldLabel, Field);

/**
 * The default value for this field.
 * @type {*}
 * @protected
 */
FieldLabel.prototype.DEFAULT_VALUE = '';

/**
 * Construct a FieldLabel from a JSON arg object,
 * dereferencing any string table references.
 * @param {!Object} options A JSON object with options (text, and class).
 * @return {!FieldLabel} The new field instance.
 * @package
 * @nocollapse
 */
FieldLabel.fromJson = function(options) {
  const text = parsing.replaceMessageReferences(options['text']);
  // `this` might be a subclass of FieldLabel if that class doesn't override
  // the static fromJson method.
  return new this(text, undefined, options);
};

/**
 * Editable fields usually show some sort of UI indicating they are
 * editable. This field should not.
 * @type {boolean}
 */
FieldLabel.prototype.EDITABLE = false;

/**
 * @override
 */
FieldLabel.prototype.configure_ = function(config) {
  FieldLabel.superClass_.configure_.call(this, config);
  this.class_ = config['class'];
};

/**
 * Create block UI for this label.
 * @package
 */
FieldLabel.prototype.initView = function() {
  this.createTextElement_();
  if (this.class_) {
    dom.addClass(
        /** @type {!SVGTextElement} */ (this.textElement_), this.class_);
  }
};

/**
 * Ensure that the input value casts to a valid string.
 * @param {*=} opt_newValue The input value.
 * @return {?string} A valid string, or null if invalid.
 * @protected
 */
FieldLabel.prototype.doClassValidation_ = function(opt_newValue) {
  if (opt_newValue === null || opt_newValue === undefined) {
    return null;
  }
  return String(opt_newValue);
};

/**
 * Set the CSS class applied to the field's textElement_.
 * @param {?string} cssClass The new CSS class name, or null to remove.
 */
FieldLabel.prototype.setClass = function(cssClass) {
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
};

fieldRegistry.register('field_label', FieldLabel);

exports.FieldLabel = FieldLabel;
