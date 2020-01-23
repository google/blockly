/**
 * @license
 * Copyright 2012 Google LLC
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

goog.require('Blockly.Events');
goog.require('Blockly.Events.BlockChange');
goog.require('Blockly.Gesture');
goog.require('Blockly.utils');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.Size');
goog.require('Blockly.utils.style');
goog.require('Blockly.utils.userAgent');

goog.requireType('Blockly.blockRendering.ConstantProvider');


/**
 * Abstract class for an editable field.
 * @param {*} value The initial value of the field.
 * @param {?Function=} opt_validator  A function that is called to validate
 *    changes to the field's value. Takes in a value & returns a validated
 *    value, or null to abort the change.
 * @param {Object=} opt_config A map of options used to configure the field. See
 *    the individual field's documentation for a list of properties this
 *    parameter supports.
 * @constructor
 */
Blockly.Field = function(value, opt_validator, opt_config) {
  /**
   * A generic value possessed by the field.
   * Should generally be non-null, only null when the field is created.
   * @type {*}
   * @protected
   */
  this.value_ = null;

  /**
   * Validation function called when user edits an editable field.
   * @type {Function}
   * @protected
   */
  this.validator_ = null;

  /**
   * Used to cache the field's tooltip value if setTooltip is called when the
   * field is not yet initialized. Is *not* guaranteed to be accurate.
   * @type {string|Function|!SVGElement}
   * @private
   */
  this.tooltip_ = null;

  /**
   * The size of the area rendered by the field.
   * @type {!Blockly.utils.Size}
   * @protected
   */
  this.size_ = new Blockly.utils.Size(0, 0);

  /**
   * Holds the cursors svg element when the cursor is attached to the field.
   * This is null if there is no cursor on the field.
   * @type {SVGElement}
   * @private
   */
  this.cursorSvg_ = null;

  /**
   * Holds the markers svg element when the marker is attached to the field.
   * This is null if there is no marker on the field.
   * @type {SVGElement}
   * @private
   */
  this.markerSvg_ = null;

  /**
   * The rendered field's SVG group element.
   * @type {SVGGElement}
   * @protected
   */
  this.fieldGroup_ = null;

  /**
   * The rendered field's SVG border element.
   * @type {SVGRectElement}
   * @protected
   */
  this.borderRect_ = null;

  /**
   * The rendered field's SVG text element.
   * @type {SVGTextElement}
   * @protected
   */
  this.textElement_ = null;

  /**
   * The rendered field's text content element.
   * @type {Text}
   * @protected
   */
  this.textContent_ = null;

  /**
   * Mouse down event listener data.
   * @type {?Blockly.EventData}
   * @private
   */
  this.mouseDownWrapper_ = null;

  /**
   * Constants associated with the source block's renderer.
   * @type {Blockly.blockRendering.ConstantProvider}
   * @protected
   */
  this.constants_ = null;

  opt_config && this.configure_(opt_config);
  this.setValue(value);
  opt_validator && this.setValidator(opt_validator);
};

/**
 * Name of field.  Unique within each block.
 * Static labels are usually unnamed.
 * @type {string|undefined}
 */
Blockly.Field.prototype.name = undefined;

/**
 * Has this field been disposed of?
 * @type {boolean}
 * @package
 */
Blockly.Field.prototype.disposed = false;

/**
 * Maximum characters of text to display before adding an ellipsis.
 * @type {number}
 */
Blockly.Field.prototype.maxDisplayLength = 50;

/**
 * Block this field is attached to.  Starts as null, then set in init.
 * @type {Blockly.Block}
 * @protected
 */
Blockly.Field.prototype.sourceBlock_ = null;

/**
 * Does this block need to be re-rendered?
 * @type {boolean}
 * @protected
 */
Blockly.Field.prototype.isDirty_ = true;

/**
 * Is the field visible, or hidden due to the block being collapsed?
 * @type {boolean}
 * @protected
 */
