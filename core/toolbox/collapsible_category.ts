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
goog.module('Blockly.CollapsibleToolboxCategory');

const aria = goog.require('Blockly.utils.aria');
const dom = goog.require('Blockly.utils.dom');
const registry = goog.require('Blockly.registry');
const toolbox = goog.require('Blockly.utils.toolbox');
/* eslint-disable-next-line no-unused-vars */
const {ICollapsibleToolboxItem} = goog.require('Blockly.ICollapsibleToolboxItem');
/* eslint-disable-next-line no-unused-vars */
const {IToolboxItem} = goog.requireType('Blockly.IToolboxItem');
/* eslint-disable-next-line no-unused-vars */
const {IToolbox} = goog.requireType('Blockly.IToolbox');
const {ToolboxCategory} = goog.require('Blockly.ToolboxCategory');
const {ToolboxSeparator} = goog.require('Blockly.ToolboxSeparator');


/**
 * Class for a category in a toolbox that can be collapsed.
 * @implements {ICollapsibleToolboxItem}
 * @alias Blockly.CollapsibleToolboxCategory
 */
class CollapsibleToolboxCategory extends ToolboxCategory {
  /**
   * @param {!toolbox.CategoryInfo} categoryDef The information needed
   *     to create a category in the toolbox.
   * @param {!IToolbox} toolbox The parent toolbox for the category.
   * @param {ICollapsibleToolboxItem=} opt_parent The parent category or null if
   *     the category does not have a parent.
   */
  constructor(categoryDef, toolbox, opt_parent) {
    super(categoryDef, toolbox, opt_parent);

    /**
     * Container for any child categories.
     * @type {?HTMLDivElement}
     * @protected
     */
    this.subcategoriesDiv_ = null;

    /**
     * Whether or not the category should display its subcategories.
     * @type {boolean}
     * @protected
     */
    this.expanded_ = false;

    /**
     * The child toolbox items for this category.
     * @type {!Array<!IToolboxItem>}
     * @protected
     */
    this.toolboxItems_ = [];
  }

  /**
   * @override
   */
  makeDefaultCssConfig_() {
    const cssConfig = super.makeDefaultCssConfig_();
    cssConfig['contents'] = 'blocklyToolboxContents';
    return cssConfig;
  }

  /**
   * @override
   */
  parseContents_(categoryDef) {
    const contents = categoryDef['contents'];
    let prevIsFlyoutItem = true;

    if (categoryDef['custom']) {
      this.flyoutItems_ = categoryDef['custom'];
    } else if (contents) {
      for (let i = 0; i < contents.length; i++) {
        const itemDef = contents[i];
        // Separators can exist as either a flyout item or a toolbox item so
        // decide where it goes based on the type of the previous item.
        if (!registry.hasItem(registry.Type.TOOLBOX_ITEM, itemDef['kind']) ||
            (itemDef['kind'].toLowerCase() ===
                 ToolboxSeparator.registrationName &&
             prevIsFlyoutItem)) {
          const flyoutItem = /** @type {toolbox.FlyoutItemInfo} */ (itemDef);
          this.flyoutItems_.push(flyoutItem);
          prevIsFlyoutItem = true;
        } else {
          this.createToolboxItem_(itemDef);
          prevIsFlyoutItem = false;
        }
      }
    }
  }

  /**
   * Creates a toolbox item and adds it to the list of toolbox items.
   * @param {!toolbox.ToolboxItemInfo} itemDef The information needed
   *     to create a toolbox item.
   * @private
   */
  createToolboxItem_(itemDef) {
    let registryName = itemDef['kind'];
    const categoryDef = /** @type {!toolbox.CategoryInfo} */ (itemDef);

    // Categories that are collapsible are created using a class registered
    // under a different name.
    if (registryName.toUpperCase() == 'CATEGORY' &&
        toolbox.isCategoryCollapsible(categoryDef)) {
      registryName = CollapsibleToolboxCategory.registrationName;
    }
    const ToolboxItemClass =
        registry.getClass(registry.Type.TOOLBOX_ITEM, registryName);
    const toolboxItem =
        new ToolboxItemClass(itemDef, this.parentToolbox_, this);
    this.toolboxItems_.push(toolboxItem);
  }

  /**
   * @override
   */
  init() {
    super.init();

    this.setExpanded(
        this.toolboxItemDef_['expanded'] === 'true' ||
        this.toolboxItemDef_['expanded']);
  }

