/**
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * http://blockly.googlecode.com/
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
 * @fileoverview Dropdown input field.  Used for editable titles and variables.
 * In the interests of a consistent UI, the toolbox shares some functions and
 * properties with the context menu.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.FieldDropdown');

goog.require('Blockly.Field');


/**
 * Class for an editable dropdown field.
 * @param {(!Array.<string>|!Function)} menuGenerator An array of options
 *     for a dropdown list, or a function which generates these options.
 * @param {Function} opt_changeHandler A function that is executed when a new
 *     option is selected.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldDropdown = function(menuGenerator, opt_changeHandler) {
  this.menuGenerator_ = menuGenerator;
  this.changeHandler_ = opt_changeHandler;
  this.trimOptions_();
  var firstTuple = this.getOptions_()[0];
  this.value_ = firstTuple[1];

  // Add dropdown arrow: "option ▾" (LTR) or "▾ אופציה" (RTL)
  this.arrow_ = Blockly.createSvgElement('tspan', {}, null);
  this.arrow_.appendChild(document.createTextNode(
      Blockly.RTL ? '\u25BE ' : ' \u25BE'));

  // Call parent's constructor.
  Blockly.FieldDropdown.superClass_.constructor.call(this, firstTuple[0]);
};
goog.inherits(Blockly.FieldDropdown, Blockly.Field);

/**
 * Create the dropdown field's elements.  Only needs to be called once.
 * @return {!Element} The field's SVG group.
 */
Blockly.FieldDropdown.createDom = function() {
  /*
  <g class="blocklyHidden blocklyFieldDropdown">
    <rect class="blocklyDropdownMenuShadow" x="0" y="1" rx="2" ry="2"/>
    <rect x="-2" y="-1" rx="2" ry="2"/>
    <g class="blocklyDropdownMenuOptions">
    </g>
  </g>
  */
  var svgGroup = Blockly.createSvgElement('g',
      {'class': 'blocklyHidden blocklyFieldDropdown'}, null);
  Blockly.FieldDropdown.svgGroup_ = svgGroup;
  Blockly.FieldDropdown.svgShadow_ = Blockly.createSvgElement('rect',
      {'class': 'blocklyDropdownMenuShadow',
      'x': 0, 'y': 1, 'rx': 2, 'ry': 2}, svgGroup);
  Blockly.FieldDropdown.svgBackground_ = Blockly.createSvgElement('rect',
      {'x': -2, 'y': -1, 'rx': 2, 'ry': 2,
      'filter': 'url(#blocklyEmboss)'}, svgGroup);
  Blockly.FieldDropdown.svgOptions_ = Blockly.createSvgElement('g',
      {'class': 'blocklyDropdownMenuOptions'}, svgGroup);
  return svgGroup;
};

/**
 * Close the dropdown and dispose of all UI.
 */
Blockly.FieldDropdown.prototype.dispose = function() {
  if (Blockly.FieldDropdown.openDropdown_ == this) {
    Blockly.FieldDropdown.hide();
  }
  // Call parent's destructor.
  Blockly.Field.prototype.dispose.call(this);
};

/**
 * Corner radius of the dropdown background.
 */
Blockly.FieldDropdown.CORNER_RADIUS = 2;

/**
 * Mouse cursor style when over the hotspot that initiates the editor.
 */
Blockly.FieldDropdown.prototype.CURSOR = 'default';

/**
 * Which block is the dropdown attached to?
 * @type {Blockly.FieldDropdown}
 * @private
 */
Blockly.FieldDropdown.openDropdown_ = null;

/**
 * Create a dropdown menu under the text.
 * @private
 */