Blockly.Field.prototype.visible_ = true;

/**
 * The element the click handler is bound to.
 * @type {Element}
 * @protected
 */
Blockly.Field.prototype.clickTarget_ = null;

/**
 * A developer hook to override the returned text of this field.
 * Override if the text representation of the value of this field
 * is not just a string cast of its value.
 * Return null to resort to a string cast.
 * @return {?string} Current text. Return null to resort to a string cast.
 * @protected
 */
Blockly.Field.prototype.getText_;

/**
 * An optional method that can be defined to show an editor when the field is
 *     clicked. Blockly will automatically set the field as clickable if this
 *     method is defined.
 * @param {Event=} opt_e Optional mouse event that triggered the field to open,
 *     or undefined if triggered programatically.
 * @return {void}
 * @protected
 */
Blockly.Field.prototype.showEditor_;

/**
 * Non-breaking space.
 * @const
 */
Blockly.Field.NBSP = '\u00A0';

/**
 * Editable fields usually show some sort of UI indicating they are editable.
 * They will also be saved by the XML renderer.
 * @type {boolean}
 */
Blockly.Field.prototype.EDITABLE = true;

/**
 * Serializable fields are saved by the XML renderer, non-serializable fields
 * are not. Editable fields should also be serializable. This is not the
 * case by default so that SERIALIZABLE is backwards compatible.
 * @type {boolean}
 */
Blockly.Field.prototype.SERIALIZABLE = false;

/**
 * Process the configuration map passed to the field.
 * @param {!Object} config A map of options used to configure the field. See
 *    the individual field's documentation for a list of properties this
 *    parameter supports.
 * @protected
 */
Blockly.Field.prototype.configure_ = function(config) {
  var tooltip = config['tooltip'];
  if (typeof tooltip == 'string') {
    tooltip = Blockly.utils.replaceMessageReferences(
        config['tooltip']);
  }
  tooltip && this.setTooltip(tooltip);

  // TODO (#2884): Possibly add CSS class config option.
  // TODO (#2885): Possibly add cursor config option.
};

/**
 * Attach this field to a block.
 * @param {!Blockly.Block} block The block containing this field.
 */
Blockly.Field.prototype.setSourceBlock = function(block) {
  if (this.sourceBlock_) {
    throw Error('Field already bound to a block.');
  }
  this.sourceBlock_ = block;
  if (block.workspace.rendered) {
    this.constants_ = block.workspace.getRenderer().getConstants();
  }
};

/**
 * Get the block this field is attached to.
 * @return {Blockly.Block} The block containing this field.
 */
Blockly.Field.prototype.getSourceBlock = function() {
  return this.sourceBlock_;
};

/**
 * Initialize everything to render this field. Override
 * methods initModel and initView rather than this method.
 * @package
 */
Blockly.Field.prototype.init = function() {
  if (this.fieldGroup_) {
    // Field has already been initialized once.
    return;
  }
  this.fieldGroup_ = /** @type {!SVGGElement} **/
      (Blockly.utils.dom.createSvgElement('g', {}, null));
  if (!this.isVisible()) {
    this.fieldGroup_.style.display = 'none';
  }
  var sourceBlockSvg = /** @type {!Blockly.BlockSvg} **/ (this.sourceBlock_);
  sourceBlockSvg.getSvgRoot().appendChild(this.fieldGroup_);
  this.initView();
  this.updateEditable();
  this.setTooltip(this.tooltip_);
  this.bindEvents_();
  this.initModel();
};

/**
 * Create the block UI for this field.
 * @package
 */
Blockly.Field.prototype.initView = function() {
  this.createBorderRect_();
  this.createTextElement_();
};

/**
 * Initializes the model of the field after it has been installed on a block.
 * No-op by default.
 * @package
 */
Blockly.Field.prototype.initModel = function() {
};

/**
 * Create a field border rect element. Not to be overridden by subclasses.
 * Instead modify the result of the function inside initView, or create a
 * separate function to call.
 * @protected
 */
