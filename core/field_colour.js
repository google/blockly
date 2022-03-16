/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Colour input field.
 */
'use strict';

/**
 * Colour input field.
 * @class
 */
goog.module('Blockly.FieldColour');

const Css = goog.require('Blockly.Css');
const aria = goog.require('Blockly.utils.aria');
const browserEvents = goog.require('Blockly.browserEvents');
const colour = goog.require('Blockly.utils.colour');
const dom = goog.require('Blockly.utils.dom');
const dropDownDiv = goog.require('Blockly.dropDownDiv');
const fieldRegistry = goog.require('Blockly.fieldRegistry');
const idGenerator = goog.require('Blockly.utils.idGenerator');
const {Field} = goog.require('Blockly.Field');
const {KeyCodes} = goog.require('Blockly.utils.KeyCodes');
/* eslint-disable-next-line no-unused-vars */
const {Sentinel} = goog.requireType('Blockly.utils.Sentinel');
const {Size} = goog.require('Blockly.utils.Size');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.BlockChange');


/**
 * Class for a colour input field.
 * @extends {Field}
 * @alias Blockly.FieldColour
 */
class FieldColour extends Field {
  /**
   * @param {(string|!Sentinel)=} opt_value The initial value of the
   *     field. Should be in '#rrggbb' format. Defaults to the first value in
   *     the default colour array.
   *     Also accepts Field.SKIP_SETUP if you wish to skip setup (only used by
   *     subclasses that want to handle configuration and setting the field
   *     value after their own constructors have run).
   * @param {Function=} opt_validator A function that is called to validate
   *     changes to the field's value. Takes in a colour string & returns a
   *     validated colour string ('#rrggbb' format), or null to abort the
   *     change.Blockly.
   * @param {Object=} opt_config A map of options used to configure the field.
   *     See the [field creation documentation]{@link
   *     https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/colour}
   *     for a list of properties this parameter supports.
   */
  constructor(opt_value, opt_validator, opt_config) {
    super(Field.SKIP_SETUP);

    /**
     * The field's colour picker element.
     * @type {?Element}
     * @private
     */
    this.picker_ = null;

    /**
     * Index of the currently highlighted element.
     * @type {?number}
     * @private
     */
    this.highlightedIndex_ = null;

    /**
     * Mouse click event data.
     * @type {?browserEvents.Data}
     * @private
     */
    this.onClickWrapper_ = null;

    /**
     * Mouse move event data.
     * @type {?browserEvents.Data}
     * @private
     */
    this.onMouseMoveWrapper_ = null;

    /**
     * Mouse enter event data.
     * @type {?browserEvents.Data}
     * @private
     */
    this.onMouseEnterWrapper_ = null;

    /**
     * Mouse leave event data.
     * @type {?browserEvents.Data}
     * @private
     */
    this.onMouseLeaveWrapper_ = null;

    /**
     * Key down event data.
     * @type {?browserEvents.Data}
     * @private
     */
    this.onKeyDownWrapper_ = null;

    /**
     * Serializable fields are saved by the serializer, non-serializable fields
     * are not. Editable fields should also be serializable.
     * @type {boolean}
     */
    this.SERIALIZABLE = true;

    /**
     * Mouse cursor style when over the hotspot that initiates the editor.
     * @type {string}
     */
    this.CURSOR = 'default';

    /**
     * Used to tell if the field needs to be rendered the next time the block is
     * rendered. Colour fields are statically sized, and only need to be
     * rendered at initialization.
     * @type {boolean}
     * @protected
     */
    this.isDirty_ = false;

    /**
     * Array of colours used by this field.  If null, use the global list.
     * @type {Array<string>}
     * @private
     */
    this.colours_ = null;

    /**
     * Array of colour tooltips used by this field.  If null, use the global
     * list.
     * @type {Array<string>}
     * @private
     */
    this.titles_ = null;

    /**
     * Number of colour columns used by this field.  If 0, use the global
     * setting. By default use the global constants for columns.
     * @type {number}
     * @private
     */
    this.columns_ = 0;

    if (opt_value === Field.SKIP_SETUP) return;
    if (opt_config) this.configure_(opt_config);
    this.setValue(opt_value);
    if (opt_validator) this.setValidator(opt_validator);
  }