Blockly.FieldDropdown.prototype.showEditor_ = function() {
  var svgGroup = Blockly.FieldDropdown.svgGroup_;
  var svgOptions = Blockly.FieldDropdown.svgOptions_;
  var svgBackground = Blockly.FieldDropdown.svgBackground_;
  var svgShadow = Blockly.FieldDropdown.svgShadow_;
  // Erase all existing options.
  goog.dom.removeChildren(svgOptions);
  // The menu must be made visible early since otherwise BBox and
  // getComputedTextLength will return 0.
  Blockly.removeClass_(svgGroup, 'blocklyHidden');
  Blockly.FieldDropdown.openDropdown_ = this;

  function callbackFactory(value) {
    return function(e) {
      if (this.changeHandler_) {
        // Call any change handler, and allow it to override.
        var override = this.changeHandler_(value);
        if (override !== undefined) {
          value = override;
        }
      }
      if (value !== null) {
        this.setValue(value);
      }
      // This mouse click has been handled, don't bubble up to document.
      e.stopPropagation();
    };
  }

  var maxWidth = 0;
  var resizeList = [];
  var checkElement = null;
  var options = this.getOptions_();
  for (var x = 0; x < options.length; x++) {
    var text = options[x][0];  // Human-readable text.
    var value = options[x][1]; // Language-neutral value.
    var gElement = Blockly.ContextMenu.optionToDom(text);
    var rectElement = /** @type {SVGRectElement} */ (gElement.firstChild);
    var textElement = /** @type {SVGTextElement} */ (gElement.lastChild);
    svgOptions.appendChild(gElement);
    // Add a checkmark next to the current item.
    if (!checkElement && value == this.value_) {
      checkElement = Blockly.createSvgElement('text',
          {'class': 'blocklyMenuText', 'y': 15}, null);
      // Insert the checkmark between the rect and text, thus preserving the
      // ability to reference them as firstChild and lastChild respectively.
      gElement.insertBefore(checkElement, textElement);
      checkElement.appendChild(document.createTextNode('\u2713'));
    }

    gElement.setAttribute('transform',
        'translate(0, ' + (x * Blockly.ContextMenu.Y_HEIGHT) + ')');
    resizeList.push(rectElement);
    Blockly.bindEvent_(gElement, 'mousedown', null, Blockly.noEvent);
    Blockly.bindEvent_(gElement, 'mouseup', this, callbackFactory(value));
    Blockly.bindEvent_(gElement, 'mouseup', null,
                       Blockly.FieldDropdown.hide);
    // Compute the length of the longest text length.
    maxWidth = Math.max(maxWidth, textElement.getComputedTextLength());
  }
  // Run a second pass to resize all options to the required width.
  maxWidth += Blockly.ContextMenu.X_PADDING * 2;
  for (var x = 0; x < resizeList.length; x++) {
    resizeList[x].setAttribute('width', maxWidth);
  }
  if (Blockly.RTL) {
    // Right-align the text.
    for (var x = 0, gElement; gElement = svgOptions.childNodes[x]; x++) {
      var textElement = gElement.lastChild;
      textElement.setAttribute('text-anchor', 'end');
      textElement.setAttribute('x', maxWidth - Blockly.ContextMenu.X_PADDING);
    }
  }
  if (checkElement) {
    if (Blockly.RTL) {
      // Research indicates that RTL checkmarks are supposed to be drawn the
      // same in the same direction as LTR checkmarks.  It's only the alignment
      // that needs to change.
      checkElement.setAttribute('text-anchor', 'end');
      checkElement.setAttribute('x', maxWidth - 5);
    } else {
      checkElement.setAttribute('x', 5);
    }
  }
  var width = maxWidth + Blockly.FieldDropdown.CORNER_RADIUS * 2;
  var height = options.length * Blockly.ContextMenu.Y_HEIGHT +
               Blockly.FieldDropdown.CORNER_RADIUS + 1;
  svgShadow.setAttribute('width', width);
  svgShadow.setAttribute('height', height);
  svgBackground.setAttribute('width', width);
  svgBackground.setAttribute('height', height);
  var hexColour = Blockly.makeColour(this.sourceBlock_.getColour());
  svgBackground.setAttribute('fill', hexColour);
  // Position the dropdown to line up with the field.
  var xy = Blockly.getSvgXY_(/** @type {!Element} */ (this.borderRect_));
  var borderBBox = this.borderRect_.getBBox();
  var x;
  if (Blockly.RTL) {
    x = xy.x - maxWidth + Blockly.ContextMenu.X_PADDING + borderBBox.width -
        Blockly.BlockSvg.SEP_SPACE_X / 2;
  } else {
    x = xy.x - Blockly.ContextMenu.X_PADDING + Blockly.BlockSvg.SEP_SPACE_X / 2;
  }
  svgGroup.setAttribute('transform',
      'translate(' + x + ', ' + (xy.y + borderBBox.height) + ')');
};

/**
 * Factor out common words in statically defined options.
 * Create prefix and/or suffix labels.
 * @private
 */
