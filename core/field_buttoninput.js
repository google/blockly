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

goog.provide('Blockly.ButtonInput');

goog.require('Blockly.Field');
goog.require('Blockly.Msg');
goog.require('Blockly.utils.userAgent');

/**
 * Class for an editable text field.
 *
 * @param {string}      text            The initial content of the field.
 * @param {Function=}   optValidator   An optional function that is called  to validate any constraints
 *                                      on what the user entered.  Takes the new text as an argument and
 *                                      returns either the accepted text, a replacement text, or null to
 *                                      abort the change.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.ButtonInput = function (text, optValidator) {
  Blockly.ButtonInput.superClass_.constructor.call(this, text,
    optValidator);
};
Blockly.utils.object.inherits(Blockly.ButtonInput, Blockly.Field);

Blockly.ButtonInput.FONTSIZE = 11; // Point size of text. Should match blocklyText's font-size in CSS.
Blockly.ButtonInput.MIN_WIDTH = 50;
Blockly.ButtonInput.WIDGET_MIN_WIDTH = 0;

Blockly.ButtonInput.prototype.CURSOR = 'button'; // Mouse cursor style when over the hotspot that initiates the editor.
Blockly.ButtonInput.prototype.isSpecial = true;

Blockly.ButtonInput.prototype.KEY_CODE = 'KEYCODE_SPACEBAR';
Blockly.ButtonInput.prototype.LOCALIZED_KEY = Blockly.Msg.SPACEBAR;
Blockly.ButtonInput.prototype.PYTHON_KEY = 'Space';

/**
 * Close the input widget if this input is being deleted.
 */
Blockly.ButtonInput.prototype.dispose = function () {
  Blockly.WidgetDiv.hideIfOwner(this);
  Blockly.ButtonInput.superClass_.dispose.call(this);
};

/**
 * Construct a ButtonInput from a JSON arg object,
 * dereferencing any string table references.
 * @param {!Object} options A JSON object with options (text, class, and
 *                          spellcheck).
 * @returns {!Blockly.ButtonInput} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.ButtonInput.fromJson = function (options) {
  var text = Blockly.utils.replaceMessageReferences(options.text);
  var field = new Blockly.ButtonInput(text, options.class);
  return field;
};

/**
* Serializable fields are saved by the XML renderer, non-serializable fields
* are not. Editable fields should also be serializable.
* @type {boolean}
*/
Blockly.ButtonInput.prototype.SERIALIZABLE = true;

/**
 * Create the block UI for this checkbox.
 * @package
 */
Blockly.ButtonInput.prototype.initView = function() {
  Blockly.ButtonInput.superClass_.initView.call(this);
  this.updateSize_();
};

/**
 * Set the value of this field.
 * @param {?string} newValue New value.
 * @override
 */
Blockly.ButtonInput.prototype.setValue = function (newValue) {
  // console.log(newValue);
  if (newValue === null) {
    return; // No change if null.
  }
  if (this.sourceBlock_) {
    var validated = this.callValidator(newValue);
    // If the new value is invalid, validation returns null.
    // In this case we still want to display the illegal result.
    if (validated !== null) {
      newValue = validated;
    }
  }

  // Save the KEY
  this.KEY_CODE = newValue;

  // Convert the user-visible text based on the KEY
  var newText = this.getDisplayText_();

  newText = String(newText);

  if (this.textElement_) {
    this.textContent_.nodeValue = newText;
  }

  newValue = Blockly.Field.prototype.setValue.call(this, newValue);

  this.updateSize_();
};

/**
 * Return the key that the user pressed.
 * For special keys (Spacebar and 4 arrows), those
 * are not translated to the language chosen by the user,
 * but remain in english.
 */
Blockly.ButtonInput.prototype.getValue = function () {
  // Retrieve the stored KEY (used for caching)
  return this.KEY_CODE;
};

Blockly.ButtonInput.prototype.getDisplayText_ = function () {
  switch (this.KEY_CODE) {
    case 'KEYCODE_SPACEBAR':
      return Blockly.Msg.SPACEBAR;
    case 'KEYCODE_UP':
      return Blockly.Msg.UP;
    case 'KEYCODE_DOWN':
      return Blockly.Msg.DOWN;
    case 'KEYCODE_LEFT':
      return Blockly.Msg.LEFT;
    case 'KEYCODE_RIGHT':
      return Blockly.Msg.RIGHT;
    default:
      // Lowercase this so caps lock doesn't affect things
      return this.KEY_CODE.toLowerCase();
  }
};

/**
 * Get the text from this field.
 * @return {string} Current text.
 */
