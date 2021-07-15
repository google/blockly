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

goog.require('Blockly.ISelectableToolboxItem');
goog.require('Blockly.registry');
goog.require('Blockly.ToolboxItem');
goog.require('Blockly.utils');
goog.require('Blockly.utils.aria');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.toolbox');

goog.requireType('Blockly.ICollapsibleToolboxItem');
goog.requireType('Blockly.IToolbox');


/**
 * Class for a category in a toolbox.
 * @param {!Blockly.utils.toolbox.CategoryInfo} categoryDef The information needed
 *     to create a category in the toolbox.
 * @param {!Blockly.IToolbox} toolbox The parent toolbox for the category.
 * @param {Blockly.ICollapsibleToolboxItem=} opt_parent The parent category or null if
 *     the category does not have a parent.
 * @constructor
 * @extends {Blockly.ToolboxItem}
 * @implements {Blockly.ISelectableToolboxItem}
 */
Blockly.ToolboxCategory = function(categoryDef, toolbox, opt_parent) {
  Blockly.ToolboxCategory.superClass_.constructor.call(
      this, categoryDef, toolbox, opt_parent);

  /**
   * The name that will be displayed on the category.
   * @type {string}
   * @protected
   */
  this.name_ = Blockly.utils.replaceMessageReferences(categoryDef['name']);

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
   * The html element that holds children elements of the category row.
   * @type {?Element}
   * @protected
   */
  this.rowContents_ = null;

  /**
   * The html element for the toolbox icon.
   * @type {?Element}
   * @protected
   */
  this.iconDom_ = null;

  /**
   * The html element for the toolbox label.
   * @type {?Element}
   * @protected
   */
  this.labelDom_ = null;

  /**
   * All the css class names that are used to create a category.
   * @type {!Blockly.ToolboxCategory.CssConfig}
   * @protected
   */
  this.cssConfig_ = this.makeDefaultCssConfig_();

  var cssConfig = categoryDef['cssconfig'] || categoryDef['cssConfig'];
  Blockly.utils.object.mixin(this.cssConfig_, cssConfig);

  /**
   * True if the category is meant to be hidden, false otherwise.
   * @type {boolean}
   * @protected
   */
  this.isHidden_ = false;

  /**
   * True if this category is disabled, false otherwise.
   * @type {boolean}
   * @protected
   */
  this.isDisabled_ = false;

  /**
   * The flyout items for this category.
   * @type {string|!Blockly.utils.toolbox.FlyoutItemInfoArray}
   * @protected
   */
  this.flyoutItems_ = [];

  this.parseContents_(categoryDef);
};

Blockly.utils.object.inherits(Blockly.ToolboxCategory, Blockly.ToolboxItem);

/**
 * All the CSS class names that are used to create a category.
 * @typedef {{
 *            container:(string|undefined),
 *            row:(string|undefined),
 *            rowcontentcontainer:(string|undefined),
 *            icon:(string|undefined),
 *            label:(string|undefined),
 *            selected:(string|undefined),
 *            openicon:(string|undefined),
 *            closedicon:(string|undefined)
 *          }}
 */
Blockly.ToolboxCategory.CssConfig;

/**
 * Name used for registering a toolbox category.
 * @const {string}
 */
Blockly.ToolboxCategory.registrationName = 'category';

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
 * Creates an object holding the default classes for a category.
 * @return {!Blockly.ToolboxCategory.CssConfig} The configuration object holding
 *    all the CSS classes for a category.
 * @protected
 */
Blockly.ToolboxCategory.prototype.makeDefaultCssConfig_ = function() {
  return {
    'container': 'blocklyToolboxCategory',
    'row': 'blocklyTreeRow',
    'rowcontentcontainer': 'blocklyTreeRowContentContainer',
    'icon': 'blocklyTreeIcon',
    'label': 'blocklyTreeLabel',
    'contents': 'blocklyToolboxContents',
    'selected': 'blocklyTreeSelected',
    'openicon': 'blocklyTreeIconOpen',
    'closedicon': 'blocklyTreeIconClosed',
  };
};

/**
 * Parses the contents array depending on if the category is a dynamic category,
 * or if its contents are meant to be shown in the flyout.
 * @param {!Blockly.utils.toolbox.CategoryInfo} categoryDef The information needed
 *     to create a category.
 * @protected
 */
Blockly.ToolboxCategory.prototype.parseContents_ = function(categoryDef) {
  var contents = categoryDef['contents'];

  if (categoryDef['custom']) {
    this.flyoutItems_ = categoryDef['custom'];
  } else if (contents) {
    for (var i = 0, itemDef; (itemDef = contents[i]); i++) {
      var flyoutItem = /** @type {Blockly.utils.toolbox.FlyoutItemInfo} */ (itemDef);
      this.flyoutItems_.push(flyoutItem);
    }
  }
};

