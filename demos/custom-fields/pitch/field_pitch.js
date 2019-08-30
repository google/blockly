/**
 * Visual Blocks Editor
 *
 * Copyright 2016 Google Inc.
 * https://github.com/google/blockly-games
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
 * @fileoverview Music pitch input field. Borrowed from Blockly Games.
 * @author fraser@google.com (Neil Fraser)
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

goog.provide('Blockly.FieldPitch');

goog.require('Blockly.FieldTextInput');
goog.require('Blockly.utils.math');
goog.require('Blockly.utils.userAgent');


/**
 * Class for an editable pitch field.
 * @param {string} text The initial content of the field.
 * @extends {Blockly.FieldTextInput}
 * @constructor
 */
Blockly.FieldPitch = function(text) {
  Blockly.FieldPitch.superClass_.constructor.call(this, text);
};
goog.inherits(Blockly.FieldPitch, Blockly.FieldTextInput);

/**
 * Construct a FieldPitch from a JSON arg object.
 * @param {!Object} options A JSON object with options (pitch).
 * @return {!Blockly.FieldPitch} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldPitch.fromJson = function(options) {
  return new Blockly.FieldPitch(options['pitch']);
};

/**
 * All notes available for the picker.
 */
Blockly.FieldPitch.NOTES = 'C3 D3 E3 F3 G3 A3 B3 C4 D4 E4 F4 G4 A4'.split(/ /);

/**
 * Show the inline free-text editor on top of the text and the note picker.
 * @private
 */
Blockly.FieldPitch.prototype.showEditor_ = function() {
  Blockly.FieldPitch.superClass_.showEditor_.call(this);

  var div = Blockly.WidgetDiv.DIV;
  if (!div.firstChild) {
    // Mobile interface uses Blockly.prompt.
    return;
  }
  // Build the DOM.
  var editor = this.dropdownCreate_();
  Blockly.DropDownDiv.getContentDiv().appendChild(editor);

  var border = this.sourceBlock_.getColourBorder();
  border = border.colourBorder || border.colourLight;
  Blockly.DropDownDiv.setColour(this.sourceBlock_.getColour(), border);

  Blockly.DropDownDiv.showPositionedByField(
      this, this.dropdownDispose_.bind(this));

  // The note picker is different from other fields in that it updates on
  // mousemove even if it's not in the middle of a drag.  In future we may
  // change this behaviour.  For now, using bindEvent_ instead of
  // bindEventWithChecks_ allows it to work without a mousedown/touchstart.
  this.clickWrapper_ =
      Blockly.bindEvent_(this.imageElement_, 'click', this,
          this.hide_);
  this.moveWrapper_ =
      Blockly.bindEvent_(this.imageElement_, 'mousemove', this,
          this.onMouseMove);

  this.updateGraph_();
};

/**
 * Create the pitch editor.
 * @return {!Element} The newly created pitch picker.
 * @private
 */
Blockly.FieldPitch.prototype.dropdownCreate_ = function() {
  this.imageElement_ = document.createElement('div');
  this.imageElement_.id = 'notePicker';

  return this.imageElement_;
};

/**
 * Dispose of events belonging to the pitch editor.
 * @private
 */
Blockly.FieldPitch.prototype.dropdownDispose_ = function() {
  Blockly.unbindEvent_(this.clickWrapper_);
  Blockly.unbindEvent_(this.moveWrapper_);
};

/**
 * Hide the editor.
 * @private
 */
Blockly.FieldPitch.prototype.hide_ = function() {
  Blockly.WidgetDiv.hide();
  Blockly.DropDownDiv.hideWithoutAnimation();
};

/**
 * Set the note to match the mouse's position.
 * @param {!Event} e Mouse move event.
 */
Blockly.FieldPitch.prototype.onMouseMove = function(e) {
  var bBox = this.imageElement_.getBoundingClientRect();
  var dy = e.clientY - bBox.top;
  var note = Blockly.utils.math.clamp(Math.round(13.5 - dy / 7.5), 0, 12);
  this.imageElement_.style.backgroundPosition = (-note * 37) + 'px 0';
  this.setEditorValue_(note);
};

/**
 * Convert a provided value to a note.
 * @param {number|string} newValue The provided value.
 * @return {string} The respective note.
 */
Blockly.FieldPitch.prototype.valueToNote = function(newValue) {
  var note = Blockly.FieldPitch.NOTES[Number(newValue)];
  return note;
};

/**
 * Convert a note to a value that can be stored in the field.
 * @param {string} newText The provided note.
 * @return {number} The respective value.
 */
Blockly.FieldPitch.prototype.noteToValue = function(newText) {
  var i = Blockly.FieldPitch.NOTES.indexOf(newText);
  return i;
};

/**
 * Get the text to be displayed on the field node.
 * @return {?string} The html value if we're editing, otherwise null. Null means
 *   the super class will handle it, likely a string cast of value.
 * @protected
 */
Blockly.FieldPitch.prototype.getText_ = function() {
  if (this.isBeingEdited_) {
    return Blockly.FieldPitch.superClass_.getText_.call(this);
  }
  return this.valueToNote(this.getValue()) || null;
};

/**
 * Transform the provided value into a text to show in the html input.
 * @param {*} value The value stored in this field.
 * @returns {string} The text to show on the html input.
 */
Blockly.FieldPitch.prototype.getEditorText_ = function(value) {
  return this.valueToNote(value);
};

/**
 * Transform the text received from the html input (note) into a value
 *    to store in this field.
 * @param {string} text Text received from the html input.
 * @returns {*} The value to store.
 */
Blockly.FieldPitch.prototype.getValueFromEditorText_ = function(text) {
  return this.noteToValue(text);
};

/**
 * Updates the graph when the field rerenders.
 * @private
 * @override
 */
Blockly.FieldPitch.prototype.render_ = function() {
  Blockly.FieldPitch.superClass_.render_.call(this);
  this.updateGraph_();
};

/**
 * Redraw the note picker with the current note.
 * @private
 */
Blockly.FieldPitch.prototype.updateGraph_ = function() {
  if (!this.imageElement_) {
    return;
  }
  var i = this.getValue();
  this.imageElement_.style.backgroundPosition = (-i * 37) + 'px 0';
};

/**
 * Ensure that only a valid value may be entered.
 * @param {*} opt_newValue The input value.
 * @return {*} A valid value, or null if invalid.
 */
Blockly.FieldPitch.prototype.doClassValidation_ = function(opt_newValue) {
  if (opt_newValue === null || opt_newValue === undefined) {
    return null;
  }
  var note = this.valueToNote(opt_newValue);
  if (note) {
    return opt_newValue;
  }
  return null;
};

Blockly.fieldRegistry.register('field_pitch', Blockly.FieldPitch);
