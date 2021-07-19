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

goog.require('Blockly.ASTNode');
goog.require('Blockly.Marker');
goog.require('Blockly.registry');
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
 * @public
 */
Blockly.Cursor.prototype.next = function() {
  const curNode = this.getCurNode();
  if (!curNode) {
    return null;
  }

  let newNode = curNode.next();
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
 * @public
 */
Blockly.Cursor.prototype.in = function() {
  let curNode = this.getCurNode();
  if (!curNode) {
    return null;
  }
  // If we are on a previous or output connection, go to the block level before
  // performing next operation.
  if (curNode.getType() == Blockly.ASTNode.types.PREVIOUS ||
      curNode.getType() == Blockly.ASTNode.types.OUTPUT) {
    curNode = curNode.next();
  }
  const newNode = curNode.in();

  if (newNode) {
    this.setCurNode(newNode);
  }
  return newNode;
};

/**
 * Find the previous connection, field, or block.
 * @return {Blockly.ASTNode} The previous element, or null if the current node
 *     is not set or there is no previous value.
 * @public
 */
Blockly.Cursor.prototype.prev = function() {
  const curNode = this.getCurNode();
  if (!curNode) {
    return null;
  }
  let newNode = curNode.prev();

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
 * @public
 */
Blockly.Cursor.prototype.out = function() {
  const curNode = this.getCurNode();
  if (!curNode) {
    return null;
  }
  let newNode = curNode.out();

  if (newNode && newNode.getType() == Blockly.ASTNode.types.BLOCK) {
    newNode = newNode.prev() || newNode;
  }

  if (newNode) {
    this.setCurNode(newNode);
  }
  return newNode;
};

Blockly.registry.register(
    Blockly.registry.Type.CURSOR, Blockly.registry.DEFAULT, Blockly.Cursor);
