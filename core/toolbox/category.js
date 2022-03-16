/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A toolbox category used to organize blocks in the toolbox.
 */
'use strict';

/**
 * A toolbox category used to organize blocks in the toolbox.
 * @class
 */
goog.module('Blockly.ToolboxCategory');

const Css = goog.require('Blockly.Css');
const aria = goog.require('Blockly.utils.aria');
const colourUtils = goog.require('Blockly.utils.colour');
const dom = goog.require('Blockly.utils.dom');
const object = goog.require('Blockly.utils.object');
const parsing = goog.require('Blockly.utils.parsing');
const registry = goog.require('Blockly.registry');
const toolbox = goog.require('Blockly.utils.toolbox');
/* eslint-disable-next-line no-unused-vars */
const {ICollapsibleToolboxItem} = goog.requireType('Blockly.ICollapsibleToolboxItem');
/* eslint-disable-next-line no-unused-vars */
const {ISelectableToolboxItem} = goog.require('Blockly.ISelectableToolboxItem');
/* eslint-disable-next-line no-unused-vars */
const {IToolbox} = goog.requireType('Blockly.IToolbox');
const {ToolboxItem} = goog.require('Blockly.ToolboxItem');


/**
 * Class for a category in a toolbox.
 * @implements {ISelectableToolboxItem}
 * @alias Blockly.ToolboxCategory
 */
class ToolboxCategory extends ToolboxItem {
  /**
   * @param {!toolbox.CategoryInfo} categoryDef The information needed
   *     to create a category in the toolbox.
   * @param {!IToolbox} toolbox The parent toolbox for the category.
   * @param {ICollapsibleToolboxItem=} opt_parent The parent category or null if
   *     the category does not have a parent.
   */
  constructor(categoryDef, toolbox, opt_parent) {
    super(categoryDef, toolbox, opt_parent);

    /** @type {!toolbox.CategoryInfo} */
    this.toolboxItemDef_;

    /**
     * The name that will be displayed on the category.
     * @type {string}
     * @protected
     */
    this.name_ = '';

    /**
     * The colour of the category.
     * @type {string}
     * @protected
     */
    this.colour_ = '';

    /**
     * The html container for the category.
     * @type {?HTMLDivElement}
     * @protected
     */
    this.htmlDiv_ = null;

    /**
     * The html element for the category row.
     * @type {?HTMLDivElement}
     * @protected
     */
    this.rowDiv_ = null;

    /**
     * The html element that holds children elements of the category row.
     * @type {?HTMLDivElement}
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
     * @type {!ToolboxCategory.CssConfig}
     * @protected
     */
    this.cssConfig_ = this.makeDefaultCssConfig_();

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
     * @type {string|!toolbox.FlyoutItemInfoArray}
     * @protected
     */
    this.flyoutItems_ = [];
  }

  /**
   * Initializes the toolbox item.
   * This includes creating the DOM and updating the state of any items based
   * on the info object.
   * Init should be called immediately after the construction of the toolbox
   * item, to ensure that the category contents are properly parsed.
   * @override
   */
  init() {
    this.parseCategoryDef_(this.toolboxItemDef_);
    this.parseContents_(this.toolboxItemDef_);
    this.createDom_();
    if (this.toolboxItemDef_['hidden'] === 'true') {
      this.hide();
    }
  }


  /**
   * Creates an object holding the default classes for a category.
   * @return {!ToolboxCategory.CssConfig} The configuration object holding
   *    all the CSS classes for a category.
   * @protected
   */
  makeDefaultCssConfig_() {
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
  }

  /**
   * Parses the contents array depending on if the category is a dynamic
   * category, or if its contents are meant to be shown in the flyout.
   * @param {!toolbox.CategoryInfo} categoryDef The information needed
   *     to create a category.
   * @protected
   */
  parseContents_(categoryDef) {
    const contents = categoryDef['contents'];

    if (categoryDef['custom']) {
      this.flyoutItems_ = categoryDef['custom'];
    } else if (contents) {
      for (let i = 0; i < contents.length; i++) {
        const itemDef = contents[i];
        const flyoutItem =
            /** @type {toolbox.FlyoutItemInfo} */ (itemDef);
        this.flyoutItems_.push(flyoutItem);
      }
    }
  }