  /**
   * @override
   */
  createDom_() {
    super.createDom_();

    const subCategories = this.getChildToolboxItems();
    this.subcategoriesDiv_ = this.createSubCategoriesDom_(subCategories);
    aria.setRole(this.subcategoriesDiv_, aria.Role.GROUP);
    this.htmlDiv_.appendChild(this.subcategoriesDiv_);

    return this.htmlDiv_;
  }

  /**
   * @override
   */
  createIconDom_() {
    const toolboxIcon = document.createElement('span');
    if (!this.parentToolbox_.isHorizontal()) {
      dom.addClass(toolboxIcon, this.cssConfig_['icon']);
      toolboxIcon.style.visibility = 'visible';
    }

    toolboxIcon.style.display = 'inline-block';
    return toolboxIcon;
  }

  /**
   * Create the DOM for all subcategories.
   * @param {!Array<!IToolboxItem>} subcategories The subcategories.
   * @return {!HTMLDivElement} The div holding all the subcategories.
   * @protected
   */
  createSubCategoriesDom_(subcategories) {
    const contentsContainer =
        /** @type {!HTMLDivElement} */ (document.createElement('div'));
    dom.addClass(contentsContainer, this.cssConfig_['contents']);

    for (let i = 0; i < subcategories.length; i++) {
      const newCategory = subcategories[i];
      newCategory.init();
      const newCategoryDiv = newCategory.getDiv();
      contentsContainer.appendChild(newCategoryDiv);
      if (newCategory.getClickTarget) {
        newCategory.getClickTarget().setAttribute('id', newCategory.getId());
      }
    }
    return contentsContainer;
  }

  /**
   * Opens or closes the current category.
   * @param {boolean} isExpanded True to expand the category, false to close.
   * @public
   */
  setExpanded(isExpanded) {
    if (this.expanded_ === isExpanded) {
      return;
    }
    this.expanded_ = isExpanded;
    if (isExpanded) {
      this.subcategoriesDiv_.style.display = 'block';
      this.openIcon_(this.iconDom_);
    } else {
      this.subcategoriesDiv_.style.display = 'none';
      this.closeIcon_(this.iconDom_);
    }
    aria.setState(
        /** @type {!HTMLDivElement} */ (this.htmlDiv_), aria.State.EXPANDED,
        isExpanded);

    this.parentToolbox_.handleToolboxItemResize();
  }

  /**
   * @override
   */
  setVisible_(isVisible) {
    this.htmlDiv_.style.display = isVisible ? 'block' : 'none';
    const childToolboxItems = this.getChildToolboxItems();
    for (let i = 0; i < childToolboxItems.length; i++) {
      const child = childToolboxItems[i];
      child.setVisible_(isVisible);
    }
    this.isHidden_ = !isVisible;

    if (this.parentToolbox_.getSelectedItem() === this) {
      this.parentToolbox_.clearSelection();
    }
  }

  /**
   * Whether the category is expanded to show its child subcategories.
   * @return {boolean} True if the toolbox item shows its children, false if it
   *     is collapsed.
   * @public
   */
  isExpanded() {
    return this.expanded_;
  }

  /**
   * @override
   */
  isCollapsible() {
    return true;
  }

  /**
   * @override
   */
  onClick(_e) {
    this.toggleExpanded();
  }

  /**
   * Toggles whether or not the category is expanded.
   * @public
   */
  toggleExpanded() {
    this.setExpanded(!this.expanded_);
  }

  /**
   * @override
   */
  getDiv() {
    return this.htmlDiv_;
  }

  /**
   * Gets any children toolbox items. (ex. Gets the subcategories)
   * @return {!Array<!IToolboxItem>} The child toolbox items.
   */
  getChildToolboxItems() {
    return this.toolboxItems_;
  }
}

/**
 * All the CSS class names that are used to create a collapsible
 * category. This is all the properties from the regular category plus contents.
 * @typedef {{
 *            container:?string,
 *            row:?string,
 *            rowcontentcontainer:?string,
 *            icon:?string,
 *            label:?string,
 *            selected:?string,
 *            openicon:?string,
 *            closedicon:?string,
 *            contents:?string
 *          }}
 */
CollapsibleToolboxCategory.CssConfig;

/**
 * Name used for registering a collapsible toolbox category.
 * @type {string}
 * @override
 */
CollapsibleToolboxCategory.registrationName = 'collapsibleCategory';


registry.register(
    registry.Type.TOOLBOX_ITEM, CollapsibleToolboxCategory.registrationName,
    CollapsibleToolboxCategory);

exports.CollapsibleToolboxCategory = CollapsibleToolboxCategory;
