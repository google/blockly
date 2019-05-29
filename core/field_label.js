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

goog.require('goog.math.Size');


/**
 * Class for a non-editable, non-serializable text field.
 * @param {string} text The initial content of the field.
 * @param {string=} opt_class Optional CSS class for the field's text.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldLabel = function(text, opt_class) {
  this.size_ = new goog.math.Size(0, 17.5);
  this.class_ = opt_class;
  this.setValue(text);
  this.tooltip_ = '';
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
  this.textElement_ = Blockly.utils.createSvgElement('text',
      {
        'class': 'blocklyText',
        'y': this.size_.height - 5
      }, this.fieldGroup_);
  if (this.class_) {
    Blockly.utils.addClass(this.textElement_, this.class_);
  }

  if (this.tooltip_) {
    this.textElement_.tooltip = this.tooltip_;
  } else {
    // Configure the field to be transparent with respect to tooltips.
    this.textElement_.tooltip = this.sourceBlock_;
  }
  Blockly.Tooltip.bindMouseEvents(this.textElement_);
};

/**
 * Dispose of all DOM objects belonging to this text.
 */
Blockly.FieldLabel.prototype.dispose = function() {
  if (this.textElement_) {
    Blockly.utils.removeNode(this.textElement_);
    this.textElement_ = null;
  }
};

/**
 * Change the tooltip text for this field.
 * @param {string|!Element} newTip Text for tooltip or a parent element to
 *     link to for its tooltip.
 */
Blockly.FieldLabel.prototype.setTooltip = function(newTip) {
  this.tooltip_ = newTip;
  if (this.textElement_) {
    this.textElement_.tooltip = newTip;
  }
};

Blockly.FieldLabel.prototype.getCorrectedSize = function() {
  // getSize also renders and updates the size if needed.  Rather than duplicate
  // the logic to figure out whether to rerender, just call getSize.
  this.getSize();
  return new goog.math.Size(this.size_.width, this.size_.height - 5);
};

Blockly.Field.register('field_label', Blockly.FieldLabel);