  /**
   * Parses the non-contents parts of the category def.
   * @param {!toolbox.CategoryInfo} categoryDef The information needed to create
   *     a category.
   * @protected
   */
  parseCategoryDef_(categoryDef) {
    this.name_ = parsing.replaceMessageReferences(categoryDef['name']);
    this.colour_ = this.getColour_(categoryDef);
    object.mixin(
        this.cssConfig_, categoryDef['cssconfig'] || categoryDef['cssConfig']);
  }

  /**
   * Creates the DOM for the category.
   * @return {!HTMLDivElement} The parent element for the category.
   * @protected
   */
  createDom_() {
    this.htmlDiv_ = this.createContainer_();
    aria.setRole(this.htmlDiv_, aria.Role.TREEITEM);
    aria.setState(
        /** @type {!HTMLDivElement} */ (this.htmlDiv_), aria.State.SELECTED,
        false);
    aria.setState(
        /** @type {!HTMLDivElement} */ (this.htmlDiv_), aria.State.LEVEL,
        this.level_);

    this.rowDiv_ = this.createRowContainer_();
    this.rowDiv_.style.pointerEvents = 'auto';
    this.htmlDiv_.appendChild(this.rowDiv_);

    this.rowContents_ = this.createRowContentsContainer_();
    this.rowContents_.style.pointerEvents = 'none';
    this.rowDiv_.appendChild(this.rowContents_);

    this.iconDom_ = this.createIconDom_();
    aria.setRole(this.iconDom_, aria.Role.PRESENTATION);
    this.rowContents_.appendChild(this.iconDom_);

    this.labelDom_ = this.createLabelDom_(this.name_);
    this.rowContents_.appendChild(this.labelDom_);
    aria.setState(
        /** @type {!Element} */ (this.htmlDiv_), aria.State.LABELLEDBY,
        this.labelDom_.getAttribute('id'));

    this.addColourBorder_(this.colour_);

    return this.htmlDiv_;
  }

  /**
   * Creates the container that holds the row and any subcategories.
   * @return {!HTMLDivElement} The div that holds the icon and the label.
   * @protected
   */
  createContainer_() {
    const container =
        /** @type {!HTMLDivElement} */ (document.createElement('div'));
    dom.addClass(container, this.cssConfig_['container']);
    return container;
  }

  /**
   * Creates the parent of the contents container. All clicks will happen on
   * this div.
   * @return {!HTMLDivElement} The div that holds the contents container.
   * @protected
   */
  createRowContainer_() {
    const rowDiv =
        /** @type {!HTMLDivElement} */ (document.createElement('div'));
    dom.addClass(rowDiv, this.cssConfig_['row']);
    let nestedPadding = ToolboxCategory.nestedPadding * this.getLevel();
    nestedPadding = nestedPadding.toString() + 'px';
    this.workspace_.RTL ? rowDiv.style.paddingRight = nestedPadding :
                          rowDiv.style.paddingLeft = nestedPadding;
    return rowDiv;
  }

  /**
   * Creates the container for the label and icon.
   * This is necessary so we can set all subcategory pointer events to none.
   * @return {!HTMLDivElement} The div that holds the icon and the label.
   * @protected
   */
  createRowContentsContainer_() {
    const contentsContainer =
        /** @type {!HTMLDivElement} */ (document.createElement('div'));
    dom.addClass(contentsContainer, this.cssConfig_['rowcontentcontainer']);
    return contentsContainer;
  }

  /**
   * Creates the span that holds the category icon.
   * @return {!Element} The span that holds the category icon.
   * @protected
   */
  createIconDom_() {
    const toolboxIcon = document.createElement('span');
    if (!this.parentToolbox_.isHorizontal()) {
      dom.addClass(toolboxIcon, this.cssConfig_['icon']);
    }

    toolboxIcon.style.display = 'inline-block';
    return toolboxIcon;
  }

