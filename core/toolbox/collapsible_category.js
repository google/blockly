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

goog.module('Blockly.CollapsibleToolboxCategory');
goog.module.declareLegacyNamespace();

goog.require('Blockly.ICollapsibleToolboxItem');
goog.require('Blockly.registry');
goog.require('Blockly.ToolboxCategory');
goog.require('Blockly.ToolboxItem');
goog.require('Blockly.ToolboxSeparator');
goog.require('Blockly.utils.aria');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.toolbox');

goog.requireType('Blockly.IToolbox');
goog.requireType('Blockly.IToolboxItem');


/**
 * Class for a category in a toolbox that can be collapsed.
 * @param {!Blockly.utils.toolbox.CategoryInfo} categoryDef The information needed
 *     to create a category in the toolbox.
 * @param {!Blockly.IToolbox} toolbox The parent toolbox for the category.
 * @param {Blockly.ICollapsibleToolboxItem=} opt_parent The parent category or null if
 *     the category does not have a parent.
 * @constructor
 * @extends {Blockly.ToolboxCategory}
 * @implements {Blockly.ICollapsibleToolboxItem}
 */
const CollapsibleToolboxCategory = function(categoryDef, toolbox, opt_parent) {
  /**
   * Container for any child categories.
   * @type {?Element}
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
   * @type {!Array<!Blockly.ToolboxItem>}
   * @protected
   */
  this.toolboxItems_ = [];

  CollapsibleToolboxCategory.superClass_.constructor.call(
      this, categoryDef, toolbox, opt_parent);
};

Blockly.utils.object.inherits(CollapsibleToolboxCategory, Blockly.ToolboxCategory);

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
 * @const {string}
 */
CollapsibleToolboxCategory.registrationName = 'collapsibleCategory';

/**
 * @override
 */
CollapsibleToolboxCategory.prototype.makeDefaultCssConfig_ = function() {
  const cssConfig = CollapsibleToolboxCategory.superClass_.makeDefaultCssConfig_.call(
      this);
  cssConfig['contents'] = 'blocklyToolboxContents';
  return cssConfig;
};

/**
 * @override
 */
CollapsibleToolboxCategory.prototype.parseContents_ = function(categoryDef) {
  const contents = categoryDef['contents'];
  let prevIsFlyoutItem = true;

  if (categoryDef['custom']) {
    this.flyoutItems_ = categoryDef['custom'];
  } else if (contents) {
    for (let i = 0; i < contents.length; i++) {
      const itemDef = contents[i];
      // Separators can exist as either a flyout item or a toolbox item so
      // decide where it goes based on the type of the previous item.
      if (!Blockly.registry.hasItem(Blockly.registry.Type.TOOLBOX_ITEM, itemDef['kind']) ||
          (itemDef['kind'].toLowerCase() == Blockly.ToolboxSeparator.registrationName &&
          prevIsFlyoutItem)) {
        const flyoutItem = /** @type {Blockly.utils.toolbox.FlyoutItemInfo} */ (itemDef);
        this.flyoutItems_.push(flyoutItem);
        prevIsFlyoutItem = true;
      } else {
        this.createToolboxItem_(itemDef);
        prevIsFlyoutItem = false;
      }
    }
  }
};

/**
 * Creates a toolbox item and adds it to the list of toolbox items.
 * @param {!Blockly.utils.toolbox.ToolboxItemInfo} itemDef The information needed
 *     to create a toolbox item.
 * @private
 */
CollapsibleToolboxCategory.prototype.createToolboxItem_ = function(itemDef) {
  let registryName = itemDef['kind'];
  const categoryDef = /** @type {!Blockly.utils.toolbox.CategoryInfo} */ (itemDef);

  // Categories that are collapsible are created using a class registered under
  // a diffferent name.
  if (registryName.toUpperCase() == 'CATEGORY' &&
      Blockly.utils.toolbox.isCategoryCollapsible(categoryDef)) {
    registryName = CollapsibleToolboxCategory.registrationName;
  }
  const ToolboxItemClass = Blockly.registry.getClass(
      Blockly.registry.Type.TOOLBOX_ITEM, registryName);
  const toolboxItem = new ToolboxItemClass(itemDef, this.parentToolbox_, this);
  this.toolboxItems_.push(toolboxItem);
};

