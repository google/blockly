/**
 * @license
 * Copyright 2019 Google LLC
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

  this.setContentInternal(content);
  this.setValue(opt_value);

  /**
   * @type {boolean}
   * @private
   */
  this.enabled_ = true;

  /**
   * @type {Blockly.MenuItem}
   * @private
   */
  this.previousSibling_;

  /**
   * @type {Blockly.MenuItem}
   * @private
   */
  this.nextSibling_;
};
Blockly.utils.object.inherits(Blockly.MenuItem, Blockly.Component);


/**
 * Creates the menuitem's DOM.
 * @override
 */
Blockly.MenuItem.prototype.createDom = function() {
  var element = document.createElement('div');
  element.id = this.getId();
  this.setElementInternal(element);

  // Set class and style
  element.className = 'goog-menuitem goog-option ' +
      (!this.enabled_ ? 'goog-menuitem-disabled ' : '') +
      (this.checked_ ? 'goog-option-selected ' : '') +
      (this.isRightToLeft() ? 'goog-menuitem-rtl ' : '');

  var content = this.getContentWrapperDom();
  element.appendChild(content);

  // Add a checkbox for checkable menu items.
  var checkboxDom = this.getCheckboxDom();
  if (checkboxDom) {
    content.appendChild(checkboxDom);
  }

  content.appendChild(this.getContentDom());

  // Initialize ARIA role and state.
  Blockly.utils.aria.setRole(element, this.roleName_ || (this.checkable_ ?
      Blockly.utils.aria.Role.MENUITEMCHECKBOX :
      Blockly.utils.aria.Role.MENUITEM));
  Blockly.utils.aria.setState(element, Blockly.utils.aria.State.SELECTED,
      (this.checkable_ && this.checked_) || false);
};

/**
 * @return {Element} The HTML element for the checkbox.
 * @protected
 */
Blockly.MenuItem.prototype.getCheckboxDom = function() {
  if (!this.checkable_) {
    return null;
  }
  var menuItemCheckbox = document.createElement('div');
  menuItemCheckbox.className = 'goog-menuitem-checkbox';
  return menuItemCheckbox;
};

/**
 * @return {!Element} The HTML for the content.
 * @protected
 */
Blockly.MenuItem.prototype.getContentDom = function() {
  var content = this.content_;
  if (typeof content === 'string') {
    content = document.createTextNode(content);
  }
  return content;
};

/**
 * @return {!Element} The HTML for the content wrapper.
 * @protected
 */
Blockly.MenuItem.prototype.getContentWrapperDom = function() {
  var contentWrapper = document.createElement('div');
  contentWrapper.className = 'goog-menuitem-content';
  return contentWrapper;
};

/**
 * Sets the content associated with the menu item.
 * @param {string} content Text caption to set as the
 *    menuitem's contents.
 * @protected
 */
Blockly.MenuItem.prototype.setContentInternal = function(content) {
  this.content_ = content;
};

/**
 * Sets the value associated with the menu item.
 * @param {*} value Value to be associated with the menu item.
 * @package
 */
Blockly.MenuItem.prototype.setValue = function(value) {
  this.value_ = value;
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
    return;
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
    if (!this.enabled_) {
      Blockly.utils.dom.addClass(el, 'goog-menuitem-disabled');
    } else {
      Blockly.utils.dom.removeClass(el, 'goog-menuitem-disabled');
    }
  }
};

/**
 * Handles click events. If the component is enabled, trigger
 * the action associated with this menu item.
 * @param {Event} _e Mouse event to handle.
 * @package
 */
Blockly.MenuItem.prototype.handleClick = function(_e) {
  if (this.isEnabled()) {
    this.setHighlighted(true);
    this.performActionInternal();
  }
};

/**
 * Performs the appropriate action when the menu item is activated
 * by the user.
 * @protected
 */
Blockly.MenuItem.prototype.performActionInternal = function() {
  if (this.checkable_) {
    this.setChecked(!this.checked_);
  }
  if (this.actionHandler_) {
    this.actionHandler_.call(/** @type {?} */ (this.actionHandlerObj_), this);
  }
};

/**
 * Set the handler that's triggered when the menu item is activated
 * by the user. If `opt_obj` is provided, it will be used as the
 * 'this' object in the function when called.
 * @param {function(this:T,!Blockly.MenuItem):?} fn The handler.
 * @param {T=} opt_obj Used as the 'this' object in f when called.
 * @template T
 * @package
 */
Blockly.MenuItem.prototype.onAction = function(fn, opt_obj) {
  this.actionHandler_ = fn;
  this.actionHandlerObj_ = opt_obj;
};
