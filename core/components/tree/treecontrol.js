/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2019 Google Inc.
 * https://developers.google.com/blockly/
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

goog.require('Blockly.Events');
goog.require('Blockly.Events.Ui');
goog.require('Blockly.tree.TreeNode');
goog.require('Blockly.tree.BaseNode');
goog.require('Blockly.utils.aria');


/**
 * An extension of the TreeControl object in closure that provides
 * a way to view a hierarchical set of data.
 * Similar to Closure's goog.ui.tree.TreeControl
 *
 * @param {Blockly.Toolbox} toolbox The parent toolbox for this tree.
 * @param {Object} config The configuration for the tree.
 * @constructor
 * @extends {Blockly.tree.BaseNode}
 */
Blockly.tree.TreeControl = function(toolbox, config) {
  this.toolbox_ = toolbox;
  Blockly.tree.BaseNode.call(this, '', config);

  // The root is open and selected by default.
  this.setExpandedInternal(true);
  this.setSelectedInternal(true);

  this.selectedItem_ = this;
};
goog.inherits(Blockly.tree.TreeControl, Blockly.tree.BaseNode);

/**
 * Returns the tree.
 * @override
 */
Blockly.tree.TreeControl.prototype.getTree = function() {
  return this;
};

/**
 * Return node depth.
 * @override
 */
Blockly.tree.TreeControl.prototype.getDepth = function() {
  return 0;
};

/**
 * Expands the parent chain of this node so that it is visible.
 * @override
 */
Blockly.tree.TreeControl.prototype.reveal = function() {
  // always expanded by default
  // needs to be overriden so that we don't try to reveal our parent
  // which is a generic component
};


/**
 * Handles focus on the tree.
 * @param {!Event} e The browser event.
 * @private
 */
Blockly.tree.TreeControl.prototype.handleFocus_ = function(/* e */) {
  this.focused_ = true;
  Blockly.utils.dom.addClass(this.getElement(), 'focused');

  if (this.selectedItem_) {
    this.selectedItem_.select();
  }
};


/**
 * Handles blur on the tree.
 * @param {!Event} e The browser event.
 * @private
 */
Blockly.tree.TreeControl.prototype.handleBlur_ = function(/* e */) {
  this.focused_ = false;
  Blockly.utils.dom.removeClass(this.getElement(), 'focused');
};


/**
 * @return {boolean} Whether the tree has keyboard focus.
 */
Blockly.tree.TreeControl.prototype.hasFocus = function() {
  return this.focused_;
};


/** @override */
Blockly.tree.TreeControl.prototype.getExpanded = function() {
  return !this.showRootNode_ ||
      Blockly.tree.TreeControl.superClass_.getExpanded.call(this);
};

/** @override */
Blockly.tree.TreeControl.prototype.setExpanded = function(expanded) {
  if (!this.showRootNode_) {
    this.setExpandedInternal(expanded);
  } else {
    Blockly.tree.TreeControl.superClass_.setExpanded.call(this, expanded);
  }
};

/** @override */
Blockly.tree.TreeControl.prototype.getIconElement = function() {
  var el = this.getRowElement();
  return el ? /** @type {Element} */ (el.firstChild) : null;
};

/** @override */
Blockly.tree.TreeControl.prototype.getExpandIconElement = function() {
  // no expand icon for root element
  return null;
};

/** @override */
Blockly.tree.TreeControl.prototype.updateExpandIcon = function() {
  // no expand icon
};

/** @override */
Blockly.tree.TreeControl.prototype.getRowClassName = function() {
  // TODO: look into this
  // return this.getConfig().cssHideRoot;
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
  } else if (!expanded && config.cssCollapsedRootIcon) {
    return config.cssTreeIcon + ' ' + config.cssCollapsedRootIcon;
  }
  return '';
};

/**
 * Sets the selected item.
 * @param {Blockly.tree.BaseNode} node The item to select.
 */
Blockly.tree.TreeControl.prototype.setSelectedItem = function(node) {
  var toolbox = this.toolbox_;
  if (node == this.selectedItem_ || node == toolbox.tree_) {
    return;
  }
  if (toolbox.lastCategory_) {
    toolbox.lastCategory_.getRowElement().style.backgroundColor = '';
  }
  if (node) {
    var hexColour = node.hexColour || '#57e';
    node.getRowElement().style.backgroundColor = hexColour;
    // Add colours to child nodes which may have been collapsed and thus
    // not rendered.
    toolbox.addColour_(node);
  }
  var oldNode = this.getSelectedItem();

  if (this.selectedItem_ == node) {
    return;
  }

  var hadFocus = false;
  if (this.selectedItem_) {
    hadFocus = this.selectedItem_ == this.focusedNode_;
    this.selectedItem_.setSelectedInternal(false);
  }

  this.selectedItem_ = node;

  if (node) {
    node.setSelectedInternal(true);
    if (hadFocus) {
      node.select();
    }
  }

  if (node && node.blocks && node.blocks.length) {
    toolbox.flyout_.show(node.blocks);
    // Scroll the flyout to the top if the category has changed.
    if (toolbox.lastCategory_ != node) {
      toolbox.flyout_.scrollToStart();
    }
  } else {
    // Hide the flyout.
    toolbox.flyout_.hide();
  }
  if (oldNode != node && oldNode != this) {
    var event = new Blockly.Events.Ui(null, 'category',
        oldNode && oldNode.getText(), node && node.getText());
    event.workspaceId = toolbox.workspace_.id;
    Blockly.Events.fire(event);
  }
  if (node) {
    toolbox.lastCategory_ = node;
  }
};

