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

goog.provide('Blockly.AsciiInput');

goog.require('Blockly.Field');
goog.require('Blockly.Msg');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.userAgent');


/**
 * Class for an editable text field.
 * 
 * @param {string}      text            The initial content of the field.
 * @param {Function=}   opt_validator   An optional function that is called  to validate any constraints
 *                                      on what the user entered.  Takes the new text as an argument and
 *                                      returns either the accepted text, a replacement text, or null to
 *                                      abort the change.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.AsciiInput = function (text, opt_validator) {
    Blockly.AsciiInput.superClass_.constructor.call(this, text,
        opt_validator);
};
goog.inherits(Blockly.AsciiInput, Blockly.Field);

Blockly.AsciiInput.FONTSIZE = 11;                  //Point size of text. Should match blocklyText's font-size in CSS.
Blockly.AsciiInput.MIN_WIDTH = 50;
Blockly.AsciiInput.WIDGET_MIN_WIDTH = 0;

Blockly.AsciiInput.prototype.CURSOR = 'button';    //Mouse cursor style when over the hotspot that initiates the editor.
Blockly.AsciiInput.prototype.isSpecial = true;

Blockly.AsciiInput.prototype.KEY_CODE = "KEYCODE_SPACEBAR    32";
Blockly.AsciiInput.prototype.LOCALIZED_KEY = Blockly.Msg.SPACEBAR;
Blockly.AsciiInput.prototype.PYTHON_KEY = "32";

/**
 * Close the input widget if this input is being deleted.
 */
Blockly.AsciiInput.prototype.dispose = function () {
    Blockly.WidgetDiv.hideIfOwner(this);
    Blockly.AsciiInput.superClass_.dispose.call(this);
};

/**
 * Construct a ButtonInput from a JSON arg object,
 * dereferencing any string table references.
 * @param {!Object} options A JSON object with options (text, class, and
 *                          spellcheck).
 * @returns {!Blockly.AsciiInput} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.AsciiInput.fromJson = function(options) {
  var text = Blockly.utils.replaceMessageReferences(options['text']);
  var field = new Blockly.AsciiInput(text, options['class']);
  return field;
};

/**
 * Set the value of this field.
 * @param {?string} newValue New value.
 * @override
 */
Blockly.AsciiInput.prototype.setValue = function (newValue) {
  // console.log(newValue);
    if (newValue === null) {
        return;  // No change if null.
    }
    if (this.sourceBlock_) {
        var validated = this.callValidator(newValue);
        // If the new value is invalid, validation returns null.
        // In this case we still want to display the illegal result.
        if (validated !== null) {
          newValue = validated;
        }
    }
    
    //Save the KEY
    this.KEY_CODE = newValue;
    newValue = Blockly.Field.prototype.setValue.call(this, newValue);

    //Update the text field
    this.setText(this.KEY_CODE);
};

/**
 * Return the key that the user pressed.
 * For special keys (Spacebar and 4 arrows), those
 * are not translated to the language chosen by the user,
 * but remain in english.
 */
Blockly.AsciiInput.prototype.getValue = function() {
  //Retrieve the stored KEY (used for caching)
  return this.KEY_CODE;
};

/**
 * Set the text in this field and fire a change event.
 * @param {*} newText New text.
 */
Blockly.AsciiInput.prototype.setText = function (newText) {
    if (newText === null) {
        // No change if null.
        return;
    }
    
    //Convert the user-visible text based on the KEY
    newText = this.convertText(newText);

    newText = String(newText);
    if (newText === this.text_) {
        // No change.
        return;
    }
    if (this.sourceBlock_ && Blockly.Events.isEnabled()) {
        Blockly.Events.fire(new Blockly.Events.Change(
        this.sourceBlock_, 'field', this.name, this.text_, newText));
    }

    Blockly.Field.prototype.setText.call(this, newText);
    this.resizeInput_();
};

Blockly.AsciiInput.prototype.convertText = function() {
  var stored = this.KEY_CODE.split('    ');
  switch (stored[0]) {
    case "KEYCODE_SPACEBAR":
      return Blockly.Msg.SPACEBAR;
    case "KEYCODE_UP":
      return Blockly.Msg.UP;
    case "KEYCODE_DOWN":
      return Blockly.Msg.DOWN;
    case "KEYCODE_LEFT":
      return Blockly.Msg.LEFT;
    case "KEYCODE_RIGHT":
      return Blockly.Msg.RIGHT;
    default:
      //Lowercase this so caps lock doesn't affect things
      return stored[0].toLowerCase();
  }
};

