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
 * @fileoverview clickable image field.
 * @author toebes@extremenetworks.com (John Toebes)
 */
'use strict';

goog.provide('Blockly.FieldClickImage');

goog.require('Blockly.FieldImage');

/**
 * Class for a clickable image.
 * @param {string} src The URL of the image.
 * @param {number} width Width of the image.
 * @param {number} height Height of the image.
 * @param {?string} opt_alt Optional alt text for when block is collapsed.
 * @param {?Function} handler A function that is executed when the
 *     image is selected.
 * @extends {Blockly.FieldImage}
 * @constructor
 */
Blockly.FieldClickImage = function(src, width, height, opt_alt, handler) {
  Blockly.FieldClickImage.superClass_.constructor.call(this,
                                                   src, width, height, '');

  this.setChangeHandler(handler);
};

goog.inherits(Blockly.FieldClickImage, Blockly.FieldImage);

/**
 * Editable fields are saved by the XML renderer, non-editable fields are not.
 * However we don't want to serialize it even if it is present
 */
Blockly.FieldClickImage.prototype.EDITABLE = true;
Blockly.FieldClickImage.prototype.SERIALIZABLE = false;

/**
 * Mouse cursor style when over the hotspot that initiates the editor.
 */
Blockly.FieldClickImage.prototype.CURSOR = 'default';

/**
 * Add or remove the UI indicating if this image may be clicked or not.
 */
Blockly.FieldClickImage.prototype.updateEditable = function() {
  if (this.sourceBlock_.isInFlyout || !this.EDITABLE) {
    Blockly.addClass_(/** @type {!Element} */ (this.fieldGroup_),
                      'blocklyIconGroupReadonly');
  } else {
    Blockly.removeClass_(/** @type {!Element} */ (this.fieldGroup_),
                         'blocklyIconGroupReadonly');
  }
};

/**
 * Install this field on a block.
 * @param {!Blockly.Block} block The block containing this field.
 */
Blockly.FieldClickImage.prototype.init = function(block) {
  if (this.sourceBlock_) {
    // Image has already been initialized once.
    return;
  }
  Blockly.FieldClickImage.superClass_.init.call(this, block);

  // We want to use the styling of an Icon  to indicate clickability
  Blockly.addClass_(/** @type {!Element} */ (this.fieldGroup_),
                    'blocklyIconGroup');
  // Mark this as being a fadable Icon
  Blockly.addClass_(/** @type {!Element} */ (this.fieldGroup_),
                    'blocklyIconFading');
  // If the image was already hidden, make it hidden.  We have to do this
  // because setVisible skips this step if the object wasn't rendered at the
  // time it marked it as hidden.
  if (!this.visible_) {
    this.visible_ = true;
    this.setVisible(false);
  }
  //
  // Update the classes for this to appear editable
  this.updateEditable();
  // And bind to the mouseup so that we can get called for a click
  this.mouseUpWrapper_ =
      Blockly.bindEvent_(this.fieldGroup_, 'mouseup', this, this.onMouseUp_);
  // Force a render.
  this.updateTextNode_();
}

/**
 * Take the action of the block
 * Note that this does swap out the dragMode_ variable because we know that
 * We only get invoked when we aren't actually dragging (otherwise the click
 * would be consumed by the drag code).  Once we return, there is a small amount
 * of cleanup which needs to complete
 * @private
 */
Blockly.FieldClickImage.prototype.showEditor_ = function() {
  if (this.changeHandler_) {
    var saveDragMode = Blockly.dragMode_;
    Blockly.dragMode_ = 0;
    this.changeHandler_.call(this.sourceBlock_,this);
    Blockly.dragMode_ = saveDragMode;
  }
};
