/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The class representing a basic cursor.
 * Used to demo switching between different cursors.
 */
'use strict';

/**
 * The class representing a basic cursor.
 * Used to demo switching between different cursors.
 * @class
 */
goog.module('Blockly.BasicCursor');

const object = goog.require('Blockly.utils.object');
const registry = goog.require('Blockly.registry');
const {ASTNode} = goog.require('Blockly.ASTNode');
const {Cursor} = goog.require('Blockly.Cursor');


/**
 * Class for a basic cursor.
 * This will allow the user to get to all nodes in the AST by hitting next or
 * previous.
 * @constructor
 * @extends {Cursor}
 * @alias Blockly.BasicCursor
 */
const BasicCursor = function() {
  BasicCursor.superClass_.constructor.call(this);
};
object.inherits(BasicCursor, Cursor);

/**
 * Name used for registering a basic cursor.
 * @const {string}
 */
BasicCursor.registrationName = 'basicCursor';

/**
 * Find the next node in the pre order traversal.
 * @return {?ASTNode} The next node, or null if the current node is
 *     not set or there is no next value.
 * @override
 */
BasicCursor.prototype.next = function() {
  const curNode = this.getCurNode();
  if (!curNode) {
    return null;
  }
  const newNode = this.getNextNode_(curNode, this.validNode_);

  if (newNode) {
    this.setCurNode(newNode);
  }
  return newNode;
};

/**
 * For a basic cursor we only have the ability to go next and previous, so
 * in will also allow the user to get to the next node in the pre order
 * traversal.
 * @return {?ASTNode} The next node, or null if the current node is
 *     not set or there is no next value.
 * @override
 */
BasicCursor.prototype.in = function() {
  return this.next();
};

/**
 * Find the previous node in the pre order traversal.
 * @return {?ASTNode} The previous node, or null if the current node
 *     is not set or there is no previous value.
 * @override
 */
BasicCursor.prototype.prev = function() {
  const curNode = this.getCurNode();
  if (!curNode) {
    return null;
  }
  const newNode = this.getPreviousNode_(curNode, this.validNode_);

  if (newNode) {
    this.setCurNode(newNode);
  }
  return newNode;
};

/**
 * For a basic cursor we only have the ability to go next and previous, so
 * out will allow the user to get to the previous node in the pre order
 * traversal.
 * @return {?ASTNode} The previous node, or null if the current node is
 *     not set or there is no previous value.
 * @override
 */
BasicCursor.prototype.out = function() {
  return this.prev();
};

/**
 * Uses pre order traversal to navigate the Blockly AST. This will allow
 * a user to easily navigate the entire Blockly AST without having to go in
 * and out levels on the tree.
 * @param {?ASTNode} node The current position in the AST.
 * @param {!function(ASTNode) : boolean} isValid A function true/false
 *     depending on whether the given node should be traversed.
 * @return {?ASTNode} The next node in the traversal.
 * @protected
 */
BasicCursor.prototype.getNextNode_ = function(node, isValid) {
  if (!node) {
    return null;
  }
  const newNode = node.in() || node.next();
  if (isValid(newNode)) {
    return newNode;
  } else if (newNode) {
    return this.getNextNode_(newNode, isValid);
  }
  const siblingOrParent = this.findSiblingOrParent_(node.out());
  if (isValid(siblingOrParent)) {
    return siblingOrParent;
  } else if (siblingOrParent) {
    return this.getNextNode_(siblingOrParent, isValid);
  }
  return null;
};

/**
 * Reverses the pre order traversal in order to find the previous node. This
 * will allow a user to easily navigate the entire Blockly AST without having to
 * go in and out levels on the tree.
 * @param {?ASTNode} node The current position in the AST.
 * @param {!function(ASTNode) : boolean} isValid A function true/false
 *     depending on whether the given node should be traversed.
 * @return {?ASTNode} The previous node in the traversal or null if no
 *     previous node exists.
 * @protected
 */
BasicCursor.prototype.getPreviousNode_ = function(node, isValid) {
  if (!node) {
    return null;
  }
  let newNode = node.prev();

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
 * @param {?ASTNode} node The AST node to check whether it is valid.
 * @return {boolean} True if the node should be visited, false otherwise.
 * @protected
 */
BasicCursor.prototype.validNode_ = function(node) {
  let isValid = false;
  const type = node && node.getType();
  if (type === ASTNode.types.OUTPUT || type === ASTNode.types.INPUT ||
      type === ASTNode.types.FIELD || type === ASTNode.types.NEXT ||
      type === ASTNode.types.PREVIOUS || type === ASTNode.types.WORKSPACE) {
    isValid = true;
  }
  return isValid;
};

/**
 * From the given node find either the next valid sibling or parent.
 * @param {?ASTNode} node The current position in the AST.
 * @return {?ASTNode} The parent AST node or null if there are no
 *     valid parents.
 * @private
 */
BasicCursor.prototype.findSiblingOrParent_ = function(node) {
  if (!node) {
    return null;
  }
  const nextNode = node.next();
  if (nextNode) {
    return nextNode;
  }
  return this.findSiblingOrParent_(node.out());
};


/**
 * Get the right most child of a node.
 * @param {?ASTNode} node The node to find the right most child of.
 * @return {?ASTNode} The right most child of the given node, or the node
 *     if no child exists.
 * @private
 */
BasicCursor.prototype.getRightMostChild_ = function(node) {
  if (!node.in()) {
    return node;
  }
  let newNode = node.in();
  while (newNode.next()) {
    newNode = newNode.next();
  }
  return this.getRightMostChild_(newNode);
};

registry.register(
    registry.Type.CURSOR, BasicCursor.registrationName, BasicCursor);

exports.BasicCursor = BasicCursor;