/**
 * @override
 */
CollapsibleToolboxCategory.prototype.init = function() {
  CollapsibleToolboxCategory.superClass_.init.call(this);

  this.setExpanded(this.toolboxItemDef_['expanded'] == 'true' ||
      this.toolboxItemDef_['expanded']);
};

/**
 * @override
 */
CollapsibleToolboxCategory.prototype.createDom_ = function() {
  CollapsibleToolboxCategory.superClass_.createDom_.call(this);

  const subCategories = this.getChildToolboxItems();
  this.subcategoriesDiv_ = this.createSubCategoriesDom_(subCategories);
  Blockly.utils.aria.setRole(this.subcategoriesDiv_,
      Blockly.utils.aria.Role.GROUP);
  this.htmlDiv_.appendChild(this.subcategoriesDiv_);

  return this.htmlDiv_;
};

/**
 * @override
 */
CollapsibleToolboxCategory.prototype.createIconDom_ = function() {
  const toolboxIcon = document.createElement('span');
  if (!this.parentToolbox_.isHorizontal()) {
    Blockly.utils.dom.addClass(toolboxIcon, this.cssConfig_['icon']);
    toolboxIcon.style.visibility = 'visible';
  }

  toolboxIcon.style.display = 'inline-block';
  return toolboxIcon;
};

/**
 * Create the DOM for all subcategories.
 * @param {!Array<!Blockly.ToolboxItem>} subcategories The subcategories.
 * @return {!Element} The div holding all the subcategories.
 * @protected
 */
CollapsibleToolboxCategory.prototype.createSubCategoriesDom_ = function(subcategories) {
  const contentsContainer = document.createElement('div');
  Blockly.utils.dom.addClass(contentsContainer, this.cssConfig_['contents']);

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
};


/**
 * Opens or closes the current category.
 * @param {boolean} isExpanded True to expand the category, false to close.
 * @public
 */
CollapsibleToolboxCategory.prototype.setExpanded = function(isExpanded) {
  if (this.expanded_ == isExpanded) {
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
  Blockly.utils.aria.setState(/** @type {!Element} */ (this.htmlDiv_),
      Blockly.utils.aria.State.EXPANDED, isExpanded);

  this.parentToolbox_.handleToolboxItemResize();
};

/**
 * @override
 */
CollapsibleToolboxCategory.prototype.setVisible_ = function(isVisible) {
  this.htmlDiv_.style.display = isVisible ? 'block' : 'none';
  const childToolboxItems = this.getChildToolboxItems();
  for (let i = 0; i < childToolboxItems.length; i++) {
    const child = childToolboxItems[i];
    child.setVisible_(isVisible);
  }
  this.isHidden_ = !isVisible;

  if (this.parentToolbox_.getSelectedItem() == this) {
    this.parentToolbox_.clearSelection();
  }
};

/**
 * Whether the category is expanded to show its child subcategories.
 * @return {boolean} True if the toolbox item shows its children, false if it
 *     is collapsed.
 * @public
 */
CollapsibleToolboxCategory.prototype.isExpanded = function() {
  return this.expanded_;
};

/**
 * @override
 */
CollapsibleToolboxCategory.prototype.isCollapsible = function() {
  return true;
};

/**
 * @override
 */
CollapsibleToolboxCategory.prototype.onClick = function(_e) {
  this.toggleExpanded();
};

/**
 * Toggles whether or not the category is expanded.
 * @public
 */
CollapsibleToolboxCategory.prototype.toggleExpanded = function() {
  this.setExpanded(!this.expanded_);
};

/**
 * @override
 */
CollapsibleToolboxCategory.prototype.getDiv = function() {
  return this.htmlDiv_;
};

/**
 * Gets any children toolbox items. (ex. Gets the subcategories)
 * @return {!Array<!Blockly.IToolboxItem>} The child toolbox items.
 */
CollapsibleToolboxCategory.prototype.getChildToolboxItems = function() {
  return this.toolboxItems_;
};


Blockly.registry.register(Blockly.registry.Type.TOOLBOX_ITEM,
    CollapsibleToolboxCategory.registrationName, CollapsibleToolboxCategory);

exports = CollapsibleToolboxCategory;
