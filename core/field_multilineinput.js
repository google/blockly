/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
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
goog.require('Blockly.Field');
goog.require('Blockly.fieldRegistry');
goog.require('Blockly.FieldTextInput');
goog.require('Blockly.utils');
goog.require('Blockly.utils.aria');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.KeyCodes');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.Svg');
goog.require('Blockly.utils.userAgent');
goog.require('Blockly.WidgetDiv');


/**
 * Class for an editable text area field.
 * @param {string=} opt_value The initial content of the field. Should cast to a
 *    string. Defaults to an empty string if null or undefined.
 * @param {Function=} opt_validator An optional function that is called
 *     to validate any constraints on what the user entered.  Takes the new
 *     text as an argument and returns either the accepted text, a replacement
 *     text, or null to abort the change.
 * @param {Object=} opt_config A map of options used to configure the field.
 *    See the [field creation documentation]{@link https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/multiline-text-input#creation}
 *    for a list of properties this parameter supports.
 * @extends {Blockly.FieldTextInput}
 * @constructor
 */
Blockly.FieldMultilineInput = function(opt_value, opt_validator, opt_config) {
  Blockly.FieldMultilineInput.superClass_.constructor.call(this,
      opt_value, opt_validator, opt_config);

  /**
   * The SVG group element that will contain a text element for each text row
   *     when initialized.
   * @type {SVGGElement}
   */
  this.textGroup_ = null;

  /**
   * Defines the maximum number of lines of field.
   * If exceeded, scrolling functionality is enabled.
   * @type {number}
   * @protected
   */
  this.maxLines_ = Infinity;

  /**
   * Whether Y overflow is currently occurring.
   * @type {boolean}
   * @protected
   */
  this.isOverflowedY_ = false;
};
Blockly.utils.object.inherits(Blockly.FieldMultilineInput,
    Blockly.FieldTextInput);

/**
 * @override
 */
Blockly.FieldMultilineInput.prototype.configure_ = function(config) {
  Blockly.FieldMultilineInput.superClass_.configure_.call(this, config);
  config.maxLines && this.setMaxLines(config.maxLines);
};

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
 * Serializes this field's value to XML. Should only be called by Blockly.Xml.
 * @param {!Element} fieldElement The element to populate with info about the
 *    field's state.
 * @return {!Element} The element containing info about the field's state.
 * @package
 */
Blockly.FieldMultilineInput.prototype.toXml = function(fieldElement) {
  // Replace '\n' characters with HTML-escaped equivalent '&#10'. This is
  // needed so the plain-text representation of the XML produced by
  // `Blockly.Xml.domToText` will appear on a single line (this is a limitation
  // of the plain-text format).
  fieldElement.textContent = this.getValue().replace(/\n/g, '&#10;');
  return fieldElement;
};

/**
 * Sets the field's value based on the given XML element. Should only be
 * called by Blockly.Xml.
 * @param {!Element} fieldElement The element containing info about the
 *    field's state.
 * @package
 */
