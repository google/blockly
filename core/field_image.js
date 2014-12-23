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
 * @fileoverview Image field.  Used for titles, labels, etc.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.FieldImage');

goog.require('Blockly.Field');
goog.require('goog.userAgent');


/**
 * Class for an image.
 * @param {string} src The URL of the image.
 * @param {number} width Width of the image.
 * @param {number} height Height of the image.
 * @param {?string} opt_alt Optional alt text for when block is collapsed.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldImage = function(src, width, height, opt_alt) {
  this.sourceBlock_ = null;
  // Ensure height and width are numbers.  Strings are bad at math.
  this.height_ = Number(height);
  this.width_ = Number(width);
  this.size_ = {height: this.height_ + 10, width: this.width_};
  this.text_ = opt_alt || '';
  // Build the DOM.
  var offsetY = 6 - Blockly.BlockSvg.FIELD_HEIGHT;
  this.fieldGroup_ = Blockly.createSvgElement('g', {}, null);
  this.imageElement_ = Blockly.createSvgElement('image',
      {'height': this.height_ + 'px',
       'width': this.width_ + 'px',
       'y': offsetY}, this.fieldGroup_);
  this.setValue(src);
  if (goog.userAgent.GECKO) {
    // Due to a Firefox bug which eats mouse events on image elements,
    // a transparent rectangle needs to be placed on top of the image.
    this.rectElement_ = Blockly.createSvgElement('rect',
        {'height': this.height_ + 'px',
         'width': this.width_ + 'px',
         'y': offsetY,
         'fill-opacity': 0}, this.fieldGroup_);
  }
};
goog.inherits(Blockly.FieldImage, Blockly.Field);

/**
 * Clone this FieldImage.
 * @return {!Blockly.FieldImage} The result of calling the constructor again
 *   with the current values of the arguments used during construction.
 */
Blockly.FieldImage.prototype.clone = function() {
  return new Blockly.FieldImage(this.getSrc(), this.width_, this.height_,
      this.getText());
};

/**
 * Rectangular mask used by Firefox.
 * @type {Element}
 * @private
 */
Blockly.FieldImage.prototype.rectElement_ = null;

/**
 * Editable fields are saved by the XML renderer, non-editable fields are not.
 */
Blockly.FieldImage.prototype.EDITABLE = false;

/**
 * Install this text on a block.
 * @param {!Blockly.Block} block The block containing this text.
 */
Blockly.FieldImage.prototype.init = function(block) {
  if (this.sourceBlock_) {
    // Image has already been initialized once.
    return;
  }
  this.sourceBlock_ = block;
  block.getSvgRoot().appendChild(this.fieldGroup_);

  // Configure the field to be transparent with respect to tooltips.
  var topElement = this.rectElement_ || this.imageElement_;
  topElement.tooltip = this.sourceBlock_;
  Blockly.Tooltip.bindMouseEvents(topElement);
};

/**
 * Dispose of all DOM objects belonging to this text.
 */
Blockly.FieldImage.prototype.dispose = function() {
  goog.dom.removeNode(this.fieldGroup_);
  this.fieldGroup_ = null;
  this.imageElement_ = null;
  this.rectElement_ = null;
};

/**
 * Change the tooltip text for this field.
 * @param {string|!Element} newTip Text for tooltip or a parent element to
 *     link to for its tooltip.
 */
Blockly.FieldImage.prototype.setTooltip = function(newTip) {
  var topElement = this.rectElement_ || this.imageElement_;
  topElement.tooltip = newTip;
};

/**
 * Get the source URL of this image.
 * @return {string} Current text.
 * @override
 */
Blockly.FieldImage.prototype.getValue = function() {
  return this.src_;
};

/**
 * Set the source URL of this image.
 * @param {?string} src New source.
 * @override
 */
Blockly.FieldImage.prototype.setValue = function(src) {
  if (src === null) {
    // No change if null.
    return;
  }
  this.src_ = src;
  this.imageElement_.setAttributeNS('http://www.w3.org/1999/xlink',
      'xlink:href', goog.isString(src) ? src : '');
};

/**
 * Set the alt text of this image.
 * @param {?string} alt New alt text.
 * @override
 */
Blockly.FieldImage.prototype.setText = function(alt) {
  if (alt === null) {
    // No change if null.
    return;
  }
  this.text_ = alt;
};

/**
 * Images are fixed width, no need to render.
 * @private
 */
Blockly.FieldImage.prototype.render_ = function() {
  // NOP
};