  /**
   * Creates the span that holds the category label.
   * This should have an ID for accessibility purposes.
   * @param {string} name The name of the category.
   * @return {!Element} The span that holds the category label.
   * @protected
   */
  createLabelDom_(name) {
    const toolboxLabel = document.createElement('span');
    toolboxLabel.setAttribute('id', this.getId() + '.label');
    toolboxLabel.textContent = name;
    dom.addClass(toolboxLabel, this.cssConfig_['label']);
    return toolboxLabel;
  }

  /**
   * Updates the colour for this category.
   * @public
   */
  refreshTheme() {
    this.colour_ = this.getColour_(/** @type {toolbox.CategoryInfo} **/
                                   (this.toolboxItemDef_));
    this.addColourBorder_(this.colour_);
  }

  /**
   * Add the strip of colour to the toolbox category.
   * @param {string} colour The category colour.
   * @protected
   */
  addColourBorder_(colour) {
    if (colour) {
      const border =
          ToolboxCategory.borderWidth + 'px solid ' + (colour || '#ddd');
      if (this.workspace_.RTL) {
        this.rowDiv_.style.borderRight = border;
      } else {
        this.rowDiv_.style.borderLeft = border;
      }
    }
  }

  /**
   * Gets either the colour or the style for a category.
   * @param {!toolbox.CategoryInfo} categoryDef The object holding
   *    information on the category.
   * @return {string} The hex colour for the category.
   * @protected
   */
  getColour_(categoryDef) {
    const styleName =
        categoryDef['categorystyle'] || categoryDef['categoryStyle'];
    const colour = categoryDef['colour'];

    if (colour && styleName) {
      console.warn(
          'Toolbox category "' + this.name_ +
          '" must not have both a style and a colour');
    } else if (styleName) {
      return this.getColourfromStyle_(styleName);
    } else {
      return this.parseColour_(colour);
    }
    return '';
  }

  /**
   * Sets the colour for the category using the style name and returns the new
   * colour as a hex string.
   * @param {string} styleName Name of the style.
   * @return {string} The hex colour for the category.
   * @private
   */
  getColourfromStyle_(styleName) {
    const theme = this.workspace_.getTheme();
    if (styleName && theme) {
      const style = theme.categoryStyles[styleName];
      if (style && style.colour) {
        return this.parseColour_(style.colour);
      } else {
        console.warn(
            'Style "' + styleName + '" must exist and contain a colour value');
      }
    }
    return '';
  }

  /**
   * Gets the HTML element that is clickable.
   * The parent toolbox element receives clicks. The parent toolbox will add an
   * ID to this element so it can pass the onClick event to the correct
   * toolboxItem.
   * @return {!Element} The HTML element that receives clicks.
   * @public
   */
  getClickTarget() {
    return /** @type {!Element} */ (this.rowDiv_);
  }

  /**
   * Parses the colour on the category.
   * @param {number|string} colourValue HSV hue value (0 to 360), #RRGGBB
   *     string, or a message reference string pointing to one of those two
   *     values.
   * @return {string} The hex colour for the category.
   * @private
   */
  parseColour_(colourValue) {
    // Decode the colour for any potential message references
    // (eg. `%{BKY_MATH_HUE}`).
    const colour = parsing.replaceMessageReferences(colourValue);
    if (colour == null || colour === '') {
      // No attribute. No colour.
      return '';
    } else {
      const hue = Number(colour);
      if (!isNaN(hue)) {
        return colourUtils.hueToHex(hue);
      } else {
        const hex = colourUtils.parse(colour);
        if (hex) {
          return hex;
        } else {
          console.warn(
              'Toolbox category "' + this.name_ +
              '" has unrecognized colour attribute: ' + colour);
          return '';
        }
      }
    }
  }