Blockly.Field.prototype.createBorderRect_ = function() {
  this.size_.height =
      Math.max(this.size_.height, this.constants_.FIELD_BORDER_RECT_HEIGHT);
  this.size_.width =
      Math.max(this.size_.width, this.constants_.FIELD_BORDER_RECT_X_PADDING * 2);
  this.borderRect_ = /** @type {!SVGRectElement} **/
      (Blockly.utils.dom.createSvgElement('rect',
          {
            'rx': this.constants_.FIELD_BORDER_RECT_RADIUS,
            'ry': this.constants_.FIELD_BORDER_RECT_RADIUS,
            'x': 0,
            'y': 0,
            'height': this.size_.height,
            'width': this.size_.width,
            'class': 'blocklyFieldRect'
          }, this.fieldGroup_));
};

/**
 * Create a field text element. Not to be overridden by subclasses. Instead
 * modify the result of the function inside initView, or create a separate
 * function to call.
 * @protected
 */
Blockly.Field.prototype.createTextElement_ = function() {
  var xOffset = this.borderRect_ ?
    this.constants_.FIELD_BORDER_RECT_X_PADDING : 0;
  var baselineCenter = this.constants_.FIELD_TEXT_BASELINE_CENTER;
  var baselineY = this.constants_.FIELD_TEXT_BASELINE_Y;
  this.size_.height = Math.max(this.size_.height, baselineCenter ?
      this.constants_.FIELD_TEXT_HEIGHT : baselineY);
  if (this.size_.height > this.constants_.FIELD_TEXT_HEIGHT) {
    baselineY += (this.size_.height - baselineY) / 2;
  }
  this.textElement_ = /** @type {!SVGTextElement} **/
      (Blockly.utils.dom.createSvgElement('text',
          {
            'class': 'blocklyText',
            'y': baselineCenter ? this.size_.height / 2 : baselineY,
            'dy': this.constants_.FIELD_TEXT_Y_OFFSET,
            'x': xOffset
          }, this.fieldGroup_));
  if (baselineCenter) {
    this.textElement_.setAttribute('dominant-baseline', 'central');
  }
  this.textContent_ = document.createTextNode('');
  this.textElement_.appendChild(this.textContent_);
};

/**
 * Bind events to the field. Can be overridden by subclasses if they need to do
 * custom input handling.
 * @protected
 */
Blockly.Field.prototype.bindEvents_ = function() {
  Blockly.Tooltip.bindMouseEvents(this.getClickTarget_());
  this.mouseDownWrapper_ =
      Blockly.bindEventWithChecks_(
          this.getClickTarget_(), 'mousedown', this, this.onMouseDown_);
};

/**
 * Sets the field's value based on the given XML element. Should only be
 * called by Blockly.Xml.
 * @param {!Element} fieldElement The element containing info about the
 *    field's state.
 * @package
 */
Blockly.Field.prototype.fromXml = function(fieldElement) {
  this.setValue(fieldElement.textContent);
};

/**
 * Serializes this field's value to XML. Should only be called by Blockly.Xml.
 * @param {!Element} fieldElement The element to populate with info about the
 *    field's state.
 * @return {!Element} The element containing info about the field's state.
 * @package
 */
Blockly.Field.prototype.toXml = function(fieldElement) {
  fieldElement.textContent = this.getValue();
  return fieldElement;
};

/**
 * Dispose of all DOM objects and events belonging to this editable field.
 * @package
 */
Blockly.Field.prototype.dispose = function() {
  Blockly.DropDownDiv.hideIfOwner(this);
  Blockly.WidgetDiv.hideIfOwner(this);

  if (this.mouseDownWrapper_) {
    Blockly.unbindEvent_(this.mouseDownWrapper_);
  }

  Blockly.utils.dom.removeNode(this.fieldGroup_);

  this.disposed = true;
};

