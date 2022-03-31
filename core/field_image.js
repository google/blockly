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
const parsing = goog.require('Blockly.utils.parsing');
const {Field} = goog.require('Blockly.Field');
/* eslint-disable-next-line no-unused-vars */
const {Sentinel} = goog.requireType('Blockly.utils.Sentinel');
const {Size} = goog.require('Blockly.utils.Size');
const {Svg} = goog.require('Blockly.utils.Svg');


/**
 * Class for an image on a block.
 * @extends {Field}
 * @alias Blockly.FieldImage
 */
class FieldImage extends Field {
  /**
   * @param {string|!Sentinel} src The URL of the image.
   *     Also accepts Field.SKIP_SETUP if you wish to skip setup (only used by
   *     subclasses that want to handle configuration and setting the field
   *     value after their own constructors have run).
   * @param {!(string|number)} width Width of the image.
   * @param {!(string|number)} height Height of the image.
   * @param {string=} opt_alt Optional alt text for when block is collapsed.
   * @param {function(!FieldImage)=} opt_onClick Optional function to be
   *     called when the image is clicked. If opt_onClick is defined, opt_alt
   *     must also be defined.
   * @param {boolean=} opt_flipRtl Whether to flip the icon in RTL.
   * @param {Object=} opt_config A map of options used to configure the field.
   *     See the [field creation documentation]{@link
   *     https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/image#creation}
   *     for a list of properties this parameter supports.
   */
  constructor(
      src, width, height, opt_alt, opt_onClick, opt_flipRtl, opt_config) {
    super(Field.SKIP_SETUP);

    // Return early.
    if (!src) {
      throw Error('Src value of an image field is required');
    }
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

    /**
     * Editable fields usually show some sort of UI indicating they are
     * editable. This field should not.
     * @type {boolean}
     * @const
     */
    this.EDITABLE = false;

    /**
     * Used to tell if the field needs to be rendered the next time the block is
     * rendered. Image fields are statically sized, and only need to be
     * rendered at initialization.
     * @type {boolean}
     * @protected
     */
    this.isDirty_ = false;

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

    if (src === Field.SKIP_SETUP) return;

    if (opt_config) {
      this.configure_(opt_config);
    } else {
      this.flipRtl_ = !!opt_flipRtl;
      this.altText_ = parsing.replaceMessageReferences(opt_alt) || '';
    }
    this.setValue(parsing.replaceMessageReferences(src));
  }

  /**
   * Configure the field based on the given map of options.
   * @param {!Object} config A map of options to configure the field based on.
   * @protected
   * @override
   */
  configure_(config) {
    super.configure_(config);
    this.flipRtl_ = !!config['flipRtl'];
    this.altText_ = parsing.replaceMessageReferences(config['alt']) || '';
  }

  /**
   * Create the block UI for this image.
   * @package
   */
  initView() {
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
  }

  /**
   * @override
   */
  updateSize_() {
    // NOP
  }

  /**
   * Ensure that the input value (the source URL) is a string.
   * @param {*=} opt_newValue The input value.
   * @return {?string} A string, or null if invalid.
   * @protected
   */
  doClassValidation_(opt_newValue) {
    if (typeof opt_newValue !== 'string') {
      return null;
    }
    return opt_newValue;
  }

  /**
   * Update the value of this image field, and update the displayed image.
   * @param {*} newValue The value to be saved. The default validator guarantees
   * that this is a string.
   * @protected
   */
  doValueUpdate_(newValue) {
    this.value_ = newValue;
    if (this.imageElement_) {
      this.imageElement_.setAttributeNS(
          dom.XLINK_NS, 'xlink:href', String(this.value_));
    }
  }

  /**
   * Get whether to flip this image in RTL
   * @return {boolean} True if we should flip in RTL.
   * @override
   */
  getFlipRtl() {
    return this.flipRtl_;
  }

  /**
   * Set the alt text of this image.
   * @param {?string} alt New alt text.
   * @public
   */
  setAlt(alt) {
    if (alt === this.altText_) {
      return;
    }
    this.altText_ = alt || '';
    if (this.imageElement_) {
      this.imageElement_.setAttribute('alt', this.altText_);
    }
  }

  /**
   * If field click is called, and click handler defined,
   * call the handler.
   * @protected
   */
  showEditor_() {
    if (this.clickHandler_) {
      this.clickHandler_(this);
    }
  }

  /**
   * Set the function that is called when this image  is clicked.
   * @param {?function(!FieldImage)} func The function that is called
   *    when the image is clicked, or null to remove.
   */
  setOnClickHandler(func) {
    this.clickHandler_ = func;
  }

  /**
   * Use the `getText_` developer hook to override the field's text
   * representation.
   * Return the image alt text instead.
   * @return {?string} The image alt text.
   * @protected
   * @override
   */
  getText_() {
    return this.altText_;
  }

  /**
   * Construct a FieldImage from a JSON arg object,
   * dereferencing any string table references.
   * @param {!Object} options A JSON object with options (src, width, height,
   *    alt, and flipRtl).
   * @return {!FieldImage} The new field instance.
   * @package
   * @nocollapse
   */
  static fromJson(options) {
    // `this` might be a subclass of FieldImage if that class doesn't override
    // the static fromJson method.
    return new this(
        options['src'], options['width'], options['height'], undefined,
        undefined, undefined, options);
  }
}

/**
 * The default value for this field.
 * @type {*}
 * @protected
 */
FieldImage.prototype.DEFAULT_VALUE = '';

/**
 * Vertical padding below the image, which is included in the reported height of
 * the field.
 * @type {number}
 * @private
 */
FieldImage.Y_PADDING = 1;

fieldRegistry.register('field_image', FieldImage);

exports.FieldImage = FieldImage;