Blockly.FieldDropdown.prototype.trimOptions_ = function() {
  this.prefixTitle = null;
  this.suffixTitle = null;
  var options = this.menuGenerator_;
  if (!goog.isArray(options) || options.length < 2) {
    return;
  }
  var strings = options.map(function(t) {return t[0];});
  var shortest = Blockly.shortestStringLength(strings);
  var prefixLength = Blockly.commonWordPrefix(strings, shortest);
  var suffixLength = Blockly.commonWordSuffix(strings, shortest);
  if (!prefixLength && !suffixLength) {
    return;
  }
  if (shortest <= prefixLength + suffixLength) {
    // One or more strings will entirely vanish if we proceed.  Abort.
    return;
  }
  if (prefixLength) {
    this.prefixTitle = strings[0].substring(0, prefixLength - 1);
  }
  if (suffixLength) {
    this.suffixTitle = strings[0].substr(1 - suffixLength);
  }
  // Remove the prefix and suffix from the options.
  var newOptions = [];
  for (var x = 0; x < options.length; x++) {
    var text = options[x][0];
    var value = options[x][1];
    text = text.substring(prefixLength, text.length - suffixLength);
    newOptions[x] = [text, value];
  }
  this.menuGenerator_ = newOptions;
};

/**
 * Return a list of the options for this dropdown.
 * @return {!Array.<!Array.<string>>} Array of option tuples:
 *     (human-readable text, language-neutral name).
 * @private
 */
Blockly.FieldDropdown.prototype.getOptions_ = function() {
  if (goog.isFunction(this.menuGenerator_)) {
    return this.menuGenerator_.call(this);
  }
  return /** @type {!Array.<!Array.<string>>} */ (this.menuGenerator_);
};

/**
 * Get the language-neutral value from this dropdown menu.
 * @return {string} Current text.
 */
Blockly.FieldDropdown.prototype.getValue = function() {
  return this.value_;
};

/**
 * Set the language-neutral value for this dropdown menu.
 * @param {string} newValue New value to set.
 */
Blockly.FieldDropdown.prototype.setValue = function(newValue) {
  this.value_ = newValue;
  // Look up and display the human-readable text.
  var options = this.getOptions_();
  for (var x = 0; x < options.length; x++) {
    // Options are tuples of human-readable text and language-neutral values.
    if (options[x][1] == newValue) {
      this.setText(options[x][0]);
      return;
    }
  }
  // Value not found.  Add it, maybe it will become valid once set
  // (like variable names).
  this.setText(newValue);
};

/**
 * Set the text in this field.  Trigger a rerender of the source block.
 * @param {?string} text New text.
 */
Blockly.FieldDropdown.prototype.setText = function(text) {
  if (this.sourceBlock_) {
    // Update arrow's colour.
    this.arrow_.style.fill = Blockly.makeColour(this.sourceBlock_.getColour());
  }
  if (text === null) {
    // No change if null.
    return;
  }
  this.text_ = text;
  // Empty the text element.
  goog.dom.removeChildren(/** @type {!Element} */ (this.textElement_));
  // Replace whitespace with non-breaking spaces so the text doesn't collapse.
  text = text.replace(/\s/g, Blockly.Field.NBSP);
  if (!text) {
    // Prevent the field from disappearing if empty.
    text = Blockly.Field.NBSP;
  }
  var textNode = document.createTextNode(text);
  this.textElement_.appendChild(textNode);

  // Insert dropdown arrow.
  if (Blockly.RTL) {
    this.textElement_.insertBefore(this.arrow_, this.textElement_.firstChild);
  } else {
    this.textElement_.appendChild(this.arrow_);
  }

  // Cached width is obsolete.  Clear it.
  this.size_.width = 0;

  if (this.sourceBlock_ && this.sourceBlock_.rendered) {
    this.sourceBlock_.render();
    this.sourceBlock_.bumpNeighbours_();
    this.sourceBlock_.workspace.fireChangeEvent();
  }
};

/**
 * Hide the dropdown menu.
 */
Blockly.FieldDropdown.hide = function() {
  var svgGroup = Blockly.FieldDropdown.svgGroup_;
  if (svgGroup) {
    Blockly.addClass_(svgGroup, 'blocklyHidden');
  }
  Blockly.FieldDropdown.openDropdown_ = null;
};
