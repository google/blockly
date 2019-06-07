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

goog.require('Blockly.utils.Coordinate');
goog.require('Blockly.DropDownDiv');
goog.require('Blockly.Events');
goog.require('Blockly.Events.BlockChange');
goog.require('Blockly.Field');
goog.require('Blockly.Msg');
goog.require('Blockly.utils');
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
  var field = new Blockly.FieldTextInput(text, options['class']);
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
 * The HTML input element for the user to type, or null if no FieldTextInput
 * editor is currently open.
 * @type {HTMLInputElement}
 * @protected
 */
Blockly.FieldTextInput.htmlInput_ = null;

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
 * Close the input widget if this input is being deleted.
 */
Blockly.FieldTextInput.prototype.dispose = function() {
  Blockly.WidgetDiv.hideIfOwner(this);
  Blockly.FieldTextInput.superClass_.dispose.call(this);
};

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
 * @protected
 */
Blockly.FieldTextInput.prototype.doValueInvalid_ = function() {
  if (this.isBeingEdited_) {
    this.isTextValid_ = false;
    var htmlInput = Blockly.FieldTextInput.htmlInput_;
    if (htmlInput) {
      var oldValue = this.value_;
      // Revert value when the text becomes invalid.
      this.value_ = htmlInput.untypedDefaultValue_;
      if (this.sourceBlock_ && Blockly.Events.isEnabled()) {
        Blockly.Events.fire(new Blockly.Events.BlockChange(
            this.sourceBlock_, 'field', this.name, oldValue, this.value_));
      }
    }
  }
};

/**
 * Called by setValue if the text input is valid. Updates the value of the
 * field, and updates the text of the field if it is not currently being
 * edited (i.e. handled by the htmlInput_).
 * @param {!string} newValue The new validated value of the field.
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
    var htmlInput = Blockly.FieldTextInput.htmlInput_;
    this.resizeEditor_();
    if (!this.isTextValid_) {
      Blockly.utils.dom.addClass(htmlInput, 'blocklyInvalidInput');
    } else {
      Blockly.utils.dom.removeClass(htmlInput, 'blocklyInvalidInput');
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
  // Start editing.
  this.isBeingEdited_ = true;

  // Show the div.
  Blockly.WidgetDiv.show(this, this.sourceBlock_.RTL, this.widgetDispose_());
  var div = Blockly.WidgetDiv.DIV;

  // Create the input.
  var htmlInput = document.createElement('input');
  htmlInput.className = 'blocklyHtmlInput';
  htmlInput.setAttribute('spellcheck', this.spellcheck_);
  var fontSize =
      (Blockly.FieldTextInput.FONTSIZE * this.workspace_.scale) + 'pt';
  div.style.fontSize = fontSize;
  htmlInput.style.fontSize = fontSize;
  div.appendChild(htmlInput);

  // Assign the current value to the input & resize.
  htmlInput.value = htmlInput.defaultValue = this.value_;
  htmlInput.untypedDefaultValue_ = this.value_;
  htmlInput.oldValue_ = null;
  this.resizeEditor_();

  // Give it focus.
  if (!quietInput) {
    htmlInput.focus();
    htmlInput.select();
  }

  // Bind events.
  this.bindInputEvents_(htmlInput);

  // Save it.
  Blockly.FieldTextInput.htmlInput_ = htmlInput;
};

/**
 * Bind handlers for user input on this field and size changes on the workspace.
 * @param {!HTMLInputElement} htmlInput The htmlInput created in showEditor, to
 *     which event handlers will be bound.
 * @private
 */
