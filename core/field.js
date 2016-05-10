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
 * @fileoverview Field.  Used for editable titles, variables, etc.
 * This is an abstract class that defines the UI on the block.  Actual
 * instances would be Blockly.FieldTextInput, Blockly.FieldDropdown, etc.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Field');

goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.math.Size');
goog.require('goog.style');
goog.require('goog.userAgent');


/**
 * Abstract class for an editable field.
 * @param {string} text The initial content of the field.
 * @param {Function=} opt_validator An optional function that is called
 *     to validate any constraints on what the user entered.  Takes the new
 *     text as an argument and returns either the accepted text, a replacement
 *     text, or null to abort the change.
 * @constructor
 */
Blockly.Field = function(text, opt_validator) {
  this.size_ = new goog.math.Size(0, 25);
  this.setValue(text);
  this.setValidator(opt_validator);
};

/**
 * Temporary cache of text widths.
 * @type {Object}
 * @private
 */
Blockly.Field.cacheWidths_ = null;

/**
 * Number of current references to cache.
 * @type {number}
 * @private
 */
Blockly.Field.cacheReference_ = 0;


/**
 * Name of field.  Unique within each block.
 * Static labels are usually unnamed.
 * @type {string=}
 */
Blockly.Field.prototype.name = undefined;

/**
 * Maximum characters of text to display before adding an ellipsis.
 * @type {number}
 */
Blockly.Field.prototype.maxDisplayLength = 50;

/**
 * Visible text to display.
 * @type {string}
 * @private
 */
Blockly.Field.prototype.text_ = '';

/**
 * Block this field is attached to.  Starts as null, then in set in init.
 * @type {Blockly.Block}
 * @private
 */
Blockly.Field.prototype.sourceBlock_ = null;

/**
 * Is the field visible, or hidden due to the block being collapsed?
 * @type {boolean}
 * @private
 */
Blockly.Field.prototype.visible_ = true;

/**
 * Validation function called when user edits an editable field.
 * @type {Function}
 * @private
 */
Blockly.Field.prototype.validator_ = null;

/**
 * Non-breaking space.
 * @const
 */
Blockly.Field.NBSP = '\u00A0';

/**
 * Editable fields are saved by the XML renderer, non-editable fields are not.
 */
Blockly.Field.prototype.EDITABLE = true;

/**
 * Attach this field to a block.
 * @param {!Blockly.Block} block The block containing this field.
 */
Blockly.Field.prototype.setSourceBlock = function(block) {
  goog.asserts.assert(!this.sourceBlock_, 'Field already bound to a block.');
  this.sourceBlock_ = block;
};

/**
 * Install this field on a block.
 */
Blockly.Field.prototype.init = function() {
  if (this.fieldGroup_) {
    // Field has already been initialized once.
    return;
  }
  // Build the DOM.
  this.fieldGroup_ = Blockly.createSvgElement('g', {}, null);
  if (!this.visible_) {
    this.fieldGroup_.style.display = 'none';
  }
  this.borderRect_ = Blockly.createSvgElement('rect',
      {'rx': 4,
       'ry': 4,
       'x': -Blockly.BlockSvg.SEP_SPACE_X / 2,
       'y': 0,
       'height': 16}, this.fieldGroup_, this.sourceBlock_.workspace);
  /** @type {!Element} */
  this.textElement_ = Blockly.createSvgElement('text',
      {'class': 'blocklyText', 'y': this.size_.height - 12.5},
      this.fieldGroup_);

  this.updateEditable();
  this.sourceBlock_.getSvgRoot().appendChild(this.fieldGroup_);
  this.mouseUpWrapper_ =
      Blockly.bindEvent_(this.fieldGroup_, 'mouseup', this, this.onMouseUp_);
  // Force a render.
  this.updateTextNode_();
  if (Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.Change(
        this.sourceBlock_, 'field', this.name, '', this.getValue()));
  }
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
  this.validator_ = null;
};

/**
 * Add or remove the UI indicating if this field is editable or not.
 */
