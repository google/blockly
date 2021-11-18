/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Image field.  Used for pictures, icons, etc.
 */
'use strict';

/**
 * Image field.  Used for pictures, icons, etc.
 * @class
 */
goog.module('Blockly.FieldImage');

const dom = goog.require('Blockly.utils.dom');
const fieldRegistry = goog.require('Blockly.fieldRegistry');
const object = goog.require('Blockly.utils.object');
const parsing = goog.require('Blockly.utils.parsing');
const {Field} = goog.require('Blockly.Field');
const {Size} = goog.require('Blockly.utils.Size');
const {Svg} = goog.require('Blockly.utils.Svg');


/**
 * Class for an image on a block.
 * @param {string} src The URL of the image.
 * @param {!(string|number)} width Width of the image.
 * @param {!(string|number)} height Height of the image.
 * @param {string=} opt_alt Optional alt text for when block is collapsed.
 * @param {function(!FieldImage)=} opt_onClick Optional function to be
 *     called when the image is clicked. If opt_onClick is defined, opt_alt must
 *     also be defined.
 * @param {boolean=} opt_flipRtl Whether to flip the icon in RTL.
 * @param {Object=} opt_config A map of options used to configure the field.
 *    See the [field creation documentation]{@link
 * https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/image#creation}
 *    for a list of properties this parameter supports.
 * @extends {Field}
 * @constructor
 * @alias Blockly.FieldImage
 */
const FieldImage = function(
    src, width, height, opt_alt, opt_onClick, opt_flipRtl, opt_config) {
  // Return early.
  if (!src) {
    throw Error('Src value of an image field is required');
  }
  src = parsing.replaceMessageReferences(src);
  const imageHeight = Number(parsing.replaceMessageReferences(height));
  const imageWidth = Number(parsing.replaceMessageReferences(width));
  if (isNaN(imageHeight) || isNaN(imageWidth)) {
    throw Error(
        'Height and width values of an image field must cast to' +
        ' numbers.');
  }
  if (imageHeight <= 0 || imageWidth <= 0) {
    throw Error(
        'Height and width values of an image field must be greater' +
        ' than 0.');
  }

  // Initialize configurable properties.
  /**
   * Whether to flip this image in RTL.
   * @type {boolean}
   * @private
   */
  this.flipRtl_ = false;

  /**
   * Alt text of this image.
   * @type {string}
   * @private
   */
  this.altText_ = '';

  FieldImage.superClass_.constructor.call(this, src, null, opt_config);

  if (!opt_config) {  // If the config wasn't passed, do old configuration.
    this.flipRtl_ = !!opt_flipRtl;
    this.altText_ = parsing.replaceMessageReferences(opt_alt) || '';
  }

  // Initialize other properties.
  /**
   * The size of the area rendered by the field.
   * @type {Size}
   * @protected
   * @override
   */
  this.size_ = new Size(imageWidth, imageHeight + FieldImage.Y_PADDING);

  /**
   * Store the image height, since it is different from the field height.
   * @type {number}
   * @private
   */
  this.imageHeight_ = imageHeight;

  /**
   * The function to be called when this field is clicked.
   * @type {?function(!FieldImage)}
   * @private
   */
  this.clickHandler_ = null;

  if (typeof opt_onClick === 'function') {
    this.clickHandler_ = opt_onClick;
  }

  /**
   * The rendered field's image element.
   * @type {SVGImageElement}
   * @private
   */
  this.imageElement_ = null;
};
object.inherits(FieldImage, Field);

/**
 * The default value for this field.
 * @type {*}
 * @protected
 */
FieldImage.prototype.DEFAULT_VALUE = '';

/**
 * Construct a FieldImage from a JSON arg object,
 * dereferencing any string table references.
 * @param {!Object} options A JSON object with options (src, width, height,
 *    alt, and flipRtl).
 * @return {!FieldImage} The new field instance.
 * @package
 * @nocollapse
 */