Blockly.FieldTextInput.prototype.bindInputEvents_ = function(htmlInput) {
  // Bind to keydown -- trap Enter without IME and Esc to hide.
  htmlInput.onKeyDownWrapper_ =
      Blockly.bindEventWithChecks_(
          htmlInput, 'keydown', this, this.onHtmlInputKeyDown_);
  // Bind to keyup -- resize after every keystroke.
  htmlInput.onKeyUpWrapper_ =
      Blockly.bindEventWithChecks_(
          htmlInput, 'keyup', this, this.onHtmlInputChange_);
  // Bind to keyPress -- repeatedly resize when holding down a key.
  htmlInput.onKeyPressWrapper_ =
      Blockly.bindEventWithChecks_(
          htmlInput, 'keypress', this, this.onHtmlInputChange_);
  htmlInput.onWorkspaceChangeWrapper_ = this.resizeEditor_.bind(this);
  this.workspace_.addChangeListener(htmlInput.onWorkspaceChangeWrapper_);
};

/**
 * Unbind handlers for user input and workspace size changes.
 * @param {!HTMLInputElement} htmlInput The html for this text input.
 * @private
 */
Blockly.FieldTextInput.prototype.unbindInputEvents_ = function(htmlInput) {
  Blockly.unbindEvent_(htmlInput.onKeyDownWrapper_);
  Blockly.unbindEvent_(htmlInput.onKeyUpWrapper_);
  Blockly.unbindEvent_(htmlInput.onKeyPressWrapper_);
  this.workspace_.removeChangeListener(
      htmlInput.onWorkspaceChangeWrapper_);
};

/**
 * Handle key down to the editor.
 * @param {!Event} e Keyboard event.
 * @private
 */
Blockly.FieldTextInput.prototype.onHtmlInputKeyDown_ = function(e) {
  var htmlInput = Blockly.FieldTextInput.htmlInput_;
  var tabKey = 9, enterKey = 13, escKey = 27;
  if (e.keyCode == enterKey) {
    Blockly.WidgetDiv.hide();
    Blockly.DropDownDiv.hideIfOwner(this);
  } else if (e.keyCode == escKey) {
    htmlInput.value = htmlInput.defaultValue;
    Blockly.WidgetDiv.hide();
    Blockly.DropDownDiv.hideIfOwner(this);
  } else if (e.keyCode == tabKey) {
    Blockly.WidgetDiv.hide();
    Blockly.DropDownDiv.hideIfOwner(this);
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
  var htmlInput = Blockly.FieldTextInput.htmlInput_;
  var text = htmlInput.value;
  if (text !== htmlInput.oldValue_) {
    htmlInput.oldValue_ = text;

    // TODO(#2169): Once issue is fixed the setGroup functionality could be
    //              moved up to the Field setValue method. This would create a
    //              broader fix for all field types.
    Blockly.Events.setGroup(true);
    this.setValue(text);
    // Always render the input text.
    this.text_ = Blockly.FieldTextInput.htmlInput_.value;
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
 * Close the editor, save the results, and dispose of the editable
 * text field's elements.
 * @return {!Function} Closure to call on destruction of the WidgetDiv.
 * @private
 */
Blockly.FieldTextInput.prototype.widgetDispose_ = function() {
  var thisField = this;
  return function() {
    var htmlInput = Blockly.FieldTextInput.htmlInput_;

    // Finalize value.
    thisField.isBeingEdited_ = false;
    // No need to call setValue because if the widget is being closed the
    // latest input text has already been validated.
    if (thisField.value_ !== thisField.text_) {
      // At the end of an edit the text should be the same as the value. It
      // may not be if the input text is different than the validated text.
      // We should fix that.
      thisField.text_ = String(thisField.value_);
      thisField.isTextValid_ = true;
      thisField.forceRerender();
    }
    // Otherwise don't rerender.

    // Call onFinishEditing
    // TODO: Get rid of this or make it less of a hack.
    if (thisField.onFinishEditing_) {
      thisField.onFinishEditing_(thisField.value_);
    }

    // Remove htmlInput.
    thisField.unbindInputEvents_(htmlInput);
    Blockly.FieldTextInput.htmlInput_ = null;

    // Delete style properties.
    var style = Blockly.WidgetDiv.DIV.style;
    style.width = 'auto';
    style.height = 'auto';
    style.fontSize = '';
  };
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
