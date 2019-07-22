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
 * @fileoverview Colour input field.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.FieldColour');

goog.require('Blockly.DropDownDiv');
goog.require('Blockly.Events');
goog.require('Blockly.Events.BlockChange');
goog.require('Blockly.Field');
goog.require('Blockly.utils.colour');

goog.require('goog.math.Size');


/**
 * Class for a colour input field.
 * @param {string=} opt_value The initial value of the field. Should be in
 *    '#rrggbb' format. Defaults to the first value in the default colour array.
 * @param {Function=} opt_validator A function that is called to validate
 *    changes to the field's value. Takes in a colour string & returns a
 *    validated colour string ('#rrggbb' format), or null to abort the change.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldColour = function(opt_value, opt_validator) {
  opt_value = this.doClassValidation_(opt_value);
  if (opt_value === null) {
    opt_value = Blockly.FieldColour.COLOURS[0];
  }
  Blockly.FieldColour.superClass_.constructor.call(
      this, opt_value, opt_validator);
};
goog.inherits(Blockly.FieldColour, Blockly.Field);

/**
 * Construct a FieldColour from a JSON arg object.
 * @param {!Object} options A JSON object with options (colour).
 * @return {!Blockly.FieldColour} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldColour.fromJson = function(options) {
  return new Blockly.FieldColour(options['colour']);
};

/**
 * Default width of a colour field.
 * @type {number}
 * @private
 * @const
 */
Blockly.FieldColour.DEFAULT_WIDTH = 16;

/**
 * Default height of a colour field.
 * @type {number}
 * @private
 * @const
 */
Blockly.FieldColour.DEFAULT_HEIGHT = 12;

/**
 * Serializable fields are saved by the XML renderer, non-serializable fields
 * are not. Editable fields should also be serializable.
 * @type {boolean}
 * @const
 */
Blockly.FieldColour.prototype.SERIALIZABLE = true;

/**
 * Mouse cursor style when over the hotspot that initiates the editor.
 */
Blockly.FieldColour.prototype.CURSOR = 'default';

/**
 * Used to tell if the field needs to be rendered the next time the block is
 * rendered. Colour fields are statically sized, and only need to be
 * rendered at initialization.
 * @type {boolean}
 * @private
 */
Blockly.FieldColour.prototype.isDirty_ = false;

/**
 * Array of colours used by this field.  If null, use the global list.
 * @type {Array.<string>}
 * @private
 */
Blockly.FieldColour.prototype.colours_ = null;

/**
 * Array of colour tooltips used by this field.  If null, use the global list.
 * @type {Array.<string>}
 * @private
 */
Blockly.FieldColour.prototype.titles_ = null;

/**
 * Number of colour columns used by this field.  If 0, use the global setting.
 * By default use the global constants for columns.
 * @type {number}
 * @private
 */
Blockly.FieldColour.prototype.columns_ = 0;

/**
 * Border colour for the dropdown div showing the colour picker.  Must be a CSS
 * string.
 * @type {string}
 * @private
 */
Blockly.FieldColour.prototype.DROPDOWN_BORDER_COLOUR = 'silver';

/**
 * Background colour for the dropdown div showing the colour picker.  Must be a
 * CSS string.
 * @type {string}
 * @private
 */
Blockly.FieldColour.prototype.DROPDOWN_BACKGROUND_COLOUR = 'white';

/**
 * Create the block UI for this colour field.
 * @package
 */
Blockly.FieldColour.prototype.initView = function() {
  this.size_ = new goog.math.Size(Blockly.FieldColour.DEFAULT_WIDTH,
      Blockly.FieldColour.DEFAULT_HEIGHT);
  this.createBorderRect_();
  this.borderRect_.style['fillOpacity'] = 1;
  this.borderRect_.style.fill = this.value_;
};

/**
 * Ensure that the input value is a valid colour.
 * @param {string=} newValue The input value.
 * @return {?string} A valid colour, or null if invalid.
 * @protected
 */
Blockly.FieldColour.prototype.doClassValidation_ = function(newValue) {
  if (typeof newValue != 'string') {
    return null;
  }
  return Blockly.utils.colour.parse(newValue);
};

/**
 * Update the value of this colour field, and update the displayed colour.
 * @param {string} newValue The new colour in '#rrggbb' format.
 * @protected
 */
Blockly.FieldColour.prototype.doValueUpdate_ = function(newValue) {
  this.value_ = newValue;
  if (this.borderRect_) {
    this.borderRect_.style.fill = newValue;
  }
};

/**
 * Get the text for this field.  Used when the block is collapsed.
 * @return {string} Text representing the value of this field.
 */
Blockly.FieldColour.prototype.getText = function() {
  var colour = this.value_;
  // Try to use #rgb format if possible, rather than #rrggbb.
  if (/^#(.)\1(.)\2(.)\3$/.test(colour)) {
    colour = '#' + colour[1] + colour[3] + colour[5];
  }
  return colour;
};

/**
 * An array of colour strings for the palette.
 * Copied from goog.ui.ColorPicker.SIMPLE_GRID_COLORS
 * All colour pickers use this unless overridden with setColours.
 * @type {!Array.<string>}
 */