/**
 * Add or remove the UI indicating if this field is editable or not.
 */
Blockly.Field.prototype.updateEditable = function() {
  var group = this.fieldGroup_;
  if (!this.EDITABLE || !group) {
    return;
  }
  if (this.sourceBlock_.isEditable()) {
    Blockly.utils.dom.addClass(group, 'blocklyEditableText');
    Blockly.utils.dom.removeClass(group, 'blocklyNonEditableText');
    group.style.cursor = this.CURSOR;
  } else {
    Blockly.utils.dom.addClass(group, 'blocklyNonEditableText');
    Blockly.utils.dom.removeClass(group, 'blocklyEditableText');
    group.style.cursor = '';
  }
};

/**
 * Check whether this field defines the showEditor_ function.
 * @return {boolean} Whether this field is clickable.
 */
Blockly.Field.prototype.isClickable = function() {
  return !!this.sourceBlock_ && this.sourceBlock_.isEditable() &&
      !!this.showEditor_ && (typeof this.showEditor_ === 'function');
};

/**
 * Check whether this field is currently editable.  Some fields are never
 * EDITABLE (e.g. text labels). Other fields may be EDITABLE but may exist on
 * non-editable blocks.
 * @return {boolean} Whether this field is editable and on an editable block
 */
Blockly.Field.prototype.isCurrentlyEditable = function() {
  return this.EDITABLE && !!this.sourceBlock_ && this.sourceBlock_.isEditable();
};

/**
 * Check whether this field should be serialized by the XML renderer.
 * Handles the logic for backwards compatibility and incongruous states.
 * @return {boolean} Whether this field should be serialized or not.
 */
Blockly.Field.prototype.isSerializable = function() {
  var isSerializable = false;
  if (this.name) {
    if (this.SERIALIZABLE) {
      isSerializable = true;
    } else if (this.EDITABLE) {
      console.warn('Detected an editable field that was not serializable.' +
        ' Please define SERIALIZABLE property as true on all editable custom' +
        ' fields. Proceeding with serialization.');
      isSerializable = true;
    }
  }
  return isSerializable;
};

/**
 * Gets whether this editable field is visible or not.
 * @return {boolean} True if visible.
 */
Blockly.Field.prototype.isVisible = function() {
  return this.visible_;
};

/**
 * Sets whether this editable field is visible or not. Should only be called
 * by input.setVisible.
 * @param {boolean} visible True if visible.
 * @package
 */
Blockly.Field.prototype.setVisible = function(visible) {
  if (this.visible_ == visible) {
    return;
  }
  this.visible_ = visible;
  var root = this.getSvgRoot();
  if (root) {
    root.style.display = visible ? 'block' : 'none';
  }
};

/**
 * Sets a new validation function for editable fields, or clears a previously
 * set validator.
 *
 * The validator function takes in the new field value, and returns
 * validated value. The validated value could be the input value, a modified
 * version of the input value, or null to abort the change.
 *
 * If the function does not return anything (or returns undefined) the new
 * value is accepted as valid. This is to allow for fields using the
 * validated function as a field-level change event notification.
 *
 * @param {Function} handler The validator function
 *     or null to clear a previous validator.
 */
Blockly.Field.prototype.setValidator = function(handler) {
  this.validator_ = handler;
};

/**
 * Gets the validation function for editable fields, or null if not set.
 * @return {Function} Validation function, or null.
 */
Blockly.Field.prototype.getValidator = function() {
  return this.validator_;
};

/**
 * Validates a change.  Does nothing.  Subclasses may override this.
 * @param {string} text The user's text.
 * @return {string} No change needed.
 * @deprecated May 2019. Override doClassValidation and other relevant 'do'
 *  functions instead.
 */
Blockly.Field.prototype.classValidator = function(text) {
  return text;
};

/**
 * Calls the validation function for this field, as well as all the validation
 * function for the field's class and its parents.
 * @param {string} text Proposed text.
 * @return {?string} Revised text, or null if invalid.
 * @deprecated May 2019. setValue now contains all relevant logic.
 */
