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
 * @fileoverview The class representing a cursor.
 * Used primarily for keyboard navigation.
 */
'use strict';

goog.provide('Blockly.Cursor');


/**
 * Class for a cursor.
 * A cursor controls how a user navigates the blockly ast.
 * @constructor
 */
Blockly.Cursor = function() {
  /*
   * The current location of the cursor.
   * @type {Blockly.Field|Blockly.Connection|Blockly.Block}
   * @private
   */
  this.curNode_ = null;
};

/**
 * The object in charge of drawing the visual representation of the current node.
 * @type {Blockly.CursorSvg}
 */
Blockly.Cursor.prototype.drawer = null;

/**
 * Sets the object in charge of drawing the cursor.
 * @param{Blockly.CursorSvg} drawer The object in charge of drawing the cursor.
 */
Blockly.Cursor.prototype.setDrawer = function(drawer) {
  this.drawer = drawer;
};

/**
 * Get the current drawer for the cursor.
 * @return {Blockly.CursorSvg} The object in charge of drawing the cursor.
 */
Blockly.Cursor.prototype.getDrawer = function() {
  return this.drawer;
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
Blockly.Cursor.prototype.setLocation = function(newNode) {
  this.curNode_ = newNode;
  if (this.drawer) {
    this.drawer.draw(this.getCurNode());
  }
};

/**
 * Hide the cursor svg.
 */
Blockly.Cursor.prototype.hide = function() {
  if (this.drawer) {
    this.drawer.hide();
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

  if (newNode && newNode.getType() === Blockly.ASTNode.types.NEXT) {
    newNode = newNode.next() || newNode;
  }

  if (newNode) {
    this.setLocation(newNode);
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
  var newNode = curNode.in();

  if (newNode && newNode.getType() === Blockly.ASTNode.types.OUTPUT) {
    newNode = newNode.next() || newNode;
  }

  if (newNode) {
    this.setLocation(newNode);
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

  if (newNode && newNode.getType() === Blockly.ASTNode.types.NEXT) {
    newNode = newNode.prev() || newNode;
  }

  if (newNode) {
    this.setLocation(newNode);
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
  if (newNode) {
    this.setLocation(newNode);
  }
  return newNode;
};
