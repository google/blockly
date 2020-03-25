/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Definition of the Blockly.tree.TreeNode class.
 * This class is similar to Closure's goog.ui.tree.TreeNode class.
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

goog.provide('Blockly.tree.TreeNode');

goog.require('Blockly.tree.BaseNode');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.KeyCodes');


/**
 * A single node in the tree, customized for Blockly's UI.
 * Similar to Closure's goog.ui.tree.TreeNode
 *
 * @param {Blockly.Toolbox} toolbox The parent toolbox for this tree.
 * @param {string} content The content of the node label treated as
 *     plain-text and will be HTML escaped.
 * @param {!Blockly.tree.BaseNode.Config} config The configuration for the tree.
 * @constructor
 * @extends {Blockly.tree.BaseNode}
 */
Blockly.tree.TreeNode = function(toolbox, content, config) {
  this.toolbox_ = toolbox;
  Blockly.tree.BaseNode.call(this, content, config);
};
Blockly.utils.object.inherits(Blockly.tree.TreeNode, Blockly.tree.BaseNode);

/**
 * Returns the tree.
 * @return {?Blockly.tree.TreeControl} The tree.
 * @override
 */
Blockly.tree.TreeNode.prototype.getTree = function() {
  if (this.tree) {
    return this.tree;
  }
  var parent = this.getParent();
  if (parent) {
    var tree = parent.getTree();
    if (tree) {
      this.setTreeInternal(tree);
      return tree;
    }
  }
  return null;
};

/**
 * Returns the source for the icon.
 * @return {string} Src for the icon.
 * @override
 */
Blockly.tree.TreeNode.prototype.getCalculatedIconClass = function() {
  var expanded = this.expanded_;
  if (expanded && this.expandedIconClass) {
    return this.expandedIconClass;
  }
  var iconClass = this.iconClass;
  if (!expanded && iconClass) {
    return iconClass;
  }

  // fall back on default icons
  var config = this.config_;
  if (this.hasChildren()) {
    if (expanded && config.cssExpandedFolderIcon) {
      return config.cssTreeIcon + ' ' + config.cssExpandedFolderIcon;
    } else if (!expanded && config.cssCollapsedFolderIcon) {
      return config.cssTreeIcon + ' ' + config.cssCollapsedFolderIcon;
    }
  } else {
    if (config.cssFileIcon) {
      return config.cssTreeIcon + ' ' + config.cssFileIcon;
    }
  }
  return '';
};

/**
 * Expand or collapse the node on mouse click.
 * @param {!Event} _e The browser event.
 * @override
 */
Blockly.tree.TreeNode.prototype.onClick_ = function(_e) {
  // Expand icon.
  if (this.hasChildren() && this.isUserCollapsible_) {
    this.toggle();
    this.select();
  } else if (this.isSelected()) {
    this.getTree().setSelectedItem(null);
  } else {
    this.select();
  }
  this.updateRow();
};

/**
 * Suppress the inherited mouse down behaviour.
 * @param {!Event} _e The browser event.
 * @override
 * @private
 */
Blockly.tree.TreeNode.prototype.onMouseDown = function(_e) {
  // NOP
};

/**
 * Remap event.keyCode in horizontalLayout so that arrow
 * keys work properly and call original onKeyDown handler.
 * @param {!Event} e The browser event.
 * @return {boolean} The handled value.
 * @override
 * @private
 */
Blockly.tree.TreeNode.prototype.onKeyDown = function(e) {
  if (this.tree.toolbox_.horizontalLayout_) {
    var map = {};
    var next = Blockly.utils.KeyCodes.DOWN;
    var prev = Blockly.utils.KeyCodes.UP;
    map[Blockly.utils.KeyCodes.RIGHT] = this.rightToLeft_ ? prev : next;
    map[Blockly.utils.KeyCodes.LEFT] = this.rightToLeft_ ? next : prev;
    map[Blockly.utils.KeyCodes.UP] = Blockly.utils.KeyCodes.LEFT;
    map[Blockly.utils.KeyCodes.DOWN] = Blockly.utils.KeyCodes.RIGHT;

    var newKeyCode = map[e.keyCode];
    Object.defineProperties(e, {
      keyCode: {value: newKeyCode || e.keyCode}
    });
  }
  return Blockly.tree.TreeNode.superClass_.onKeyDown.call(this, e);
};

/**
 * Set the handler that's triggered when the size of node has changed.
 * @param {function():?} fn The handler
 * @package
 */
Blockly.tree.TreeNode.prototype.onSizeChanged = function(fn) {
  this.onSizeChanged_ = fn;
};

/**
 * Trigger a size changed event if a handler exists.
 * @private
 */
Blockly.tree.TreeNode.prototype.resizeToolbox_ = function() {
  if (this.onSizeChanged_) {
    this.onSizeChanged_.call(this.toolbox_);
  }
};

/**
 * Resize the toolbox when a node is expanded.
 * @override
 */
Blockly.tree.TreeNode.prototype.doNodeExpanded =
    Blockly.tree.TreeNode.prototype.resizeToolbox_;

/**
 * Resize the toolbox when a node is collapsed.
 * @override
 */
Blockly.tree.TreeNode.prototype.doNodeCollapsed =
    Blockly.tree.TreeNode.prototype.resizeToolbox_;
