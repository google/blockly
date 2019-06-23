/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2019 Google Inc.
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
 * @fileoverview Text Area field.
 * @author fraser@google.com (Neil Fraser)
 * @author Andrew Mee
 * @author acbart@udel.edu (Austin Cory Bart)
 */
'use strict';

goog.provide('Blockly.FieldTextArea');

goog.require('Blockly.DropDownDiv');
goog.require('Blockly.Field');
goog.require('Blockly.Msg');
goog.require('Blockly.utils');
goog.require('Blockly.utils.Coordinate');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.userAgent');


/**
 * Class for an editable text field.
 * @param {string} text The initial content of the field.
 * @param {Function=} opt_validator An optional function that is called
 *     to validate any constraints on what the user entered.  Takes the new
 *     text as an argument and returns either the accepted text, a replacement
 *     text, or null to abort the change.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldTextArea = function(text, opt_validator) {
  Blockly.FieldTextArea.superClass_.constructor.call(this, text,
      opt_validator);
};
goog.inherits(Blockly.FieldTextArea, Blockly.FieldTextInput);

/**
 * Construct a FieldTextArea from a JSON arg object,
 * dereferencing any string table references.
 * @param {!Object} options A JSON object with options (text, class, and
 *                          spellcheck).
 * @return {!Blockly.FieldTextArea} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldTextArea.fromJson = function(options) {
  var text = Blockly.utils.replaceMessageReferences(options['text']);
  var field = new Blockly.FieldTextArea(text);
  if (typeof options['spellcheck'] === 'boolean') {
    field.setSpellcheck(options['spellcheck']);
  }
  return field;
};

/**
 * Initialize this field based on the given XML.
 * @param {!Element} fieldElement The element containing information about the
 *    variable field's state.
 */
Blockly.FieldTextArea.prototype.fromXml = function(fieldElement) {
  var length = fieldElement.getAttribute('length');
  var lines = [];
  for (var i = 0; i < length; i++) {
      lines.push(fieldElement.getAttribute('line'+i));
  }
  fieldElement.textContent = lines.join("\n");
  console.log("|"+fieldElement.textContent+"|");
  this.setValue(fieldElement.textContent);
};

/**
 * Serialize this field to Xml.
 * @param {!Element} fieldElement The element to populate with info about the
 *    field's state.
 * @return {!Element} The element containing info about the field's state.
 */
Blockly.FieldTextArea.prototype.toXml = function(fieldElement) {
  var lines = this.getValue().split("\n");
  var length = lines.length;
  fieldElement.setAttribute('length', length);
  for (var i = 0; i < length; i++) {
      fieldElement.setAttribute('line'+i, lines[i]);
  }
  console.log("|"+this.getValue()+"|");
  console.log(fieldElement);
  return fieldElement;
};

/**
 * Get the text from this field as displayed on screen.  May differ from getText
 * due to ellipsis, and other formatting.
 * @return {string} Currently displayed text.
 * @private
 */
Blockly.FieldTextArea.prototype.getDisplayText_ = function() {
  var value = this.value_;
  if (!value) {
    // Prevent the field from disappearing if empty.
    return Blockly.Field.NBSP;
  }
  value = value.split("\n").map(function(value) {
    if (value.length > this.maxDisplayLength) {
      // Truncate displayed string and add an ellipsis ('...').
      value = value.substring(0, this.maxDisplayLength - 4) + '...';
    }
    // Replace whitespace with non-breaking spaces so the value doesn't collapse - keep newline.
    value = value.replace(/\s/g, Blockly.Field.NBSP);
    return value;
  }.bind(this)).join("\n");
  if (this.sourceBlock_.RTL) {
    // The SVG is LTR, force value to be RTL.
    value += '\u200F';
  }
  return value;
};

/**
 * Updates the colour of the htmlInput given the current validity of the
 * field's value.
 * @protected
 */
Blockly.FieldTextArea.prototype.render_ = function() {
  if (!this.visible_) {
    this.size_.width = 0;
    return;
  }
  // Replace the text.
  var textElement = this.textElement_;
  textElement.setAttribute('class', 'blocklyText blocklyTextCode');
  goog.dom.removeChildren(/** @type {!Element} */ (textElement));
  var txt = this.getDisplayText_();
  var y = 0;
  var yoffset = 14; // 12.5 is hard-coded in Blockly.Field
  var txtLines = txt.split("\n");
  txtLines.forEach(function(t) {
    Blockly.utils.dom.createSvgElement('tspan', {x:0,y:y + yoffset}, textElement)
        .appendChild(document.createTextNode(t));
    y += 20;
  });
  if (txtLines.length == 0) {
    y += 20;
  }

  // set up widths
  this.size_.width = this.textElement_.getBBox().width + 5;
  this.size_.height = y + (Blockly.BlockSvg.SEP_SPACE_Y + 5) ;

  if (this.borderRect_) {
    this.borderRect_.setAttribute('width',
        this.size_.width + Blockly.BlockSvg.SEP_SPACE_X);
    this.borderRect_.setAttribute('height',
        this.size_.height - (Blockly.BlockSvg.SEP_SPACE_Y + 5));
  }
};

/**
 * Create the text input editor widget.
 * @return {!HTMLInputElement} The newly created text input editor.
 * @private
 */
Blockly.FieldTextArea.prototype.widgetCreate_ = function() {
  var div = Blockly.WidgetDiv.DIV;

  var htmlInput = document.createElement('textarea');
  htmlInput.className = 'blocklyHtmlInput';
  htmlInput.setAttribute('spellcheck', this.spellcheck_);
  var fontSize =
      (Blockly.FieldTextInput.FONTSIZE * this.workspace_.scale) + 'pt';
  div.style.fontSize = fontSize;
  htmlInput.style.fontSize = fontSize;
  htmlInput.style.fontFamily = 'monospace';
  htmlInput.style.marginTop = "2px";
  htmlInput.setAttribute('spellcheck', this.spellcheck_);
  htmlInput.style.resize = 'none';
  htmlInput.style['line-height'] = '20px';
  htmlInput.style['overflow'] = 'hidden';
  htmlInput.style['height'] = '100%';
  div.appendChild(htmlInput);

  htmlInput.value = htmlInput.defaultValue = this.value_;
  htmlInput.untypedDefaultValue_ = this.value_;
  htmlInput.oldValue_ = null;
  this.resizeEditor_();

  this.bindInputEvents_(htmlInput);

  return htmlInput;
};

/**
 * Handle key down to the editor.
 * @param {!Event} e Keyboard event.
 * @private
 */
Blockly.FieldTextArea.prototype.onHtmlInputKeyDown_ = function(e) {
  var escKey = 27;
  if (e.keyCode == escKey) {
    Blockly.WidgetDiv.hide();
  }
};

/**
 * Resize the editor to fit the text.
 * @protected
 */
Blockly.FieldTextArea.prototype.resizeEditor_ = function() {
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

Blockly.Field.register('field_textarea', Blockly.FieldTextArea);