/**
 * @override
 */
Blockly.ToolboxCategory.prototype.init = function() {
  this.createDom_();
  if (this.toolboxItemDef_['hidden'] == 'true') {
    this.hide();
  }
};

/**
 * Creates the DOM for the category.
 * @return {!Element} The parent element for the category.
 * @protected
 */
Blockly.ToolboxCategory.prototype.createDom_ = function() {
  this.htmlDiv_ = this.createContainer_();
  Blockly.utils.aria.setRole(this.htmlDiv_, Blockly.utils.aria.Role.TREEITEM);
  Blockly.utils.aria.setState(/** @type {!Element} */ (this.htmlDiv_),
      Blockly.utils.aria.State.SELECTED,false);
  Blockly.utils.aria.setState(/** @type {!Element} */ (this.htmlDiv_),
      Blockly.utils.aria.State.LEVEL, this.level_);

  this.rowDiv_ = this.createRowContainer_();
  this.rowDiv_.style.pointerEvents = 'auto';
  this.htmlDiv_.appendChild(this.rowDiv_);

  this.rowContents_ = this.createRowContentsContainer_();
  this.rowContents_.style.pointerEvents = 'none';
  this.rowDiv_.appendChild(this.rowContents_);

  this.iconDom_ = this.createIconDom_();
  Blockly.utils.aria.setRole(this.iconDom_, Blockly.utils.aria.Role.PRESENTATION);
  this.rowContents_.appendChild(this.iconDom_);

  this.labelDom_ = this.createLabelDom_(this.name_);
  this.rowContents_.appendChild(this.labelDom_);
  Blockly.utils.aria.setState(/** @type {!Element} */ (this.htmlDiv_),
      Blockly.utils.aria.State.LABELLEDBY, this.labelDom_.getAttribute('id'));

  this.addColourBorder_(this.colour_);

  return this.htmlDiv_;
};

/**
 * Creates the container that holds the row and any subcategories.
 * @return {!Element} The div that holds the icon and the label.
 * @protected
 */
Blockly.ToolboxCategory.prototype.createContainer_ = function() {
  var container = document.createElement('div');
  Blockly.utils.dom.addClass(container, this.cssConfig_['container']);
  return container;
};

/**
 * Creates the parent of the contents container. All clicks will happen on this
 * div.
 * @return {!Element} The div that holds the contents container.
 * @protected
 */
Blockly.ToolboxCategory.prototype.createRowContainer_ = function() {
  var rowDiv = document.createElement('div');
  Blockly.utils.dom.addClass(rowDiv, this.cssConfig_['row']);
  var nestedPadding = Blockly.ToolboxCategory.nestedPadding * this.getLevel();
  nestedPadding = nestedPadding.toString() + 'px';
  this.workspace_.RTL ? rowDiv.style.paddingRight = nestedPadding :
      rowDiv.style.paddingLeft = nestedPadding;
  return rowDiv;
};

/**
 * Creates the container for the label and icon.
 * This is necessary so we can set all subcategory pointer events to none.
 * @return {!Element} The div that holds the icon and the label.
 * @protected
 */
Blockly.ToolboxCategory.prototype.createRowContentsContainer_ = function() {
  var contentsContainer = document.createElement('div');
  Blockly.utils.dom.addClass(contentsContainer, this.cssConfig_['rowcontentcontainer']);
  return contentsContainer;
};

/**
 * Creates the span that holds the category icon.
 * @return {!Element} The span that holds the category icon.
 * @protected
 */
Blockly.ToolboxCategory.prototype.createIconDom_ = function() {
  var toolboxIcon = document.createElement('span');
  if (!this.parentToolbox_.isHorizontal()) {
    Blockly.utils.dom.addClass(toolboxIcon, this.cssConfig_['icon']);
  }

  toolboxIcon.style.display = 'inline-block';
  return toolboxIcon;
};

/**
 * Creates the span that holds the category label.
 * This should have an ID for accessibility purposes.
 * @param {string} name The name of the category.
 * @return {!Element} The span that holds the category label.
 * @protected
 */
Blockly.ToolboxCategory.prototype.createLabelDom_ = function(name) {
  var toolboxLabel = document.createElement('span');
  toolboxLabel.setAttribute('id', this.getId() + '.label');
  toolboxLabel.textContent = name;
  Blockly.utils.dom.addClass(toolboxLabel, this.cssConfig_['label']);
  return toolboxLabel;
};

/**
 * Updates the colour for this category.
 * @public
 */
Blockly.ToolboxCategory.prototype.refreshTheme = function() {
  this.colour_ = this.getColour_(/** @type {Blockly.utils.toolbox.CategoryInfo} **/
      (this.toolboxItemDef_));
  this.addColourBorder_(this.colour_);
};

