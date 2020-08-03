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
 */
Blockly.ToolboxCategory.nestedPadding = 19;

/**
 * The width in pixels of the strip of colour next to each category.
 * @type {number}
 */
Blockly.ToolboxCategory.borderWidth = 8;

/**
 * The default colour of the category. This is used as the background colour of
 * the category when it is selected.
 * @type {string}
 */
Blockly.ToolboxCategory.defaultBackgroundColour = '#57e';

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
 * @override
 */
Blockly.ToolboxCategory.prototype.createDom = function() {
  this.htmlDiv_ = this.createContainer_();
  Blockly.utils.aria.setRole(this.htmlDiv_, Blockly.utils.aria.Role.TREEITEM);
  Blockly.utils.aria.setState(/** @type {!Element} */ (this.htmlDiv_),
      Blockly.utils.aria.State.SELECTED,false);
  Blockly.utils.aria.setState(/** @type {!Element} */ (this.htmlDiv_),
      Blockly.utils.aria.State.LEVEL, this.level_);
  this.htmlDiv_.setAttribute('id', this.id_);

  this.rowDiv_ = this.createRowContainer_();
  this.htmlDiv_.appendChild(this.rowDiv_);

  this.iconSpan_ = this.createIconSpan_();
  Blockly.utils.aria.setRole(this.iconSpan_, Blockly.utils.aria.Role.PRESENTATION);
  this.rowDiv_.appendChild(this.iconSpan_);

  var labelSpan = this.createLabelSpan_();
  this.rowDiv_.appendChild(labelSpan);
  Blockly.utils.aria.setState(/** @type {!Element} */ (this.htmlDiv_),
      Blockly.utils.aria.State.LABELLEDBY, labelSpan.getAttribute('id'));

  if (this.hasChildren()) {
    var contents = /** @type {!Array<!Blockly.ToolboxItem>} */ (this.contents_);
    this.subcategoriesDiv_ = this.createSubCategories_(contents);
    Blockly.utils.aria.setRole(this.subcategoriesDiv_,
        Blockly.utils.aria.Role.GROUP);
    this.htmlDiv_.appendChild(this.subcategoriesDiv_);
  }

  this.addColour_(this.colour_);

  this.setExpanded(this.expanded_);

  return this.htmlDiv_;
};

/**
 * Creates the container that holds the row and any sub categories.
 * @return {!Element} The div that holds the icon and the label.
 * @protected
 */
Blockly.ToolboxCategory.prototype.createContainer_ = function() {
  var container = document.createElement('div');
  Blockly.utils.dom.addClass(container, this.classConfig_['container']);
  return container;
};

/**
 * Creates the container for the icon and the label.
 * @return {!Element} The div that holds the icon and the label.
 * @protected
 */
Blockly.ToolboxCategory.prototype.createRowContainer_ = function() {
  var rowDiv = document.createElement('div');
  Blockly.utils.dom.addClass(rowDiv, this.classConfig_['row']);
  var nestedPadding = Blockly.ToolboxCategory.nestedPadding * this.getLevel();
  nestedPadding = nestedPadding.toString() + 'px';
  this.workspace_.RTL ? rowDiv.style.paddingRight = nestedPadding :
      rowDiv.style.paddingLeft = nestedPadding;
  rowDiv.style.pointerEvents = 'none';
  return rowDiv;
};

/**
 * Creates the span that holds the category icon.
 * @return {!Element} The span that holds the category icon.
 * @protected
 */
Blockly.ToolboxCategory.prototype.createIconSpan_ = function() {
  var toolboxIcon = document.createElement('span');
  if (!this.parentToolbox_.isHorizontal()) {
    Blockly.utils.dom.addClass(toolboxIcon, this.classConfig_['icon']);
    if (this.hasChildren()) {
      toolboxIcon.style.visibility = 'visible';
    }
  }

  toolboxIcon.style.display = 'inline-block';
  return toolboxIcon;
};

/**
 * Creates the span that holds the category label.
 * This should have an id for accessibility purposes.
 * @return {!Element} The span that holds the category label.
 * @protected
 */
Blockly.ToolboxCategory.prototype.createLabelSpan_ = function() {
  var toolboxLabel = document.createElement('span');
  toolboxLabel.setAttribute('id', this.getId() + '.label');
  toolboxLabel.textContent = this.name_;
  Blockly.utils.dom.addClass(toolboxLabel, this.classConfig_['label']);
  return toolboxLabel;
};

/**
 * Create the dom for all subcategories.
 * @param {!Array<!Blockly.ToolboxItem>} contents The category contents.
 * @return {!Element} The div holding all the subcategories.
 * @protected
 */
Blockly.ToolboxCategory.prototype.createSubCategories_ = function(contents) {
  var contentsContainer = document.createElement('div');
  Blockly.utils.dom.addClass(contentsContainer, this.classConfig_['contents']);

  for (var i = 0; i < contents.length; i++) {
    var newCategory = contents[i];
    var dom = newCategory.createDom();
    contentsContainer.appendChild(dom);
  }
  return contentsContainer;
};

/**
 * Updates the colour for this category.
 * @public
 */
Blockly.ToolboxCategory.prototype.refreshTheme = function() {
  this.colour_ = this.getColour_(/** @type {Blockly.utils.toolbox.Category} **/
      (this.toolboxItemDef_));
  this.addColour_(this.colour_);
};

/**
 * Add the strip of colour to the toolbox category.
 * @param {string} colour The category colour.
 * @protected
 */
