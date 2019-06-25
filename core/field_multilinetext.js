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

goog.provide('Blockly.FieldMultilineText');

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
Blockly.FieldMultilineText = function(text, opt_validator) {
  Blockly.FieldMultilineText.superClass_.constructor.call(this, text,
      opt_validator);
};
goog.inherits(Blockly.FieldMultilineText, Blockly.FieldTextInput);

/**
 * Pixel height of a single line of text.
 */
Blockly.FieldMultilineText.prototype.lineHeight_ = 20;

/**
 * Pixel width of the textarea's top offset (margin)
 */
Blockly.FieldMultilineText.prototype.areaTop_ = 1;

/**
 * Pixel width of the textarea's left offset (margin)
 */
Blockly.FieldMultilineText.prototype.areaLeft_ = 5;

/**
 * Construct a FieldMultilineText from a JSON arg object,
 * dereferencing any string table references.
 * @param {!Object} options A JSON object with options (text, class, and
 *                          spellcheck).
 * @return {!Blockly.FieldMultilineText} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldMultilineText.fromJson = function(options) {
  var text = Blockly.utils.replaceMessageReferences(options['text']);
  var field = new Blockly.FieldMultilineText(text);
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
Blockly.FieldMultilineText.prototype.fromXml = function(fieldElement) {
  var length = fieldElement.getAttribute('length');
  var lines = [];
  for (var i = 0; i < length; i++) {
    lines.push(fieldElement.getAttribute('line' + i));
  }
  fieldElement.textContent = lines.join("\n");
  this.setValue(fieldElement.textContent);
};

/**
 * Serialize this field to Xml.
 * @param {!Element} fieldElement The element to populate with info about the
 *    field's state.
 * @return {!Element} The element containing info about the field's state.
 */
Blockly.FieldMultilineText.prototype.toXml = function(fieldElement) {
  var lines = this.getValue().split("\n");
  var length = lines.length;
  fieldElement.setAttribute('length', length);
  for (var i = 0; i < length; i++) {
    fieldElement.setAttribute('line' + i, lines[i]);
  }
  return fieldElement;
};

/**
 * Create the block UI for this field.
 * @package
 */
Blockly.FieldMultilineText.prototype.initView = function() {
  Blockly.FieldDropdown.superClass_.initView.call(this);
  this.textElement_.setAttribute('class', 'blocklyText blocklyTextCode');
  
};

/**
 * Get the text from this field as displayed on screen.  May differ from getText
 * due to ellipsis, and other formatting.
 * @return {string} Currently displayed text.
 * @private
 */
Blockly.FieldMultilineText.prototype.getDisplayText_ = function() {
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
 * Updates the text of the textElement.
 * @protected
 */
Blockly.FieldMultilineText.prototype.render_ = function() {
  // Replace the text.
  var textElement = this.textElement_;
  // Clear out old tspan lines
  var currentChild;
  while (currentChild = textElement.firstChild) {
    textElement.removeChild(currentChild);
  }
  // Add in new tspan lines
  var txt = this.getDisplayText_();
  var y = 0;
  var xoffset = 0;
  var yoffset = 12.5; // 12.5 is hard-coded in Blockly.Field
  var txtLines = txt.split("\n");
  var lineHeight = this.lineHeight_;
  txtLines.forEach(function(t) {
    Blockly.utils.dom.createSvgElement('tspan', {x:xoffset,y:y + yoffset}, textElement)
        .appendChild(document.createTextNode(t));
    y += lineHeight;
  });
  if (txtLines.length == 0) {
    y += lineHeight;
  }

  // set up widths
  this.size_.width = this.textElement_.getBBox().width + 5;
  // Minimum size of block (25) - default borderRect_ height (16)
  //   = 9 for vertical margin
  this.size_.height = y + 9;

  if (this.borderRect_) {
    this.borderRect_.setAttribute('width',
        this.size_.width + Blockly.BlockSvg.SEP_SPACE_X);
    this.borderRect_.setAttribute('height', y);
  }
};

/**
 * Create the text input editor widget.
 * @return {!HTMLInputElement} The newly created text input editor.
 * @private
 */
Blockly.FieldMultilineText.prototype.widgetCreate_ = function() {
  var div = Blockly.WidgetDiv.DIV;

  var htmlInput = document.createElement('textarea');
  htmlInput.className = 'blocklyHtmlInput';
  var fontSize =
      (Blockly.FieldTextInput.FONTSIZE * this.workspace_.scale) + 'pt';
  div.style.fontSize = fontSize;
  
  var scale = this.sourceBlock_.workspace.scale;
  div.style.lineHeight = (this.lineHeight_ * scale) + 'px';
  htmlInput.style.fontSize = fontSize;
  htmlInput.style.fontFamily = 'monospace';
  // Rendering weirdness values
  htmlInput.style.marginTop = (this.areaTop_ * scale) + "px";
  htmlInput.style.paddingLeft = (this.areaLeft_ * scale) + "px";
  htmlInput.style.resize = 'none';
  htmlInput.style.lineHeight = (this.lineHeight_ * scale) + 'px';
  htmlInput.style.overflow = 'hidden';
  htmlInput.style.height = '100%';
  htmlInput.setAttribute('spellcheck', this.spellcheck_);
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
Blockly.FieldMultilineText.prototype.onHtmlInputKeyDown_ = function(e) {
  var tabKey = 9, escKey = 27;
  if (e.keyCode == escKey) {
    Blockly.WidgetDiv.hide();
  } else if (e.keyCode == tabKey) {
    Blockly.WidgetDiv.hide();
    this.sourceBlock_.tab(this, !e.shiftKey);
    e.preventDefault();
  }
};


Blockly.Field.register('field_multilinetext', Blockly.FieldMultilineText);