/**
 * Get the text from this field.
 * @return {string} Current text.
 */
Blockly.AsciiInput.prototype.convertKeyToCode = function() {
    var stored = this.KEY_CODE.split('    ');
    return stored[1];
};

Blockly.AsciiInput.prototype.resizeInput_ = function() {
  if (this.sourceBlock_ != undefined && 
      this.sourceBlock_.workspace.isFlyout != undefined &&
      this.sourceBlock_.workspace.isFlyout) {
        return;
  }

  var textWidth = 0;
  var tempWidth = 0;

  if (this.size_ != undefined) {
    // if (this.size_.width == Blockly.AsciiInput.MIN_WIDTH) {
    //   return;
    // }


    try {
        textWidth = this.textElement_.getComputedTextLength();
    } catch (e) {
      // In other cases where we fail to geth the computed text. Instead, use an
      // approximation and do not cache the result. At some later point in time
      // when the block is inserted into the visible DOM, this method will be
      // called again and, at that point in time, will not throw an exception.
      if (this.text_) {
        textWidth = this.text_.length * 8;
      }
    }

    tempWidth = textWidth + 20;

    if (tempWidth < Blockly.AsciiInput.MIN_WIDTH) {
      tempWidth = Blockly.AsciiInput.MIN_WIDTH;
    }

    if (tempWidth < Blockly.AsciiInput.WIDGET_MIN_WIDTH) {
      tempWidth = Blockly.AsciiInput.WIDGET_MIN_WIDTH;
    }

    this.size_ = new goog.math.Size(tempWidth, this.size_.height);
  }

  if (this.borderRect_ != undefined) {
    this.borderRect_.setAttribute("width", tempWidth);
  }

  if (this.textElement_ != undefined) {
    //The -4 accounts for the rx property of the surrounding rect (used for rounding of the box). Check Blockly.Field.
    var newX = ((tempWidth - textWidth) / 2) - 5;
    this.textElement_.setAttribute("x", newX);
  }

  if (this.sourceBlock_ != undefined) {
    this.sourceBlock_.rendered && this.sourceBlock_.render();
  }

  // if (this.borderRect_ == undefined || this.textElement_ == undefined) {
  //     var thisField = this;
  //     var intervalId = -1;
  //     intervalId = setInterval(function() {
  //       if ((thisField.borderRect_ != undefined) && 
  //           (thisField.textElement_ != undefined) && 
  //           (thisField.sourceBlock_ != undefined)) {
  //             thisField.resizeInput_();
  //             clearInterval(intervalId);
  //       }
  //     }, 100);
  // }
};

/**
 * Show the inline free-text editor on top of the text.
 * @param {boolean=} opt_quietInput True if editor should be created without
 *     focus.  Defaults to false.
 * @private
 */
