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
 * @constructor
 */
Blockly.Cursor = function() {
  /*
   * The current location of the cursor.
   * @type Blockly.Field|Blockly.Connection|Blockly.Block
   * @private
   */
  this.curNode_ = null;
};

/**
 * Object holding different types for a cursor.
 */
Blockly.Cursor.prototype.types = {
  FIELD: 'field',
  BLOCK: 'block',
  INPUT: 'input',
  OUTPUT: 'output',
  NEXT: 'next',
  PREVIOUS: 'previous',
  STACK: 'stack',
  WORKSPACE: 'workspace'
};

/**
 * Gets the current location of the cursor.
 * @return {Blockly.ASTNode} The current field,
 * connection, or block the cursor is on.
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
  this.update_();
};

/**
 * Update method to be overwritten in cursor_svg.
 * @protected
 */
Blockly.Cursor.prototype.update_ = function() {};

/**
 * Find the next connection, field, or block.
 * @return {Blockly.ASTNode} The next element.
 */
Blockly.Cursor.prototype.next = function() {
  var curNode = this.getCurNode();
  if (!curNode) {
    return null;
  }
  var newNode = curNode.next();
  if (newNode) {
    this.setLocation(newNode);
  }
  return newNode;
};

/**
 * Find the next in connection or field.
 * @return {Blockly.ASTNode} The next element.
 */
Blockly.Cursor.prototype.in = function() {
  var curNode = this.getCurNode();
  if (!curNode) {
    return null;
  }
  var newNode = curNode.in();
  if (newNode) {
    this.setLocation(newNode);
  }
  return newNode;
};

/**
 * Find the previous connection, field, or block.
 * @return {Blockly.ASTNode} The next element.
 */
Blockly.Cursor.prototype.prev = function() {
  var curNode = this.getCurNode();
  if (!curNode) {
    return null;
  }
  var newNode = curNode.prev();
  if (newNode) {
    this.setLocation(newNode);
  }
  return newNode;
};

/**
 * Find the next out connection, field, or block.
 * @return {Blockly.ASTNode} The next element.
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