Blockly.FieldMultilineInput.prototype.fromXml = function(fieldElement) {
  this.setValue(fieldElement.textContent.replace(/&#10;/g, '\n'));
};

/**
 * Create the block UI for this field.
 * @package
 */
Blockly.FieldMultilineInput.prototype.initView = function() {
  this.createBorderRect_();
  this.textGroup_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.G, {
        'class': 'blocklyEditableText',
      }, this.fieldGroup_);
};

/**
 * Get the text from this field as displayed on screen.  May differ from getText
 * due to ellipsis, and other formatting.
 * @return {string} Currently displayed text.
 * @protected
 * @override
 */
Blockly.FieldMultilineInput.prototype.getDisplayText_ = function() {
  var textLines = this.getText();
  if (!textLines) {
    // Prevent the field from disappearing if empty.
    return Blockly.Field.NBSP;
  }
  var lines = textLines.split('\n');
  textLines = '';
  var displayLinesNumber = this.isOverflowedY_ ? this.maxLines_ : lines.length;
  for (var i = 0; i < displayLinesNumber; i++) {
    var text = lines[i];
    if (text.length > this.maxDisplayLength) {
      // Truncate displayed string and add an ellipsis ('...').
      text = text.substring(0, this.maxDisplayLength - 4) + '...';
    } else if (this.isOverflowedY_ && i === displayLinesNumber - 1) {
      text = text.substring(0, text.length - 3) + '...';
    }
    // Replace whitespace with non-breaking spaces so the text doesn't collapse.
    text = text.replace(/\s/g, Blockly.Field.NBSP);

    textLines += text;
    if (i !== displayLinesNumber - 1) {
      textLines += '\n';
    }
  }
  if (this.sourceBlock_.RTL) {
    // The SVG is LTR, force value to be RTL.
    textLines += '\u200F';
  }
  return textLines;
};

/**
 * Called by setValue if the text input is valid. Updates the value of the
 * field, and updates the text of the field if it is not currently being
 * edited (i.e. handled by the htmlInput_). Is being redefined here to update
 * overflow state of the field.
 * @param {*} newValue The value to be saved. The default validator guarantees
 * that this is a string.
 * @protected
 */
Blockly.FieldMultilineInput.prototype.doValueUpdate_ = function(newValue) {
  Blockly.FieldMultilineInput.superClass_.doValueUpdate_.call(this, newValue);
  this.isOverflowedY_ = this.value_.split('\n').length > this.maxLines_;
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
    var lineHeight = this.getConstants().FIELD_TEXT_HEIGHT +
        this.getConstants().FIELD_BORDER_RECT_Y_PADDING;
    var span = Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.TEXT, {
          'class': 'blocklyText blocklyMultilineText',
          x: this.getConstants().FIELD_BORDER_RECT_X_PADDING,
          y: y + this.getConstants().FIELD_BORDER_RECT_Y_PADDING,
          dy: this.getConstants().FIELD_TEXT_BASELINE
        }, this.textGroup_);
    span.appendChild(document.createTextNode(lines[i]));
    y += lineHeight;
  }

  if (this.isBeingEdited_) {
    var htmlInput = /** @type {!HTMLElement} */(this.htmlInput_);
    if (this.isOverflowedY_) {
      Blockly.utils.dom.addClass(htmlInput, 'blocklyHtmlTextAreaInputOverflowedY');
    } else {
      Blockly.utils.dom.removeClass(htmlInput, 'blocklyHtmlTextAreaInputOverflowedY');
    }
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
    totalHeight += this.getConstants().FIELD_TEXT_HEIGHT +
        (i > 0 ? this.getConstants().FIELD_BORDER_RECT_Y_PADDING : 0);
  }
  if (this.isBeingEdited_) {
    // The default width is based on the longest line in the display text,
    // but when it's being edited, width should be calculated based on the
    // absolute longest line, even if it would be truncated after editing.
    // Otherwise we would get wrong editor width when there are more
    // lines than this.maxLines_.
    var actualEditorLines = this.value_.split('\n');
    var dummyTextElement = Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.TEXT,{'class': 'blocklyText blocklyMultilineText'});
    var fontSize = this.getConstants().FIELD_TEXT_FONTSIZE;
    var fontWeight = this.getConstants().FIELD_TEXT_FONTWEIGHT;
    var fontFamily = this.getConstants().FIELD_TEXT_FONTFAMILY;

    for (var i = 0; i < actualEditorLines.length; i++) {
      if (actualEditorLines[i].length > this.maxDisplayLength) {
        actualEditorLines[i] = actualEditorLines[i].substring(0, this.maxDisplayLength);
      }
      dummyTextElement.textContent = actualEditorLines[i];
      var lineWidth = Blockly.utils.dom.getFastTextWidth(
          dummyTextElement, fontSize, fontWeight, fontFamily);
      if (lineWidth > totalWidth) {
        totalWidth = lineWidth;
      }
    }

    var scrollbarWidth = this.htmlInput_.offsetWidth - this.htmlInput_.clientWidth;
    totalWidth += scrollbarWidth;
  }
  if (this.borderRect_) {
    totalHeight += this.getConstants().FIELD_BORDER_RECT_Y_PADDING * 2;
    totalWidth += this.getConstants().FIELD_BORDER_RECT_X_PADDING * 2;
    this.borderRect_.setAttribute('width', totalWidth);
    this.borderRect_.setAttribute('height', totalHeight);
  }
  this.size_.width = totalWidth;
  this.size_.height = totalHeight;

  this.positionBorderRect_();
};