Blockly.FieldColour.COLOURS = [
  // grays
  '#ffffff', '#cccccc', '#c0c0c0', '#999999', '#666666', '#333333', '#000000',
  // reds
  '#ffcccc', '#ff6666', '#ff0000', '#cc0000', '#990000', '#660000', '#330000',
  // oranges
  '#ffcc99', '#ff9966', '#ff9900', '#ff6600', '#cc6600', '#993300', '#663300',
  // yellows
  '#ffff99', '#ffff66', '#ffcc66', '#ffcc33', '#cc9933', '#996633', '#663333',
  // olives
  '#ffffcc', '#ffff33', '#ffff00', '#ffcc00', '#999900', '#666600', '#333300',
  // greens
  '#99ff99', '#66ff99', '#33ff33', '#33cc00', '#009900', '#006600', '#003300',
  // turquoises
  '#99ffff', '#33ffff', '#66cccc', '#00cccc', '#339999', '#336666', '#003333',
  // blues
  '#ccffff', '#66ffff', '#33ccff', '#3366ff', '#3333ff', '#000099', '#000066',
  // purples
  '#ccccff', '#9999ff', '#6666cc', '#6633ff', '#6600cc', '#333399', '#330099',
  // violets
  '#ffccff', '#ff99ff', '#cc66cc', '#cc33cc', '#993399', '#663366', '#330033'
];

/**
 * An array of tooltip strings for the palette.  If not the same length as
 * COLOURS, the colour's hex code will be used for any missing titles.
 * All colour pickers use this unless overridden with setColours.
 * @type {!Array.<string>}
 */
Blockly.FieldColour.TITLES = [];

/**
 * Number of columns in the palette.
 * All colour pickers use this unless overridden with setColumns.
 */
Blockly.FieldColour.COLUMNS = 7;

/**
 * Set a custom colour grid for this field.
 * @param {Array.<string>} colours Array of colours for this block,
 *     or null to use default (Blockly.FieldColour.COLOURS).
 * @param {Array.<string>} opt_titles Optional array of colour tooltips,
 *     or null to use default (Blockly.FieldColour.TITLES).
 * @return {!Blockly.FieldColour} Returns itself (for method chaining).
 */
Blockly.FieldColour.prototype.setColours = function(colours, opt_titles) {
  this.colours_ = colours;
  if (opt_titles !== undefined) {
    this.titles_ = opt_titles;
  }
  return this;
};

/**
 * Set a custom grid size for this field.
 * @param {number} columns Number of columns for this block,
 *     or 0 to use default (Blockly.FieldColour.COLUMNS).
 * @return {!Blockly.FieldColour} Returns itself (for method chaining).
 */
Blockly.FieldColour.prototype.setColumns = function(columns) {
  this.columns_ = columns;
  return this;
};

/**
 * Create and show the colour field's editor.
 * @private
 */
Blockly.FieldColour.prototype.showEditor_ = function() {
  var picker = this.dropdownCreate_();
  Blockly.DropDownDiv.getContentDiv().appendChild(picker);

  Blockly.DropDownDiv.setColour(
      this.DROPDOWN_BACKGROUND_COLOUR, this.DROPDOWN_BORDER_COLOUR);

  Blockly.DropDownDiv.showPositionedByField(
      this, this.dropdownDispose_.bind(this));
};

/**
 * Handle a click on a colour cell.
 * @param {!Event} e Mouse event.
 * @private
 */
Blockly.FieldColour.prototype.onClick_ = function(e) {
  var cell = e.target;
  if (cell && !cell.label) {
    // The target element is the 'div', back out to the 'td'.
    cell = cell.parentNode;
  }
  var colour = cell && cell.label;
  if (colour !== null) {
    this.setValue(colour);
    Blockly.DropDownDiv.hideIfOwner(this);
  }
};

/**
 * Create a colour picker dropdown editor.
 * @return {!Element} The newly created colour picker.
 * @private
 */
Blockly.FieldColour.prototype.dropdownCreate_ = function() {
  var columns = this.columns_ || Blockly.FieldColour.COLUMNS;
  var colours = this.colours_ || Blockly.FieldColour.COLOURS;
  var titles = this.titles_ || Blockly.FieldColour.TITLES;
  var selectedColour = this.getValue();
  // Create the palette.
  var table = document.createElement('table');
  table.className = 'blocklyColourTable';
  var row;
  for (var i = 0; i < colours.length; i++) {
    if (i % columns == 0) {
      row = document.createElement('tr');
      table.appendChild(row);
    }
    var cell = document.createElement('td');
    row.appendChild(cell);
    var div = document.createElement('div');
    cell.appendChild(div);
    cell.label = colours[i];  // This becomes the value, if clicked.
    cell.title = titles[i] || colours[i];
    div.style.backgroundColor = colours[i];
    if (colours[i] == selectedColour) {
      div.className = 'blocklyColourSelected';
    }
  }

  // Configure event handler on the table to listen for any event in a cell.
  this.onUpWrapper_ = Blockly.bindEvent_(table, 'mouseup', this, this.onClick_);

  return table;
};

/**
 * Dispose of events belonging to the colour editor.
 * @private
 */
Blockly.FieldColour.prototype.dropdownDispose_ = function() {
  Blockly.unbindEvent_(this.onUpWrapper_);
};

Blockly.Field.register('field_colour', Blockly.FieldColour);
