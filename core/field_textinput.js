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
 * @fileoverview Text input field.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.FieldTextInput');

goog.require('Blockly.Events');
goog.require('Blockly.Events.BlockChange');
goog.require('Blockly.Field');
goog.require('Blockly.fieldRegistry');
goog.require('Blockly.Msg');
goog.require('Blockly.utils');
goog.require('Blockly.utils.aria');
goog.require('Blockly.utils.Coordinate');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.KeyCodes');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.Size');
goog.require('Blockly.utils.userAgent');


/**
 * Class for an editable text field.
 * @param {string=} opt_value The initial value of the field. Should cast to a
 *    string. Defaults to an empty string if null or undefined.
 * @param {?Function=} opt_validator A function that is called to validate
 *    changes to the field's value. Takes in a string & returns a validated
 *    string, or null to abort the change.
 * @param {Object=} opt_config A map of options used to configure the field.
 *    See the [field creation documentation]{@link https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/text-input#creation}
 *    for a list of properties this parameter supports.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldTextInput = function(opt_value, opt_validator, opt_config) {
  /**
   * Allow browser to spellcheck this field.
   * @type {boolean}
   * @protected
   */
  this.spellcheck_ = true;

  if (opt_value == null) {
    opt_value = '';
  }
  Blockly.FieldTextInput.superClass_.constructor.call(this,
      opt_value, opt_validator, opt_config);
};
Blockly.utils.object.inherits(Blockly.FieldTextInput, Blockly.Field);

/**
 * Construct a FieldTextInput from a JSON arg object,
 * dereferencing any string table references.
 * @param {!Object} options A JSON object with options (text, and spellcheck).
 * @return {!Blockly.FieldTextInput} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldTextInput.fromJson = function(options) {
  var text = Blockly.utils.replaceMessageReferences(options['text']);
  return new Blockly.FieldTextInput(text, undefined, options);
};

/**
 * Serializable fields are saved by the XML renderer, non-serializable fields
 * are not. Editable fields should also be serializable.
 * @type {boolean}
 */
Blockly.FieldTextInput.prototype.SERIALIZABLE = true;

/**
 * Point size of text.  Should match blocklyText's font-size in CSS.
 */
Blockly.FieldTextInput.FONTSIZE = 11;

/**
 * Pixel size of input border radius.
 * Should match blocklyText's border-radius in CSS.
 */
Blockly.FieldTextInput.BORDERRADIUS = 4;

/**
 * Mouse cursor style when over the hotspot that initiates the editor.
 */
Blockly.FieldTextInput.prototype.CURSOR = 'text';

/**
 * @override
 */
Blockly.FieldTextInput.prototype.configure_ = function(config) {
  Blockly.FieldTextInput.superClass_.configure_.call(this, config);
  if (typeof config['spellcheck'] == 'boolean') {
    this.spellcheck_ = config['spellcheck'];
  }
};

/**
 * Ensure that the input value casts to a valid string.
 * @param {*=} opt_newValue The input value.
 * @return {*} A valid string, or null if invalid.
 * @protected
 */
Blockly.FieldTextInput.prototype.doClassValidation_ = function(opt_newValue) {
  if (opt_newValue === null || opt_newValue === undefined) {
    return null;
  }
  return String(opt_newValue);
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
          this.sourceBlock_, 'field', this.name || null, oldValue, this.value_));
    }
  }
};

/**
 * Called by setValue if the text input is valid. Updates the value of the
 * field, and updates the text of the field if it is not currently being
 * edited (i.e. handled by the htmlInput_).
 * @param {*} newValue The value to be saved. The default validator guarantees
 * that this is a string.
 * @protected
 */
Blockly.FieldTextInput.prototype.doValueUpdate_ = function(newValue) {
  this.isTextValid_ = true;
  this.value_ = newValue;
  if (!this.isBeingEdited_) {
    // This should only occur if setValue is triggered programmatically.
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
    if (this.sourceBlock_.RTL) {
      // in RTL, we need to let the browser reflow before resizing
      // in order to get the correct bounding box of the borderRect
      // avoiding issue #2777.
      setTimeout(this.resizeEditor_.bind(this), 0);
    } else {
      this.resizeEditor_();
    }
    if (!this.isTextValid_) {
      Blockly.utils.dom.addClass(this.htmlInput_, 'blocklyInvalidInput');
      Blockly.utils.aria.setState(this.htmlInput_, 'invalid', true);
    } else {
      Blockly.utils.dom.removeClass(this.htmlInput_, 'blocklyInvalidInput');
      Blockly.utils.aria.setState(this.htmlInput_, 'invalid', false);
    }
  }
};

/**
 * Set whether this field is spellchecked by the browser.
 * @param {boolean} check True if checked.
 */
