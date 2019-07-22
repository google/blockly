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
 * @fileoverview Text input field.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.FieldTextInput');

goog.require('Blockly.Events');
goog.require('Blockly.Events.BlockChange');
goog.require('Blockly.Field');
goog.require('Blockly.Msg');
goog.require('Blockly.utils');
goog.require('Blockly.utils.Coordinate');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.userAgent');


/**
 * Class for an editable text field.
 * @param {string=} opt_value The initial value of the field. Should cast to a
 *    string. Defaults to an empty string if null or undefined.
 * @param {Function=} opt_validator A function that is called to validate
 *    changes to the field's value. Takes in a string & returns a validated
 *    string, or null to abort the change.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldTextInput = function(opt_value, opt_validator) {
  opt_value = this.doClassValidation_(opt_value);
  if (opt_value === null) {
    opt_value = '';
  }
  Blockly.FieldTextInput.superClass_.constructor.call(this, opt_value,
      opt_validator);
};
goog.inherits(Blockly.FieldTextInput, Blockly.Field);

/**
 * Construct a FieldTextInput from a JSON arg object,
 * dereferencing any string table references.
 * @param {!Object} options A JSON object with options (text, class, and
 *                          spellcheck).
 * @return {!Blockly.FieldTextInput} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldTextInput.fromJson = function(options) {
  var text = Blockly.utils.replaceMessageReferences(options['text']);
  var field = new Blockly.FieldTextInput(text);
  if (typeof options['spellcheck'] === 'boolean') {
    field.setSpellcheck(options['spellcheck']);
  }
  return field;
};

/**
 * Serializable fields are saved by the XML renderer, non-serializable fields
 * are not. Editable fields should also be serializable.
 * @type {boolean}
 * @const
 */
Blockly.FieldTextInput.prototype.SERIALIZABLE = true;

/**
 * Point size of text.  Should match blocklyText's font-size in CSS.
 */
Blockly.FieldTextInput.FONTSIZE = 11;

/**
 * Mouse cursor style when over the hotspot that initiates the editor.
 */
Blockly.FieldTextInput.prototype.CURSOR = 'text';

/**
 * Allow browser to spellcheck this field.
 * @private
 */
Blockly.FieldTextInput.prototype.spellcheck_ = true;

/**
 * Ensure that the input value casts to a valid string.
 * @param {string=} newValue The input value.
 * @return {?string} A valid string, or null if invalid.
 * @protected
 */
Blockly.FieldTextInput.prototype.doClassValidation_ = function(newValue) {
  if (newValue === null || newValue === undefined) {
    return null;
  }
  return String(newValue);
};

/**
 * Called by setValue if the text input is not valid. If the field is
 * currently being edited it reverts value of the field to the previous
 * value while allowing the display text to be handled by the htmlInput_.
 * @param {*} _invalidValue The input value that was determined to be invalid.
 *    This is not used by the text input because its display value is stored on
 *    the htmlInput_.
 * @protected
 */
Blockly.FieldTextInput.prototype.doValueInvalid_ = function(_invalidValue) {
  if (this.isBeingEdited_) {
    this.isTextValid_ = false;
    var oldValue = this.value_;
    // Revert value when the text becomes invalid.
    this.value_ = this.htmlInput_.untypedDefaultValue_;
    if (this.sourceBlock_ && Blockly.Events.isEnabled()) {
      Blockly.Events.fire(new Blockly.Events.BlockChange(
          this.sourceBlock_, 'field', this.name, oldValue, this.value_));
    }
  }
};

/**
 * Called by setValue if the text input is valid. Updates the value of the
 * field, and updates the text of the field if it is not currently being
 * edited (i.e. handled by the htmlInput_).
 * @param {string} newValue The new validated value of the field.
 * @protected
 */
Blockly.FieldTextInput.prototype.doValueUpdate_ = function(newValue) {
  this.isTextValid_ = true;
  this.value_ = newValue;
  if (!this.isBeingEdited_) {
    // This should only occur if setValue is triggered programmatically.
    this.text_ = String(newValue);
    this.isDirty_ = true;
  }
};

/**
 * Updates the colour of the htmlInput given the current validity of the
 * field's value.
 * @protected
 */
Blockly.FieldTextInput.prototype.render_ = function() {
  Blockly.FieldTextInput.superClass_.render_.call(this);
  // This logic is done in render_ rather than doValueInvalid_ or
  // doValueUpdate_ so that the code is more centralized.
  if (this.isBeingEdited_) {
    this.resizeEditor_();
    if (!this.isTextValid_) {
      Blockly.utils.dom.addClass(this.htmlInput_, 'blocklyInvalidInput');
    } else {
      Blockly.utils.dom.removeClass(this.htmlInput_, 'blocklyInvalidInput');
    }
  }
};

