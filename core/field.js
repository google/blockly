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
 * @fileoverview Input field.  Used for editable titles, variables, etc.
 * This is an abstract class that defines the UI on the block.  Actual
 * instances would be Blockly.FieldTextInput, Blockly.FieldDropdown, etc.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Field');

goog.require('goog.asserts');
goog.require('goog.math.Size');
goog.require('goog.userAgent');


/**
 * Class for an editable field.
 * @param {string} text The initial content of the field.
 * @constructor
 */
Blockly.Field = function(text) {
  this.size_ = new goog.math.Size(0, 25);
  this.setText(text);
};

/**
 * Block this field is attached to.  Starts as null, then in set in init.
 * @private
 */
Blockly.Field.prototype.sourceBlock_ = null;

/**
 * Is the field visible, or hidden due to the block being collapsed?
 * @private
 */
Blockly.Field.prototype.visible_ = true;

/**
 * Clone this Field.  This must be implemented by all classes derived from
 * Field.  Since this class should not be instantiated, calling this method
 * throws an exception.
 * @throws {goog.assert.AssertionError}
 */
Blockly.Field.prototype.clone = function() {
  goog.asserts.fail('There should never be an instance of Field, ' +
      'only its derived classes.');
};

/**
 * Non-breaking space.
 */
Blockly.Field.NBSP = '\u00A0';

/**
 * Editable fields are saved by the XML renderer, non-editable fields are not.
 */
Blockly.Field.prototype.EDITABLE = true;

/**
 * Install this field on a block.
 * @param {!Blockly.Block} block The block containing this field.
 */
Blockly.Field.prototype.init = function(block) {
  if (this.sourceBlock_) {
    // Field has already been initialized once.
    return;
  }
  this.sourceBlock_ = block;
  // Build the DOM.
  this.fieldGroup_ = Blockly.createSvgElement('g', {}, null);
  this.borderRect_ = Blockly.createSvgElement('rect',
      {'rx': 4,
       'ry': 4,
       'x': -Blockly.BlockSvg.SEP_SPACE_X / 2,
       'y': -12,
       'height': 16}, this.fieldGroup_);
  this.textElement_ = Blockly.createSvgElement('text',
      {'class': 'blocklyText'}, this.fieldGroup_);

  this.updateEditable();
  block.getSvgRoot().appendChild(this.fieldGroup_);
  this.mouseUpWrapper_ =
      Blockly.bindEvent_(this.fieldGroup_, 'mouseup', this, this.onMouseUp_);
  // Force a render.
  this.updateTextNode_();
};

/**
 * Dispose of all DOM objects belonging to this editable field.
 */
Blockly.Field.prototype.dispose = function() {
  if (this.mouseUpWrapper_) {
    Blockly.unbindEvent_(this.mouseUpWrapper_);
    this.mouseUpWrapper_ = null;
  }
  this.sourceBlock_ = null;
  goog.dom.removeNode(this.fieldGroup_);
  this.fieldGroup_ = null;
  this.textElement_ = null;
  this.borderRect_ = null;
};

/**
 * Add or remove the UI indicating if this field is editable or not.
 */
Blockly.Field.prototype.updateEditable = function() {
  if (!this.EDITABLE) {
    return;
  }
  if (this.sourceBlock_.isEditable()) {
    Blockly.addClass_(/** @type {!Element} */ (this.fieldGroup_),
                      'blocklyEditableText');
    Blockly.removeClass_(/** @type {!Element} */ (this.fieldGroup_),
                         'blocklyNoNEditableText');
    this.fieldGroup_.style.cursor = this.CURSOR;
  } else {
    Blockly.addClass_(/** @type {!Element} */ (this.fieldGroup_),
                      'blocklyNonEditableText');
    Blockly.removeClass_(/** @type {!Element} */ (this.fieldGroup_),
                         'blocklyEditableText');
    this.fieldGroup_.style.cursor = '';
  }
};

/**
 * Gets whether this editable field is visible or not.
 * @return {boolean} True if visible.
 */
Blockly.Field.prototype.isVisible = function() {
  return this.visible_;
};

/**
 * Sets whether this editable field is visible or not.
 * @param {boolean} visible True if visible.
 */
Blockly.Field.prototype.setVisible = function(visible) {
  if (this.visible_ == visible) {
    return;
  }
  this.visible_ = visible;
  var root = this.getSvgRoot();
  if (root) {
    root.style.display = visible ? 'block' : 'none';
    this.render_();
  }
};