/**
 * Show the inline free-text editor on top of the text.
 * Overrides the default behaviour to force rerender in order to
 * correct block size, based on editor text.
 * @param {Event=} _opt_e Optional mouse event that triggered the field to open,
 *     or undefined if triggered programmatically.
 * @param {boolean=} opt_quietInput True if editor should be created without
 *     focus.  Defaults to false.
 * @override
 */
Blockly.FieldMultilineInput.prototype.showEditor_ = function(_opt_e, opt_quietInput) {
  Blockly.FieldMultilineInput.superClass_.showEditor_.call(this, _opt_e, opt_quietInput);
  this.forceRerender();
};

/**
 * Create the text input editor widget.
 * @return {!HTMLTextAreaElement} The newly created text input editor.
 * @protected
 */
Blockly.FieldMultilineInput.prototype.widgetCreate_ = function() {
  var div = Blockly.WidgetDiv.DIV;
  var scale = this.workspace_.getScale();

  var htmlInput =
    /** @type {HTMLTextAreaElement} */ (document.createElement('textarea'));
  htmlInput.className = 'blocklyHtmlInput blocklyHtmlTextAreaInput';
  htmlInput.setAttribute('spellcheck', this.spellcheck_);
  var fontSize = (this.getConstants().FIELD_TEXT_FONTSIZE * scale) + 'pt';
  div.style.fontSize = fontSize;
  htmlInput.style.fontSize = fontSize;
  var borderRadius = (Blockly.FieldTextInput.BORDERRADIUS * scale) + 'px';
  htmlInput.style.borderRadius = borderRadius;
  var paddingX = this.getConstants().FIELD_BORDER_RECT_X_PADDING * scale;
  var paddingY = this.getConstants().FIELD_BORDER_RECT_Y_PADDING * scale / 2;
  htmlInput.style.padding = paddingY + 'px ' + paddingX + 'px ' + paddingY +
      'px ' + paddingX + 'px';
  var lineHeight = this.getConstants().FIELD_TEXT_HEIGHT +
      this.getConstants().FIELD_BORDER_RECT_Y_PADDING;
  htmlInput.style.lineHeight = (lineHeight * scale) + 'px';

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
 * Sets the maxLines config for this field.
 * @param {number} maxLines Defines the maximum number of lines allowed,
 *     before scrolling functionality is enabled.
 */
Blockly.FieldMultilineInput.prototype.setMaxLines = function(maxLines) {
  if (typeof maxLines === 'number' && maxLines > 0 && maxLines !== this.maxLines_) {
    this.maxLines_ = maxLines;
    this.forceRerender();
  }
};

/**
 * Returns the maxLines config of this field.
 * @return {number} The maxLines config value.
 */
Blockly.FieldMultilineInput.prototype.getMaxLines = function() {
  return this.maxLines_;
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
  '}',
  '.blocklyHtmlTextAreaInputOverflowedY {',
    'overflow-y: scroll;',
  '}'
  /* eslint-enable indent */
]);


Blockly.fieldRegistry.register('field_multilinetext', Blockly.FieldMultilineInput);
