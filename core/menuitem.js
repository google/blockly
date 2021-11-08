/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blockly menu item similar to Closure's goog.ui.MenuItem
 */
'use strict';

/**
 * Blockly menu item similar to Closure's goog.ui.MenuItem
 * @class
 */
goog.module('Blockly.MenuItem');

const aria = goog.require('Blockly.utils.aria');
const dom = goog.require('Blockly.utils.dom');
const idGenerator = goog.require('Blockly.utils.idGenerator');


/**
 * Class representing an item in a menu.
 *
 * @param {string|!HTMLElement} content Text caption to display as the content
 *     of the item, or a HTML element to display.
 * @param {string=} opt_value Data/model associated with the menu item.
 * @constructor
 * @alias Blockly.MenuItem
 */
const MenuItem = function(content, opt_value) {
  /**
   * Human-readable text of this menu item, or the HTML element to display.
   * @type {string|!HTMLElement}
   * @private
   */
  this.content_ = content;

  /**
   * Machine-readable value of this menu item.
   * @type {string|undefined}
   * @private
   */
  this.value_ = opt_value;

  /**
   * Is the menu item clickable, as opposed to greyed-out.
   * @type {boolean}
   * @private
   */
  this.enabled_ = true;

  /**
   * The DOM element for the menu item.
   * @type {?Element}
   * @private
   */
  this.element_ = null;

  /**
   * Whether the menu item is rendered right-to-left.
   * @type {boolean}
   * @private
   */
  this.rightToLeft_ = false;

  /**
   * ARIA name for this menu.
   * @type {?aria.Role}
   * @private
   */
  this.roleName_ = null;

  /**
   * Is this menu item checkable.
   * @type {boolean}
   * @private
   */
  this.checkable_ = false;

  /**
   * Is this menu item currently checked.
   * @type {boolean}
   * @private
   */
  this.checked_ = false;

  /**
   * Is this menu item currently highlighted.
   * @type {boolean}
   * @private
   */
  this.highlight_ = false;

  /**
   * Bound function to call when this menu item is clicked.
   * @type {?Function}
   * @private
   */
  this.actionHandler_ = null;
};


/**
 * Creates the menuitem's DOM.
 * @return {!Element} Completed DOM.
 */
MenuItem.prototype.createDom = function() {
  const element = document.createElement('div');
  element.id = idGenerator.getNextUniqueId();
  this.element_ = element;

  // Set class and style
  // goog-menuitem* is deprecated, use blocklyMenuItem*.  May 2020.
  element.className = 'blocklyMenuItem goog-menuitem ' +
      (this.enabled_ ? '' : 'blocklyMenuItemDisabled goog-menuitem-disabled ') +
      (this.checked_ ? 'blocklyMenuItemSelected goog-option-selected ' : '') +
      (this.highlight_ ? 'blocklyMenuItemHighlight goog-menuitem-highlight ' :
                         '') +
      (this.rightToLeft_ ? 'blocklyMenuItemRtl goog-menuitem-rtl ' : '');

  const content = document.createElement('div');
  content.className = 'blocklyMenuItemContent goog-menuitem-content';
  // Add a checkbox for checkable menu items.
  if (this.checkable_) {
    const checkbox = document.createElement('div');
    checkbox.className = 'blocklyMenuItemCheckbox goog-menuitem-checkbox';
    content.appendChild(checkbox);
  }

  let contentDom = /** @type {!HTMLElement} */ (this.content_);
  if (typeof this.content_ === 'string') {
    contentDom = document.createTextNode(this.content_);
  }
  content.appendChild(contentDom);
  element.appendChild(content);

  // Initialize ARIA role and state.
  if (this.roleName_) {
    aria.setRole(element, this.roleName_);
  }
  aria.setState(
      element, aria.State.SELECTED,
      (this.checkable_ && this.checked_) || false);
  aria.setState(element, aria.State.DISABLED, !this.enabled_);

  return element;
};

/**
 * Dispose of this menu item.
 */
MenuItem.prototype.dispose = function() {
  this.element_ = null;
};

/**
 * Gets the menu item's element.
 * @return {?Element} The DOM element.
 * @package
 */
MenuItem.prototype.getElement = function() {
  return this.element_;
};

/**
 * Gets the unique ID for this menu item.
 * @return {string} Unique component ID.
 * @package
 */
MenuItem.prototype.getId = function() {
  return this.element_.id;
};

/**
 * Gets the value associated with the menu item.
 * @return {*} value Value associated with the menu item.
 * @package
 */
MenuItem.prototype.getValue = function() {
  return this.value_;
};

/**
 * Set menu item's rendering direction.
 * @param {boolean} rtl True if RTL, false if LTR.
 * @package
 */
MenuItem.prototype.setRightToLeft = function(rtl) {
  this.rightToLeft_ = rtl;
};

/**
 * Set the menu item's accessibility role.
 * @param {!aria.Role} roleName Role name.
 * @package
 */
MenuItem.prototype.setRole = function(roleName) {
  this.roleName_ = roleName;
};

/**
 * Sets the menu item to be checkable or not. Set to true for menu items
 * that represent checkable options.
 * @param {boolean} checkable Whether the menu item is checkable.
 * @package
 */
MenuItem.prototype.setCheckable = function(checkable) {
  this.checkable_ = checkable;
};

/**
 * Checks or unchecks the component.
 * @param {boolean} checked Whether to check or uncheck the component.
 * @package
 */
MenuItem.prototype.setChecked = function(checked) {
  this.checked_ = checked;
};

/**
 * Highlights or unhighlights the component.
 * @param {boolean} highlight Whether to highlight or unhighlight the component.
 * @package
 */
MenuItem.prototype.setHighlighted = function(highlight) {
  this.highlight_ = highlight;

  const el = this.getElement();
  if (el && this.isEnabled()) {
    // goog-menuitem-highlight is deprecated, use blocklyMenuItemHighlight.
    // May 2020.
    const name = 'blocklyMenuItemHighlight';
    const nameDep = 'goog-menuitem-highlight';
    if (highlight) {
      dom.addClass(el, name);
      dom.addClass(el, nameDep);
    } else {
      dom.removeClass(el, name);
      dom.removeClass(el, nameDep);
    }
  }
};

/**
 * Returns true if the menu item is enabled, false otherwise.
 * @return {boolean} Whether the menu item is enabled.
 * @package
 */
MenuItem.prototype.isEnabled = function() {
  return this.enabled_;
};

/**
 * Enables or disables the menu item.
 * @param {boolean} enabled Whether to enable or disable the menu item.
 * @package
 */
MenuItem.prototype.setEnabled = function(enabled) {
  this.enabled_ = enabled;
};

/**
 * Performs the appropriate action when the menu item is activated
 * by the user.
 * @package
 */
MenuItem.prototype.performAction = function() {
  if (this.isEnabled() && this.actionHandler_) {
    this.actionHandler_(this);
  }
};

/**
 * Set the handler that's called when the menu item is activated by the user.
 * `obj` will be used as the 'this' object in the function when called.
 * @param {function(!MenuItem)} fn The handler.
 * @param {!Object} obj Used as the 'this' object in fn when called.
 * @package
 */
MenuItem.prototype.onAction = function(fn, obj) {
  this.actionHandler_ = fn.bind(obj);
};

exports.MenuItem = MenuItem;