Blockly.Field.prototype.callValidator = function(text) {
  var classResult = this.classValidator(text);
  if (classResult === null) {
    // Class validator rejects value.  Game over.
    return null;
  } else if (classResult !== undefined) {
    text = classResult;
  }
  var userValidator = this.getValidator();
  if (userValidator) {
    var userResult = userValidator.call(this, text);
    if (userResult === null) {
      // User validator rejects value.  Game over.
      return null;
    } else if (userResult !== undefined) {
      text = userResult;
    }
  }
  return text;
};

/**
 * Gets the group element for this editable field.
 * Used for measuring the size and for positioning.
 * @return {!SVGGElement} The group element.
 */
Blockly.Field.prototype.getSvgRoot = function() {
  return /** @type {!SVGGElement} */ (this.fieldGroup_);
};

/**
 * Updates the field to match the colour/style of the block. Should only be
 * called by BlockSvg.applyColour().
 * @package
 */
Blockly.Field.prototype.applyColour = function() {
  // Non-abstract sub-classes may wish to implement this. See FieldDropdown.
};

/**
 * Used by getSize() to move/resize any DOM elements, and get the new size.
 *
 * All rendering that has an effect on the size/shape of the block should be
 * done here, and should be triggered by getSize().
 * @protected
 */
Blockly.Field.prototype.render_ = function() {
  if (this.textContent_) {
    this.textContent_.nodeValue = this.getDisplayText_();
    this.updateSize_();
  }
};

/**
 * Show an editor when the field is clicked only if the field is clickable.
 * @param {Event=} opt_e Optional mouse event that triggered the field to open,
 *     or undefined if triggered programatically.
 * @package
 */
Blockly.Field.prototype.showEditor = function(opt_e) {
  if (this.isClickable()) {
    this.showEditor_(opt_e);
  }
};

/**
 * Updates the width of the field. Redirects to updateSize_().
 * @deprecated May 2019  Use Blockly.Field.updateSize_() to force an update
 * to the size of the field, or Blockly.utils.dom.getTextWidth() to
 * check the size of the field.
 */
Blockly.Field.prototype.updateWidth = function() {
  console.warn('Deprecated call to updateWidth, call' +
    ' Blockly.Field.updateSize_ to force an update to the size of the' +
    ' field, or Blockly.utils.dom.getTextWidth() to check the size' +
    ' of the field.');
  this.updateSize_();
};

/**
 * Updates the size of the field based on the text.
 * @protected
 */
Blockly.Field.prototype.updateSize_ = function() {
  var textWidth = Blockly.utils.dom.getFastTextWidth(
      /** @type {!SVGTextElement} */ (this.textElement_),
      this.constants_.FIELD_TEXT_FONTSIZE,
      this.constants_.FIELD_TEXT_FONTWEIGHT,
      this.constants_.FIELD_TEXT_FONTFAMILY);
  var totalWidth = textWidth;
  if (this.borderRect_) {
    totalWidth += this.constants_.FIELD_BORDER_RECT_X_PADDING * 2;
    this.borderRect_.setAttribute('width', totalWidth);
  }
  this.size_.width = totalWidth;
};

/**
 * Returns the height and width of the field.
 *
 * This should *in general* be the only place render_ gets called from.
 * @return {!Blockly.utils.Size} Height and width.
 */
Blockly.Field.prototype.getSize = function() {
  if (!this.isVisible()) {
    return new Blockly.utils.Size(0, 0);
  }

  if (this.isDirty_) {
    this.render_();
    this.isDirty_ = false;
  } else if (this.visible_ && this.size_.width == 0) {
    // If the field is not visible the width will be 0 as well, one of the
    // problems with the old system.
    console.warn('Deprecated use of setting size_.width to 0 to rerender a' +
      ' field. Set field.isDirty_ to true instead.');
    this.render_();
  }
  return this.size_;
};