  /**
   * Configure the field based on the given map of options.
   * @param {!Object} config A map of options to configure the field based on.
   * @protected
   * @override
   */
  configure_(config) {
    super.configure_(config);
    if (config['colourOptions']) {
      this.colours_ = config['colourOptions'];
      this.titles_ = config['colourTitles'];
    }
    if (config['columns']) {
      this.columns_ = config['columns'];
    }
  }

  /**
   * Create the block UI for this colour field.
   * @package
   */
  initView() {
    this.size_ = new Size(
        this.getConstants().FIELD_COLOUR_DEFAULT_WIDTH,
        this.getConstants().FIELD_COLOUR_DEFAULT_HEIGHT);
    if (!this.getConstants().FIELD_COLOUR_FULL_BLOCK) {
      this.createBorderRect_();
      this.borderRect_.style['fillOpacity'] = '1';
    } else {
      this.clickTarget_ = this.sourceBlock_.getSvgRoot();
    }
  }

  /**
   * @override
   */
  applyColour() {
    if (!this.getConstants().FIELD_COLOUR_FULL_BLOCK) {
      if (this.borderRect_) {
        this.borderRect_.style.fill = /** @type {string} */ (this.getValue());
      }
    } else {
      this.sourceBlock_.pathObject.svgPath.setAttribute(
          'fill', this.getValue());
      this.sourceBlock_.pathObject.svgPath.setAttribute('stroke', '#fff');
    }
  }

  /**
   * Ensure that the input value is a valid colour.
   * @param {*=} opt_newValue The input value.
   * @return {?string} A valid colour, or null if invalid.
   * @protected
   */
  doClassValidation_(opt_newValue) {
    if (typeof opt_newValue !== 'string') {
      return null;
    }
    return colour.parse(opt_newValue);
  }

  /**
   * Update the value of this colour field, and update the displayed colour.
   * @param {*} newValue The value to be saved. The default validator guarantees
   * that this is a colour in '#rrggbb' format.
   * @protected
   */
  doValueUpdate_(newValue) {
    this.value_ = newValue;
    if (this.borderRect_) {
      this.borderRect_.style.fill = /** @type {string} */ (newValue);
    } else if (this.sourceBlock_ && this.sourceBlock_.rendered) {
      this.sourceBlock_.pathObject.svgPath.setAttribute('fill', newValue);
      this.sourceBlock_.pathObject.svgPath.setAttribute('stroke', '#fff');
    }
  }

  /**
   * Get the text for this field.  Used when the block is collapsed.
   * @return {string} Text representing the value of this field.
   */
  getText() {
    let colour = /** @type {string} */ (this.value_);
    // Try to use #rgb format if possible, rather than #rrggbb.
    if (/^#(.)\1(.)\2(.)\3$/.test(colour)) {
      colour = '#' + colour[1] + colour[3] + colour[5];
    }
    return colour;
  }

  /**
   * Set a custom colour grid for this field.
   * @param {Array<string>} colours Array of colours for this block,
   *     or null to use default (FieldColour.COLOURS).
   * @param {Array<string>=} opt_titles Optional array of colour tooltips,
   *     or null to use default (FieldColour.TITLES).
   * @return {!FieldColour} Returns itself (for method chaining).
   */
  setColours(colours, opt_titles) {
    this.colours_ = colours;
    if (opt_titles) {
      this.titles_ = opt_titles;
    }
    return this;
  }

  /**
   * Set a custom grid size for this field.
   * @param {number} columns Number of columns for this block,
   *     or 0 to use default (FieldColour.COLUMNS).
   * @return {!FieldColour} Returns itself (for method chaining).
   */
  setColumns(columns) {
    this.columns_ = columns;
    return this;
  }

