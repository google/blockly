/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blockly menu item similar to Closure's goog.ui.MenuItem
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

goog.provide('Blockly.MenuItem');

goog.require('Blockly.Component');
goog.require('Blockly.utils.aria');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.object');


/**
 * Class representing an item in a menu.
 *
 * @param {string} content Text caption to display as the content of
 *     the item.
 * @param {string=} opt_value Data/model associated with the menu item.
 * @constructor
 * @extends {Blockly.Component}
 */
Blockly.MenuItem = function(content, opt_value) {
  Blockly.Component.call(this);

  /**
   * Human-readable text of this menu item.
   * @type {string}
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
   * Is the menu clickable, as opposed to greyed-out.
   * @type {boolean}
   * @private
   */
  this.enabled_ = true;
};
Blockly.utils.object.inherits(Blockly.MenuItem, Blockly.Component);


/**
 * Creates the menuitem's DOM.
 * @override
 */
Blockly.MenuItem.prototype.createDom = function() {
  var element = document.createElement('div');
  element.id = this.getId();
  element.blocklyMenuItem = this;  // Link DOM back to this data structure.
  this.setElementInternal(element);

  // Set class and style
  element.className = 'goog-menuitem ' +
      (!this.enabled_ ? 'goog-menuitem-disabled ' : '') +
      (this.checked_ ? 'goog-option-selected ' : '') +
      (this.rightToLeft_ ? 'goog-menuitem-rtl ' : '');

  var content = document.createElement('div');
  content.className = 'goog-menuitem-content';
  // Add a checkbox for checkable menu items.
  if (!this.checkable_) {
    var checkbox = document.createElement('div');
    checkbox.className = 'goog-menuitem-checkbox';
    content.appendChild(checkbox);
  }

  content.appendChild(document.createTextNode(this.content_));
  element.appendChild(content);

  // Initialize ARIA role and state.
  Blockly.utils.aria.setRole(element, this.roleName_);
  Blockly.utils.aria.setState(element, Blockly.utils.aria.State.SELECTED,
      (this.checkable_ && this.checked_) || false);
};

/** @override */
Blockly.MenuItem.prototype.disposeInternal = function() {
  this.getElement().blocklyMenuItem = null;
  Blockly.MenuItem.superClass_.disposeInternal.call(this);
};

/**
 * Gets the value associated with the menu item.
 * @return {*} value Value associated with the menu item.
 * @package
 */
Blockly.MenuItem.prototype.getValue = function() {
  return this.value_;
};

/**
 * Set the menu accessibility role.
 * @param {!Blockly.utils.aria.Role} roleName Role name.
 * @package
 */
Blockly.MenuItem.prototype.setRole = function(roleName) {
  this.roleName_ = roleName;
};

/**
 * Sets the menu item to be checkable or not. Set to true for menu items
 * that represent checkable options.
 * @param {boolean} checkable Whether the menu item is checkable.
 * @package
 */
Blockly.MenuItem.prototype.setCheckable = function(checkable) {
  this.checkable_ = checkable;
};

/**
 * Checks or unchecks the component.
 * @param {boolean} checked Whether to check or uncheck the component.
 * @package
 */
Blockly.MenuItem.prototype.setChecked = function(checked) {
  if (!this.checkable_) {
    throw Error('MenuItem not checkable');
  }
  this.checked_ = checked;

  var el = this.getElement();
  if (el && this.isEnabled()) {
    if (checked) {
      Blockly.utils.dom.addClass(el, 'goog-option-selected');
      Blockly.utils.aria.setState(el,
          Blockly.utils.aria.State.SELECTED, true);
    } else {
      Blockly.utils.dom.removeClass(el, 'goog-option-selected');
      Blockly.utils.aria.setState(el,
          Blockly.utils.aria.State.SELECTED, false);
    }
  }
};

/**
 * Highlights or unhighlights the component.
 * @param {boolean} highlight Whether to highlight or unhighlight the component.
 * @package
 */
Blockly.MenuItem.prototype.setHighlighted = function(highlight) {
  this.highlight_ = highlight;

  var el = this.getElement();
  if (el && this.isEnabled()) {
    if (highlight) {
      Blockly.utils.dom.addClass(el, 'goog-menuitem-highlight');
    } else {
      Blockly.utils.dom.removeClass(el, 'goog-menuitem-highlight');
    }
  }
};

/**
 * Returns true if the menu item is enabled, false otherwise.
 * @return {boolean} Whether the menu item is enabled.
 * @package
 */
Blockly.MenuItem.prototype.isEnabled = function() {
  return this.enabled_;
};

/**
 * Enables or disables the menu item.
 * @param {boolean} enabled Whether to enable or disable the menu item.
 * @package
 */
Blockly.MenuItem.prototype.setEnabled = function(enabled) {
  this.enabled_ = enabled;

  var el = this.getElement();
  if (el) {
    if (enabled) {
      Blockly.utils.dom.removeClass(el, 'goog-menuitem-disabled');
    } else {
      Blockly.utils.dom.addClass(el, 'goog-menuitem-disabled');
    }
  }
};

/**
 * Performs the appropriate action when the menu item is activated
 * by the user.
 * @package
 */
Blockly.MenuItem.prototype.performAction = function() {
  if (this.isEnabled() && this.actionHandler_) {
    this.actionHandler_.call(this.actionHandlerObj_, this);
  }
};

/**
 * Set the handler that's called when the menu item is activated by the user.
 * `obj` will be used as the 'this' object in the function when called.
 * @param {function(!Blockly.MenuItem)} fn The handler.
 * @param {!Object} obj Used as the 'this' object in fn when called.
 * @package
 */
Blockly.MenuItem.prototype.onAction = function(fn, obj) {
  this.actionHandler_ = fn;
  this.actionHandlerObj_ = obj;
};
