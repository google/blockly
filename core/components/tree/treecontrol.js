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
 * @fileoverview Definition of the Blockly.tree.TreeControl class.
 * This class is similar to Closure's goog.ui.tree.TreeControl class.
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

goog.provide('Blockly.tree.TreeControl');

goog.require('Blockly.tree.TreeNode');
goog.require('Blockly.tree.BaseNode');
goog.require('Blockly.utils.aria');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.style');


/**
 * An extension of the TreeControl object in closure that provides
 * a way to view a hierarchical set of data.
 * Similar to Closure's goog.ui.tree.TreeControl
 *
 * @param {Blockly.Toolbox} toolbox The parent toolbox for this tree.
 * @param {!Blockly.tree.BaseNode.Config} config The configuration for the tree.
 * @constructor
 * @extends {Blockly.tree.BaseNode}
 */
Blockly.tree.TreeControl = function(toolbox, config) {
  this.toolbox_ = toolbox;

  Blockly.tree.BaseNode.call(this, '', config);

  // The root is open and selected by default.
  this.setExpandedInternal(true);
  this.setSelectedInternal(true);

  /**
   * Currently selected item.
   * @type {Blockly.tree.BaseNode}
   * @private
   */
  this.selectedItem_ = this;
};
Blockly.utils.object.inherits(Blockly.tree.TreeControl, Blockly.tree.BaseNode);

/**
 * Returns the tree.
 * @override
 */
Blockly.tree.TreeControl.prototype.getTree = function() {
  return this;
};

/**
 * Returns the associated toolbox.
 * @return {Blockly.Toolbox} The toolbox.
 * @package
 */
Blockly.tree.TreeControl.prototype.getToolbox = function() {
  return this.toolbox_;
};

/**
 * Return node depth.
 * @override
 */
Blockly.tree.TreeControl.prototype.getDepth = function() {
  return 0;
};

/**
 * Handles focus on the tree.
 * @param {!Event} _e The browser event.
 * @private
 */
Blockly.tree.TreeControl.prototype.handleFocus_ = function(_e) {
  this.focused_ = true;
  var el = /** @type {!Element} */ (this.getElement());
  Blockly.utils.dom.addClass(el, 'focused');

  if (this.selectedItem_) {
    this.selectedItem_.select();
  }
};

/**
 * Handles blur on the tree.
 * @param {!Event} _e The browser event.
 * @private
 */
Blockly.tree.TreeControl.prototype.handleBlur_ = function(_e) {
  this.focused_ = false;
  var el = /** @type {!Element} */ (this.getElement());
  Blockly.utils.dom.removeClass(el, 'focused');
};

/**
 * Get whether this tree has focus or not.
 * @return {boolean} True if it has focus.
 * @package
 */
Blockly.tree.TreeControl.prototype.hasFocus = function() {
  return this.focused_;
};

/** @override */
Blockly.tree.TreeControl.prototype.getExpanded = function() {
  return true;
};

/** @override */
Blockly.tree.TreeControl.prototype.setExpanded = function(expanded) {
  this.setExpandedInternal(expanded);
};

/** @override */
Blockly.tree.TreeControl.prototype.getIconElement = function() {
  var el = this.getRowElement();
  return el ? /** @type {Element} */ (el.firstChild) : null;
};

/** @override */
Blockly.tree.TreeControl.prototype.updateExpandIcon = function() {
  // no expand icon
};

/** @override */
Blockly.tree.TreeControl.prototype.getRowClassName = function() {
  return Blockly.tree.TreeControl.superClass_.getRowClassName.call(this) +
      ' ' + this.getConfig().cssHideRoot;
};

/**
 * Returns the source for the icon.
 * @return {string} Src for the icon.
 * @override
 */
Blockly.tree.TreeControl.prototype.getCalculatedIconClass = function() {
  var expanded = this.getExpanded();
  var expandedIconClass = this.getExpandedIconClass();
  if (expanded && expandedIconClass) {
    return expandedIconClass;
  }
  var iconClass = this.getIconClass();
  if (!expanded && iconClass) {
    return iconClass;
  }

  // fall back on default icons
  var config = this.getConfig();
  if (expanded && config.cssExpandedRootIcon) {
    return config.cssTreeIcon + ' ' + config.cssExpandedRootIcon;
  }
  return '';
};

/**
 * Sets the selected item.
 * @param {Blockly.tree.BaseNode} node The item to select.
 * @package
 */
Blockly.tree.TreeControl.prototype.setSelectedItem = function(node) {
  if (node == this.selectedItem_) {
    return;
  }

  if (this.onBeforeSelected_ &&
    !this.onBeforeSelected_.call(this.toolbox_, node)) {
    return;
  }

  var oldNode = this.getSelectedItem();

  if (this.selectedItem_) {
    this.selectedItem_.setSelectedInternal(false);
  }

  this.selectedItem_ = node;

  if (node) {
    node.setSelectedInternal(true);
  }

  if (this.onAfterSelected_) {
    this.onAfterSelected_.call(this.toolbox_, oldNode, node);
  }
};