  /**
   * Create and show the colour field's editor.
   * @protected
   */
  showEditor_() {
    this.dropdownCreate_();
    dropDownDiv.getContentDiv().appendChild(this.picker_);

    dropDownDiv.showPositionedByField(this, this.dropdownDispose_.bind(this));

    // Focus so we can start receiving keyboard events.
    this.picker_.focus({preventScroll: true});
  }

  /**
   * Handle a click on a colour cell.
   * @param {!MouseEvent} e Mouse event.
   * @private
   */
  onClick_(e) {
    const cell = /** @type {!Element} */ (e.target);
    const colour = cell && cell.label;
    if (colour !== null) {
      this.setValue(colour);
      dropDownDiv.hideIfOwner(this);
    }
  }

  /**
   * Handle a key down event. Navigate around the grid with the
   * arrow keys. Enter selects the highlighted colour.
   * @param {!KeyboardEvent} e Keyboard event.
   * @private
   */
  onKeyDown_(e) {
    let handled = false;
    if (e.keyCode === KeyCodes.UP) {
      this.moveHighlightBy_(0, -1);
      handled = true;
    } else if (e.keyCode === KeyCodes.DOWN) {
      this.moveHighlightBy_(0, 1);
      handled = true;
    } else if (e.keyCode === KeyCodes.LEFT) {
      this.moveHighlightBy_(-1, 0);
      handled = true;
    } else if (e.keyCode === KeyCodes.RIGHT) {
      this.moveHighlightBy_(1, 0);
      handled = true;
    } else if (e.keyCode === KeyCodes.ENTER) {
      // Select the highlighted colour.
      const highlighted = this.getHighlighted_();
      if (highlighted) {
        const colour = highlighted && highlighted.label;
        if (colour !== null) {
          this.setValue(colour);
        }
      }
      dropDownDiv.hideWithoutAnimation();
      handled = true;
    }
    if (handled) {
      e.stopPropagation();
    }
  }

