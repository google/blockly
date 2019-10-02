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
 * @fileoverview The class representing a cursor.
 * Used primarily for keyboard navigation.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */
'use strict';

goog.provide('Blockly.Cursor');


/**
 * Class for a cursor.
 * A cursor controls how a user navigates the Blockly AST.
 * @constructor
 */
Blockly.Cursor = function() {
  /*
   * The current location of the cursor.
   * @type {Blockly.ASTNode}
   * @private
   */
  this.curNode_ = null;

  /**
   * The object in charge of drawing the visual representation of the current node.
   * @type {Blockly.CursorSvg}
   * @private
   */
  this.drawer_ = null;
};

/**
 * Sets the object in charge of drawing the cursor.
 * @param {Blockly.CursorSvg} drawer The object in charge of drawing the cursor.
 */
Blockly.Cursor.prototype.setDrawer = function(drawer) {
  this.drawer_ = drawer;
};

/**
 * Get the current drawer for the cursor.
 * @return {Blockly.CursorSvg} The object in charge of drawing the cursor.
 */
Blockly.Cursor.prototype.getDrawer = function() {
  return this.drawer_;
};

/**
 * Gets the current location of the cursor.
 * @return {Blockly.ASTNode} The current field, connection, or block the cursor
 *     is on.
 */
Blockly.Cursor.prototype.getCurNode = function() {
  return this.curNode_;
};

/**
 * Set the location of the cursor and call the update method.
 * Setting isStack to true will only work if the newLocation is the top most
 * output or previous connection on a stack.
 * @param {Blockly.ASTNode} newNode The new location of the cursor.
 */
Blockly.Cursor.prototype.setCurNode = function(newNode) {
  this.curNode_ = newNode;
  if (this.drawer_) {
    this.drawer_.draw(this.getCurNode());
  }
};

/**
 * Hide the cursor SVG.
 */
Blockly.Cursor.prototype.hide = function() {
  if (this.drawer_) {
    this.drawer_.hide();
  }
};

/**
 * Find the next connection, field, or block.
 * @return {Blockly.ASTNode} The next element, or null if the current node is
 *     not set or there is no next value.
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
