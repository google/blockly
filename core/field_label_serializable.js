/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Non-editable, serializable text field. Behaves like a
 *    normal label but is serialized to XML. It may only be
 *    edited programmatically.
 */
'use strict';

/**
 * Non-editable, serializable text field. Behaves like a
 *    normal label but is serialized to XML. It may only be
 *    edited programmatically.
 * @class
 */
goog.module('Blockly.FieldLabelSerializable');

const fieldRegistry = goog.require('Blockly.fieldRegistry');
const parsing = goog.require('Blockly.utils.parsing');
const {FieldLabel} = goog.require('Blockly.FieldLabel');


/**
 * Class for a non-editable, serializable text field.
 * @extends {FieldLabel}
 * @alias Blockly.FieldLabelSerializable
 */
class FieldLabelSerializable extends FieldLabel {
  /**
   * @param {string=} opt_value The initial value of the field. Should cast to a
   *    string. Defaults to an empty string if null or undefined.
   * @param {string=} opt_class Optional CSS class for the field's text.
   * @param {Object=} opt_config A map of options used to configure the field.
   *    See the [field creation documentation]{@link
   * https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/label-serializable#creation}
   *    for a list of properties this parameter supports.
   */
  constructor(opt_value, opt_class, opt_config) {
    super(String(opt_value ?? ''), opt_class, opt_config);

    /**
     * Editable fields usually show some sort of UI indicating they are
     * editable. This field should not.
     * @type {boolean}
     */
    this.EDITABLE = false;

    /**
     * Serializable fields are saved by the XML renderer, non-serializable
     * fields are not.  This field should be serialized, but only edited
     * programmatically.
     * @type {boolean}
     */
    this.SERIALIZABLE = true;
  }

  /**
   * Construct a FieldLabelSerializable from a JSON arg object,
   * dereferencing any string table references.
   * @param {!Object} options A JSON object with options (text, and class).
   * @return {!FieldLabelSerializable} The new field instance.
   * @package
   * @nocollapse
   * @override
   */
  static fromJson(options) {
    const text = parsing.replaceMessageReferences(options['text']);
    // `this` might be a subclass of FieldLabelSerializable if that class
    // doesn't override the static fromJson method.
    return new this(text, undefined, options);
  }
}

fieldRegistry.register('field_label_serializable', FieldLabelSerializable);

exports.FieldLabelSerializable = FieldLabelSerializable;