/**
 * Returns the bounding box of the rendered field, accounting for workspace
 * scaling.
 * @return {!Object} An object with top, bottom, left, and right in pixels
 *     relative to the top left corner of the page (window coordinates).
 * @package
 */
Blockly.Field.prototype.getScaledBBox = function() {
  if (!this.borderRect_) {
    // Browsers are inconsistent in what they return for a bounding box.
    // - Webkit / Blink: fill-box / object bounding box
    // - Gecko / Triden / EdgeHTML: stroke-box
    var bBox = this.sourceBlock_.getHeightWidth();
    var scale = this.sourceBlock_.workspace.scale;
    var xy = this.getAbsoluteXY_();
    var scaledWidth = bBox.width * scale;
    var scaledHeight = bBox.height * scale;

    if (Blockly.utils.userAgent.GECKO) {
      xy.x += 1.5 * scale;
      xy.y += 1.5 * scale;
      scaledWidth += 1 * scale;
      scaledHeight += 1 * scale;
    } else {
      if (!Blockly.utils.userAgent.EDGE && !Blockly.utils.userAgent.IE) {
        xy.x -= 0.5 * scale;
        xy.y -= 0.5 * scale;
      }
      scaledWidth += 1 * scale;
      scaledHeight += 1 * scale;
    }
  } else {
    var bBox = this.borderRect_.getBoundingClientRect();
    var xy = Blockly.utils.style.getPageOffset(this.borderRect_);
    var scaledWidth = bBox.width;
    var scaledHeight = bBox.height;
  }
  return {
    top: xy.y,
    bottom: xy.y + scaledHeight,
    left: xy.x,
    right: xy.x + scaledWidth
  };
};

/**
 * Get the text from this field to display on the block. May differ from
 * ``getText`` due to ellipsis, and other formatting.
 * @return {string} Text to display.
 * @protected
 */
Blockly.Field.prototype.getDisplayText_ = function() {
  var text = this.getText();
  if (!text) {
    // Prevent the field from disappearing if empty.
    return Blockly.Field.NBSP;
  }
  if (text.length > this.maxDisplayLength) {
    // Truncate displayed string and add an ellipsis ('...').
    text = text.substring(0, this.maxDisplayLength - 2) + '\u2026';
  }
  // Replace whitespace with non-breaking spaces so the text doesn't collapse.
  text = text.replace(/\s/g, Blockly.Field.NBSP);
  if (this.sourceBlock_ && this.sourceBlock_.RTL) {
    // The SVG is LTR, force text to be RTL.
    text += '\u200F';
  }
  return text;
};

/**
 * Get the text from this field.
 * @return {string} Current text.
 */
Blockly.Field.prototype.getText = function() {
  if (this.getText_) {
    var text = this.getText_.call(this);
    if (text !== null) {
      return String(text);
    }
  }
  return String(this.getValue());
};

/**
 * Set the text in this field.  Trigger a rerender of the source block.
 * @param {*} _newText New text.
 * @deprecated 2019 setText should not be used directly. Use setValue instead.
 */
Blockly.Field.prototype.setText = function(_newText) {
  throw Error('setText method is deprecated');
};

/**
 * Force a rerender of the block that this field is installed on, which will
 * rerender this field and adjust for any sizing changes.
 * Other fields on the same block will not rerender, because their sizes have
 * already been recorded.
 * @package
 */
Blockly.Field.prototype.markDirty = function() {
  this.isDirty_ = true;
};

/**
 * Force a rerender of the block that this field is installed on, which will
 * rerender this field and adjust for any sizing changes.
 * Other fields on the same block will not rerender, because their sizes have
 * already been recorded.
 * @package
 */
Blockly.Field.prototype.forceRerender = function() {
  this.isDirty_ = true;
  if (this.sourceBlock_ && this.sourceBlock_.rendered) {
    this.sourceBlock_.render();
    this.sourceBlock_.bumpNeighbours();
  }
};