Blockly.ButtonInput.prototype.convertKeyToCode = function () {
  switch (this.KEY_CODE) {
    case 'KEYCODE_SPACEBAR':
      return 'spacebar';
    case 'KEYCODE_UP':
      return 'up';
    case 'KEYCODE_DOWN':
      return 'down';
    case 'KEYCODE_LEFT':
      return 'left';
    case 'KEYCODE_RIGHT':
      return 'right';
    default:
      // Lowercase this so caps lock doesn't affect things
      return this.KEY_CODE.toLowerCase();
  }
};

Blockly.ButtonInput.prototype.updateSize_ = function () {
  if (this.sourceBlock_ &&
      this.sourceBlock_.workspace.isFlyout &&
      this.sourceBlock_.workspace.isFlyout) {
    return;
  }

  var textWidth = 0;
  var tempWidth = 0;

  if (this.size_ !== undefined) {
    try {
      textWidth = Blockly.utils.dom.getTextWidth(this.textElement_);

      if (textWidth === 0 && this.textContent_) {
        textWidth = this.textContent_.nodeValue.length * 8;
      }
    } catch (e) {
      // In other cases where we fail to geth the computed text. Instead, use an
      // approximation and do not cache the result. At some later point in time
      // when the block is inserted into the visible DOM, this method will be
      // called again and, at that point in time, will not throw an exception.
      if (this.textContent_) {
        textWidth = this.textContent_.nodeValue.length * 8;
      }
    }

    tempWidth = textWidth + 20;

    if (tempWidth < Blockly.ButtonInput.MIN_WIDTH) {
      tempWidth = Blockly.ButtonInput.MIN_WIDTH;
    }

    if (tempWidth < Blockly.ButtonInput.WIDGET_MIN_WIDTH) {
      tempWidth = Blockly.ButtonInput.WIDGET_MIN_WIDTH;
    }

    this.size_ = new Blockly.utils.Size(tempWidth + 5, this.size_.height);
  }

  if (this.borderRect_) {
    this.borderRect_.setAttribute('width', tempWidth);
  }

  if (this.textElement_) {
    // The -4 accounts for the rx property of the surrounding rect (used for rounding of the box). Check Blockly.Field.
    var newX = ((tempWidth - textWidth) / 2);
    this.textElement_.setAttribute('x', newX);
  }
};

/**
 * Show the inline free-text editor on top of the text.
 * @param {boolean=} optQuietInput True if editor should be created without
 *     focus.  Defaults to false.
 * @private
 */
Blockly.ButtonInput.prototype.showEditor_ = function (optQuietInput) {
  this.workspace_ = this.sourceBlock_.workspace;
  var quietInput = optQuietInput || false;

  Blockly.WidgetDiv.show(this, this.sourceBlock_.RTL, this.widgetDispose_());

  var div = Blockly.WidgetDiv.DIV;
  // Create the input.
  var htmlInput = document.createElement('input');
  htmlInput.setAttribute('class', 'blocklyHtmlButtonInput');
  var fontSize =
    (Blockly.ButtonInput.FONTSIZE * this.workspace_.scale) + 'pt';
  div.style.fontSize = fontSize;
  htmlInput.style.fontSize = fontSize;
  var bBox = this.fieldGroup_.getBBox();
  htmlInput.placeholder = Blockly.Msg.PRESS_ANY_KEY;
  Blockly.ButtonInput.WIDGET_MIN_WIDTH = (htmlInput.placeholder.length * 8);
  htmlInput.style.width = (Blockly.ButtonInput.WIDGET_MIN_WIDTH * this.workspace_.scale) + 'px';
  // Remove 6 as there is 2 pixels of padding and 4 pixels of border
  htmlInput.style.height = ((bBox.height * this.workspace_.scale) - 6) + 'px';

  /** @type {!HTMLInputElement} */
  Blockly.ButtonInput.htmlInput_ = htmlInput;
  div.appendChild(htmlInput);

  this.validate_();
  this.resizeEditor_();
  if (!quietInput) {
    htmlInput.focus();
    htmlInput.select();
  }

  // Bind to keydown -- trap Enter without IME and Esc to hide.
  htmlInput.onKeyDownWrapper_ =
    Blockly.bindEventWithChecks_(htmlInput, 'keydown', this,
      this.onHtmlInputKeyDown_);
  htmlInput.onWorkspaceChangeWrapper_ = this.resizeEditor_.bind(this);
  this.workspace_.addChangeListener(htmlInput.onWorkspaceChangeWrapper_);
};

/**
 * Handle key down to the editor.
 * @param {!Event} e Keyboard event.
 * @private
 */
