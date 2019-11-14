/**
 * @license
 * Copyright 2019 Google LLC
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

goog.provide('Blockly.FieldMultilineInput');

goog.require('Blockly.Css');
goog.require('Blockly.DropDownDiv');
goog.require('Blockly.FieldTextInput');
goog.require('Blockly.utils');
goog.require('Blockly.utils.aria');
goog.require('Blockly.utils.Coordinate');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.KeyCodes');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.userAgent');


/**
 * Class for an editable text area field.
 * @param {string=} opt_value The initial content of the field. Should cast to a
 *    string. Defaults to an empty string if null or undefined.
 * @param {Function=} opt_validator An optional function that is called
 *     to validate any constraints on what the user entered.  Takes the new
 *     text as an argument and returns either the accepted text, a replacement
 *     text, or null to abort the change.
 * @param {Object=} opt_config A map of options used to configure the field.
 *    See the [field creation documentation]{@link https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/text-input#creation}
 *    for a list of properties this parameter supports.
 * @extends {Blockly.FieldTextInput}
 * @constructor
 */
Blockly.FieldMultilineInput = function(opt_value, opt_validator, opt_config) {
  // TODO: Once this field is documented the opt_config link should point to its
  //  creation documentation, rather than the text input field's.
  if (opt_value == null) {
    opt_value = '';
  }
  Blockly.FieldMultilineInput.superClass_.constructor.call(this,
      opt_value, opt_validator, opt_config);

  /**
   * The SVG group element that will contain a text element for each text row
   *     when initialized.
   * @type {SVGGElement}
   */
  this.textGroup_ = null;
};
Blockly.utils.object.inherits(Blockly.FieldMultilineInput,
    Blockly.FieldTextInput);


/**
 * The default height of a single line of text.
 * @type {number}
 * @const
 */
Blockly.FieldMultilineInput.LINE_HEIGHT = 20;

/**
 * Construct a FieldMultilineInput from a JSON arg object,
 * dereferencing any string table references.
 * @param {!Object} options A JSON object with options (text, and spellcheck).
 * @return {!Blockly.FieldMultilineInput} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldMultilineInput.fromJson = function(options) {
  var text = Blockly.utils.replaceMessageReferences(options['text']);
  return new Blockly.FieldMultilineInput(text, undefined, options);
};

/**
 * Create the block UI for this field.
 * @package
 */
Blockly.FieldMultilineInput.prototype.initView = function() {
  this.createBorderRect_();
  this.textGroup_ = /** @type {!SVGGElement} **/
      (Blockly.utils.dom.createSvgElement('g',
          {
            'class': 'blocklyEditableText',
          }, this.fieldGroup_));
};

/**
 * Get the text from this field as displayed on screen.  May differ from getText
 * due to ellipsis, and other formatting.
 * @return {string} Currently displayed text.
 * @private
 */