/**
 * Used to change the value of the field. Handles validation and events.
 * Subclasses should override doClassValidation_ and doValueUpdate_ rather
 * than this method.
 * @param {*} newValue New value.
 */
Blockly.Field.prototype.setValue = function(newValue) {
  var doLogging = false;
  if (newValue === null) {
    doLogging && console.log('null, return');
    // Not a valid value to check.
    return;
  }

  var validatedValue = this.doClassValidation_(newValue);
  // Class validators might accidentally forget to return, we'll ignore that.
  newValue = this.processValidation_(newValue, validatedValue);
  if (newValue instanceof Error) {
    doLogging && console.log('invalid class validation, return');
    return;
  }

  var localValidator = this.getValidator();
  if (localValidator) {
    validatedValue = localValidator.call(this, newValue);
    // Local validators might accidentally forget to return, we'll ignore that.
    newValue = this.processValidation_(newValue, validatedValue);
    if (newValue instanceof Error) {
      doLogging && console.log('invalid local validation, return');
      return;
    }
  }
  var oldValue = this.getValue();
  if (oldValue === newValue) {
    doLogging && console.log('same, return');
    // No change.
    return;
  }

  if (this.sourceBlock_ && Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.BlockChange(
        this.sourceBlock_, 'field', this.name || null, oldValue, newValue));
  }
  this.doValueUpdate_(newValue);
  if (this.isDirty_) {
    this.forceRerender();
  }
  doLogging && console.log(this.value_);
};

/**
 * Process the result of validation.
 * @param {*} newValue New value.
 * @param {*} validatedValue Validated value.
 * @return {*} New value, or an Error object.
 * @private
 */
Blockly.Field.prototype.processValidation_ = function(newValue,
    validatedValue) {
  if (validatedValue === null) {
    this.doValueInvalid_(newValue);
    if (this.isDirty_) {
      this.forceRerender();
    }
    return Error();
  }
  if (validatedValue !== undefined) {
    newValue = validatedValue;
  }
  return newValue;
};

/**
 * Get the current value of the field.
 * @return {*} Current value.
 */
Blockly.Field.prototype.getValue = function() {
  return this.value_;
};

/**
 * Used to validate a value. Returns input by default. Can be overridden by
 * subclasses, see FieldDropdown.
 * @param {*=} opt_newValue The value to be validated.
 * @return {*} The validated value, same as input by default.
 * @protected
 * @suppress {deprecated} Suppress deprecated this.classValidator call.
 */
Blockly.Field.prototype.doClassValidation_ = function(opt_newValue) {
  if (opt_newValue === null || opt_newValue === undefined) {
    return null;
  }
  // For backwards compatibility.
  opt_newValue = this.classValidator(/** @type {string} */ (opt_newValue));
  return opt_newValue;
};

/**
 * Used to update the value of a field. Can be overridden by subclasses to do
 * custom storage of values/updating of external things.
 * @param {*} newValue The value to be saved.
 * @protected
 */
Blockly.Field.prototype.doValueUpdate_ = function(newValue) {
  this.value_ = newValue;
  this.isDirty_ = true;
};

/**
 * Used to notify the field an invalid value was input. Can be overidden by
 * subclasses, see FieldTextInput.
 * No-op by default.
 * @param {*} _invalidValue The input value that was determined to be invalid.
 * @protected
 */
Blockly.Field.prototype.doValueInvalid_ = function(_invalidValue) {
  // NOP
};

/**
 * Handle a mouse down event on a field.
 * @param {!Event} e Mouse down event.
 * @protected
 */
Blockly.Field.prototype.onMouseDown_ = function(e) {
  if (!this.sourceBlock_ || !this.sourceBlock_.workspace) {
    return;
  }
  var gesture = this.sourceBlock_.workspace.getGesture(e);
  if (gesture) {
    gesture.setStartField(this);
  }
};

