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
 * @fileoverview Image field.  Used for pictures, icons, etc.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.FieldImage');

goog.require('Blockly.Field');
goog.require('Blockly.utils');

goog.require('goog.math.Size');


/**
 * Class for an image on a block.
 * @param {string=} src The URL of the image. Defaults to an empty string.
 * @param {!(string|number)} width Width of the image.
 * @param {!(string|number)} height Height of the image.
 * @param {string=} opt_alt Optional alt text for when block is collapsed.
 * @param {Function=} opt_onClick Optional function to be called when the image
 *     is clicked.  If opt_onClick is defined, opt_alt must also be defined.
 * @param {boolean=} opt_flipRtl Whether to flip the icon in RTL.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldImage = function(src, width, height,
    opt_alt, opt_onClick, opt_flipRtl) {
  this.sourceBlock_ = null;


  if (isNaN(height) || isNaN(width)) {
    throw Error('Height and width values of an image field must cast to' +
      ' numbers.');
  }

  // Ensure height and width are numbers.  Strings are bad at math.
  this.height_ = Number(height);
  this.width_ = Number(width);
  if (this.height_ <= 0 || this.width_ <= 0) {
    throw Error('Height and width values of an image field must be greater' +
      ' than 0.');
  }
  this.size_ = new goog.math.Size(this.width_,
      this.height_ + 2 * Blockly.BlockSvg.INLINE_PADDING_Y);

  this.flipRtl_ = opt_flipRtl;
  this.tooltip_ = '';
  this.text_ = opt_alt || '';
  this.setValue(src || '');

  if (typeof opt_onClick == 'function') {
    this.clickHandler_ = opt_onClick;
  }
};
goog.inherits(Blockly.FieldImage, Blockly.Field);

/**
 * Construct a FieldImage from a JSON arg object,
 * dereferencing any string table references.
 * @param {!Object} options A JSON object with options (src, width, height,
 *    alt, and flipRtl).
 * @return {!Blockly.FieldImage} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldImage.fromJson = function(options) {
  var src = Blockly.utils.replaceMessageReferences(options['src']);
  var width = Number(Blockly.utils.replaceMessageReferences(options['width']));
  var height =
      Number(Blockly.utils.replaceMessageReferences(options['height']));
  var alt = Blockly.utils.replaceMessageReferences(options['alt']);
  var flipRtl = !!options['flipRtl'];
  return new Blockly.FieldImage(src, width, height, alt, null, flipRtl);
};

/**
 * Editable fields usually show some sort of UI indicating they are
 * editable. This field should not.
 * @type {boolean}
 * @const
 */
Blockly.FieldImage.prototype.EDITABLE = false;

/**
 * Create the block UI for this image.
 * @package
 */
Blockly.FieldImage.prototype.initView = function() {
  this.imageElement_ = Blockly.utils.createSvgElement(
      'image',
      {
        'height': this.height_ + 'px',
        'width': this.width_ + 'px',
        'alt': this.text_
      },
      this.fieldGroup_);
  this.imageElement_.setAttributeNS('http://www.w3.org/1999/xlink',
      'xlink:href', this.value_);
  this.sourceBlock_.getSvgRoot().appendChild(this.fieldGroup_);

  if (this.tooltip_) {
    this.imageElement_.tooltip = this.tooltip_;
  } else {
    // Configure the field to be transparent with respect to tooltips.
    this.setTooltip(this.sourceBlock_);
  }
  Blockly.Tooltip.bindMouseEvents(this.imageElement_);

  this.maybeAddClickHandler_();
};

/**
 * Dispose of all DOM objects belonging to this text.
 */
Blockly.FieldImage.prototype.dispose = function() {
  if (this.fieldGroup_) {
    Blockly.utils.removeNode(this.fieldGroup_);
    this.fieldGroup_ = null;
  }
  this.imageElement_ = null;
};

/**
 * Bind events for a mouse down on the image, but only if a click handler has
 * been defined.
 * @private
 */
Blockly.FieldImage.prototype.maybeAddClickHandler_ = function() {
  if (this.clickHandler_) {
    this.mouseDownWrapper_ =
        Blockly.bindEventWithChecks_(
            this.fieldGroup_, 'mousedown', this, this.clickHandler_);
  }
};

/**
 * Change the tooltip text for this field.
 * @param {string|!Element} newTip Text for tooltip or a parent element to
 *     link to for its tooltip.
 */
Blockly.FieldImage.prototype.setTooltip = function(newTip) {
  this.tooltip_ = newTip;
  if (this.imageElement_) {
    this.imageElement_.tooltip = newTip;
  }
};

/**
 * Ensure that the input value (the source URL) is a string.
 * @param {string=} newValue The input value
 * @return {?string} A string, or null if invalid.
 * @protected
 */
Blockly.FieldImage.prototype.doClassValidation_ = function(newValue) {
  if (typeof newValue != 'string') {
    return null;
  }
  return newValue;
};

/**
 * Update the value of this image field, and update the displayed image.
 * @param {string} newValue The new image src.
 * @protected
 */
Blockly.FieldImage.prototype.doValueUpdate_ = function(newValue) {
  this.value_ = newValue;
  if (this.imageElement_) {
    this.imageElement_.setAttributeNS('http://www.w3.org/1999/xlink',
        'xlink:href', this.value_ || '');
  }
};

/**
 * Get whether to flip this image in RTL
 * @return {boolean} True if we should flip in RTL.
 */
Blockly.FieldImage.prototype.getFlipRtl = function() {
  return this.flipRtl_;
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
  if (this.imageElement_) {
    this.imageElement_.setAttribute('alt', alt || '');
  }
};

/**
 * Images are fixed width, no need to render.
 * @private
 */
Blockly.FieldImage.prototype.render_ = function() {
  this.size_.width = this.width_;
  this.size_.height = this.height_ + 2 * Blockly.BlockSvg.INLINE_PADDING_Y;
};

/**
 * If field click is called, and click handler defined,
 * call the handler.
 */
Blockly.FieldImage.prototype.showEditor_ = function() {
  if (this.clickHandler_) {
    this.clickHandler_(this);
  }
};

Blockly.Field.register('field_image', Blockly.FieldImage);