/**
 * Set whether this field is spellchecked by the browser.
 * @param {boolean} check True if checked.
 */
Blockly.FieldTextInput.prototype.setSpellcheck = function(check) {
  this.spellcheck_ = check;
};

/**
 * Show the inline free-text editor on top of the text.
 * @param {boolean=} opt_quietInput True if editor should be created without
 *     focus.  Defaults to false.
 * @protected
 */
Blockly.FieldTextInput.prototype.showEditor_ = function(opt_quietInput) {
  this.workspace_ = this.sourceBlock_.workspace;
  var quietInput = opt_quietInput || false;
  if (!quietInput && (Blockly.utils.userAgent.MOBILE ||
                      Blockly.utils.userAgent.ANDROID ||
                      Blockly.utils.userAgent.IPAD)) {
    this.showPromptEditor_();
  } else {
    this.showInlineEditor_(quietInput);
  }
};

/**
 * Create and show a text input editor that is a prompt (usually a popup).
 * Mobile browsers have issues with in-line textareas (focus and keyboards).
 * @private
 */
Blockly.FieldTextInput.prototype.showPromptEditor_ = function() {
  var fieldText = this;
  Blockly.prompt(Blockly.Msg['CHANGE_VALUE_TITLE'], this.text_,
      function(newValue) {
        fieldText.setValue(newValue);
      });
};

/**
 * Create and show a text input editor that sits directly over the text input.
 * @param {boolean} quietInput True if editor should be created without
 *     focus.
 * @private
 */
Blockly.FieldTextInput.prototype.showInlineEditor_ = function(quietInput) {
  this.isBeingEdited_ = true;
  Blockly.WidgetDiv.show(
      this, this.sourceBlock_.RTL, this.widgetDispose_.bind(this));
  this.htmlInput_ = this.widgetCreate_();

  if (!quietInput) {
    this.htmlInput_.focus();
    this.htmlInput_.select();
  }
};

/**
 * Create the text input editor widget.
 * @return {!HTMLInputElement} The newly created text input editor.
 * @private
 */
Blockly.FieldTextInput.prototype.widgetCreate_ = function() {
  var div = Blockly.WidgetDiv.DIV;

  var htmlInput = document.createElement('input');
  htmlInput.className = 'blocklyHtmlInput';
  htmlInput.setAttribute('spellcheck', this.spellcheck_);
  var fontSize =
      (Blockly.FieldTextInput.FONTSIZE * this.workspace_.scale) + 'pt';
  div.style.fontSize = fontSize;
  htmlInput.style.fontSize = fontSize;
  div.appendChild(htmlInput);

  htmlInput.value = htmlInput.defaultValue = this.value_;
  htmlInput.untypedDefaultValue_ = this.value_;
  htmlInput.oldValue_ = null;
  this.resizeEditor_();

  this.bindInputEvents_(htmlInput);

  return htmlInput;
};

/**
 * Close the editor, save the results, and dispose any events bound to the
 * text input's editor.
 * @private
 */
Blockly.FieldTextInput.prototype.widgetDispose_ = function() {
  // Finalize value.
  this.isBeingEdited_ = false;
  // No need to call setValue because if the widget is being closed the
  // latest input text has already been validated.
  if (this.value_ !== this.text_) {
    // At the end of an edit the text should be the same as the value. It
    // may not be if the input text is different than the validated text.
    // We should fix that.
    this.text_ = String(this.value_);
    this.isTextValid_ = true;
    this.forceRerender();
  }
  // Otherwise don't rerender.

  // Call onFinishEditing
  // TODO: Get rid of this or make it less of a hack.
  if (this.onFinishEditing_) {
    this.onFinishEditing_(this.value_);
  }

  // Remove htmlInput events.
  this.unbindInputEvents_();

  // Delete style properties.
  var style = Blockly.WidgetDiv.DIV.style;
  style.width = 'auto';
  style.height = 'auto';
  style.fontSize = '';
};

/**
 * Bind handlers for user input on the text input field's editor.
 * @param {!HTMLInputElement} htmlInput The htmlInput to which event
 *    handlers will be bound.
 * @private
 */
Blockly.FieldTextInput.prototype.bindInputEvents_ = function(htmlInput) {
  // Trap Enter without IME and Esc to hide.
  this.onKeyDownWrapper_ =
      Blockly.bindEventWithChecks_(
          htmlInput, 'keydown', this, this.onHtmlInputKeyDown_);
  // Resize after every keystroke.
  this.onKeyUpWrapper_ =
      Blockly.bindEventWithChecks_(
          htmlInput, 'keyup', this, this.onHtmlInputChange_);
  // Repeatedly resize when holding down a key.
  this.onKeyPressWrapper_ =
      Blockly.bindEventWithChecks_(
          htmlInput, 'keypress', this, this.onHtmlInputChange_);

  // TODO: Figure out if this is necessary.
  this.onWorkspaceChangeWrapper_ = this.resizeEditor_.bind(this);
  this.workspace_.addChangeListener(this.onWorkspaceChangeWrapper_);
};

