/**
 * @license
 * Copyright 2012 Google LLC
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

goog.require('Blockly.Css');
goog.require('Blockly.DropDownDiv');
goog.require('Blockly.Events');
goog.require('Blockly.Events.BlockChange');
goog.require('Blockly.Field');
goog.require('Blockly.fieldRegistry');
goog.require('Blockly.navigation');
goog.require('Blockly.utils.aria');
goog.require('Blockly.utils.colour');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.IdGenerator');
goog.require('Blockly.utils.KeyCodes');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.Size');


/**
 * Class for a colour input field.
 * @param {string=} opt_value The initial value of the field. Should be in
 *    '#rrggbb' format. Defaults to the first value in the default colour array.
 * @param {Function=} opt_validator A function that is called to validate
 *    changes to the field's value. Takes in a colour string & returns a
 *    validated colour string ('#rrggbb' format), or null to abort the change.
 * @param {Object=} opt_config A map of options used to configure the field.
 *    See the [field creation documentation]{@link https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/colour}
 *    for a list of properties this parameter supports.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldColour = function(opt_value, opt_validator, opt_config) {
  Blockly.FieldColour.superClass_.constructor.call(
      this, opt_value || Blockly.FieldColour.COLOURS[0],
      opt_validator, opt_config);

  /**
   * The size of the area rendered by the field.
   * @type {Blockly.utils.Size}
   * @protected
   * @override
   */
  this.size_ = new Blockly.utils.Size(Blockly.FieldColour.DEFAULT_WIDTH,
      Blockly.FieldColour.DEFAULT_HEIGHT);
};
Blockly.utils.object.inherits(Blockly.FieldColour, Blockly.Field);

/**
 * Construct a FieldColour from a JSON arg object.
 * @param {!Object} options A JSON object with options (colour).
 * @return {!Blockly.FieldColour} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldColour.fromJson = function(options) {
  return new Blockly.FieldColour(options['colour'], undefined, options);
};

/**
 * Default width of a colour field.
 * @type {number}
 * @private
 * @const
 */
Blockly.FieldColour.DEFAULT_WIDTH = 26;

/**
 * Default height of a colour field.
 * @type {number}
 * @private
 * @const
 */
Blockly.FieldColour.DEFAULT_HEIGHT = Blockly.Field.BORDER_RECT_DEFAULT_HEIGHT;

/**
 * Serializable fields are saved by the XML renderer, non-serializable fields
 * are not. Editable fields should also be serializable.
 * @type {boolean}
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
 * @protected
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
 * Configure the field based on the given map of options.
 * @param {!Object} config A map of options to configure the field based on.
 * @private
 */
Blockly.FieldColour.prototype.configure_ = function(config) {
  Blockly.FieldColour.superClass_.configure_.call(this, config);
  if (config['colourOptions']) {
    this.colours_ = config['colourOptions'];
    this.titles_ = config['colourTitles'];
  }
  if (config['columns']) {
    this.columns_ = config['columns'];
  }
};

/**
 * Create the block UI for this colour field.
 * @package
 */
Blockly.FieldColour.prototype.initView = function() {
  this.createBorderRect_();
  this.borderRect_.style['fillOpacity'] = 1;
  this.borderRect_.style.fill = this.value_;
};

/**
 * Ensure that the input value is a valid colour.
 * @param {*=} opt_newValue The input value.
 * @return {?string} A valid colour, or null if invalid.
 * @protected
 */
Blockly.FieldColour.prototype.doClassValidation_ = function(opt_newValue) {
  if (typeof opt_newValue != 'string') {
    return null;
  }
  return Blockly.utils.colour.parse(opt_newValue);
};

/**
 * Update the value of this colour field, and update the displayed colour.
 * @param {*} newValue The value to be saved. The default validator guarantees
 * that this is a colour in '#rrggbb' format.
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
  var colour = /** @type {string} */ (this.value_);
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
 * @param {Array.<string>=} opt_titles Optional array of colour tooltips,
 *     or null to use default (Blockly.FieldColour.TITLES).
 * @return {!Blockly.FieldColour} Returns itself (for method chaining).
 */