  /**
   * Adds appropriate classes to display an open icon.
   * @param {?Element} iconDiv The div that holds the icon.
   * @protected
   */
  openIcon_(iconDiv) {
    if (!iconDiv) {
      return;
    }
    dom.removeClasses(iconDiv, this.cssConfig_['closedicon']);
    dom.addClass(iconDiv, this.cssConfig_['openicon']);
  }

  /**
   * Adds appropriate classes to display a closed icon.
   * @param {?Element} iconDiv The div that holds the icon.
   * @protected
   */
  closeIcon_(iconDiv) {
    if (!iconDiv) {
      return;
    }
    dom.removeClasses(iconDiv, this.cssConfig_['openicon']);
    dom.addClass(iconDiv, this.cssConfig_['closedicon']);
  }

  /**
   * Sets whether the category is visible or not.
   * For a category to be visible its parent category must also be expanded.
   * @param {boolean} isVisible True if category should be visible.
   * @protected
   */
  setVisible_(isVisible) {
    this.htmlDiv_.style.display = isVisible ? 'block' : 'none';
    this.isHidden_ = !isVisible;

    if (this.parentToolbox_.getSelectedItem() === this) {
      this.parentToolbox_.clearSelection();
    }
  }

  /**
   * Hide the category.
   */
  hide() {
    this.setVisible_(false);
  }

  /**
   * Show the category. Category will only appear if its parent category is also
   * expanded.
   */
  show() {
    this.setVisible_(true);
  }

  /**
   * Whether the category is visible.
   * A category is only visible if all of its ancestors are expanded and
   * isHidden_ is false.
   * @return {boolean} True if the category is visible, false otherwise.
   * @public
   */
  isVisible() {
    return !this.isHidden_ && this.allAncestorsExpanded_();
  }

  /**
   * Whether all ancestors of a category (parent and parent's parent, etc.) are
   * expanded.
   * @return {boolean} True only if every ancestor is expanded
   * @protected
   */
  allAncestorsExpanded_() {
    let category = this;
    while (category.getParent()) {
      category = category.getParent();
      if (!category.isExpanded()) {
        return false;
      }
    }
    return true;
  }

  /**
   * @override
   */
  isSelectable() {
    return this.isVisible() && !this.isDisabled_;
  }

  /**
   * Handles when the toolbox item is clicked.
   * @param {!Event} _e Click event to handle.
   * @public
   */
  onClick(_e) {
    // No-op
  }

  /**
   * Sets the current category as selected.
   * @param {boolean} isSelected True if this category is selected, false
   *     otherwise.
   * @public
   */
  setSelected(isSelected) {
    if (isSelected) {
      const defaultColour =
          this.parseColour_(ToolboxCategory.defaultBackgroundColour);
      this.rowDiv_.style.backgroundColor = this.colour_ || defaultColour;
      dom.addClass(this.rowDiv_, this.cssConfig_['selected']);
    } else {
      this.rowDiv_.style.backgroundColor = '';
      dom.removeClass(this.rowDiv_, this.cssConfig_['selected']);
    }
    aria.setState(
        /** @type {!Element} */ (this.htmlDiv_), aria.State.SELECTED,
        isSelected);
  }

  /**
   * Sets whether the category is disabled.
   * @param {boolean} isDisabled True to disable the category, false otherwise.
   */
  setDisabled(isDisabled) {
    this.isDisabled_ = isDisabled;
    this.getDiv().setAttribute('disabled', isDisabled);
    isDisabled ? this.getDiv().setAttribute('disabled', 'true') :
                 this.getDiv().removeAttribute('disabled');
  }

  /**
   * Gets the name of the category. Used for emitting events.
   * @return {string} The name of the toolbox item.
   * @public
   */
  getName() {
    return this.name_;
  }

  /**
   * @override
   */
  getParent() {
    return this.parent_;
  }

  /**
   * @override
   */
  getDiv() {
    return this.htmlDiv_;
  }