Blockly.ButtonInput.prototype.onHtmlInputKeyDown_ = function (e) {
  var isKeyPressSuccessful = true;

  if (e.keyCode !== Blockly.utils.KeyCodes.ESC) {
    // "Parse" the key by getting the local version of it (and disregarging Shift, Control, etc)
    isKeyPressSuccessful = this.keyDisplayParser_(e);
  }

  // If the key parsed susccessfully, hide the widget
  // Otherwise, show the "invalid key pressed" animation
  if (isKeyPressSuccessful) {
    this.setValue(this.KEY_CODE);
    Blockly.WidgetDiv.hide();
    this.updateSize_();
  } else {
    if (e.keyCode === Blockly.utils.KeyCodes.TAB) {
      e.preventDefault();
    }
    this.onInvalidButtonPressed_();
  }

  this.forceRerender();
};

/**
 * Changes the placeholder text of the widget from
 * "Press any key" to "Invalid key pressed" and proceeds to
 * start a flashing animation.
 */
Blockly.ButtonInput.prototype.onInvalidButtonPressed_ = function () {
  // Get the widget and all HTML children of it
  var div = Blockly.WidgetDiv.DIV;
  var children = div.children;

  div.blur();

  // Find the child of the widget that has the text input block in it
  for (var i = 0; i < children.length; i++) {
    if (children[i].className === 'blocklyHtmlButtonInput') { // ||
      // children[i].className == "blocklyHtmlButtonInput button-input-error-1" ||
      // children[i].className == "blocklyHtmlButtonInput button-input-error-2") {

      // Change the placeholder text of the input element
      children[i].placeholder = Blockly.Msg.INVALID_KEY_PRESSED;
      // Make sure "dead" keys on Mac are ignored (annoying keys that have to pressed twice)
      children[i].value = '';

      // children[i].blur();
      Blockly.ButtonInput.WIDGET_MIN_WIDTH = (children[i].placeholder.length * 8);
      children[i].style.width = (Blockly.ButtonInput.WIDGET_MIN_WIDTH * this.sourceBlock_.workspace.scale) + 'px';
      this.updateSize_();

      // Change the class so the animation starts triggering
      children[i].className = 'blocklyHtmlButtonInput button-input-error-1';

      // Focus the widget so user presses are still registered in the onHtmlInputKeyDown_ event
      children[i].focus();
      children[i].select();

      // After 300 ms, change the class again (triggers the flashing effect)
      setTimeout(this.changePlaceholderAnimation_(children[i], 0), 300);
    }
  }


  this.forceRerender();
};

/**
 * Switches the class of the widget so a flashing effect is achieved.
 * After 6 loops, triggers the end animation, which slowly switches back to
 * the "Press any key" placeholder.
 */
Blockly.ButtonInput.prototype.changePlaceholderAnimation_ = function (elem, count) {
  // Switch the class between error-1 and error-2
  if (elem.className === 'blocklyHtmlButtonInput button-input-error-1') {
    elem.className = 'blocklyHtmlButtonInput button-input-error-2';
  } else {
    elem.className = 'blocklyHtmlButtonInput button-input-error-1';
  }

  // Make sure "dead" keys on Mac are ignored (annoying keys that have to pressed twice)
  elem.value = '';

  // Focus the widget so user presses are still registered in the onHtmlInputKeyDown_ event
  elem.focus();
  elem.select();

  // Check the lifetime of the animation
  // under 5 loops - continue animation
  // at 5 loops - slowly go to red color
  // at 6 loops - go to end of animation
  if (count < 5) {
    count = count + 1;
    setTimeout(this.changePlaceholderAnimation_.bind(this, elem, count), 500);
  } else if (count === 5) {
    count = count + 1;
    setTimeout(this.changePlaceholderAnimation_.bind(this, elem, count), 2000);
  } else {
    setTimeout(this.onResetPlaceholder_.bind(this, elem), 500);
  }

  this.forceRerender();
};

/**
 * Restores the placeholder of the widget to say "Press any key".
 * Done after the "invalid key pressed" animation finishes.
 */
Blockly.ButtonInput.prototype.onResetPlaceholder_ = function (elem) {
  // Return to the original class name
  elem.className = 'blocklyHtmlButtonInput';
  // Change the label
  elem.placeholder = Blockly.Msg.PRESS_ANY_KEY;

  // Only update the min width if the widget is still active!
  if (Blockly.ButtonInput.WIDGET_MIN_WIDTH > 0) {
    Blockly.ButtonInput.WIDGET_MIN_WIDTH = (elem.placeholder.length * 8);
    elem.style.width = (Blockly.ButtonInput.WIDGET_MIN_WIDTH * this.sourceBlock_.workspace.scale) + 'px';
    this.updateSize_();
  }

  // Make sure it's selected so the user key presses will still be registered in the onHtmlInputKeyDown_ event
  elem.focus();
  elem.select();

  this.forceRerender();
};

