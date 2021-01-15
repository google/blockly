/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The class representing a basic cursor.
 * Used to demo switching between different cursors.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */
'use strict';

goog.provide('Blockly.BasicCursor');

goog.require('Blockly.ASTNode');
goog.require('Blockly.Cursor');


/**
 * Class for a basic cursor.
 * This will allow the user to get to all nodes in the AST by hitting next or
 * previous.
 * @constructor
 * @extends {Blockly.Cursor}
 */
Blockly.BasicCursor = function() {
  Blockly.BasicCursor.superClass_.constructor.call(this);
};
Blockly.utils.object.inherits(Blockly.BasicCursor, Blockly.Cursor);

/**
 * Find the next node in the pre order traversal.
 * @return {Blockly.ASTNode} The next node, or null if the current node is
 *     not set or there is no next value.
 * @override
 */
Blockly.BasicCursor.prototype.next = function() {
  var curNode = this.getCurNode();
  if (!curNode) {
    return null;
  }
  var newNode = this.getNextNode_(curNode, this.validNode_);

  if (newNode) {
    this.setCurNode(newNode);
  }
  return newNode;
};

/**
 * For a basic cursor we only have the ability to go next and previous, so
 * in will also allow the user to get to the next node in the pre order traversal.
 * @return {Blockly.ASTNode} The next node, or null if the current node is
 *     not set or there is no next value.
 * @override
 */
Blockly.BasicCursor.prototype.in = function() {
  return this.next();
};

/**
 * Find the previous node in the pre order traversal.
 * @return {Blockly.ASTNode} The previous node, or null if the current node
 *     is not set or there is no previous value.
 * @override
 */
Blockly.BasicCursor.prototype.prev = function() {
  var curNode = this.getCurNode();
  if (!curNode) {
    return null;
  }
  var newNode = this.getPreviousNode_(curNode, this.validNode_);

  if (newNode) {
    this.setCurNode(newNode);
  }
  return newNode;
};

/**
 * For a basic cursor we only have the ability to go next and previous, so
 * out will allow the user to get to the previous node in the pre order traversal.
 * @return {Blockly.ASTNode} The previous node, or null if the current node is
 *     not set or there is no previous value.
 * @override
 */
Blockly.BasicCursor.prototype.out = function() {
  return this.prev();
};

/**
 * Uses pre order traversal to navigate the Blockly AST. This will allow
 * a user to easily navigate the entire Blockly AST without having to go in
 * and out levels on the tree.
 * @param {Blockly.ASTNode} node The current position in the AST.
 * @param {!function(Blockly.ASTNode) : boolean} isValid A function true/false
 *     depending on whether the given node should be traversed.
 * @return {Blockly.ASTNode} The next node in the traversal.
 * @protected
 */
Blockly.BasicCursor.prototype.getNextNode_ = function(node, isValid) {
  if (!node) {
    return null;
  }
  var newNode = node.in() || node.next();
  if (isValid(newNode)) {
    return newNode;
  } else if (newNode) {
    return this.getNextNode_(newNode, isValid);
  }
  var siblingOrParent = this.findSiblingOrParent_(node.out());
  if (isValid(siblingOrParent)) {
    return siblingOrParent;
  } else if (siblingOrParent) {
    return this.getNextNode_(siblingOrParent, isValid);
  }
  return null;
};

/**
 * Reverses the pre order traversal in order to find the previous node. This will
 * allow a user to easily navigate the entire Blockly AST without having to go in
 * and out levels on the tree.
 * @param {Blockly.ASTNode} node The current position in the AST.
 * @param {!function(Blockly.ASTNode) : boolean} isValid A function true/false
 *     depending on whether the given node should be traversed.
 * @return {Blockly.ASTNode} The previous node in the traversal or null if no
 *     previous node exists.
 * @protected
 */
Blockly.BasicCursor.prototype.getPreviousNode_ = function(node, isValid) {
  if (!node) {
    return null;
  }
  var newNode = node.prev();

  if (newNode) {
    newNode = this.getRightMostChild_(newNode);
  } else {
    newNode = node.out();
  }
  if (isValid(newNode)) {
    return newNode;
  } else if (newNode) {
    return this.getPreviousNode_(newNode, isValid);
  }
  return null;
};

/**
 * Decides what nodes to traverse and which ones to skip. Currently, it
 * skips output, stack and workspace nodes.
 * @param {Blockly.ASTNode} node The AST node to check whether it is valid.
 * @return {boolean} True if the node should be visited, false otherwise.
 * @protected
 */
Blockly.BasicCursor.prototype.validNode_ = function(node) {
  var isValid = false;
  var type = node && node.getType();
  if (type == Blockly.ASTNode.types.OUTPUT ||
      type == Blockly.ASTNode.types.INPUT ||
      type == Blockly.ASTNode.types.FIELD ||
      type == Blockly.ASTNode.types.NEXT ||
      type == Blockly.ASTNode.types.PREVIOUS ||
      type == Blockly.ASTNode.types.WORKSPACE) {
    isValid = true;
  }
  return isValid;
};

/**
 * From the given node find either the next valid sibling or parent.
 * @param {Blockly.ASTNode} node The current position in the AST.
 * @return {Blockly.ASTNode} The parent AST node or null if there are no
 *     valid parents.
 * @private
 */
Blockly.BasicCursor.prototype.findSiblingOrParent_ = function(node) {
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
 * Get the right most child of a node.
 * @param {Blockly.ASTNode} node The node to find the right most child of.
 * @return {Blockly.ASTNode} The right most child of the given node, or the node
 *     if no child exists.
 * @private
 */
Blockly.BasicCursor.prototype.getRightMostChild_ = function(node) {
  if (!node.in()) {
    return node;
  }
  var newNode = node.in();
  while (newNode.next()) {
    newNode = newNode.next();
  }
  return this.getRightMostChild_(newNode);

};