/**
 * Returns the selected item.
 * @return {Blockly.tree.BaseNode} The currently selected item.
 */
Blockly.tree.TreeControl.prototype.getSelectedItem = function() {
  return this.selectedItem_;
};

/**
 * Updates the lines after the tree has been drawn.
 * @private
 */
Blockly.tree.TreeControl.prototype.updateLinesAndExpandIcons_ = function() {
  var tree = this;
  var showLines = false;
  var showRootLines = false;

  /**
   * Recursively walk through all nodes and update the class names of the
   * expand icon and the children element.
   * @param {!Blockly.tree.BaseNode} node tree node
   */
  function updateShowLines(node) {
    var childrenEl = node.getChildrenElement();
    if (childrenEl) {
      var hideLines = !showLines || tree == node.getParent() && !showRootLines;
      var childClass = hideLines ? node.getConfig().cssChildrenNoLines :
                                   node.getConfig().cssChildren;
      childrenEl.className = childClass;

      var expandIconEl = node.getExpandIconElement();
      if (expandIconEl) {
        expandIconEl.className = node.getExpandIconClass();
      }
    }
    node.forEachChild(updateShowLines);
  }
  updateShowLines(this);
};

/**
 * Add roles and states.
 * @protected
 * @override
 */
Blockly.tree.TreeControl.prototype.initAccessibility = function() {
  Blockly.tree.TreeControl.superClass_.initAccessibility.call(this);

  var elt = this.getElement();
  // goog.asserts.assert(elt, 'The DOM element for the tree cannot be null.');
  Blockly.utils.aria.setRole(elt, 'tree');
  Blockly.utils.aria.setState(elt, 'labelledby', this.getLabelElement().id);
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
 */
Blockly.tree.TreeControl.prototype.attachEvents_ = function() {
  var el = this.getElement();
  el.tabIndex = 0;

  this.onFocusWrapper_ = Blockly.bindEvent_(el,
      'focus', this, this.handleFocus_);
  this.onBlurWrapper_ = Blockly.bindEvent_(el,
      'blur', this, this.handleBlur_);

  this.onMousedownWrapper_ = Blockly.bindEventWithChecks_(el,
      'mousedown', this, this.handleMouseEvent_);
  this.onClickWrapper_ = Blockly.bindEventWithChecks_(el,
      'click', this, this.handleMouseEvent_);
  
  this.onKeydownWrapper_ = Blockly.bindEvent_(el,
      'keydown', this, this.handleKeyEvent);

  if (Blockly.Touch.TOUCH_ENABLED) {
    this.onTouchEndWrapper_ = Blockly.bindEventWithChecks_(el,
        'touchend', this, this.handleTouchEvent_);
  }
};

/**
 * Removes the event listeners from the tree.
 * @private
 */
Blockly.tree.TreeControl.prototype.detachEvents_ = function() {
  Blockly.unbindEvent_(this.onFocusWrapper_);
  Blockly.unbindEvent_(this.onBlurWrapper_);
  Blockly.unbindEvent_(this.onMousedownWrapper_);
  Blockly.unbindEvent_(this.onClickWrapper_);
  Blockly.unbindEvent_(this.onKeyDownWrapper_);
  if (this.onTouchEndWrapper_) {
    Blockly.unbindEvent_(this.onTouchEndWrapper_);
  }
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
 * Handles touch events.
 * @param {!Event} e The browser event.
 * @private
 */
Blockly.tree.TreeControl.prototype.handleTouchEvent_ = function(e) {
  var node = this.getNodeFromEvent_(e);
  if (node && e.type === 'touchend') {
    // Fire asynchronously since onMouseDown takes long enough that the browser
    // would fire the default mouse event before this method returns.
    setTimeout(function() {
      node.onClick_(e);  // Same behaviour for click and touch.
    }, 1);
  }
};

/**
 * Handles key down on the tree.
 * @param {!Event} e The browser event.
 * @return {boolean} The handled value.
 */
Blockly.tree.TreeControl.prototype.handleKeyEvent = function(e) {
  var handled = false;

  // Handle navigation keystrokes.
  handled = this.selectedItem_ && this.selectedItem_.onKeyDown(e);

  if (handled) {
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
 * @return {!Blockly.TreeNode} The new item.
 */
Blockly.tree.TreeControl.prototype.createNode = function(opt_content) {
  return new Blockly.tree.TreeNode(this.toolbox_, opt_content || '', this.getConfig());
};
