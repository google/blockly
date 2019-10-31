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
 * @fileoverview The class representing a cursor that is used to navigate
 * between tab navigable fields.
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

goog.provide('Blockly.TabNavigateCursor');

goog.require('Blockly.ASTNode');
goog.require('Blockly.Cursor');
goog.require('Blockly.utils.object');


/**
 * A cursor for navigating between tab navigable fields.
 * @constructor
 * @extends {Blockly.Cursor}
 */
Blockly.TabNavigateCursor = function() {
  Blockly.TabNavigateCursor.superClass_.constructor.call(this);
};
Blockly.utils.object.inherits(Blockly.TabNavigateCursor, Blockly.Cursor);

/**
 * Find the next node in the pre order traversal.
 * @override
 */
Blockly.TabNavigateCursor.prototype.next = function() {
  var curNode = this.getCurNode();
  if (!curNode) {
    return null;
  }
  var newNode = this.getNextNode_(curNode);

  if (newNode) {
    this.setCurNode(newNode);
  }
  return newNode;
};

/**
 * Find the previous node in the pre order traversal.
 * @override
 */
Blockly.TabNavigateCursor.prototype.prev = function() {
  var curNode = this.getCurNode();
  if (!curNode) {
    return null;
  }
  var newNode = this.getPreviousNode_(curNode);

  if (newNode) {
    this.setCurNode(newNode);
  }
  return newNode;
};

/**
 * Skip all nodes except for tab navigable fields.
 * @param {Blockly.ASTNode} node The AST node to check whether it is valid.
 * @return {boolean} True if the node should be visited, false otherwise.
 * @private
 */
Blockly.TabNavigateCursor.prototype.validNode_ = function(node) {
  var isValid = false;
  var type = node && node.getType();
  if (node) {
    var location = node.getLocation();
    if (type == Blockly.ASTNode.types.FIELD &&
        location && location.isTabNavigable() &&
        (/** @type {!Blockly.Field} */ (location)).isClickable()) {
      isValid = true;
    }
  }
  return isValid;
};

/**
 * From a given node find either the next valid sibling or parent.
 * @param {Blockly.ASTNode} node The current position in the AST.
 * @return {Blockly.ASTNode} The parent AST node or null if there are no
 *     valid parents.
 * @private
 */
Blockly.TabNavigateCursor.prototype.findSiblingOrParent_ = function(node) {
  if (!node) {
    return null;
  }
  var nextNode = node.next();
  if (nextNode) {
    return nextNode;
  }
  return this.findSiblingOrParent_(node.out());
};

/**
 * Navigate the Blockly AST using pre-order traversal.
 * @param {Blockly.ASTNode} node The current position in the AST.
 * @return {Blockly.ASTNode} The next node in the traversal.
 * @private
 */
Blockly.TabNavigateCursor.prototype.getNextNode_ = function(node) {
  if (!node) {
    return null;
  }
  var newNode = node.in() || node.next();
  if (this.validNode_(newNode)) {
    return newNode;
  } else if (newNode) {
    return this.getNextNode_(newNode);
  }
  var siblingOrParent = this.findSiblingOrParent_(node.out());
  if (this.validNode_(siblingOrParent)) {
    return siblingOrParent;
  } else if (siblingOrParent) {
    return this.getNextNode_(siblingOrParent);
  }
  return null;
};

/**
 * Get the right most child of a node.
 * @param {Blockly.ASTNode} node The node to find the right most child of.
 * @return {Blockly.ASTNode} The right most child of the given node, or the node
 *     if no child exists.
 * @private
 */
Blockly.TabNavigateCursor.prototype.getRightMostChild_ = function(node) {
  if (!node.in()) {
    return node;
  }
  var newNode = node.in();
  while (newNode.next()) {
    newNode = newNode.next();
  }
  return this.getRightMostChild_(newNode);
};

/**
 * Use reverse pre-order traversal in order to find the previous node.
 * @param {Blockly.ASTNode} node The current position in the AST.
 * @return {Blockly.ASTNode} The previous node in the traversal or null if no
 *     previous node exists.
 * @private
 */
Blockly.TabNavigateCursor.prototype.getPreviousNode_ = function(node) {
  if (!node) {
    return null;
  }
  var newNode = node.prev();

  if (newNode) {
    newNode = this.getRightMostChild_(newNode);
  } else {
    newNode = node.out();
  }
  if (this.validNode_(newNode)) {
    return newNode;
  } else if (newNode) {
    return this.getPreviousNode_(newNode);
  }
  return null;
};
