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
goog.require('Blockly.fieldRegistry');
goog.require('Blockly.utils');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.Size');


/**
 * Class for an image on a block.
 * @param {string} src The URL of the image. Defaults to an empty string.
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

  if (!src) {
    throw Error('Src value of an image field is required');
  }

  if (isNaN(height) || isNaN(width)) {
    throw Error('Height and width values of an image field must cast to' +
      ' numbers.');
  }

  // Ensure height and width are numbers.  Strings are bad at math.
  var imageHeight = Number(height);
  var imageWidth = Number(width);
  if (imageHeight <= 0 || imageWidth <= 0) {
    throw Error('Height and width values of an image field must be greater' +
      ' than 0.');
  }

  /**
   * Store the image height, since it is different from the field height.
   * @type {number}
   * @private
   */
  this.imageHeight_ = imageHeight;

  /**
   * Whether to flip this image in RTL.
   * @type {boolean}
   * @private
   */
  this.flipRtl_ = opt_flipRtl || false;

  /**
   * Alt text of this image.
   * @type {string}
   * @private
   */
  this.altText_ = opt_alt || '';

  if (typeof opt_onClick == 'function') {
    this.clickHandler_ = opt_onClick;
  }

  Blockly.FieldImage.superClass_.constructor.call(
      this, src || '', null);

  /**
   * The size of the area rendered by the field.
   * @type {Blockly.utils.Size}
   * @protected
   * @override
   */
  this.size_ = new Blockly.utils.Size(imageWidth,
      imageHeight + Blockly.FieldImage.Y_PADDING);
};
Blockly.utils.object.inherits(Blockly.FieldImage, Blockly.Field);

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
 * Vertical padding below the image, which is included in the reported height of
 * the field.
 * @type {number}
 * @private
 */
Blockly.FieldImage.Y_PADDING = 1;

/**
 * Editable fields usually show some sort of UI indicating they are
 * editable. This field should not.
 * @type {boolean}
 * @const
 */
Blockly.FieldImage.prototype.EDITABLE = false;

/**
 * Used to tell if the field needs to be rendered the next time the block is
 * rendered. Image fields are statically sized, and only need to be
 * rendered at initialization.
 * @type {boolean}
 * @protected
 */
Blockly.FieldImage.prototype.isDirty_ = false;

/**
 * Create the block UI for this image.
 * @package
 */
Blockly.FieldImage.prototype.initView = function() {
  this.imageElement_ = Blockly.utils.dom.createSvgElement(
      'image',
      {
        'height': this.imageHeight_ + 'px',
        'width': this.size_.width + 'px',
        'alt': this.altText_
      },
      this.fieldGroup_);
  this.imageElement_.setAttributeNS(Blockly.utils.dom.XLINK_NS,
      'xlink:href', /** @type {string} */ (this.value_));
};

/**
 * Ensure that the input value (the source URL) is a string.
 * @param {string} newValue The input value.
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
    this.imageElement_.setAttributeNS(Blockly.utils.dom.XLINK_NS,
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
 * @public
 */
Blockly.FieldImage.prototype.setAlt = function(alt) {
  if (alt === this.altText_) {
    // No change.
    return;
  }
  this.altText_ = alt || '';
  if (this.imageElement_) {
    this.imageElement_.setAttribute('alt', this.altText_);
  }
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

/**
 * Set the function that is called when this image  is clicked.
 * @param {Function} func The function that is called when the image
 *    is clicked. It will receive the image field as a parameter.
 * @public
 */
Blockly.FieldImage.prototype.setOnClickHandler = function(func) {
  this.clickHandler_ = func;
};

/**
 * Use the `getText_` developer hook to override the field's text represenation.
 * Return the image alt text instead.
 * @return {?string} The image alt text.
 * @protected
 * @override
 */
Blockly.FieldImage.prototype.getText_ = function() {
  return this.altText_;
};

Blockly.fieldRegistry.register('field_image', Blockly.FieldImage);
