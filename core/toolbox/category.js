/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A toolbox category used to organize blocks in the toolbox.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */
'use strict';

goog.provide('Blockly.ToolboxCategory');

goog.require('Blockly.CollapsibleToolboxItem');
goog.require('Blockly.utils.aria');
goog.require('Blockly.utils.object');

goog.requireType('Blockly.ToolboxItem');


/**
 * Class for a category in a toolbox.
 * @param {!Blockly.utils.toolbox.Category} categoryDef The information needed
 *     to create a category in the toolbox.
 * @param {!Blockly.IToolbox} toolbox The parent toolbox for the category.
 * @param {Blockly.ToolboxCategory=} opt_parent The parent category or null if
 *     the category does not have a parent.
 * @constructor
 * @extends {Blockly.CollapsibleToolboxItem}
 */
Blockly.ToolboxCategory = function(categoryDef, toolbox, opt_parent) {
  Blockly.ToolboxCategory.superClass_.constructor.call(
      this, categoryDef, toolbox);

  /**
   * The name that will be displayed on the category.
   * @type {string}
   * @protected
   */
  this.name_ = categoryDef['name'];

  var contents = categoryDef['contents'];

  /**
   * True if this category has subcategories, false otherwise.
   * @type {boolean}
   * @private
   */
  this.hasChildren_ = contents && contents.length &&
    typeof contents != 'string' &&
    contents[0].kind.toUpperCase() == 'CATEGORY';
  /**
   * The parent of the category.
   * @type {?Blockly.ToolboxCategory}
   * @protected
   */
  this.parent_ = opt_parent || null;

  /**
   * The level that the category is nested at.
   * @type {number}
   * @protected
   */
  this.level_ = this.parent_ ? this.parent_.getLevel() + 1 : 0;

  /**
   * The colour of the category.
   * @type {string}
   * @protected
   */
  this.colour_ = this.getColour_(categoryDef);

  /**
   * The html container for the category.
   * @type {?Element}
   * @protected
   */
  this.htmlDiv_ = null;

  /**
   * The html element for the category row.
   * @type {?Element}
   * @protected
   */
  this.rowDiv_ = null;

  /**
   * The html element for the toolbox icon.
   * @type {?Element}
   * @protected
   */
  this.iconSpan_ = null;

  /**
   * Container for any children categories.
   * @type {?Element}
   * @protected
   */
  this.subcategoriesDiv_ = null;

  /**
   * The config for all the category css classes.
   * @type {!Blockly.ToolboxCategory.ClassConfig}
   * @protected
   */
  this.classConfig_ = {
    'container': 'blocklyToolboxCategory',
    'row': 'blocklyTreeRow',
    'icon': 'blocklyTreeIcon',
    'label': 'blocklyTreeLabel',
    'contents': 'blocklyToolboxContents',
    'selected': 'blocklyTreeSelected',
    'openIcon': 'blocklyTreeIconOpen',
    'closedIcon': 'blocklyTreeIconClosed'
  };

  Blockly.utils.object.mixin(this.classConfig_, categoryDef['classConfig']);

  /**
   * Whether or not the category should display its children.
   * @type {boolean}
   * @protected
   */
  this.expanded_ = categoryDef['expanded'] == 'true' || categoryDef['expanded'];

  /**
   * True if the category is visible, false otherwise.
   * @type {boolean}
   * @private
   */
  this.isVisible_ = true;

  /**
   * Parse the contents for this category.
   * @type {string|
   *        !Array<!Blockly.ToolboxItem>|
   *        !Array<!Blockly.utils.toolbox.FlyoutItemDef>}
   * @protected
   */
  this.contents_ = this.parseContents_(categoryDef, this.hasChildren_);
};

Blockly.utils.object.inherits(Blockly.ToolboxCategory,
    Blockly.CollapsibleToolboxItem);

/**
 * @typedef {{
 *            container:?string,
 *            row:?string,
 *            icon:?string,
 *            label:?string,
 *            contents:?string,
 *            selected:?string,
 *            openIcon:?string,
 *            closedIcon:?string,
 *          }}
 */
Blockly.ToolboxCategory.ClassConfig;

/**
 * The number of pixels to move the category over at each nested level.
 * @type {number}
 * @const {number}
 */
Blockly.ToolboxCategory.NESTED_PADDING = 19;

/**
 * Parses the contents array depending on if the category has children, is a
 * dynamic category, or if its contents are meant to be shown in the flyout.
 * @param {!Blockly.utils.toolbox.Category} categoryDef The information needed
 *     to create a category.
 * @param {boolean} hasChildren True if this category has subcategories, false
 *     otherwise.
 * @return {string|!Array<!Blockly.ToolboxItem>|
 *          !Array<!Blockly.utils.toolbox.FlyoutItemDef>}
 *     The contents for this category.
 * @private
 */
Blockly.ToolboxCategory.prototype.parseContents_ = function(categoryDef,
    hasChildren) {
  var toolboxItems = [];
  var contents = categoryDef['contents'];
  if (hasChildren) {
    for (var i = 0; i < contents.length; i++) {
      var child = new Blockly.ToolboxCategory(contents[i], this.parentToolbox_, this);
      toolboxItems.push(child);
    }
  } else if (categoryDef['custom']) {
    toolboxItems = categoryDef['custom'];
  } else {
    toolboxItems = contents;
  }

  return toolboxItems;
};

/**
 * Adds either the colour or the style for a category.
 * @param {!Blockly.utils.toolbox.Category} categoryDef The object holding
 *    information on the category.
 * @return {string} The hex colour for the category.
 * @protected
 */
Blockly.ToolboxCategory.prototype.getColour_ = function(categoryDef) {
  var styleName = categoryDef['categorystyle'];
  var colour = categoryDef['colour'];

  if (colour && styleName) {
    console.warn('Toolbox category "' + this.name_ +
        '" must not have both a style and a colour');
  } else if (styleName) {
    return this.getColourfromStyle_(styleName);
  } else {
    return this.parseColour_(colour);
  }
  return '';
};

/**
 * Retrieves and sets the colour for the category using the style name.
 * The category colour is set from the colour style attribute.
 * @param {string} styleName Name of the style.
 * @return {string} The hex colour for the category.
 * @private
 */
Blockly.ToolboxCategory.prototype.getColourfromStyle_ = function(styleName) {
  var theme = this.workspace_.getTheme();
  if (styleName && theme) {
    var style = theme.categoryStyles[styleName];
    if (style && style.colour) {
      return this.parseColour_(style.colour);
    } else {
      console.warn('Style "' + styleName +
          '" must exist and contain a colour value');
    }
  }
  return '';
};

/**
 * Sets the colour on the category.
 * @param {number|string} colourValue HSV hue value (0 to 360), #RRGGBB string,
 *     or a message reference string pointing to one of those two values.
 * @return {string} The hex colour for the category.
 * @private
 */
Blockly.ToolboxCategory.prototype.parseColour_ = function(colourValue) {
  // Decode the colour for any potential message references
  // (eg. `%{BKY_MATH_HUE}`).
  var colour = Blockly.utils.replaceMessageReferences(colourValue);
  if (colour == null || colour === '') {
    // No attribute. No colour.
    return '';
  } else {
    var hue = Number(colour);
    if (!isNaN(hue)) {
      return Blockly.hueToHex(hue);
    } else {
      var hex = Blockly.utils.colour.parse(colour);
      if (hex) {
        return hex;
      } else {
        console.warn('Toolbox category "' + this.name_ +
            '" has unrecognized colour attribute: ' + colour);
        return '';
      }
    }
  }
};