/**
 * Add the strip of colour to the toolbox category.
 * @param {string} colour The category colour.
 * @protected
 */
Blockly.ToolboxCategory.prototype.addColourBorder_ = function(colour) {
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
 * Gets either the colour or the style for a category.
 * @param {!Blockly.utils.toolbox.CategoryInfo} categoryDef The object holding
 *    information on the category.
 * @return {string} The hex colour for the category.
 * @protected
 */
Blockly.ToolboxCategory.prototype.getColour_ = function(categoryDef) {
  var styleName = categoryDef['categorystyle'] || categoryDef['categoryStyle'];
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
 * Sets the colour for the category using the style name and returns the new
 * colour as a hex string.
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
 * Gets the HTML element that is clickable.
 * The parent toolbox element receives clicks. The parent toolbox will add an ID
 * to this element so it can pass the onClick event to the correct toolboxItem.
 * @return {!Element} The HTML element that receives clicks.
 * @public
 */
Blockly.ToolboxCategory.prototype.getClickTarget = function() {
  return /** @type {!Element} */(this.rowDiv_);
};

/**
 * Parses the colour on the category.
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
 * Adds appropriate classes to display an open icon.
 * @param {?Element} iconDiv The div that holds the icon.
 * @protected
 */
Blockly.ToolboxCategory.prototype.openIcon_ = function(iconDiv) {
  if (!iconDiv) {
    return;
  }
  Blockly.utils.dom.removeClasses(iconDiv, this.cssConfig_['closedicon']);
  Blockly.utils.dom.addClass(iconDiv, this.cssConfig_['openicon']);
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
  Blockly.utils.dom.removeClasses(iconDiv, this.cssConfig_['openicon']);
  Blockly.utils.dom.addClass(iconDiv, this.cssConfig_['closedicon']);
};

/**
 * Sets whether the category is visible or not.
 * For a category to be visible its parent category must also be expanded.
 * @param {boolean} isVisible True if category should be visible.
 * @protected
 */
Blockly.ToolboxCategory.prototype.setVisible_ = function(isVisible) {
  this.htmlDiv_.style.display = isVisible ? 'block' : 'none';
  this.isHidden_ = !isVisible;

  if (this.parentToolbox_.getSelectedItem() == this) {
    this.parentToolbox_.clearSelection();
  }
};

/**
 * Hide the category.
 */
Blockly.ToolboxCategory.prototype.hide = function() {
  this.setVisible_(false);
};

/**
 * Show the category. Category will only appear if its parent category is also
 * expanded.
 */
Blockly.ToolboxCategory.prototype.show = function() {
  this.setVisible_(true);
};

/**
 * Whether the category is visible.
 * A category is only visible if all of its ancestors are expanded and isHidden_ is false.
 * @return {boolean} True if the category is visible, false otherwise.
 * @public
 */
Blockly.ToolboxCategory.prototype.isVisible = function() {
  return !this.isHidden_ && this.allAncestorsExpanded_();
};

/**
 * Whether all ancestors of a category (parent and parent's parent, etc.) are expanded.
 * @return {boolean} True only if every ancestor is expanded
 * @protected
 */
Blockly.ToolboxCategory.prototype.allAncestorsExpanded_ = function() {
  var category = this;
  while (category.getParent()) {
    category = category.getParent();
    if (!category.isExpanded()) {
      return false;
    }
  }
  return true;
};

/**
 * @override
 */
Blockly.ToolboxCategory.prototype.isSelectable = function() {
  return this.isVisible() && !this.isDisabled_;
};

/**
 * Handles when the toolbox item is clicked.
 * @param {!Event} _e Click event to handle.
 * @public
 */
Blockly.ToolboxCategory.prototype.onClick = function(_e) {
  // No-op
};

/**
 * Sets the current category as selected.
 * @param {boolean} isSelected True if this category is selected, false
 *     otherwise.
 * @public
 */
Blockly.ToolboxCategory.prototype.setSelected = function(isSelected) {
  if (isSelected) {
    var defaultColour = this.parseColour_(
        Blockly.ToolboxCategory.defaultBackgroundColour);
    this.rowDiv_.style.backgroundColor = this.colour_ || defaultColour;
    Blockly.utils.dom.addClass(this.rowDiv_, this.cssConfig_['selected']);
  } else {
    this.rowDiv_.style.backgroundColor = '';
    Blockly.utils.dom.removeClass(this.rowDiv_, this.cssConfig_['selected']);
  }
  Blockly.utils.aria.setState(/** @type {!Element} */ (this.htmlDiv_),
      Blockly.utils.aria.State.SELECTED, isSelected);
};

/**
 * Sets whether the category is disabled.
 * @param {boolean} isDisabled True to disable the category, false otherwise.
 */
Blockly.ToolboxCategory.prototype.setDisabled = function(isDisabled) {
  this.isDisabled_ = isDisabled;
  this.getDiv().setAttribute('disabled', isDisabled);
  isDisabled ? this.getDiv().setAttribute('disabled', 'true') :
      this.getDiv().removeAttribute('disabled');
};

/**
 * Gets the name of the category. Used for emitting events.
 * @return {string} The name of the toolbox item.
 * @public
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
 * Gets the contents of the category. These are items that are meant to be
 * displayed in the flyout.
 * @return {!Blockly.utils.toolbox.FlyoutItemInfoArray|string} The definition
 *     of items to be displayed in the flyout.
 * @public
 */
Blockly.ToolboxCategory.prototype.getContents = function() {
  return this.flyoutItems_;
};

/**
 * Updates the contents to be displayed in the flyout.
 * If the flyout is open when the contents are updated, refreshSelection on the
 * toolbox must also be called.
 * @param {!Blockly.utils.toolbox.FlyoutDefinition|string} contents The contents
 *     to be displayed in the flyout. A string can be supplied to create a
 *     dynamic category.
 * @public
 */
Blockly.ToolboxCategory.prototype.updateFlyoutContents = function(contents) {
  this.flyoutItems_ = [];

  if (typeof contents == 'string') {
    this.toolboxItemDef_['custom'] = contents;
  } else {
    // Removes old custom field when contents is updated.
    delete this.toolboxItemDef_['custom'];
    this.toolboxItemDef_['contents'] =
        Blockly.utils.toolbox.convertFlyoutDefToJsonArray(contents);
  }
  this.parseContents_(
      /** @type {Blockly.utils.toolbox.CategoryInfo} */ (this.toolboxItemDef_));
};

/**
 * @override
 */
Blockly.ToolboxCategory.prototype.dispose = function() {
  Blockly.utils.dom.removeNode(this.htmlDiv_);
};

/**
 * CSS for Toolbox.  See css.js for use.
 */
Blockly.Css.register([
  /* eslint-disable indent */
  '.blocklyTreeRow:not(.blocklyTreeSelected):hover {',
    'background-color: rgba(255, 255, 255, 0.2);',
  '}',

  '.blocklyToolboxDiv[layout="h"] .blocklyToolboxCategory {',
    'margin: 1px 5px 1px 0;',
  '}',

  '.blocklyToolboxDiv[dir="RTL"][layout="h"] .blocklyToolboxCategory {',
    'margin: 1px 0 1px 5px;',
  '}',

  '.blocklyTreeRow {',
    'height: 22px;',
    'line-height: 22px;',
    'margin-bottom: 3px;',
    'padding-right: 8px;',
    'white-space: nowrap;',
  '}',

  '.blocklyToolboxDiv[dir="RTL"] .blocklyTreeRow {',
    'margin-left: 8px;',
    'padding-right: 0px',
  '}',

  '.blocklyTreeIcon {',
    'background-image: url(<<<PATH>>>/sprites.png);',
    'height: 16px;',
    'vertical-align: middle;',
    'visibility: hidden;',
    'width: 16px;',
  '}',

  '.blocklyTreeIconClosed {',
    'background-position: -32px -1px;',
  '}',

  '.blocklyToolboxDiv[dir="RTL"] .blocklyTreeIconClosed {',
    'background-position: 0 -1px;',
  '}',

  '.blocklyTreeSelected>.blocklyTreeIconClosed {',
    'background-position: -32px -17px;',
  '}',

  '.blocklyToolboxDiv[dir="RTL"] .blocklyTreeSelected>.blocklyTreeIconClosed {',
    'background-position: 0 -17px;',
  '}',

  '.blocklyTreeIconOpen {',
    'background-position: -16px -1px;',
  '}',

  '.blocklyTreeSelected>.blocklyTreeIconOpen {',
    'background-position: -16px -17px;',
  '}',

  '.blocklyTreeLabel {',
    'cursor: default;',
    'font: 16px sans-serif;',
    'padding: 0 3px;',
    'vertical-align: middle;',
  '}',

  '.blocklyToolboxDelete .blocklyTreeLabel {',
    'cursor: url("<<<PATH>>>/handdelete.cur"), auto;',
  '}',

  '.blocklyTreeSelected .blocklyTreeLabel {',
    'color: #fff;',
  '}'
  /* eslint-enable indent */
]);

Blockly.registry.register(Blockly.registry.Type.TOOLBOX_ITEM,
    Blockly.ToolboxCategory.registrationName, Blockly.ToolboxCategory);