/**
 * Gets the group element for this editable field.
 * Used for measuring the size and for positioning.
 * @return {!Element} The group element.
 */
Blockly.Field.prototype.getSvgRoot = function() {
  return /** @type {!Element} */ (this.fieldGroup_);
};

/**
 * Draws the border with the correct width.
 * Saves the computed width in a property.
 * @private
 */
Blockly.Field.prototype.render_ = function() {
  if (this.visible_) {
    try {
      var width = this.textElement_.getComputedTextLength();
    } catch(e) {
      // MSIE 11 is known to throw "Unexpected call to method or property
      // access." if Blockly is hidden.
      var width = this.textElement_.textContent.length * 8;
    }
    if (this.borderRect_) {
      this.borderRect_.setAttribute('width',
          width + Blockly.BlockSvg.SEP_SPACE_X);
    }
  } else {
    var width = 0;
  }
  this.size_.width = width;
};

/**
 * Returns the height and width of the field.
 * @return {!goog.math.Size} Height and width.
 */
Blockly.Field.prototype.getSize = function() {
  if (!this.size_.width) {
    this.render_();
  }
  return this.size_;
};

/**
 * Get the text from this field.
 * @return {string} Current text.
 */
Blockly.Field.prototype.getText = function() {
  return this.text_;
};

/**
 * Set the text in this field.  Trigger a rerender of the source block.
 * @param {?string} text New text.
 */
Blockly.Field.prototype.setText = function(text) {
  if (text === null || text === this.text_) {
    // No change if null.
    return;
  }
  this.text_ = text;
  this.updateTextNode_();

  if (this.sourceBlock_ && this.sourceBlock_.rendered) {
    this.sourceBlock_.render();
    this.sourceBlock_.bumpNeighbours_();
    this.sourceBlock_.workspace.fireChangeEvent();
  }
};

/**
 * Update the text node of this field to display the current text.
 * @private
 */
Blockly.Field.prototype.updateTextNode_ = function() {
  if (!this.textElement_) {
    // Not rendered yet.
    return;
  }
  var text = this.text_;
  // Empty the text element.
  goog.dom.removeChildren(/** @type {!Element} */ (this.textElement_));
  // Replace whitespace with non-breaking spaces so the text doesn't collapse.
  text = text.replace(/\s/g, Blockly.Field.NBSP);
  if (Blockly.RTL && text) {
    // The SVG is LTR, force text to be RTL.
    text += '\u200F';
  }
  if (!text) {
    // Prevent the field from disappearing if empty.
    text = Blockly.Field.NBSP;
  }
  var textNode = document.createTextNode(text);
  this.textElement_.appendChild(textNode);

  // Cached width is obsolete.  Clear it.
  this.size_.width = 0;
};

/**
 * By default there is no difference between the human-readable text and
 * the language-neutral values.  Subclasses (such as dropdown) may define this.
 * @return {string} Current text.
 */
Blockly.Field.prototype.getValue = function() {
  return this.getText();
};

/**
 * By default there is no difference between the human-readable text and
 * the language-neutral values.  Subclasses (such as dropdown) may define this.
 * @param {string} text New text.
 */
Blockly.Field.prototype.setValue = function(text) {
  this.setText(text);
};

/**
 * Handle a mouse up event on an editable field.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.Field.prototype.onMouseUp_ = function(e) {
  if ((goog.userAgent.IPHONE || goog.userAgent.IPAD) &&
      e.layerX !== 0 && e.layerY !== 0) {
    // iOS spawns a bogus event on the next touch after a 'prompt()' edit.
    // Unlike the real events, these have a layerX and layerY set.
    return;
  } else if (Blockly.isRightButton(e)) {
    // Right-click.
    return;
  } else if (Blockly.dragMode_ == 2) {
    // Drag operation is concluding.  Don't open the editor.
    return;
  } else if (this.sourceBlock_.isEditable()) {
    // Non-abstract sub-classes must define a showEditor_ method.
    this.showEditor_();
  }
};

/**
 * Change the tooltip text for this field.
 * @param {string|!Element} newTip Text for tooltip or a parent element to
 *     link to for its tooltip.
 */
Blockly.Field.prototype.setTooltip = function(newTip) {
  // Non-abstract sub-classes may wish to implement this.  See FieldLabel.
};
