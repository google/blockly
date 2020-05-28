/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
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

  /**
   * Click event data.
   * @type {?Blockly.EventData}
   * @private
   */
  this.onClickWrapper_ = null;

  /**
   * Key down event data.
   * @type {?Blockly.EventData}
   * @private
   */
  this.onKeydownWrapper_ = null;

  Blockly.tree.BaseNode.call(this, '', config);

  // The root is open and selected by default.
  this.expanded_ = true;
  this.selected_ = true;

  /**
   * Currently selected item.
   * @type {Blockly.tree.BaseNode}
   * @private
   */
  this.selectedItem_ = this;

  /**
   * A handler that's triggered before a node is selected.
   * @type {?function(Blockly.tree.BaseNode):boolean}
   * @private
   */
  this.onBeforeSelected_ = null;

  /**
   * A handler that's triggered before a node is selected.
   * @type {?function(Blockly.tree.BaseNode, Blockly.tree.BaseNode):?}
   * @private
   */
  this.onAfterSelected_ = null;
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

/** @override */
Blockly.tree.TreeControl.prototype.setExpanded = function(expanded) {
  this.expanded_ = expanded;
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
      ' ' + this.config_.cssHideRoot;
};

/**
 * Returns the source for the icon.
 * @return {string} Src for the icon.
 * @override
 */
Blockly.tree.TreeControl.prototype.getCalculatedIconClass = function() {
  var expanded = this.expanded_;
  if (expanded && this.expandedIconClass) {
    return this.expandedIconClass;
  }
  var iconClass = this.iconClass;
  if (!expanded && iconClass) {
    return iconClass;
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
    this.selectedItem_.setSelected(false);
  }

  this.selectedItem_ = node;

  if (node) {
    node.setSelected(true);
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
  el.className = this.config_.cssRoot;
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
 */
Blockly.tree.TreeControl.prototype.attachEvents_ = function() {
  var el = this.getElement();
  el.tabIndex = 0;

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
  if (this.onClickWrapper_) {
    Blockly.unbindEvent_(this.onClickWrapper_);
    this.onClickWrapper_ = null;
  }
  if (this.onKeydownWrapper_) {
    Blockly.unbindEvent_(this.onKeydownWrapper_);
    this.onKeydownWrapper_ = null;
  }
};

/**
 * Handles mouse events.
 * @param {!Event} e The browser event.
 * @private
 */
Blockly.tree.TreeControl.prototype.handleMouseEvent_ = function(e) {
  var node = this.getNodeFromEvent_(e);
  if (node && e.type == 'click') {
    node.onClick_(e);
  }
};

/**
 * Handles key down on the tree.
 * @param {!Event} e The browser event.
 * @return {boolean} The handled value.
 * @private
 */
Blockly.tree.TreeControl.prototype.handleKeyEvent_ = function(e) {
  // Handle navigation keystrokes.
  var handled = !!(this.selectedItem_ && this.selectedItem_.onKeyDown(e));

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
  while (target) {
    var id = target.id;
    node = Blockly.tree.BaseNode.allNodes[id];
    if (node) {
      return node;
    }
    if (target == this.getElement()) {
      break;
    }
    // Don't bubble if we hit a group. See issue #714.
    if (target.getAttribute('role') == Blockly.utils.aria.Role.GROUP) {
      return null;
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
      this.toolbox_, opt_content || '', this.config_);
};
