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
 * @fileoverview Non-editable, non-serializable text field.  Used for titles,
 *    labels, etc.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.FieldLabel');

goog.require('Blockly.Field');
goog.require('Blockly.Tooltip');
goog.require('Blockly.utils');
goog.require('Blockly.utils.dom');

goog.require('goog.math.Size');


/**
 * Class for a non-editable, non-serializable text field.
 * @param {string=} opt_value The initial value of the field. Should cast to a
 *    string. Defaults to an empty string if null or undefined.
 * @param {string=} opt_class Optional CSS class for the field's text.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldLabel = function(opt_value, opt_class) {
  this.size_ = new goog.math.Size(0, 17.5);
  this.class_ = opt_class;
  opt_value = this.doClassValidation_(opt_value);
  if (opt_value === null) {
    opt_value = '';
  }
  this.setValue(opt_value);
};
goog.inherits(Blockly.FieldLabel, Blockly.Field);

/**
 * Construct a FieldLabel from a JSON arg object,
 * dereferencing any string table references.
 * @param {!Object} options A JSON object with options (text, and class).
 * @return {!Blockly.FieldLabel} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldLabel.fromJson = function(options) {
  var text = Blockly.utils.replaceMessageReferences(options['text']);
  return new Blockly.FieldLabel(text, options['class']);
};

/**
 * Editable fields usually show some sort of UI indicating they are
 * editable. This field should not.
 * @type {boolean}
 * @const
 */
Blockly.FieldLabel.prototype.EDITABLE = false;

/**
 * Create block UI for this label.
 * @package
 */
Blockly.FieldLabel.prototype.initView = function() {
  this.createTextElement_();
  this.textElement_.setAttribute('y', this.size_.height - 5);
  if (this.class_) {
    Blockly.utils.dom.addClass(this.textElement_, this.class_);
  }
};

/**
 * Ensure that the input value casts to a valid string.
 * @param {string=} newValue The input value.
 * @return {?string} A valid string, or null if invalid.
 * @protected
 */
Blockly.FieldLabel.prototype.doClassValidation_ = function(newValue) {
  if (newValue === null || newValue === undefined) {
    return null;
  }
  return String(newValue);
};

Blockly.Field.register('field_label', Blockly.FieldLabel);
