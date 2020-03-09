/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The class representing a cursor.
 * Used primarily for keyboard navigation.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */
'use strict';

goog.provide('Blockly.Cursor');

goog.require('Blockly.Action');
goog.require('Blockly.ASTNode');
goog.require('Blockly.Marker');
goog.require('Blockly.navigation');
goog.require('Blockly.utils.object');


/**
 * Class for a cursor.
 * A cursor controls how a user navigates the Blockly AST.
 * @constructor
 * @extends {Blockly.Marker}
 */
Blockly.Cursor = function() {
  Blockly.Cursor.superClass_.constructor.call(this);

  /**
   * @override
   */
  this.type = 'cursor';
};
Blockly.utils.object.inherits(Blockly.Cursor, Blockly.Marker);

/**
 * Find the next connection, field, or block.
 * @return {Blockly.ASTNode} The next element, or null if the current node is
 *     not set or there is no next value.
 * @protected
 */
Blockly.Cursor.prototype.next = function() {
  var curNode = this.getCurNode();
  if (!curNode) {
    return null;
  }

  var newNode = curNode.next();
  while (newNode && newNode.next() &&
    (newNode.getType() == Blockly.ASTNode.types.NEXT ||
    newNode.getType() == Blockly.ASTNode.types.BLOCK)) {
    newNode = newNode.next();
  }

  if (newNode) {
    this.setCurNode(newNode);
  }
  return newNode;
};

/**
 * Find the in connection or field.
 * @return {Blockly.ASTNode} The in element, or null if the current node is
 *     not set or there is no in value.
 * @protected
 */
Blockly.Cursor.prototype.in = function() {
  var curNode = this.getCurNode();
  if (!curNode) {
    return null;
  }
  // If we are on a previous or output connection, go to the block level before
  // performing next operation.
  if (curNode.getType() == Blockly.ASTNode.types.PREVIOUS ||
    curNode.getType() == Blockly.ASTNode.types.OUTPUT) {
    curNode = curNode.next();
  }
  var newNode = curNode.in();

  if (newNode) {
    this.setCurNode(newNode);
  }
  return newNode;
};

/**
 * Find the previous connection, field, or block.
 * @return {Blockly.ASTNode} The previous element, or null if the current node
 *     is not set or there is no previous value.
 * @protected
 */
Blockly.Cursor.prototype.prev = function() {
  var curNode = this.getCurNode();
  if (!curNode) {
    return null;
  }
  var newNode = curNode.prev();

  while (newNode && newNode.prev() &&
    (newNode.getType() == Blockly.ASTNode.types.NEXT ||
    newNode.getType() == Blockly.ASTNode.types.BLOCK)) {
    newNode = newNode.prev();
  }

  if (newNode) {
    this.setCurNode(newNode);
  }
  return newNode;
};

/**
 * Find the out connection, field, or block.
 * @return {Blockly.ASTNode} The out element, or null if the current node is
 *     not set or there is no out value.
 * @protected
 */
Blockly.Cursor.prototype.out = function() {
  var curNode = this.getCurNode();
  if (!curNode) {
    return null;
  }
  var newNode = curNode.out();

  if (newNode && newNode.getType() == Blockly.ASTNode.types.BLOCK) {
    newNode = newNode.prev() || newNode;
  }

  if (newNode) {
    this.setCurNode(newNode);
  }
  return newNode;
};

/**
 * Handles the given action.
 * This is only triggered when keyboard navigation is enabled.
 * @param {!Blockly.Action} action The action to be handled.
 * @return {boolean} True if the action has been handled, false otherwise.
 */
Blockly.Cursor.prototype.onBlocklyAction = function(action) {
  // If we are on a field give it the option to handle the action
  if (this.getCurNode() &&
      this.getCurNode().getType() === Blockly.ASTNode.types.FIELD &&
      this.getCurNode().getLocation().onBlocklyAction(action)) {
    return true;
  }
  switch (action.name) {
    case Blockly.navigation.actionNames.PREVIOUS:
      this.prev();
      return true;
    case Blockly.navigation.actionNames.OUT:
      this.out();
      return true;
    case Blockly.navigation.actionNames.NEXT:
      this.next();
      return true;
    case Blockly.navigation.actionNames.IN:
      this.in();
      return true;
    default:
      return false;
  }
};