/**
 * Set the handler that's triggered before a node is selected.
 * @param {function(Blockly.tree.BaseNode):boolean} fn The handler
 * @package
 */
Blockly.tree.TreeControl.prototype.onBeforeSelected = function(fn) {
  this.onBeforeSelected_ = fn;
};

/**
 * Set the handler that's triggered after a node is selected.
 * @param {function(
 *  Blockly.tree.BaseNode, Blockly.tree.BaseNode):?} fn The handler
 * @package
 */
Blockly.tree.TreeControl.prototype.onAfterSelected = function(fn) {
  this.onAfterSelected_ = fn;
};

/**
 * Returns the selected item.
 * @return {Blockly.tree.BaseNode} The currently selected item.
 * @package
 */
Blockly.tree.TreeControl.prototype.getSelectedItem = function() {
  return this.selectedItem_;
};

/**
 * Add roles and states.
 * @protected
 * @override
 */
Blockly.tree.TreeControl.prototype.initAccessibility = function() {
  Blockly.tree.TreeControl.superClass_.initAccessibility.call(this);

  var el = /** @type {!Element} */ (this.getElement());
  Blockly.utils.aria.setRole(el, Blockly.utils.aria.Role.TREE);
  Blockly.utils.aria.setState(el,
      Blockly.utils.aria.State.LABELLEDBY, this.getLabelElement().id);
};

/** @override */
Blockly.tree.TreeControl.prototype.enterDocument = function() {
  Blockly.tree.TreeControl.superClass_.enterDocument.call(this);
  var el = this.getElement();
  el.className = this.getConfig().cssRoot;
  el.setAttribute('hideFocus', 'true');
  this.attachEvents_();
  this.initAccessibility();
};

/** @override */
Blockly.tree.TreeControl.prototype.exitDocument = function() {
  Blockly.tree.TreeControl.superClass_.exitDocument.call(this);
  this.detachEvents_();
};

/**
 * Adds the event listeners to the tree.
 * @private
 * @suppress {deprecated} Suppress deprecated bindEvent_ call.
 */
Blockly.tree.TreeControl.prototype.attachEvents_ = function() {
  var el = this.getElement();
  el.tabIndex = 0;

  this.onFocusWrapper_ = Blockly.bindEvent_(el,
      'focus', this, this.handleFocus_);
  this.onBlurWrapper_ = Blockly.bindEvent_(el,
      'blur', this, this.handleBlur_);

  this.onClickWrapper_ = Blockly.bindEventWithChecks_(el,
      'click', this, this.handleMouseEvent_);

  this.onKeydownWrapper_ = Blockly.bindEvent_(el,
      'keydown', this, this.handleKeyEvent_);
};

/**
 * Removes the event listeners from the tree.
 * @private
 */
Blockly.tree.TreeControl.prototype.detachEvents_ = function() {
  Blockly.unbindEvent_(this.onFocusWrapper_);
  Blockly.unbindEvent_(this.onBlurWrapper_);
  Blockly.unbindEvent_(this.onClickWrapper_);
  Blockly.unbindEvent_(this.onKeydownWrapper_);
};

/**
 * Handles mouse events.
 * @param {!Event} e The browser event.
 * @private
 */
Blockly.tree.TreeControl.prototype.handleMouseEvent_ = function(e) {
  var node = this.getNodeFromEvent_(e);
  if (node) {
    switch (e.type) {
      case 'mousedown':
        node.onMouseDown(e);
        break;
      case 'click':
        node.onClick_(e);
        break;
    }
  }
};

/**
 * Handles key down on the tree.
 * @param {!Event} e The browser event.
 * @return {boolean} The handled value.
 * @private
 */
Blockly.tree.TreeControl.prototype.handleKeyEvent_ = function(e) {
  var handled = false;

  // Handle navigation keystrokes.
  handled = (this.selectedItem_ && this.selectedItem_.onKeyDown(e)) || handled;

  if (handled) {
    Blockly.utils.style.scrollIntoContainerView(
        /** @type {!Element} */ (this.selectedItem_.getElement()),
        /** @type {!Element} */ (this.getElement().parentNode));
    e.preventDefault();
  }

  return handled;
};

/**
 * Finds the containing node given an event.
 * @param {!Event} e The browser event.
 * @return {Blockly.tree.BaseNode} The containing node or null if no node is
 *     found.
 * @private
 */
Blockly.tree.TreeControl.prototype.getNodeFromEvent_ = function(e) {
  // find the right node
  var node = null;
  var target = e.target;
  while (target != null) {
    var id = target.id;
    node = Blockly.tree.BaseNode.allNodes[id];
    if (node) {
      return node;
    }
    if (target == this.getElement()) {
      break;
    }
    target = target.parentNode;
  }
  return null;
};

/**
 * Creates a new tree node using the same config as the root.
 * @param {string=} opt_content The content of the node label.
 * @return {!Blockly.tree.TreeNode} The new item.
 * @package
 */
Blockly.tree.TreeControl.prototype.createNode = function(opt_content) {
  return new Blockly.tree.TreeNode(
      this.toolbox_, opt_content || '', this.getConfig());
};
