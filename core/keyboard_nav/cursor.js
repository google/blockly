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
 * @param {boolean=} opt_marker True if the cursor is a marker. A marker is used
 *     to save a location and is an immovable cursor. False or undefined if the
 *     cursor is not a marker.
 * @constructor
 */
Blockly.Cursor = function(opt_marker) {
  /*
   * The current location of the cursor.
   * @type {Blockly.Field|Blockly.Connection|Blockly.Block}
   * @private
   */
  this.curNode_ = null;

  /**
   * Whether or not the cursor is a marker.
   * @type {boolean} True if the cursor is a marker. False otherwise.
   * @private
   */
  this.isMarker_ = !!opt_marker;
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
  this.update_();
};

/**
 * Update method to be overwritten in cursor_svg.
 * @protected
 */
Blockly.Cursor.prototype.update_ = function() {};

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