Blockly.FieldColour.prototype.setColours = function(colours, opt_titles) {
  this.colours_ = colours;
  if (opt_titles) {
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
  this.picker_ = this.dropdownCreate_();
  Blockly.DropDownDiv.getContentDiv().appendChild(this.picker_);

  Blockly.DropDownDiv.showPositionedByField(
      this, this.dropdownDispose_.bind(this));

  // Focus so we can start receiving keyboard events.
  this.picker_.focus();
};

/**
 * Handle a click on a colour cell.
 * @param {!MouseEvent} e Mouse event.
 * @private
 */
Blockly.FieldColour.prototype.onClick_ = function(e) {
  var cell = /** @type {!Element} */ (e.target);
  var colour = cell && cell.label;
  if (colour !== null) {
    this.setValue(colour);
    Blockly.DropDownDiv.hideIfOwner(this);
  }
};

/**
 * Handle a key down event. Navigate around the grid with the
 * arrow keys. Enter selects the highlighted colour.
 * @param {!KeyboardEvent} e Keyboard event.
 * @private
 */
Blockly.FieldColour.prototype.onKeyDown_ = function(e) {
  var handled = false;
  if (e.keyCode === Blockly.utils.KeyCodes.UP) {
    this.moveHighlightBy_(0, -1);
    handled = true;
  } else if (e.keyCode === Blockly.utils.KeyCodes.DOWN) {
    this.moveHighlightBy_(0, 1);
    handled = true;
  } else if (e.keyCode === Blockly.utils.KeyCodes.LEFT) {
    this.moveHighlightBy_(-1, 0);
    handled = true;
  } else if (e.keyCode === Blockly.utils.KeyCodes.RIGHT) {
    this.moveHighlightBy_(1, 0);
    handled = true;
  } else if (e.keyCode === Blockly.utils.KeyCodes.ENTER) {
    // Select the highlighted colour.
    var highlighted = this.getHighlighted_();
    if (highlighted) {
      var colour = highlighted && highlighted.label;
      if (colour !== null) {
        this.setValue(colour);
      }
    }
    Blockly.DropDownDiv.hideWithoutAnimation();
    handled = true;
  }
  if (handled) {
    e.stopPropagation();
  }
};

/**
 * Handles the given action.
 * This is only triggered when keyboard accessibility mode is enabled.
 * @param {!Blockly.Action} action The action to be handled.
 * @return {boolean} True if the field handled the action, false otherwise.
 * @package
 */
Blockly.FieldColour.prototype.onBlocklyAction = function(action) {
  if (this.picker_) {
    if (action === Blockly.navigation.ACTION_PREVIOUS) {
      this.moveHighlightBy_(0, -1);
      return true;
    } else if (action === Blockly.navigation.ACTION_NEXT) {
      this.moveHighlightBy_(0, 1);
      return true;
    } else if (action === Blockly.navigation.ACTION_OUT) {
      this.moveHighlightBy_(-1, 0);
      return true;
    } else if (action === Blockly.navigation.ACTION_IN) {
      this.moveHighlightBy_(1, 0);
      return true;
    }
  }
  return Blockly.FieldColour.superClass_.onBlocklyAction.call(this, action);
};

/**
 * Move the currently highlighted position by dx and dy.
 * @param {number} dx Change of x
 * @param {number} dy Change of y
 * @private
 */
Blockly.FieldColour.prototype.moveHighlightBy_ = function(dx, dy) {
  var colours = this.colours_ || Blockly.FieldColour.COLOURS;
  var columns = this.columns_ || Blockly.FieldColour.COLUMNS;

  // Get the current x and y coordinates
  var x = this.highlightedIndex_ % columns;
  var y = Math.floor(this.highlightedIndex_ / columns);

  // Add the offset
  x += dx;
  y += dy;

  if (dx < 0) {
    // Move left one grid cell, even in RTL.
    // Loop back to the end of the previous row if we have room.
    if (x < 0 && y > 0) {
      x = columns - 1;
      y--;
    } else if (x < 0) {
      x = 0;
    }
  } else if (dx > 0) {
    // Move right one grid cell, even in RTL.
    // Loop to the start of the next row, if there's room.
    if (x > columns - 1 &&
      y < Math.floor(colours.length / columns) - 1) {
      x = 0;
      y++;
    } else if (x > columns - 1) {
      x--;
    }
  } else if (dy < 0) {
    // Move up one grid cell, stop at the top.
    if (y < 0) {
      y = 0;
    }
  } else if (dy > 0) {
    // Move down one grid cell, stop at the bottom.
    if (y > Math.floor(colours.length / columns) - 1) {
      y = Math.floor(colours.length / columns) - 1;
    }
  }

  // Move the highlight to the new coordinates.
  var cell = this.picker_.childNodes[y].childNodes[x];
  var index = (y * columns) + x;
  this.setHighlightedCell_(cell, index);
};

/**
 * Handle a mouse move event. Highlight the hovered colour.
 * @param {!MouseEvent} e Mouse event.
 * @private
 */
Blockly.FieldColour.prototype.onMouseMove_ = function(e) {
  var cell = /** @type {!Element} */ (e.target);
  var index = cell && cell.getAttribute('data-index');
  if (index !== null && index !== this.highlightedIndex_) {
    this.setHighlightedCell_(cell, Number(index));
  }
};

/**
 * Handle a mouse enter event. Focus the picker.
 * @private
 */
Blockly.FieldColour.prototype.onMouseEnter_ = function() {
  this.picker_.focus();
};

/**
 * Handle a mouse leave event. Blur the picker and unhighlight
 * the currently highlighted colour.
 * @private
 */
Blockly.FieldColour.prototype.onMouseLeave_ = function() {
  this.picker_.blur();
  var highlighted = this.getHighlighted_();
  if (highlighted) {
    Blockly.utils.dom.removeClass(highlighted, 'blocklyColourHighlighted');
  }
};

/**
 * Returns the currently highlighted item (if any).
 * @return {Element} Highlighted item (null if none).
 * @private
 */
Blockly.FieldColour.prototype.getHighlighted_ = function() {
  var columns = this.columns_ || Blockly.FieldColour.COLUMNS;
  var x = this.highlightedIndex_ % columns;
  var y = Math.floor(this.highlightedIndex_ / columns);
  var row = this.picker_.childNodes[y];
  if (!row) {
    return null;
  }
  var col = row.childNodes[x];
  return col;
};

/**
 * Update the currently highlighted cell.
 * @param {!Element} cell the new cell to highlight
 * @param {number} index the index of the new cell
 * @private
 */
Blockly.FieldColour.prototype.setHighlightedCell_ = function(cell, index) {
  // Unhighlight the current item.
  var highlighted = this.getHighlighted_();
  if (highlighted) {
    Blockly.utils.dom.removeClass(highlighted, 'blocklyColourHighlighted');
  }
  // Highlight new item.
  Blockly.utils.dom.addClass(cell, 'blocklyColourHighlighted');
  // Set new highlighted index.
  this.highlightedIndex_ = index;

  // Update accessibility roles.
  Blockly.utils.aria.setState(this.picker_,
      Blockly.utils.aria.State.ACTIVEDESCENDANT, cell.getAttribute('id'));
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
  table.tabIndex = 0;
  table.dir = 'ltr';
  Blockly.utils.aria.setRole(table,
      Blockly.utils.aria.Role.GRID);
  Blockly.utils.aria.setState(table,
      Blockly.utils.aria.State.EXPANDED, true);
  Blockly.utils.aria.setState(table, 'rowcount',
      Math.floor(colours.length / columns));
  Blockly.utils.aria.setState(table, 'colcount', columns);
  var row;
  for (var i = 0; i < colours.length; i++) {
    if (i % columns == 0) {
      row = document.createElement('tr');
      Blockly.utils.aria.setRole(row, Blockly.utils.aria.Role.ROW);
      table.appendChild(row);
    }
    var cell = document.createElement('td');
    row.appendChild(cell);
    cell.label = colours[i];  // This becomes the value, if clicked.
    cell.title = titles[i] || colours[i];
    cell.id = Blockly.utils.IdGenerator.getNextUniqueId();
    cell.setAttribute('data-index', i);
    Blockly.utils.aria.setRole(cell, Blockly.utils.aria.Role.GRIDCELL);
    Blockly.utils.aria.setState(cell,
        Blockly.utils.aria.State.LABEL, colours[i]);
    Blockly.utils.aria.setState(cell,
        Blockly.utils.aria.State.SELECTED, colours[i] == selectedColour);
    cell.style.backgroundColor = colours[i];
    if (colours[i] == selectedColour) {
      cell.className = 'blocklyColourSelected';
      this.highlightedIndex_ = i;
    }
  }

  // Configure event handler on the table to listen for any event in a cell.
  this.onClickWrapper_ = Blockly.bindEventWithChecks_(table,
      'click', this, this.onClick_, true);
  this.onMouseMoveWrapper_ = Blockly.bindEventWithChecks_(table,
      'mousemove', this, this.onMouseMove_, true);
  this.onMouseEnterWrapper_ = Blockly.bindEventWithChecks_(table,
      'mouseenter', this, this.onMouseEnter_, true);
  this.onMouseLeaveWrapper_ = Blockly.bindEventWithChecks_(table,
      'mouseleave', this, this.onMouseLeave_, true);
  this.onKeyDownWrapper_ = Blockly.bindEventWithChecks_(table,
      'keydown', this, this.onKeyDown_);

  return table;
};

/**
 * Dispose of events belonging to the colour editor.
 * @private
 */
Blockly.FieldColour.prototype.dropdownDispose_ = function() {
  Blockly.unbindEvent_(this.onClickWrapper_);
  Blockly.unbindEvent_(this.onMouseMoveWrapper_);
  Blockly.unbindEvent_(this.onMouseEnterWrapper_);
  Blockly.unbindEvent_(this.onMouseLeaveWrapper_);
  Blockly.unbindEvent_(this.onKeyDownWrapper_);
  this.picker_ = null;
};

/**
 * CSS for colour picker.  See css.js for use.
 */
Blockly.Css.register([
  /* eslint-disable indent */
  '.blocklyColourTable {',
    'border-collapse: collapse;',
    'display: block;',
    'outline: none;',
    'padding: 1px;',
  '}',

  '.blocklyColourTable>tr>td {',
    'border: .5px solid #888;',
    'box-sizing: border-box;',
    'cursor: pointer;',
    'display: inline-block;',
    'height: 20px;',
    'padding: 0;',
    'width: 20px;',
  '}',

  '.blocklyColourTable>tr>td.blocklyColourHighlighted {',
    'border-color: #eee;',
    'box-shadow: 2px 2px 7px 2px rgba(0,0,0,.3);',
    'position: relative;',
  '}',

  '.blocklyColourSelected, .blocklyColourSelected:hover {',
    'border-color: #eee !important;',
    'outline: 1px solid #333;',
    'position: relative;',
  '}'
  /* eslint-enable indent */
]);

Blockly.fieldRegistry.register('field_colour', Blockly.FieldColour);