/**
 * Parses the key code (integer) into the proper string. This allows for translations of the
 * 'special' keys like space bar and the arrow pad.
 *
 * @param {Object} keyObject   keyEvent object
 * @private
 *
 * @returns {String} A translated string of the special keys.
 */
Blockly.ButtonInput.prototype.keyDisplayParser_ = function (keyObject) {
  const keyCode = keyObject.keyCode;

  // Generate both the localized key and the equivallent that will be used for the python code
  let keyCodeForCache = keyObject.key;

  // Parse special keys (spacebar and 4 arrow keys)
  // Also parse every other key
  // If it's a special key (more than 1 character in it - ex. "Shift" has 5 chars), key is marked as invalid
  switch (keyCode) {
    case 32:
      keyCodeForCache = 'KEYCODE_SPACEBAR';
      break;
    case 37:
      keyCodeForCache = 'KEYCODE_LEFT';
      break;
    case 38:
      keyCodeForCache = 'KEYCODE_UP';
      break;
    case 39:
      keyCodeForCache = 'KEYCODE_RIGHT';
      break;
    case 40:
      keyCodeForCache = 'KEYCODE_DOWN';
      break;
    default:
      keyCodeForCache = keyObject.key;

      // If the pressed key is not a char, it is a special key (ex. Shift, Ctrl). Ignore those.
      if (keyCodeForCache.length > 1) {
        return false;
      }
      break;
  }

  this.KEY_CODE = keyCodeForCache;

  return true;
};

/**
 * Check to see if the contents of the editor validates.
 * Style the editor accordingly.
 * @private
 */
Blockly.ButtonInput.prototype.validate_ = function () {
  var valid = true;

  if (typeof Blockly.ButtonInput.htmlInput_ === 'object' && Blockly.ButtonInput.htmlInput_ != null) {
    var htmlInput = Blockly.ButtonInput.htmlInput_;
    if (this.sourceBlock_) {
      valid = this.callValidator(htmlInput.value);
    }
    if (valid === null) {
      Blockly.utils.dom.addClass(htmlInput, 'blocklyInvalidInput');
    } else {
      Blockly.utils.dom.removeClass(htmlInput, 'blocklyInvalidInput');
    }
  }
};

/**
 * Resize the editor and the underlying block to fit the text.
 * @protected
 */
Blockly.ButtonInput.prototype.resizeEditor_ = function () {
  var div = Blockly.WidgetDiv.DIV;
  var bBox = this.getScaledBBox_();
  div.style.width = bBox.right - bBox.left + 'px';
  div.style.height = bBox.bottom - bBox.top + 'px';

  // In RTL mode block fields and LTR input fields the left edge moves,
  // whereas the right edge is fixed.  Reposition the editor.
  var x = this.sourceBlock_.RTL ? bBox.right - div.offsetWidth : bBox.left;
  var xy = new Blockly.utils.Coordinate(x, bBox.top);

  // Shift by a few pixels to line up exactly.
  xy.y += 3;
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
  this.updateSize_();

  this.forceRerender();
};

/**
 * Close the editor, save the results, and dispose of the editable
 * text field's elements.
 * @return {!Function} Closure to call on destruction of the WidgetDiv.
 * @private
 */
Blockly.ButtonInput.prototype.widgetDispose_ = function () {
  var thisField = this;
  return function () {
    Blockly.ButtonInput.WIDGET_MIN_WIDTH = 0;
    thisField.setValue(thisField.KEY_CODE);
    thisField.validate_();
    thisField.updateSize_();
    thisField.sourceBlock_.rendered && thisField.sourceBlock_.render();
    var htmlInput = Blockly.ButtonInput.htmlInput_;

    if (htmlInput != null) {
      Blockly.unbindEvent_(htmlInput.onKeyDownWrapper_);
      thisField.workspace_.removeChangeListener(
        htmlInput.onWorkspaceChangeWrapper_);
    }

    Blockly.ButtonInput.htmlInput_ = null;
    Blockly.Events.setGroup(false);

    // Delete style properties.
    var style = Blockly.WidgetDiv.DIV.style;
    style.width = 'auto';
    style.height = 'auto';
    style.fontSize = '';
  };
};

Blockly.fieldRegistry.register('button_input', Blockly.ButtonInput);
