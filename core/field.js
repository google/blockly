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

goog.require('Blockly.Events');
goog.require('Blockly.Events.BlockChange');
goog.require('Blockly.Gesture');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.userAgent');

goog.require('goog.math.Size');
goog.require('goog.style');


/**
 * Abstract class for an editable field.
 * @param {*} value The initial value of the field.
 * @param {Function=} opt_validator  A function that is called to validate
 *    changes to the field's value. Takes in a value & returns a validated
 *    value, or null to abort the change.
 * @constructor
 */
Blockly.Field = function(value, opt_validator) {
  this.size_ = new goog.math.Size(0, Blockly.BlockSvg.MIN_BLOCK_Y);
  this.setValue(value);
  this.setValidator(opt_validator);
};

/**
 * The set of all registered fields, keyed by field type as used in the JSON
 * definition of a block.
 * @type {!Object<string, !{fromJson: Function}>}
 * @private
 */
Blockly.Field.TYPE_MAP_ = {};

/**
 * Registers a field type. May also override an existing field type.
 * Blockly.Field.fromJson uses this registry to find the appropriate field.
 * @param {string} type The field type name as used in the JSON definition.
 * @param {!{fromJson: Function}} fieldClass The field class containing a
 *     fromJson function that can construct an instance of the field.
 * @throws {Error} if the type name is empty, or the fieldClass is not an
 *     object containing a fromJson function.
 */
Blockly.Field.register = function(type, fieldClass) {
  if ((typeof type != 'string') || (type.trim() == '')) {
    throw Error('Invalid field type "' + type + '"');
  }
  if (!fieldClass || (typeof fieldClass.fromJson != 'function')) {
    throw Error('Field "' + fieldClass + '" must have a fromJson function');
  }
  Blockly.Field.TYPE_MAP_[type] = fieldClass;
};

/**
 * Construct a Field from a JSON arg object.
 * Finds the appropriate registered field by the type name as registered using
 * Blockly.Field.register.
 * @param {!Object} options A JSON object with a type and options specific
 *     to the field type.
 * @return {Blockly.Field} The new field instance or null if a field wasn't
 *     found with the given type name
 * @package
 */