Blockly.AsciiInput.prototype.showEditor_ = function (opt_quietInput) {
  // this.LOCALIZED_KEY = this.text_;

  this.workspace_ = this.sourceBlock_.workspace;
  var quietInput = opt_quietInput || false;

  Blockly.WidgetDiv.show(this, this.sourceBlock_.RTL, this.widgetDispose_());

  var div = Blockly.WidgetDiv.DIV;
  // Create the input.
  var htmlInput =
    goog.dom.createDom(goog.dom.TagName.INPUT, 'blocklyHtmlButtonInput');
  var fontSize =
    (Blockly.AsciiInput.FONTSIZE * this.workspace_.scale) + 'pt';
  div.style.fontSize = fontSize;
  htmlInput.style.fontSize = fontSize;
  var bBox = this.fieldGroup_.getBBox();
  htmlInput.placeholder = Blockly.Msg.PRESS_ANY_KEY;
  Blockly.AsciiInput.WIDGET_MIN_WIDTH = (htmlInput.placeholder.length * 8); 
  htmlInput.style.width = (Blockly.AsciiInput.WIDGET_MIN_WIDTH * this.workspace_.scale) + 'px';
  //Remove 6 as there is 2 pixels of padding and 4 pixels of border
  htmlInput.style.height = ((bBox.height * this.workspace_.scale) - 6) + 'px';

  /** @type {!HTMLInputElement} */
  Blockly.AsciiInput.htmlInput_ = htmlInput;
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
Blockly.AsciiInput.prototype.onHtmlInputKeyDown_ = function (e) {
  var isKeyPressSuccessful = true;
  
  var escKey = 27;
  
  //Check if the pressed key is Escape (for closing the widget)
  if (e.keyCode != escKey) {
    //"Parse" the key by getting the local version of it (and disregarging Shift, Control, etc)
    isKeyPressSuccessful = this.keyDisplayParser_(e);
  }

  //If the key parsed susccessfully, hide the widget
  //Otherwise, show the "invalid key pressed" animation
  if (isKeyPressSuccessful) {
    Blockly.WidgetDiv.hide();
    this.resizeInput_();
  }
  else {
    this.onInvalidButtonPressed_();
  }
};

/**
 * Changes the placeholder text of the widget from
 * "Press any key" to "Invalid key pressed" and proceeds to 
 * start a flashing animation.
 */
Blockly.AsciiInput.prototype.onInvalidButtonPressed_ = function() {
  //Get the widget and all HTML children of it
  var div = Blockly.WidgetDiv.DIV;
  var children = div.children;

  div.blur();

  //Find the child of the widget that has the text input block in it
  for (var i = 0; i < children.length; i++) {
    if (children[i].className == "blocklyHtmlButtonInput") { //|| 
        // children[i].className == "blocklyHtmlButtonInput button-input-error-1" || 
        // children[i].className == "blocklyHtmlButtonInput button-input-error-2") {

        //Change the placeholder text of the input element  
        children[i].placeholder = Blockly.Msg.INVALID_KEY_PRESSED;
        //Make sure "dead" keys on Mac are ignored (annoying keys that have to pressed twice)
        children[i].value = "";

        // children[i].blur();
        Blockly.AsciiInput.WIDGET_MIN_WIDTH = (children[i].placeholder.length * 8); 
        children[i].style.width = (Blockly.AsciiInput.WIDGET_MIN_WIDTH * this.sourceBlock_.workspace.scale) + 'px';
        this.resizeInput_();

        //Change the class so the animation starts triggering
        children[i].className = "blocklyHtmlButtonInput button-input-error-1";

        //Focus the widget so user presses are still registered in the onHtmlInputKeyDown_ event
        children[i].focus();
        children[i].select();

        //After 300 ms, change the class again (triggers the flashing effect)
        setTimeout(this.changePlaceholderAnimation_(children[i], 0), 300);
    }
  }
}

/**
 * Switches the class of the widget so a flashing effect is achieved.
 * After 6 loops, triggers the end animation, which slowly switches back to
 * the "Press any key" placeholder.
 */
Blockly.AsciiInput.prototype.changePlaceholderAnimation_ = function(elem, count) {
  //Switch the class between error-1 and error-2
  if (elem.className == "blocklyHtmlButtonInput button-input-error-1") {
    elem.className = "blocklyHtmlButtonInput button-input-error-2";
  }
  else {
    elem.className = "blocklyHtmlButtonInput button-input-error-1";
  }

  //Make sure "dead" keys on Mac are ignored (annoying keys that have to pressed twice)
  elem.value = "";

  //Focus the widget so user presses are still registered in the onHtmlInputKeyDown_ event
  elem.focus();
  elem.select();

  //Check the lifetime of the animation
  //under 5 loops - continue animation
  //at 5 loops - slowly go to red color
  //at 6 loops - go to end of animation
  if (count < 5) {
    count = count + 1;
    setTimeout(this.changePlaceholderAnimation_.bind(this, elem, count), 500);
  }
  else if (count == 5) {
    count = count + 1;
    setTimeout(this.changePlaceholderAnimation_.bind(this, elem, count), 2000);
  }
  else {
    setTimeout(this.onResetPlaceholder_.bind(this, elem), 500);
  }
};

/**
 * Restores the placeholder of the widget to say "Press any key".
 * Done after the "invalid key pressed" animation finishes.
 */
Blockly.AsciiInput.prototype.onResetPlaceholder_ = function(elem) {
    //Return to the original class name
    elem.className = "blocklyHtmlButtonInput";
    //Change the label
    elem.placeholder = Blockly.Msg.PRESS_ANY_KEY;

    //Only update the min width if the widget is still active!
    if (Blockly.AsciiInput.WIDGET_MIN_WIDTH > 0) {
      Blockly.AsciiInput.WIDGET_MIN_WIDTH = (elem.placeholder.length * 8); 
      elem.style.width = (Blockly.AsciiInput.WIDGET_MIN_WIDTH * this.sourceBlock_.workspace.scale) + 'px';
      this.resizeInput_();
    }
    
    //Make sure it's selected so the user key presses will still be registered in the onHtmlInputKeyDown_ event
    elem.focus();
    elem.select();
};


/**
 * Parses the key code (integer) into the proper string. This allows for translations of the
 * 'special' keys like space bar and the arrow pad.
 * 
 * @param {Object} key_object   keyEvent object
 * @private
 * 
 * @returns {String} A translated string of the special keys.
 */
Blockly.AsciiInput.prototype.keyDisplayParser_ = function (key_object) {
    console.log(key_object);

    let key_code = key_object.keyCode;

    //Generate both the localized key and the equivallent that will be used for the python code
    let key_code_for_cache = key_object.key;

    //Parse special keys (spacebar and 4 arrow keys)
    //Also parse every other key
    //If it's a special key (more than 1 character in it - ex. "Shift" has 5 chars), key is marked as invalid
    switch(key_code) {
        case 32:
            key_code_for_cache = "KEYCODE_SPACEBAR";
            break;
        case 37:
            key_code_for_cache = "KEYCODE_LEFT";
            break;
        case 38:
            key_code_for_cache = "KEYCODE_UP";
            break;
        case 39:
            key_code_for_cache = "KEYCODE_RIGHT";
            break;
        case 40:
            key_code_for_cache = "KEYCODE_DOWN";
            break;
        default:
            key_code_for_cache = key_object.key;

            //If the pressed key is not a char, it is a special key (ex. Shift, Ctrl). Ignore those.
            if (key_code_for_cache.length > 1) {
              return false;
            }
            break;
    }
    
    key_code_for_cache = key_code_for_cache + '    ' + key_code;

    this.KEY_CODE = key_code_for_cache;

    return true;
}

/**
 * Check to see if the contents of the editor validates.
 * Style the editor accordingly.
 * @private
 */
Blockly.AsciiInput.prototype.validate_ = function () {
  var valid = true;
  goog.asserts.assertObject(Blockly.AsciiInput.htmlInput_);
  var htmlInput = Blockly.AsciiInput.htmlInput_;
  if (this.sourceBlock_) {
    valid = this.callValidator(htmlInput.value);
  }
  if (valid === null) {
    Blockly.utils.addClass(htmlInput, 'blocklyInvalidInput');
  } else {
    Blockly.utils.removeClass(htmlInput, 'blocklyInvalidInput');
  }
};

/**
 * Resize the editor and the underlying block to fit the text.
 * @protected
 */
Blockly.AsciiInput.prototype.resizeEditor_ = function() {
  var div = Blockly.WidgetDiv.DIV;
  var bBox = this.getScaledBBox_();
  div.style.width = bBox.right - bBox.left + 'px';
  div.style.height = bBox.bottom - bBox.top + 'px';

  // In RTL mode block fields and LTR input fields the left edge moves,
  // whereas the right edge is fixed.  Reposition the editor.
  var x = this.sourceBlock_.RTL ? bBox.right - div.offsetWidth : bBox.left;
  var xy = new goog.math.Coordinate(x, bBox.top);

  // Shift by a few pixels to line up exactly.
  xy.y += 1;
  if (goog.userAgent.GECKO && Blockly.WidgetDiv.DIV.style.top) {
    // Firefox mis-reports the location of the border by a pixel
    // once the WidgetDiv is moved into position.
    xy.x -= 1;
    xy.y -= 1;
  }
  if (goog.userAgent.WEBKIT) {
    xy.y -= 3;
  }
  div.style.left = xy.x + 'px';
  div.style.top = xy.y + 'px';
  this.resizeInput_();
};

/**
 * Close the editor, save the results, and dispose of the editable
 * text field's elements.
 * @return {!Function} Closure to call on destruction of the WidgetDiv.
 * @private
 */
Blockly.AsciiInput.prototype.widgetDispose_ = function () {
  var thisField = this;
  return function () {
    Blockly.AsciiInput.WIDGET_MIN_WIDTH = 0;
    thisField.setText(thisField.KEY_CODE);
    thisField.validate_();
    thisField.resizeInput_();
    thisField.sourceBlock_.rendered && thisField.sourceBlock_.render();
    var htmlInput = Blockly.AsciiInput.htmlInput_;

    if (htmlInput != null) {
      Blockly.unbindEvent_(htmlInput.onKeyDownWrapper_);
      thisField.workspace_.removeChangeListener(
          htmlInput.onWorkspaceChangeWrapper_);
    }

    Blockly.AsciiInput.htmlInput_ = null;
    Blockly.Events.setGroup(false);

    // Delete style properties.
    var style = Blockly.WidgetDiv.DIV.style;
    style.width = 'auto';
    style.height = 'auto';
    style.fontSize = '';
  };
};

Blockly.Field.register('ascii_input', Blockly.AsciiInput);