Blockly.FieldTextInput.prototype.setSpellcheck = function(check) {
  if (check == this.spellcheck_) {
    return;
  }
  this.spellcheck_ = check;
  if (this.htmlInput_) {
    this.htmlInput_.setAttribute('spellcheck', this.spellcheck_);
  }
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
  Blockly.prompt(Blockly.Msg['CHANGE_VALUE_TITLE'], this.getText(),
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
  Blockly.WidgetDiv.show(
      this, this.sourceBlock_.RTL, this.widgetDispose_.bind(this));
  this.htmlInput_ = this.widgetCreate_();
  this.isBeingEdited_ = true;

  if (!quietInput) {
    this.htmlInput_.focus();
    this.htmlInput_.select();
  }
};

/**
 * Create the text input editor widget.
 * @return {!HTMLElement} The newly created text input editor.
 * @protected
 */
Blockly.FieldTextInput.prototype.widgetCreate_ = function() {
  var div = Blockly.WidgetDiv.DIV;

  var htmlInput = /** @type {HTMLInputElement} */ (document.createElement('input'));
  htmlInput.className = 'blocklyHtmlInput';
  htmlInput.setAttribute('spellcheck', this.spellcheck_);
  var fontSize =
      (Blockly.FieldTextInput.FONTSIZE * this.workspace_.scale) + 'pt';
  div.style.fontSize = fontSize;
  htmlInput.style.fontSize = fontSize;
  var borderRadius =
      (Blockly.FieldTextInput.BORDERRADIUS * this.workspace_.scale) + 'px';
  htmlInput.style.borderRadius = borderRadius;
  div.appendChild(htmlInput);

  htmlInput.value = htmlInput.defaultValue = this.getEditorText_(this.value_);
  htmlInput.untypedDefaultValue_ = this.value_;
  htmlInput.oldValue_ = null;
  if (Blockly.utils.userAgent.GECKO) {
    // In FF, ensure the browser reflows before resizing to avoid issue #2777.
    setTimeout(this.resizeEditor_.bind(this), 0);
  } else {
    this.resizeEditor_();
  }

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
  this.isTextValid_ = true;

  // Always re-render when the we close the editor as value
  // set on the field's node may be inconsistent with the field's
  // internal value.
  this.forceRerender();

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
 * @param {!HTMLElement} htmlInput The htmlInput to which event
 *    handlers will be bound.
 * @protected
 */
Blockly.FieldTextInput.prototype.bindInputEvents_ = function(htmlInput) {
  // Trap Enter without IME and Esc to hide.
  this.onKeyDownWrapper_ =
      Blockly.bindEventWithChecks_(
          htmlInput, 'keydown', this, this.onHtmlInputKeyDown_);
  // Resize after every input change.
  this.onKeyInputWrapper_ =
      Blockly.bindEventWithChecks_(
          htmlInput, 'input', this, this.onHtmlInputChange_);
};

/**
 * Unbind handlers for user input and workspace size changes.
 * @private
 */
Blockly.FieldTextInput.prototype.unbindInputEvents_ = function() {
  Blockly.unbindEvent_(this.onKeyDownWrapper_);
  Blockly.unbindEvent_(this.onKeyInputWrapper_);
};

/**
 * Handle key down to the editor.
 * @param {!Event} e Keyboard event.
 * @protected
 */
Blockly.FieldTextInput.prototype.onHtmlInputKeyDown_ = function(e) {
  if (e.keyCode == Blockly.utils.KeyCodes.ENTER) {
    Blockly.WidgetDiv.hide();
    Blockly.DropDownDiv.hideWithoutAnimation();
  } else if (e.keyCode == Blockly.utils.KeyCodes.ESC) {
    this.htmlInput_.value = this.htmlInput_.defaultValue;
    Blockly.WidgetDiv.hide();
    Blockly.DropDownDiv.hideWithoutAnimation();
  } else if (e.keyCode == Blockly.utils.KeyCodes.TAB) {
    Blockly.WidgetDiv.hide();
    Blockly.DropDownDiv.hideWithoutAnimation();
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
    var value = this.getValueFromEditorText_(text);
    this.setValue(value);
    this.forceRerender();
    Blockly.Events.setGroup(false);
  }
};

/**
 * Set the html input value and the field's internal value. The difference
 * between this and ``setValue`` is that this also updates the html input
 * value whilst editing.
 * @param {*} newValue New value.
 * @protected
 */
Blockly.FieldTextInput.prototype.setEditorValue_ = function(newValue) {
  this.isDirty_ = true;
  if (this.isBeingEdited_) {
    // In the case this method is passed an invalid value, we still
    // pass it through the transformation method `getEditorText` to deal
    // with. Otherwise, the internal field's state will be inconsistent
    // with what's shown to the user.
    this.htmlInput_.value = this.getEditorText_(newValue);
  }
  this.setValue(newValue);
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
  var n = Number(text || 0);
  return isNaN(n) ? null : String(n);
};

/**
 * Ensure that only a non-negative integer may be entered.
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

/**
 * Returns whether or not the field is tab navigable.
 * @return {boolean} True if the field is tab navigable.
 * @override
 */
Blockly.FieldTextInput.prototype.isTabNavigable = function() {
  return true;
};

/**
 * Use the `getText_` developer hook to override the field's text representation.
 * When we're currently editing, return the current html value instead.
 * Otherwise, return null which tells the field to use the default behaviour
 * (which is a string cast of the field's value).
 * @return {?string} The html value if we're editing, otherwise null.
 * @protected
 * @override
 */
Blockly.FieldTextInput.prototype.getText_ = function() {
  if (this.isBeingEdited_ && this.htmlInput_) {
    // We are currently editing, return the html input value instead.
    return this.htmlInput_.value;
  }
  return null;
};

/**
 * Transform the provided value into a text to show in the html input.
 * Override this method if the field's html input representation is different
 * than the field's value. This should be coupled with an override of
 * `getValueFromEditorText_`.
 * @param {*} value The value stored in this field.
 * @returns {string} The text to show on the html input.
 * @protected
 */
Blockly.FieldTextInput.prototype.getEditorText_ = function(value) {
  return String(value);
};

/**
 * Transform the text received from the html input into a value to store
 * in this field.
 * Override this method if the field's html input representation is different
 * than the field's value. This should be coupled with an override of
 * `getEditorText_`.
 * @param {string} text Text received from the html input.
 * @returns {*} The value to store.
 * @protected
 */
Blockly.FieldTextInput.prototype.getValueFromEditorText_ = function(text) {
  return text;
};

Blockly.fieldRegistry.register('field_input', Blockly.FieldTextInput);