Blockly.FieldMultilineInput.prototype.getDisplayText_ = function() {
  var value = this.value_;
  if (!value) {
    // Prevent the field from disappearing if empty.
    return Blockly.Field.NBSP;
  }
  var lines = value.split('\n');
  value = '';
  for (var i = 0; i < lines.length; i++) {
    var text = lines[i];
    if (text.length > this.maxDisplayLength) {
      // Truncate displayed string and add an ellipsis ('...').
      text = text.substring(0, this.maxDisplayLength - 4) + '...';
    }
    // Replace whitespace with non-breaking spaces so the text doesn't collapse.
    text = text.replace(/\s/g, Blockly.Field.NBSP);

    value += text;
    if (i !== lines.length - 1) {
      value += '\n';
    }
  }
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
Blockly.FieldMultilineInput.prototype.render_ = function() {
  // Remove all text group children.
  var currentChild;
  while ((currentChild = this.textGroup_.firstChild)) {
    this.textGroup_.removeChild(currentChild);
  }

  // Add in text elements into the group.
  var lines = this.getDisplayText_().split('\n');
  var y = 0;
  for (var i = 0; i < lines.length; i++) {
    var span = Blockly.utils.dom.createSvgElement('text', {
      'class': 'blocklyText blocklyMultilineText',
      x: this.constants_.FIELD_BORDER_RECT_X_PADDING,
      y: y + this.constants_.FIELD_BORDER_RECT_Y_PADDING,
      dy: Blockly.FieldMultilineInput.LINE_HEIGHT / 2
    }, this.textGroup_);
    span.appendChild(document.createTextNode(lines[i]));
    y += Blockly.FieldMultilineInput.LINE_HEIGHT;
  }

  this.updateSize_();

  if (this.isBeingEdited_) {
    if (this.sourceBlock_.RTL) {
      // in RTL, we need to let the browser reflow before resizing
      // in order to get the correct bounding box of the borderRect
      // avoiding issue #2777.
      setTimeout(this.resizeEditor_.bind(this), 0);
    } else {
      this.resizeEditor_();
    }
    var htmlInput = /** @type {!HTMLElement} */(this.htmlInput_);
    if (!this.isTextValid_) {
      Blockly.utils.dom.addClass(htmlInput, 'blocklyInvalidInput');
      Blockly.utils.aria.setState(htmlInput,
          Blockly.utils.aria.State.INVALID, true);
    } else {
      Blockly.utils.dom.removeClass(htmlInput, 'blocklyInvalidInput');
      Blockly.utils.aria.setState(htmlInput,
          Blockly.utils.aria.State.INVALID, false);
    }
  }
};

/**
 * Updates the size of the field based on the text.
 * @protected
 */
Blockly.FieldMultilineInput.prototype.updateSize_ = function() {
  var nodes = this.textGroup_.childNodes;
  var totalWidth = 0;
  var totalHeight = 0;
  for (var i = 0; i < nodes.length; i++) {
    var tspan = /** @type {!Element} */ (nodes[i]);
    var textWidth = Blockly.utils.dom.getTextWidth(tspan);
    if (textWidth > totalWidth) {
      totalWidth = textWidth;
    }
    totalHeight += Blockly.FieldMultilineInput.LINE_HEIGHT;
  }
  if (this.borderRect_) {
    totalWidth += this.constants_.FIELD_BORDER_RECT_X_PADDING * 2;
    this.borderRect_.setAttribute('width', totalWidth);
    this.borderRect_.setAttribute('height', totalHeight);
  }
  this.size_.width = totalWidth;
  this.size_.height = totalHeight;
};

/**
 * Resize the editor to fit the text.
 * @protected
 */
Blockly.FieldMultilineInput.prototype.resizeEditor_ = function() {
  var div = Blockly.WidgetDiv.DIV;
  var bBox = this.getScaledBBox();
  div.style.width = bBox.right - bBox.left + 'px';
  div.style.height = bBox.bottom - bBox.top + 'px';

  // In RTL mode block fields and LTR input fields the left edge moves,
  // whereas the right edge is fixed.  Reposition the editor.
  var x = this.sourceBlock_.RTL ? bBox.right - div.offsetWidth : bBox.left;
  var xy = new Blockly.utils.Coordinate(x, bBox.top);

  div.style.left = xy.x + 'px';
  div.style.top = xy.y + 'px';
};

/**
 * Create the text input editor widget.
 * @return {!HTMLTextAreaElement} The newly created text input editor.
 * @protected
 */
Blockly.FieldMultilineInput.prototype.widgetCreate_ = function() {
  var div = Blockly.WidgetDiv.DIV;
  var scale = this.workspace_.scale;

  var htmlInput = /** @type {HTMLTextAreaElement} */ (document.createElement('textarea'));
  htmlInput.className = 'blocklyHtmlInput blocklyHtmlTextAreaInput';
  htmlInput.setAttribute('spellcheck', this.spellcheck_);
  var fontSize = (this.constants_.FIELD_TEXT_FONTSIZE * scale) + 'pt';
  div.style.fontSize = fontSize;
  htmlInput.style.fontSize = fontSize;
  var borderRadius = (Blockly.FieldTextInput.BORDERRADIUS * scale) + 'px';
  htmlInput.style.borderRadius = borderRadius;
  var padding = this.constants_.FIELD_BORDER_RECT_X_PADDING * scale;
  htmlInput.style.paddingLeft = padding + 'px';
  htmlInput.style.width = 'calc(100% - ' + padding + 'px)';
  htmlInput.style.lineHeight =
      (Blockly.FieldMultilineInput.LINE_HEIGHT * scale) + 'px';

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
 * Handle key down to the editor. Override the text input definition of this
 * so as to not close the editor when enter is typed in.
 * @param {!Event} e Keyboard event.
 * @protected
 */
Blockly.FieldMultilineInput.prototype.onHtmlInputKeyDown_ = function(e) {
  if (e.keyCode !== Blockly.utils.KeyCodes.ENTER) {
    Blockly.FieldMultilineInput.superClass_.onHtmlInputKeyDown_.call(this, e);
  }
};

/**
 * CSS for multiline field.  See css.js for use.
 */
Blockly.Css.register([
  /* eslint-disable indent */
  '.blocklyHtmlTextAreaInput {',
    'font-family: monospace;',
    'resize: none;',
    'overflow: hidden;',
    'height: 100%;',
    'text-align: left;',
  '}'
  /* eslint-enable indent */
]);


Blockly.fieldRegistry.register('field_multilinetext', Blockly.FieldMultilineInput);