Blockly.ToolboxCategory.prototype.addColour_ = function(colour) {
  if (colour) {
    var border = Blockly.ToolboxCategory.borderWidth + 'px solid ' +
        (colour || '#ddd');
    if (this.workspace_.RTL) {
      this.rowDiv_.style.borderRight = border;
    } else {
      this.rowDiv_.style.borderLeft = border;
    }
  }
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

/**
 * Opens or closes the current category if it has children.
 * @param {boolean} isExpanded True to expand the category, false to close.
 * @public
 */
Blockly.ToolboxCategory.prototype.setExpanded = function(isExpanded) {
  if (!this.hasChildren() || this.expanded_ == isExpanded) {
    return;
  }
  this.expanded_ = isExpanded;
  if (isExpanded) {
    this.subcategoriesDiv_.style.display = 'block';
    this.openIcon_(this.iconSpan_);
  } else {
    this.subcategoriesDiv_.style.display = 'none';
    this.closeIcon_(this.iconSpan_);
  }
  Blockly.utils.aria.setState(/** @type {!Element} */ (this.htmlDiv_),
      Blockly.utils.aria.State.EXPANDED, isExpanded);

  if (this.hasChildren()) {
    for (var i = 0; i < this.contents_.length; i++) {
      var child = this.contents_[i];
      child.setVisible(isExpanded);
    }
  }

  Blockly.svgResize(this.workspace_);
};

/**
 * Adds appropriate classes to display an open icon.
 * @param {?Element} iconDiv The div that holds the icon.
 * @protected
 */
Blockly.ToolboxCategory.prototype.openIcon_ = function(iconDiv) {
  if (!iconDiv) {
    return;
  }

  Blockly.utils.dom.removeClass(iconDiv, this.classConfig_['closedIcon']);
  Blockly.utils.dom.addClass(iconDiv, this.classConfig_['openIcon']);
};

/**
 * Adds appropriate classes to display a closed icon.
 * @param {?Element} iconDiv The div that holds the icon.
 * @protected
 */
Blockly.ToolboxCategory.prototype.closeIcon_ = function(iconDiv) {
  if (!iconDiv) {
    return;
  }
  Blockly.utils.dom.removeClass(iconDiv, this.classConfig_['openIcon']);
  Blockly.utils.dom.addClass(iconDiv, this.classConfig_['closedIcon']);
};

/**
 * Whether or not this category has subcategories.
 * @return {boolean} True if this category has subcategories, false otherwise.
 * @public
 */
Blockly.ToolboxCategory.prototype.hasChildren = function() {
  return this.hasChildren_;
};

/**
 * Sets whether the category is visible or not. Categories are not visible if
 * they are the child of a parent who has been collapsed.
 * @param {boolean} isVisible True if category should be visible.
 * @public
 */
Blockly.ToolboxCategory.prototype.setVisible = function(isVisible) {
  // TODO: Add ability to hide the category when this is false.
  //  This causes problems for nested categories.
  this.isVisible_ = isVisible;
};

/**
 * Whether the category is visible.
 * @return {boolean} True if the category is visible, false otherwise.
 * @public
 */
Blockly.ToolboxCategory.prototype.isVisible = function() {
  return this.isVisible_;
};

/**
 * @override
 */
Blockly.ToolboxCategory.prototype.isExpanded = function() {
  return this.expanded_;
};

/**
 * @override
 */
Blockly.ToolboxCategory.prototype.isSelectable = function() {
  // TODO: Add && isSelectable_
  return this.isVisible();
};

/**
 * @override
 */
Blockly.ToolboxCategory.prototype.isCollapsible = function() {
  return this.hasChildren();
};

/**
 * @override
 */
Blockly.ToolboxCategory.prototype.onClick = function(_e) {
  this.toggleExpanded();
};

/**
 * @override
 */
Blockly.ToolboxCategory.prototype.setSelected = function(isSelected) {
  if (isSelected) {
    var defaultColour = this.parseColour_(
        Blockly.ToolboxCategory.defaultBackgroundColour);
    this.rowDiv_.style.backgroundColor = this.colour_ || defaultColour;
    Blockly.utils.dom.addClass(this.rowDiv_, this.classConfig_['selected']);
  } else {
    this.rowDiv_.style.backgroundColor = '';
    Blockly.utils.dom.removeClass(this.rowDiv_, this.classConfig_['selected']);
  }
  Blockly.utils.aria.setState(/** @type {!Element} */ (this.htmlDiv_),
      Blockly.utils.aria.State.SELECTED, isSelected);
};

/**
 * @override
 */
Blockly.ToolboxCategory.prototype.toggleExpanded = function() {
  this.setExpanded(!this.expanded_);
};

/**
 * Gets the nested level of the category
 * @return {number} The nested level of the category.
 */
Blockly.ToolboxCategory.prototype.getLevel = function() {
  return this.level_;
};

/**
 * @override
 */
Blockly.ToolboxCategory.prototype.getName = function() {
  return this.name_;
};

/**
 * @override
 */
Blockly.ToolboxCategory.prototype.getParent = function() {
  return this.parent_;
};

/**
 * @override
 */
Blockly.ToolboxCategory.prototype.getDiv = function() {
  return this.htmlDiv_;
};

/**
 * @override
 */
Blockly.ToolboxCategory.prototype.getContents = function() {
  return this.contents_;
};

/**
 * @override
 */
Blockly.ToolboxCategory.prototype.dispose = function() {
  Blockly.utils.dom.removeNode(this.htmlDiv_);
};
