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
goog.require('Blockly.utils.Size');


/**
 * Class for an image on a block.
 * @param {string} src The URL of the image. Defaults to an empty string.
 * @param {!(string|number)} width Width of the image.
 * @param {!(string|number)} height Height of the image.
 * @param {Function=} opt_onClick Optional function to be called when the image
 *     is clicked.  If opt_onClick is defined, opt_alt must also be defined.
 * @param {Object=} opt_config A map of options used to configure the field.
 *    See the documentation for a list of properties this parameter supports.
 *    https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/image
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldImage = function(src, width, height, opt_onClick, opt_config) {
  if (!src) {
    throw Error('Src value of an image field is required');
  }
  width = Blockly.utils.replaceMessageReferences(width);
  height = Blockly.utils.replaceMessageReferences(height);
  if (isNaN(height) || isNaN(width)) {
    throw Error('Height and width values of an image field must cast to' +
      ' numbers.');
  }

  src = Blockly.utils.replaceMessageReferences(src);
  this.setValue(src);

  // Ensure height and width are numbers.  Strings are bad at math.
  var imageHeight = Number(height);
  var imageWidth = Number(width);
  if (imageHeight <= 0 || imageWidth <= 0) {
    throw Error('Height and width values of an image field must be greater' +
      ' than 0.');
  }
  // Store the image height, since it is different from the field height.
  this.imageHeight_ = imageHeight;
  this.size_ = new Blockly.utils.Size(imageWidth,
      imageHeight + Blockly.FieldImage.Y_PADDING);

  /**
   * Should the image be flipped across the vertical axis when in RTL mode?
   * @type {boolean}
   * @private
   */
  this.flipRtl_ = false;

  this.configure_(opt_onClick, opt_config, arguments[5]);
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
  return new Blockly.FieldImage(
      options['src'], options['width'], options['height'], null, options);
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
 * @private
 */
Blockly.FieldImage.prototype.isDirty_ = false;

/**
 * Configure this field's customization options. Taking into account old
 * parameter ordering on the constructor.
 * @param {Function|string|null} opt_onClick Option function to be called
 *    when the image is clicked. Or alt text.
 * @param {Object|Function|null} opt_config A map of options used to
 *    configure the field. Or a function to be called when the image is clicked.
 * @param {?boolean} dep_flipRtl Should the image be flipped in RTL mode? Or
 *    this is included on the opt_config.
 * @private
 */
Blockly.FieldImage.prototype.configure_ = function(
    opt_onClick, opt_config, dep_flipRtl) {
  // Deal with config options and param reordering.
  var doOldParams = true;
  var config = null;
  if (typeof opt_onClick == 'function') {
    doOldParams = false;
    this.clickHandler_ = opt_onClick;
  }
  if (opt_config && typeof opt_config == 'object') {
    doOldParams = false;
    config = opt_config;
  }
  if (doOldParams) {
    config = {};
    // opt_onClick used to be opt_alt.
    config['alt'] = opt_onClick;
    // opt_config used to be opt_onClick.
    this.clickHandler_ = opt_config;
    // flipRtl used to be a param, instead of a config option.
    config['flipRtl'] = dep_flipRtl;
  }

  // Actually configure.
  if (config) {
    this.text_ = Blockly.utils.replaceMessageReferences(config['alt']) || '';
    this.flipRtl_ = !!config['flipRtl'];
  }
};

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
        'alt': this.text_
      },
      this.fieldGroup_);
  this.imageElement_.setAttributeNS(Blockly.utils.dom.XLINK_NS,
      'xlink:href', this.value_);
};

/**
 * Ensure that the input value (the source URL) is a string.
 * @param {string=} opt_newValue The input value.
 * @return {?string} A string, or null if invalid.
 * @protected
 */
Blockly.FieldImage.prototype.doClassValidation_ = function(opt_newValue) {
  if (typeof opt_newValue != 'string') {
    return null;
  }
  return opt_newValue;
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
 * @override
 * @deprecated 2019 setText has been deprecated for all fields. Instead use
 *    setAlt to set the alt text of the field.
 */
Blockly.FieldImage.prototype.setText = function(alt) {
  this.setAlt(alt);
};

/**
 * Set the alt text of this image.
 * @param {?string} alt New alt text.
 * @public
 */
Blockly.FieldImage.prototype.setAlt = function(alt) {
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

Blockly.fieldRegistry.register('field_image', Blockly.FieldImage);