/**
 * Change the tooltip text for this field.
 * @param {string|Function|!SVGElement} newTip Text for tooltip or a parent
 *    element to link to for its tooltip.
 */
Blockly.Field.prototype.setTooltip = function(newTip) {
  var clickTarget = this.getClickTarget_();
  if (!clickTarget) {
    // Field has not been initialized yet.
    this.tooltip_ = newTip;
    return;
  }

  if (!newTip && newTip !== '') {  // If null or undefined.
    clickTarget.tooltip = this.sourceBlock_;
  } else {
    clickTarget.tooltip = newTip;
  }
};

/**
 * The element to bind the click handler to. If not set explicitly, defaults
 * to the SVG root of the field. When this element is
 * clicked on an editable field, the editor will open.
 * @return {!Element} Element to bind click handler to.
 * @protected
 */
Blockly.Field.prototype.getClickTarget_ = function() {
  return this.clickTarget_ || this.getSvgRoot();
};

/**
 * Return the absolute coordinates of the top-left corner of this field.
 * The origin (0,0) is the top-left corner of the page body.
 * @return {!Blockly.utils.Coordinate} Object with .x and .y properties.
 * @protected
 */
Blockly.Field.prototype.getAbsoluteXY_ = function() {
  return Blockly.utils.style.getPageOffset(
      /** @type {!SVGRectElement} */ (this.getClickTarget_()));
};

/**
 * Whether this field references any Blockly variables.  If true it may need to
 * be handled differently during serialization and deserialization.  Subclasses
 * may override this.
 * @return {boolean} True if this field has any variable references.
 * @package
 */
Blockly.Field.prototype.referencesVariables = function() {
  return false;
};

/**
 * Search through the list of inputs and their fields in order to find the
 * parent input of a field.
 * @return {Blockly.Input} The input that the field belongs to.
 * @package
 */
Blockly.Field.prototype.getParentInput = function() {
  var parentInput = null;
  var block = this.sourceBlock_;
  var inputs = block.inputList;

  for (var idx = 0; idx < block.inputList.length; idx++) {
    var input = inputs[idx];
    var fieldRows = input.fieldRow;
    for (var j = 0; j < fieldRows.length; j++) {
      if (fieldRows[j] === this) {
        parentInput = input;
        break;
      }
    }
  }
  return parentInput;
};

/**
 * Returns whether or not we should flip the field in RTL.
 * @return {boolean} True if we should flip in RTL.
 */
Blockly.Field.prototype.getFlipRtl = function() {
  return false;
};

/**
 * Returns whether or not the field is tab navigable.
 * @return {boolean} True if the field is tab navigable.
 */
Blockly.Field.prototype.isTabNavigable = function() {
  return false;
};

/**
 * Handles the given action.
 * This is only triggered when keyboard accessibility mode is enabled.
 * @param {!Blockly.Action} _action The action to be handled.
 * @return {boolean} True if the field handled the action, false otherwise.
 * @package
 */
Blockly.Field.prototype.onBlocklyAction = function(_action) {
  return false;
};

/**
 * Add the cursor svg to this fields svg group.
 * @param {SVGElement} cursorSvg The svg root of the cursor to be added to the
 *     field group.
 * @package
 */
Blockly.Field.prototype.setCursorSvg = function(cursorSvg) {
  if (!cursorSvg) {
    this.cursorSvg_ = null;
    return;
  }

  this.fieldGroup_.appendChild(cursorSvg);
  this.cursorSvg_ = cursorSvg;
};

/**
 * Add the marker svg to this fields svg group.
 * @param {SVGElement} markerSvg The svg root of the marker to be added to the
 *     field group.
 * @package
 */
Blockly.Field.prototype.setMarkerSvg = function(markerSvg) {
  if (!markerSvg) {
    this.markerSvg_ = null;
    return;
  }

  this.fieldGroup_.appendChild(markerSvg);
  this.markerSvg_ = markerSvg;
};
