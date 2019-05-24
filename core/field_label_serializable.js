/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2019 Google Inc.
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
 * @fileoverview Non-editable, serializable text field. Behaves like a
 *    normal label but is serialized to XML. It may only be
 *    edited programmatically.
 */
'use strict';

goog.provide('Blockly.FieldLabelSerializable');

goog.require('Blockly.FieldLabel');
goog.require('Blockly.utils');


/**
 * Class for a non-editable, serializable text field.
 * @param {*} opt_value The initial value of the field. Should cast to a
 *    string. Defaults to an empty string if null or undefined.
 * @param {string=} opt_class Optional CSS class for the field's text.
 * @extends {Blockly.FieldLabel}
 * @constructor
 *
 */
Blockly.FieldLabelSerializable = function(opt_value, opt_class) {
  Blockly.FieldLabelSerializable.superClass_.constructor.call(this, opt_value,
      opt_class);
};
goog.inherits(Blockly.FieldLabelSerializable, Blockly.FieldLabel);

/**
 * Construct a FieldLabelSerializable from a JSON arg object,
 * dereferencing any string table references.
 * @param {!Object} options A JSON object with options (text, and class).
 * @returns {!Blockly.FieldLabelSerializable} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldLabelSerializable.fromJson = function(options) {
  var text = Blockly.utils.replaceMessageReferences(options['text']);
  return new Blockly.FieldLabelSerializable(text, options['class']);
};

/**
 * Editable fields usually show some sort of UI indicating they are
 * editable. This field should not.
 * @type {boolean}
 * @public
 */
Blockly.FieldLabelSerializable.prototype.EDITABLE = false;

/**
 * Serializable fields are saved by the XML renderer, non-serializable fields
 * are not.  This field should be serialized, but only edited programmatically.
 * @type {boolean}
 * @public
 */
Blockly.FieldLabelSerializable.prototype.SERIALIZABLE = true;

Blockly.Field.register(
    'field_label_serializable', Blockly.FieldLabelSerializable);
