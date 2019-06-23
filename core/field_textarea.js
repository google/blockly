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
 * Create the block UI for this field.
 * @package
 */
Blockly.FieldTextArea.prototype.initView = function() {
  Blockly.FieldDropdown.superClass_.initView.call(this);
  this.textElement_.setAttribute('class', 'blocklyText blocklyTextCode');
  
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
 * Updates the text of the textElement.
 * @protected
 */
Blockly.FieldTextArea.prototype.render_ = function() {
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
  var xoffset =0;
  var yoffset = 12.5; // 12.5 is hard-coded in Blockly.Field
  var txtLines = txt.split("\n");
  txtLines.forEach(function(t) {
    Blockly.utils.dom.createSvgElement('tspan', {x:xoffset,y:y + yoffset}, textElement)
        .appendChild(document.createTextNode(t));
    y += 20;
  });
  if (txtLines.length == 0) {
    y += 20;
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
Blockly.FieldTextArea.prototype.widgetCreate_ = function() {
  var div = Blockly.WidgetDiv.DIV;

  var htmlInput = document.createElement('textarea');
  htmlInput.className = 'blocklyHtmlInput';
  htmlInput.setAttribute('spellcheck', this.spellcheck_);
  var fontSize =
      (Blockly.FieldTextInput.FONTSIZE * this.workspace_.scale) + 'pt';
  div.style.fontSize = fontSize;
  
  var scale = this.sourceBlock_.workspace.scale;
  div.style.lineHeight = (20*scale)+'px';
  //div.style['line-height'] = '20px';
  htmlInput.style.fontSize = fontSize;
  htmlInput.style.fontFamily = 'monospace';
  htmlInput.style.marginTop = (1*scale)+"px";
  htmlInput.style.paddingLeft = (5*scale)+"px";
  htmlInput.setAttribute('spellcheck', this.spellcheck_);
  htmlInput.style.resize = 'none';
  htmlInput.style['line-height'] = (20*scale)+'px';
  htmlInput.style['overflow'] = 'hidden';
  htmlInput.style['height'] = '100%';
  //htmlInput.style['padding-top'] = '3px';
  //htmlInput.style['padding-left'] = '4px';
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
  var tabKey = 9, escKey = 27;
  if (e.keyCode == escKey) {
    Blockly.WidgetDiv.hide();
  } else if (e.keyCode == tabKey) {
    Blockly.WidgetDiv.hide();
    this.sourceBlock_.tab(this, !e.shiftKey);
    e.preventDefault();
  }
};


Blockly.Field.register('field_textarea', Blockly.FieldTextArea);