  /**
   * Move the currently highlighted position by dx and dy.
   * @param {number} dx Change of x
   * @param {number} dy Change of y
   * @private
   */
  moveHighlightBy_(dx, dy) {
    const colours = this.colours_ || FieldColour.COLOURS;
    const columns = this.columns_ || FieldColour.COLUMNS;

    // Get the current x and y coordinates
    let x = this.highlightedIndex_ % columns;
    let y = Math.floor(this.highlightedIndex_ / columns);

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
      if (x > columns - 1 && y < Math.floor(colours.length / columns) - 1) {
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
    const cell =
        /** @type {!Element} */ (this.picker_.childNodes[y].childNodes[x]);
    const index = (y * columns) + x;
    this.setHighlightedCell_(cell, index);
  }

  /**
   * Handle a mouse move event. Highlight the hovered colour.
   * @param {!MouseEvent} e Mouse event.
   * @private
   */
  onMouseMove_(e) {
    const cell = /** @type {!Element} */ (e.target);
    const index = cell && Number(cell.getAttribute('data-index'));
    if (index !== null && index !== this.highlightedIndex_) {
      this.setHighlightedCell_(cell, index);
    }
  }

  /**
   * Handle a mouse enter event. Focus the picker.
   * @private
   */
  onMouseEnter_() {
    this.picker_.focus({preventScroll: true});
  }

  /**
   * Handle a mouse leave event. Blur the picker and unhighlight
   * the currently highlighted colour.
   * @private
   */
  onMouseLeave_() {
    this.picker_.blur();
    const highlighted = this.getHighlighted_();
    if (highlighted) {
      dom.removeClass(highlighted, 'blocklyColourHighlighted');
    }
  }

  /**
   * Returns the currently highlighted item (if any).
   * @return {?HTMLElement} Highlighted item (null if none).
   * @private
   */
  getHighlighted_() {
    const columns = this.columns_ || FieldColour.COLUMNS;
    const x = this.highlightedIndex_ % columns;
    const y = Math.floor(this.highlightedIndex_ / columns);
    const row = this.picker_.childNodes[y];
    if (!row) {
      return null;
    }
    const col = /** @type {HTMLElement} */ (row.childNodes[x]);
    return col;
  }

  /**
   * Update the currently highlighted cell.
   * @param {!Element} cell the new cell to highlight
   * @param {number} index the index of the new cell
   * @private
   */
  setHighlightedCell_(cell, index) {
    // Unhighlight the current item.
    const highlighted = this.getHighlighted_();
    if (highlighted) {
      dom.removeClass(highlighted, 'blocklyColourHighlighted');
    }
    // Highlight new item.
    dom.addClass(cell, 'blocklyColourHighlighted');
    // Set new highlighted index.
    this.highlightedIndex_ = index;

    // Update accessibility roles.
    aria.setState(
        /** @type {!Element} */ (this.picker_), aria.State.ACTIVEDESCENDANT,
        cell.getAttribute('id'));
  }

  /**
   * Create a colour picker dropdown editor.
   * @private
   */
  dropdownCreate_() {
    const columns = this.columns_ || FieldColour.COLUMNS;
    const colours = this.colours_ || FieldColour.COLOURS;
    const titles = this.titles_ || FieldColour.TITLES;
    const selectedColour = this.getValue();
    // Create the palette.
    const table = document.createElement('table');
    table.className = 'blocklyColourTable';
    table.tabIndex = 0;
    table.dir = 'ltr';
    aria.setRole(table, aria.Role.GRID);
    aria.setState(table, aria.State.EXPANDED, true);
    aria.setState(
        table, aria.State.ROWCOUNT, Math.floor(colours.length / columns));
    aria.setState(table, aria.State.COLCOUNT, columns);
    let row;
    for (let i = 0; i < colours.length; i++) {
      if (i % columns === 0) {
        row = document.createElement('tr');
        aria.setRole(row, aria.Role.ROW);
        table.appendChild(row);
      }
      const cell = document.createElement('td');
      row.appendChild(cell);
      cell.label = colours[i];  // This becomes the value, if clicked.
      cell.title = titles[i] || colours[i];
      cell.id = idGenerator.getNextUniqueId();
      cell.setAttribute('data-index', i);
      aria.setRole(cell, aria.Role.GRIDCELL);
      aria.setState(cell, aria.State.LABEL, colours[i]);
      aria.setState(cell, aria.State.SELECTED, colours[i] === selectedColour);
      cell.style.backgroundColor = colours[i];
      if (colours[i] === selectedColour) {
        cell.className = 'blocklyColourSelected';
        this.highlightedIndex_ = i;
      }
    }

    // Configure event handler on the table to listen for any event in a cell.
    this.onClickWrapper_ = browserEvents.conditionalBind(
        table, 'click', this, this.onClick_, true);
    this.onMouseMoveWrapper_ = browserEvents.conditionalBind(
        table, 'mousemove', this, this.onMouseMove_, true);
    this.onMouseEnterWrapper_ = browserEvents.conditionalBind(
        table, 'mouseenter', this, this.onMouseEnter_, true);
    this.onMouseLeaveWrapper_ = browserEvents.conditionalBind(
        table, 'mouseleave', this, this.onMouseLeave_, true);
    this.onKeyDownWrapper_ =
        browserEvents.conditionalBind(table, 'keydown', this, this.onKeyDown_);

    this.picker_ = table;
  }

  /**
   * Disposes of events and DOM-references belonging to the colour editor.
   * @private
   */
  dropdownDispose_() {
    if (this.onClickWrapper_) {
      browserEvents.unbind(this.onClickWrapper_);
      this.onClickWrapper_ = null;
    }
    if (this.onMouseMoveWrapper_) {
      browserEvents.unbind(this.onMouseMoveWrapper_);
      this.onMouseMoveWrapper_ = null;
    }
    if (this.onMouseEnterWrapper_) {
      browserEvents.unbind(this.onMouseEnterWrapper_);
      this.onMouseEnterWrapper_ = null;
    }
    if (this.onMouseLeaveWrapper_) {
      browserEvents.unbind(this.onMouseLeaveWrapper_);
      this.onMouseLeaveWrapper_ = null;
    }
    if (this.onKeyDownWrapper_) {
      browserEvents.unbind(this.onKeyDownWrapper_);
      this.onKeyDownWrapper_ = null;
    }
    this.picker_ = null;
    this.highlightedIndex_ = null;
  }

  /**
   * Construct a FieldColour from a JSON arg object.
   * @param {!Object} options A JSON object with options (colour).
   * @return {!FieldColour} The new field instance.
   * @package
   * @nocollapse
   */
  static fromJson(options) {
    // `this` might be a subclass of FieldColour if that class doesn't override
    // the static fromJson method.
    return new this(options['colour'], undefined, options);
  }
}

/**
 * An array of colour strings for the palette.
 * Copied from goog.ui.ColorPicker.SIMPLE_GRID_COLORS
 * All colour pickers use this unless overridden with setColours.
 * @type {!Array<string>}
 */
FieldColour.COLOURS = [
  // grays
  '#ffffff',
  '#cccccc',
  '#c0c0c0',
  '#999999',
  '#666666',
  '#333333',
  '#000000',
  // reds
  '#ffcccc',
  '#ff6666',
  '#ff0000',
  '#cc0000',
  '#990000',
  '#660000',
  '#330000',
  // oranges
  '#ffcc99',
  '#ff9966',
  '#ff9900',
  '#ff6600',
  '#cc6600',
  '#993300',
  '#663300',
  // yellows
  '#ffff99',
  '#ffff66',
  '#ffcc66',
  '#ffcc33',
  '#cc9933',
  '#996633',
  '#663333',
  // olives
  '#ffffcc',
  '#ffff33',
  '#ffff00',
  '#ffcc00',
  '#999900',
  '#666600',
  '#333300',
  // greens
  '#99ff99',
  '#66ff99',
  '#33ff33',
  '#33cc00',
  '#009900',
  '#006600',
  '#003300',
  // turquoises
  '#99ffff',
  '#33ffff',
  '#66cccc',
  '#00cccc',
  '#339999',
  '#336666',
  '#003333',
  // blues
  '#ccffff',
  '#66ffff',
  '#33ccff',
  '#3366ff',
  '#3333ff',
  '#000099',
  '#000066',
  // purples
  '#ccccff',
  '#9999ff',
  '#6666cc',
  '#6633ff',
  '#6600cc',
  '#333399',
  '#330099',
  // violets
  '#ffccff',
  '#ff99ff',
  '#cc66cc',
  '#cc33cc',
  '#993399',
  '#663366',
  '#330033',
];

/**
 * The default value for this field.
 * @type {*}
 * @protected
 */
FieldColour.prototype.DEFAULT_VALUE = FieldColour.COLOURS[0];

/**
 * An array of tooltip strings for the palette.  If not the same length as
 * COLOURS, the colour's hex code will be used for any missing titles.
 * All colour pickers use this unless overridden with setColours.
 * @type {!Array<string>}
 */
FieldColour.TITLES = [];

/**
 * Number of columns in the palette.
 * All colour pickers use this unless overridden with setColumns.
 */
FieldColour.COLUMNS = 7;

/**
 * CSS for colour picker.  See css.js for use.
 */
Css.register(`
.blocklyColourTable {
  border-collapse: collapse;
  display: block;
  outline: none;
  padding: 1px;
}

.blocklyColourTable>tr>td {
  border: .5px solid #888;
  box-sizing: border-box;
  cursor: pointer;
  display: inline-block;
  height: 20px;
  padding: 0;
  width: 20px;
}

.blocklyColourTable>tr>td.blocklyColourHighlighted {
  border-color: #eee;
  box-shadow: 2px 2px 7px 2px rgba(0,0,0,.3);
  position: relative;
}

.blocklyColourSelected, .blocklyColourSelected:hover {
  border-color: #eee !important;
  outline: 1px solid #333;
  position: relative;
}
`);

fieldRegistry.register('field_colour', FieldColour);

exports.FieldColour = FieldColour;