  /**
   * Gets the contents of the category. These are items that are meant to be
   * displayed in the flyout.
   * @return {!toolbox.FlyoutItemInfoArray|string} The definition
   *     of items to be displayed in the flyout.
   * @public
   */
  getContents() {
    return this.flyoutItems_;
  }

  /**
   * Updates the contents to be displayed in the flyout.
   * If the flyout is open when the contents are updated, refreshSelection on
   * the toolbox must also be called.
   * @param {!toolbox.FlyoutDefinition|string} contents The contents
   *     to be displayed in the flyout. A string can be supplied to create a
   *     dynamic category.
   * @public
   */
  updateFlyoutContents(contents) {
    this.flyoutItems_ = [];

    if (typeof contents === 'string') {
      this.toolboxItemDef_['custom'] = contents;
    } else {
      // Removes old custom field when contents is updated.
      delete this.toolboxItemDef_['custom'];
      this.toolboxItemDef_['contents'] =
          toolbox.convertFlyoutDefToJsonArray(contents);
    }
    this.parseContents_(
        /** @type {toolbox.CategoryInfo} */ (this.toolboxItemDef_));
  }

  /**
   * @override
   */
  dispose() {
    dom.removeNode(this.htmlDiv_);
  }
}

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
ToolboxCategory.CssConfig;

/**
 * Name used for registering a toolbox category.
 * @type {string}
 */
ToolboxCategory.registrationName = 'category';

/**
 * The number of pixels to move the category over at each nested level.
 * @type {number}
 */
ToolboxCategory.nestedPadding = 19;

/**
 * The width in pixels of the strip of colour next to each category.
 * @type {number}
 */
ToolboxCategory.borderWidth = 8;

/**
 * The default colour of the category. This is used as the background colour of
 * the category when it is selected.
 * @type {string}
 */
ToolboxCategory.defaultBackgroundColour = '#57e';

/**
 * CSS for Toolbox.  See css.js for use.
 */
Css.register(`
.blocklyTreeRow:not(.blocklyTreeSelected):hover {
  background-color: rgba(255, 255, 255, .2);
}

.blocklyToolboxDiv[layout="h"] .blocklyToolboxCategory {
  margin: 1px 5px 1px 0;
}

.blocklyToolboxDiv[dir="RTL"][layout="h"] .blocklyToolboxCategory {
  margin: 1px 0 1px 5px;
}

.blocklyTreeRow {
  height: 22px;
  line-height: 22px;
  margin-bottom: 3px;
  padding-right: 8px;
  white-space: nowrap;
}

.blocklyToolboxDiv[dir="RTL"] .blocklyTreeRow {
  margin-left: 8px;
  padding-right: 0;
}

.blocklyTreeIcon {
  background-image: url(<<<PATH>>>/sprites.png);
  height: 16px;
  vertical-align: middle;
  visibility: hidden;
  width: 16px;
}

.blocklyTreeIconClosed {
  background-position: -32px -1px;
}

.blocklyToolboxDiv[dir="RTL"] .blocklyTreeIconClosed {
  background-position: 0 -1px;
}

.blocklyTreeSelected>.blocklyTreeIconClosed {
  background-position: -32px -17px;
}

.blocklyToolboxDiv[dir="RTL"] .blocklyTreeSelected>.blocklyTreeIconClosed {
  background-position: 0 -17px;
}

.blocklyTreeIconOpen {
  background-position: -16px -1px;
}

.blocklyTreeSelected>.blocklyTreeIconOpen {
  background-position: -16px -17px;
}

.blocklyTreeLabel {
  cursor: default;
  font: 16px sans-serif;
  padding: 0 3px;
  vertical-align: middle;
}

.blocklyToolboxDelete .blocklyTreeLabel {
  cursor: url("<<<PATH>>>/handdelete.cur"), auto;
}

.blocklyTreeSelected .blocklyTreeLabel {
  color: #fff;
}
`);

registry.register(
    registry.Type.TOOLBOX_ITEM, ToolboxCategory.registrationName,
    ToolboxCategory);

exports.ToolboxCategory = ToolboxCategory;