FieldImage.fromJson = function(options) {
  // `this` might be a subclass of FieldImage if that class doesn't override
  // the static fromJson method.
  return new this(
      options['src'], options['width'], options['height'], undefined, undefined,
      undefined, options);
};

/**
 * Vertical padding below the image, which is included in the reported height of
 * the field.
 * @type {number}
 * @private
 */
FieldImage.Y_PADDING = 1;

/**
 * Editable fields usually show some sort of UI indicating they are
 * editable. This field should not.
 * @type {boolean}
 */
FieldImage.prototype.EDITABLE = false;

/**
 * Used to tell if the field needs to be rendered the next time the block is
 * rendered. Image fields are statically sized, and only need to be
 * rendered at initialization.
 * @type {boolean}
 * @protected
 */
FieldImage.prototype.isDirty_ = false;

/**
 * Configure the field based on the given map of options.
 * @param {!Object} config A map of options to configure the field based on.
 * @protected
 * @override
 */
FieldImage.prototype.configure_ = function(config) {
  FieldImage.superClass_.configure_.call(this, config);
  this.flipRtl_ = !!config['flipRtl'];
  this.altText_ = parsing.replaceMessageReferences(config['alt']) || '';
};

/**
 * Create the block UI for this image.
 * @package
 */
FieldImage.prototype.initView = function() {
  this.imageElement_ = dom.createSvgElement(
      Svg.IMAGE, {
        'height': this.imageHeight_ + 'px',
        'width': this.size_.width + 'px',
        'alt': this.altText_,
      },
      this.fieldGroup_);
  this.imageElement_.setAttributeNS(
      dom.XLINK_NS, 'xlink:href', /** @type {string} */ (this.value_));

  if (this.clickHandler_) {
    this.imageElement_.style.cursor = 'pointer';
  }
};

/**
 * @override
 */
FieldImage.prototype.updateSize_ = function() {
  // NOP
};

/**
 * Ensure that the input value (the source URL) is a string.
 * @param {*=} opt_newValue The input value.
 * @return {?string} A string, or null if invalid.
 * @protected
 */
FieldImage.prototype.doClassValidation_ = function(opt_newValue) {
  if (typeof opt_newValue !== 'string') {
    return null;
  }
  return opt_newValue;
};

/**
 * Update the value of this image field, and update the displayed image.
 * @param {*} newValue The value to be saved. The default validator guarantees
 * that this is a string.
 * @protected
 */
FieldImage.prototype.doValueUpdate_ = function(newValue) {
  this.value_ = newValue;
  if (this.imageElement_) {
    this.imageElement_.setAttributeNS(
        dom.XLINK_NS, 'xlink:href', String(this.value_));
  }
};

/**
 * Get whether to flip this image in RTL
 * @return {boolean} True if we should flip in RTL.
 * @override
 */
FieldImage.prototype.getFlipRtl = function() {
  return this.flipRtl_;
};

/**
 * Set the alt text of this image.
 * @param {?string} alt New alt text.
 * @public
 */
FieldImage.prototype.setAlt = function(alt) {
  if (alt === this.altText_) {
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
 * @protected
 */
FieldImage.prototype.showEditor_ = function() {
  if (this.clickHandler_) {
    this.clickHandler_(this);
  }
};

/**
 * Set the function that is called when this image  is clicked.
 * @param {?function(!FieldImage)} func The function that is called
 *    when the image is clicked, or null to remove.
 */
FieldImage.prototype.setOnClickHandler = function(func) {
  this.clickHandler_ = func;
};

/**
 * Use the `getText_` developer hook to override the field's text
 * representation.
 * Return the image alt text instead.
 * @return {?string} The image alt text.
 * @protected
 * @override
 */
FieldImage.prototype.getText_ = function() {
  return this.altText_;
};

fieldRegistry.register('field_image', FieldImage);

exports.FieldImage = FieldImage;