/**
 * Unbind handlers for user input and workspace size changes.
 * @private
 */
Blockly.FieldTextInput.prototype.unbindInputEvents_ = function() {
  Blockly.unbindEvent_(this.onKeyDownWrapper_);
  Blockly.unbindEvent_(this.onKeyUpWrapper_);
  Blockly.unbindEvent_(this.onKeyPressWrapper_);
  this.workspace_.removeChangeListener(this.onWorkspaceChangeWrapper_);
};

/**
 * Handle key down to the editor.
 * @param {!Event} e Keyboard event.
 * @private
 */
Blockly.FieldTextInput.prototype.onHtmlInputKeyDown_ = function(e) {
  var tabKey = 9, enterKey = 13, escKey = 27;
  if (e.keyCode == enterKey) {
    Blockly.WidgetDiv.hide();
  } else if (e.keyCode == escKey) {
    this.htmlInput_.value = this.htmlInput_.defaultValue;
    Blockly.WidgetDiv.hide();
  } else if (e.keyCode == tabKey) {
    Blockly.WidgetDiv.hide();
    this.sourceBlock_.tab(this, !e.shiftKey);
    e.preventDefault();
  }
};

/**
 * Handle a change to the editor.
 * @param {!Event} _e Keyboard event.
 * @private
 */
Blockly.FieldTextInput.prototype.onHtmlInputChange_ = function(_e) {
  var text = this.htmlInput_.value;
  if (text !== this.htmlInput_.oldValue_) {
    this.htmlInput_.oldValue_ = text;

    // TODO(#2169): Once issue is fixed the setGroup functionality could be
    //              moved up to the Field setValue method. This would create a
    //              broader fix for all field types.
    Blockly.Events.setGroup(true);
    this.setValue(text);
    // Always render the input text.
    this.text_ = this.htmlInput_.value;
    this.forceRerender();
    Blockly.Events.setGroup(false);
  }
};

/**
 * Resize the editor to fit the text.
 * @protected
 */
Blockly.FieldTextInput.prototype.resizeEditor_ = function() {
  var div = Blockly.WidgetDiv.DIV;
  var bBox = this.getScaledBBox_();
  div.style.width = bBox.right - bBox.left + 'px';
  div.style.height = bBox.bottom - bBox.top + 'px';

  // In RTL mode block fields and LTR input fields the left edge moves,
  // whereas the right edge is fixed.  Reposition the editor.
  var x = this.sourceBlock_.RTL ? bBox.right - div.offsetWidth : bBox.left;
  var xy = new Blockly.utils.Coordinate(x, bBox.top);

  // Shift by a few pixels to line up exactly.
  xy.y += 1;
  if (Blockly.utils.userAgent.GECKO && Blockly.WidgetDiv.DIV.style.top) {
    // Firefox mis-reports the location of the border by a pixel
    // once the WidgetDiv is moved into position.
    xy.x -= 1;
    xy.y -= 1;
  }
  if (Blockly.utils.userAgent.WEBKIT) {
    xy.y -= 3;
  }
  div.style.left = xy.x + 'px';
  div.style.top = xy.y + 'px';
};

/**
 * Ensure that only a number may be entered.
 * @param {string} text The user's text.
 * @return {?string} A string representing a valid number, or null if invalid.
 * @deprecated
 */
Blockly.FieldTextInput.numberValidator = function(text) {
  console.warn('Blockly.FieldTextInput.numberValidator is deprecated. ' +
               'Use Blockly.FieldNumber instead.');
  if (text === null) {
    return null;
  }
  text = String(text);
  // TODO: Handle cases like 'ten', '1.203,14', etc.
  // 'O' is sometimes mistaken for '0' by inexperienced users.
  text = text.replace(/O/ig, '0');
  // Strip out thousands separators.
  text = text.replace(/,/g, '');
  var n = parseFloat(text || 0);
  return isNaN(n) ? null : String(n);
};

/**
 * Ensure that only a nonnegative integer may be entered.
 * @param {string} text The user's text.
 * @return {?string} A string representing a valid int, or null if invalid.
 * @deprecated
 */
Blockly.FieldTextInput.nonnegativeIntegerValidator = function(text) {
  var n = Blockly.FieldTextInput.numberValidator(text);
  if (n) {
    n = String(Math.max(0, Math.floor(n)));
  }
  return n;
};

Blockly.Field.register('field_input', Blockly.FieldTextInput);