Blockly.Field.fromJson = function(options) {
  var fieldClass = Blockly.Field.TYPE_MAP_[options['type']];
  if (fieldClass) {
    return fieldClass.fromJson(options);
  }
  return null;
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
 * @type {string|undefined}
 */
Blockly.Field.prototype.name = undefined;

/**
 * Maximum characters of text to display before adding an ellipsis.
 * @type {number}
 */
Blockly.Field.prototype.maxDisplayLength = 50;

/**
 * A generic value possessed by the field.
 * Should generally be non-null, only null when the field is created.
 * @type {*}
 * @protected
 */
Blockly.Field.prototype.value_ = null;

/**
 * Text representation of the field's value. Maintained for backwards
 * compatibility reasons.
 * @type {string}
 * @protected
 * @deprecated Use or override getText instead.
 */
Blockly.Field.prototype.text_ = '';

/**
 * Used to cache the field's tooltip value if setTooltip is called when the
 * field is not yet initialized. Is *not* guaranteed to be accurate.
 * @type {?string}
 * @private
 */
Blockly.Field.prototype.tooltip_ = null;

/**
 * Block this field is attached to.  Starts as null, then set in init.
 * @type {Blockly.Block}
 * @protected
 */
Blockly.Field.prototype.sourceBlock_ = null;

/**
 * Does this block need to be re-rendered?
 * @type {boolean}
 * @private
 */
Blockly.Field.prototype.isDirty_ = true;

/**
 * Is the field visible, or hidden due to the block being collapsed?
 * @type {boolean}
 * @protected
 */
Blockly.Field.prototype.visible_ = true;

/**
 * Validation function called when user edits an editable field.
 * @type {Function}
 * @protected
 */
Blockly.Field.prototype.validator_ = null;

/**
 * The element the click handler is bound to.
 * @type {!Element}
 * @private
 */
Blockly.Field.prototype.clickTarget_ = null;

/**
 * Non-breaking space.
 * @const
 */
Blockly.Field.NBSP = '\u00A0';

/**
 * Editable fields usually show some sort of UI indicating they are editable.
 * They will also be saved by the XML renderer.
 * @type {boolean}
 * @const
 * @default
 */
Blockly.Field.prototype.EDITABLE = true;

/**
 * Serializable fields are saved by the XML renderer, non-serializable fields
 * are not. Editable fields should also be serializable. This is not the
 * case by default so that SERIALIZABLE is backwards compatible.
 * @type {boolean}
 * @const
 * @default
 */
Blockly.Field.prototype.SERIALIZABLE = false;

/**
 * Attach this field to a block.
 * @param {!Blockly.Block} block The block containing this field.
 */
Blockly.Field.prototype.setSourceBlock = function(block) {
  if (this.sourceBlock_) {
    throw Error('Field already bound to a block.');
  }
  this.sourceBlock_ = block;
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
  this.fieldGroup_ = Blockly.utils.dom.createSvgElement('g', {}, null);
  if (!this.isVisible()) {
    this.fieldGroup_.style.display = 'none';
  }
  this.sourceBlock_.getSvgRoot().appendChild(this.fieldGroup_);
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
 * Create a field border rect element. Not to be overridden by subclasses.
 * Instead modify the result of the function inside initView, or create a
 * separate function to call.
 * @protected
 */
Blockly.Field.prototype.createBorderRect_ = function() {
  this.borderRect_ = Blockly.utils.dom.createSvgElement('rect',
      {
        'rx': 4,
        'ry': 4,
        'x': -Blockly.BlockSvg.SEP_SPACE_X / 2,
        'y': 0,
        'height': 16,
        'width': this.size_.width + Blockly.BlockSvg.SEP_SPACE_X
      }, this.fieldGroup_);
};

/**
 * Create a field text element. Not to be overridden by subclasses. Instead
 * modify the result of the function inside initView, or create a separate
 * function to call.
 * @protected
 */
Blockly.Field.prototype.createTextElement_ = function() {
  this.textElement_ = Blockly.utils.dom.createSvgElement('text',
      {
        'class': 'blocklyText',
        'y': this.size_.height - 12.5
      }, this.fieldGroup_);
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
 * Initializes the model of the field after it has been installed on a block.
 * No-op by default.
 * @package
 */
Blockly.Field.prototype.initModel = function() {
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
  var group = this.getClickTarget_();
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
 * validated founction as a field-level change event notification.
 *
 * @param {Function=} handler The validator
 *     function or null to clear a previous validator.
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
 * @return {!Element} The group element.
 */
Blockly.Field.prototype.getSvgRoot = function() {
  return /** @type {!Element} */ (this.fieldGroup_);
};

/**
 * Updates the field to match the colour/style of the block. Should only be
 * called by BlockSvg.updateColour().
 * @package
 */
Blockly.Field.prototype.updateColour = function() {
  // Non-abstract sub-classes may wish to implement this. See FieldDropdown.
};

/**
 * Used by getSize() to move/resize any dom elements, and get the new size.
 *
 * All rendering that has an effect on the size/shape of the block should be
 * done here, and should be triggered by getSize().
 * @protected
 */
Blockly.Field.prototype.render_ = function() {
  this.textContent_.nodeValue = this.getDisplayText_();
  this.updateSize_();
};

/**
 * Updates the width of the field. Redirects to updateSize_().
 * @deprecated May 2019  Use Blockly.Field.updateSize_() to force an update
 * to the size of the field, or Blockly.Field.getCachedWidth() to check the
 * size of the field..
 */
Blockly.Field.prototype.updateWidth = function() {
  console.warn('Deprecated call to updateWidth, call' +
    ' Blockly.Field.updateSize_ to force an update to the size of the' +
    ' field, or Blockly.Field.getCachedWidth() to check the size of the' +
    ' field.');
  this.updateSize_();
};

/**
 * Updates the size of the field based on the text.
 * @protected
 */
Blockly.Field.prototype.updateSize_ = function() {
  var width = Blockly.Field.getCachedWidth(this.textElement_);
  if (this.borderRect_) {
    this.borderRect_.setAttribute('width',
        width + Blockly.BlockSvg.SEP_SPACE_X);
  }
  this.size_.width = width;
};

/**
 * Gets the width of a text element, caching it in the process.
 * @param {!Element} textElement An SVG 'text' element.
 * @return {number} Width of element.
 */
Blockly.Field.getCachedWidth = function(textElement) {
  var key = textElement.textContent + '\n' + textElement.className.baseVal;
  var width;

  // Return the cached width if it exists.
  if (Blockly.Field.cacheWidths_) {
    width = Blockly.Field.cacheWidths_[key];
    if (width) {
      return width;
    }
  }

  // Attempt to compute fetch the width of the SVG text element.
  try {
    if (Blockly.utils.userAgent.IE || Blockly.utils.userAgent.EDGE) {
      width = textElement.getBBox().width;
    } else {
      width = textElement.getComputedTextLength();
    }
  } catch (e) {
    // In other cases where we fail to geth the computed text. Instead, use an
    // approximation and do not cache the result. At some later point in time
    // when the block is inserted into the visible DOM, this method will be
    // called again and, at that point in time, will not throw an exception.
    return textElement.textContent.length * 8;
  }

  // Cache the computed width and return.
  if (Blockly.Field.cacheWidths_) {
    Blockly.Field.cacheWidths_[key] = width;
  }
  return width;
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
 *
 * This should *in general* be the only place render_ gets called from.
 * @return {!goog.math.Size} Height and width.
 */
Blockly.Field.prototype.getSize = function() {
  if (!this.isVisible()) {
    return new goog.math.Size(0, 0);
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
 * @protected
 */
Blockly.Field.prototype.getScaledBBox_ = function() {
  var bBox = this.borderRect_.getBBox();
  var scaledHeight = bBox.height * this.sourceBlock_.workspace.scale;
  var scaledWidth = bBox.width * this.sourceBlock_.workspace.scale;
  var xy = this.getAbsoluteXY_();
  return {
    top: xy.y,
    bottom: xy.y + scaledHeight,
    left: xy.x,
    right: xy.x + scaledWidth
  };
};

/**
 * Get the text from this field as displayed on screen.  May differ from getText
 * due to ellipsis, and other formatting.
 * @return {string} Currently displayed text.
 * @protected
 */
Blockly.Field.prototype.getDisplayText_ = function() {
  var text = this.text_;
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
  if (this.sourceBlock_.RTL) {
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
  return this.text_;
};

/**
 * Set the text in this field.  Trigger a rerender of the source block.
 * @param {*} newText New text.
 */
Blockly.Field.prototype.setText = function(newText) {
  if (newText === null) {
    // No change if null.
    return;
  }
  newText = String(newText);
  if (newText === this.text_) {
    // No change.
    return;
  }
  this.text_ = newText;
  this.forceRerender();
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
    this.sourceBlock_.bumpNeighbours_();
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
        this.sourceBlock_, 'field', this.name, oldValue, newValue));
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
 * @param {*} newValue The value to be validated.
 * @return {*} The validated value, same as input by default.
 * @protected
 */
Blockly.Field.prototype.doClassValidation_ = function(newValue) {
  // For backwards compatibility.
  newValue = this.classValidator(newValue);
  return newValue;
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
  // For backwards compatibility.
  this.text_ = String(newValue);
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
 * @param {string|function|!Element} newTip Text for tooltip or a parent
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
 * @private
 */
Blockly.Field.prototype.getClickTarget_ = function() {
  return this.clickTarget_ || this.getSvgRoot();
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