Blockly.Field.prototype.updateEditable = function() {
  if (!this.EDITABLE || !this.sourceBlock_) {
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
 * Sets a new validation function for editable fields.
 * @param {Function} handler New validation function, or null.
 */
Blockly.Field.prototype.setValidator = function(handler) {
  this.validator_ = handler;
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
  if (this.visible_ && this.textElement_) {
    var key = this.textElement_.textContent + '\n' +
        this.textElement_.className.baseVal;
    if (Blockly.Field.cacheWidths_ && Blockly.Field.cacheWidths_[key]) {
      var width = Blockly.Field.cacheWidths_[key];
    } else {
      try {
        var width = this.textElement_.getComputedTextLength();
      } catch (e) {
        // MSIE 11 is known to throw "Unexpected call to method or property
        // access." if Blockly is hidden.
        var width = this.textElement_.textContent.length * 8;
      }
      if (Blockly.Field.cacheWidths_) {
        Blockly.Field.cacheWidths_[key] = width;
      }
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
 * Start caching field widths.  Every call to this function MUST also call
 * stopCache.  Caches must not survive between execution threads.
 */
Blockly.Field.startCache = function() {
  Blockly.Field.cacheReference_++;
  if (!Blockly.Field.cacheWidths_) {
    Blockly.Field.cacheWidths_ = {};
  }
};

/**
 * Stop caching field widths.  Unless caching was already on when the
 * corresponding call to startCache was made.
 */
Blockly.Field.stopCache = function() {
  Blockly.Field.cacheReference_--;
  if (!Blockly.Field.cacheReference_) {
    Blockly.Field.cacheWidths_ = null;
  }
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
 * Returns the height and width of the field,
 * accounting for the workspace scaling.
 * @return {!goog.math.Size} Height and width.
 * @private
 */
Blockly.Field.prototype.getScaledBBox_ = function() {
  var bBox = this.borderRect_.getBBox();
  // Create new object, as getBBox can return an uneditable SVGRect in IE.
  return new goog.math.Size(bBox.width * this.sourceBlock_.workspace.scale,
                            bBox.height * this.sourceBlock_.workspace.scale);
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
 * @param {*} text New text.
 */
Blockly.Field.prototype.setText = function(text) {
  if (text === null) {
    // No change if null.
    return;
  }
  text = String(text);
  if (text === this.text_) {
    // No change.
    return;
  }
  this.text_ = text;
  this.updateTextNode_();

  if (this.sourceBlock_ && this.sourceBlock_.rendered) {
    this.sourceBlock_.render();
    this.sourceBlock_.bumpNeighbours_();
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
  if (text.length > this.maxDisplayLength) {
    // Truncate displayed string and add an ellipsis ('...').
    text = text.substring(0, this.maxDisplayLength - 2) + '\u2026';
  }
  // Empty the text element.
  goog.dom.removeChildren(/** @type {!Element} */ (this.textElement_));
  // Replace whitespace with non-breaking spaces so the text doesn't collapse.
  text = text.replace(/\s/g, Blockly.Field.NBSP);
  if (this.sourceBlock_.RTL && text) {
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
 * @param {string} newText New text.
 */
Blockly.Field.prototype.setValue = function(newText) {
  if (newText === null) {
    // No change if null.
    return;
  }
  var oldText = this.getValue();
  if (oldText == newText) {
    return;
  }
  if (this.sourceBlock_ && Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.Change(
        this.sourceBlock_, 'field', this.name, oldText, newText));
  }
  this.setText(newText);
};

/**
 * Handle a mouse up event on an editable field.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.Field.prototype.onMouseUp_ = function(e) {
  if ((goog.userAgent.IPHONE || goog.userAgent.IPAD) &&
      !goog.userAgent.isVersionOrHigher('537.51.2') &&
      e.layerX !== 0 && e.layerY !== 0) {
    // Old iOS spawns a bogus event on the next touch after a 'prompt()' edit.
    // Unlike the real events, these have a layerX and layerY set.
    return;
  } else if (Blockly.isRightButton(e)) {
    // Right-click.
    return;
  } else if (Blockly.dragMode_ == Blockly.DRAG_FREE) {
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

/**
 * Return the absolute coordinates of the top-left corner of this field.
 * The origin (0,0) is the top-left corner of the page body.
 * @return {!goog.math.Coordinate} Object with .x and .y properties.
 * @private
 */
Blockly.Field.prototype.getAbsoluteXY_ = function() {
  return goog.style.getPageOffset(this.borderRect_);
};
