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
 * @param {string} src The URL of the image.
 * @param {number} width Width of the image.
 * @param {number} height Height of the image.
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

  // Ensure height and width are numbers.  Strings are bad at math.
  this.height_ = Number(height);
  this.width_ = Number(width);
  this.size_ = new goog.math.Size(this.width_,
      this.height_ + 2 * Blockly.BlockSvg.INLINE_PADDING_Y);
  this.flipRtl_ = opt_flipRtl;
  this.tooltip_ = '';
  this.setValue(src);
  this.setText(opt_alt);

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
 * @returns {!Blockly.FieldImage} The new field instance.
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
 * Editable fields are saved by the XML renderer, non-editable fields are not.
 */
Blockly.FieldImage.prototype.EDITABLE = false;

/**
 * Install this image on a block.
 */
Blockly.FieldImage.prototype.init = function() {
  if (this.fieldGroup_) {
    // Image has already been initialized once.
    return;
  }
  // Build the DOM.
  /** @type {SVGElement} */
  this.fieldGroup_ = Blockly.utils.createSvgElement('g', {}, null);
  if (!this.visible_) {
    this.fieldGroup_.style.display = 'none';
  }
  /** @type {SVGElement} */
  this.imageElement_ = Blockly.utils.createSvgElement(
      'image',
      {
        'height': this.height_ + 'px',
        'width': this.width_ + 'px'
      },
      this.fieldGroup_);
  this.setValue(this.src_);
  this.setText(this.text_);
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
  if (this.imageElement_) {
    this.imageElement_.setAttributeNS('http://www.w3.org/1999/xlink',
        'xlink:href', src || '');
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
  // NOP
};

/**
 * Images are fixed width, no need to render even if forced.
 */
Blockly.FieldImage.prototype.forceRerender = function() {
  // NOP
};

/**
 * Images are fixed width, no need to update.
 * @private
 */
Blockly.FieldImage.prototype.updateWidth = function() {
  // NOP
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
