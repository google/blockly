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
 * @author primary.edw@gmail.com (Andrew Mee)
 * based on work in field_textinput by fraser@google.com (Neil Fraser)
 * refactored by toebes@extremenetworks.com (John Toebes)
 */
'use strict';

goog.provide('Blockly.FieldTextArea');

goog.require('Blockly.FieldTextInput');
goog.require('Blockly.Msg');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.userAgent');
goog.require('goog.events.KeyCodes');


/**
 * Class for an editable text field.
 * @param {string} text The initial content of the field.
 * @param {Function} opt_changeHandler An optional function that is called
 *     to validate any constraints on what the user entered.  Takes the new
 *     text as an argument and returns either the accepted text, a replacement
 *     text, or null to abort the change.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldTextArea = function(text, opt_changeHandler) {
  Blockly.FieldTextArea.superClass_.constructor.call(this,
                                                     text, opt_changeHandler);
};
goog.inherits(Blockly.FieldTextArea, Blockly.FieldTextInput);

/**
 * Update the text node of this field to display the current text.
 * @private
 */
Blockly.FieldTextArea.prototype.updateTextNode_ = function() {
  if (!this.textElement_) {
    // Not rendered yet.
    return;
  }
  var text = this.text_;

  // Empty the text element.
  goog.dom.removeChildren(/** @type {!Element} */ (this.textElement_));

  // Replace whitespace with non-breaking spaces so the text doesn't collapse.
  text = text.replace(/ /g, Blockly.Field.NBSP);
  if (this.sourceBlock_.RTL && text) {
    // The SVG is LTR, force text to be RTL.
    text += '\u200F';
  }
  if (!text) {
    // Prevent the field from disappearing if empty.
    text = Blockly.Field.NBSP;
  }

  var lines = text.split('\n');
  var dy = '0em';
  for (var i = 0; i < lines.length; i++) {
    var tspanElement = Blockly.createSvgElement('tspan',
        {'dy': dy, 'x': 0}, this.textElement_);
    dy = '1em';
    var textNode = document.createTextNode(lines[i]);
    tspanElement.appendChild(textNode);
  }

  // Cached width is obsolete.  Clear it.
  this.size_.width = 0;
};

/**
 * Draws the border with the correct width.
 * Saves the computed width in a property.
 * @private
 */
Blockly.FieldTextArea.prototype.render_ = function() {
  this.size_.width = this.textElement_.getBBox().width + 5;
  this.size_.height = (this.text_.split(/\n/).length ||1)*20 +
                        (Blockly.BlockSvg.SEP_SPACE_Y+5) ;
  if (this.minWidth_ && this.size_.width < this.minWidth_) {
	this.size_.width = this.minWidth_;
  }
  if (this.borderRect_) {
    this.borderRect_.setAttribute('width',
         this.size_.width + Blockly.BlockSvg.SEP_SPACE_X);
	this.borderRect_.setAttribute('height',
         this.size_.height -  (Blockly.BlockSvg.SEP_SPACE_Y+5));
  }

};
	
/**
 * Show the inline free-text editor on top of the text.
 * @param {boolean=} opt_quietInput True if editor should be created without
 *     focus.  Defaults to false.
 * @private
 */
Blockly.FieldTextArea.prototype.showEditor_ = function(opt_quietInput) {
  var quietInput = opt_quietInput || false;
  if (!quietInput && (goog.userAgent.MOBILE || goog.userAgent.ANDROID ||
                      goog.userAgent.IPAD)) {
    // Mobile browsers have issues with in-line textareas (focus & keyboards).
    var newValue = window.prompt(Blockly.Msg.CHANGE_VALUE_TITLE, this.text_);
    if (this.changeHandler_) {
      var override = this.changeHandler_(newValue);
      if (override !== undefined) {
        newValue = override;
      }
    }
    if (newValue !== null) {
      this.setText(newValue);
    }
    return;
  }

  Blockly.WidgetDiv.show(this, this.sourceBlock_.RTL, this.widgetDispose_());
  var div = Blockly.WidgetDiv.DIV;
  // Create the input.
  var htmlInput = goog.dom.createDom('textarea', 'blocklyHtmlInput');
  Blockly.FieldTextInput.htmlInput_ = htmlInput;
  htmlInput.style.resize = 'none';
  htmlInput.style['line-height'] = '20px';
  htmlInput.style.height = '100%';
  div.appendChild(htmlInput);

  htmlInput.value = htmlInput.defaultValue = this.text_;
  htmlInput.oldValue_ = null;
  this.validate_();
  this.resizeEditor_();
  if (!quietInput) {
    htmlInput.focus();
    htmlInput.select();
  }

  // Bind to keydown -- trap Enter without IME and Esc to hide.
  htmlInput.onKeyDownWrapper_ =
      Blockly.bindEvent_(htmlInput, 'keydown', this, this.onHtmlInputKeyDown_);
  // Bind to keyup -- trap Enter; resize after every keystroke.
  htmlInput.onKeyUpWrapper_ =
      Blockly.bindEvent_(htmlInput, 'keyup', this, this.onHtmlInputChange_);
  // Bind to keyPress -- repeatedly resize when holding down a key.
  htmlInput.onKeyPressWrapper_ =
      Blockly.bindEvent_(htmlInput, 'keypress', this, this.onHtmlInputChange_);
  var workspaceSvg = this.sourceBlock_.workspace.getCanvas();
  htmlInput.onWorkspaceChangeWrapper_ =
      Blockly.bindEvent_(workspaceSvg, 'blocklyWorkspaceChange', this,
      this.resizeEditor_);
};

/**
 * Handle key down to the editor.
 * @param {!Event} e Keyboard event.
 * @private
 */
Blockly.FieldTextInput.prototype.onHtmlInputKeyDown_ = function(e) {
  var htmlInput = Blockly.FieldTextInput.htmlInput_;
  if (e.keyCode == goog.events.KeyCodes.ESC) {
    this.setText(htmlInput.defaultValue);
    Blockly.WidgetDiv.hide();
  }
};

/**
 * Handle a change to the editor.
 * @param {!Event} e Keyboard event.
 * @private
 */
Blockly.FieldTextArea.prototype.onHtmlInputChange_ = function(e) {
  Blockly.FieldTextInput.prototype.onHtmlInputChange_.call(this, e);

  var htmlInput = Blockly.FieldTextInput.htmlInput_;
  if (e.keyCode == goog.events.KeyCodes.ESC) {
    // Esc
    this.setText(htmlInput.defaultValue);
    Blockly.WidgetDiv.hide();
  } else {
    Blockly.FieldTextInput.prototype.onHtmlInputChange_.call(this, e);
	this.resizeEditor_();
  }
};

/**
 * Resize the editor and the underlying block to fit the text.
 * @private
 */
Blockly.FieldTextArea.prototype.resizeEditor_ = function() {
  var div = Blockly.WidgetDiv.DIV;
  var bBox = this.fieldGroup_.getBBox();
  div.style.width = bBox.width + 'px';
  div.style.height = bBox.height + 'px';
  var xy = this.getAbsoluteXY_();
  // In RTL mode block fields and LTR input fields the left edge moves,
  // whereas the right edge is fixed.  Reposition the editor.
  if (this.RTL) {
    var borderBBox = this.borderRect_.getBBox();
    xy.x += borderBBox.width;
    xy.x -= div.offsetWidth;
  }
  // Shift by a few pixels to line up exactly.
  xy.y += 1;
  if (goog.userAgent.WEBKIT) {
    xy.y -= 3;
  }
  div.style.left = xy.x + 'px';
  div.style.top = xy.y + 'px';
};

