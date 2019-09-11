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

goog.provide('Blockly.FlyoutCursor');

goog.require('Blockly.Cursor');

/**
 * Class for a flyout cursor.
 * This controls how a user navigates blocks in the flyout.
 * @constructor
 */
Blockly.FlyoutCursor = function() {
  Blockly.FlyoutCursor.superClass_.constructor.call(this);
};
goog.inherits(Blockly.FlyoutCursor, Blockly.Cursor);

/**
 * Find the next connection, field, or block.
 * @return {Blockly.ASTNode} The next element, or null if the current node is
 *     not set or there is no next value.
 */
Blockly.FlyoutCursor.prototype.next = function() {
  if (!this.isMarker_) {
    var curNode = this.getCurNode();
    if (!curNode) {
      return null;
    }
    var newNode = curNode.next();

    if (newNode) {
      this.setLocation(newNode);
    }
    return newNode;
  }
};

/**
 * Find the in connection or field.
 * @return {Blockly.ASTNode} The in element, or null if the current node is
 *     not set or there is no in value.
 */
Blockly.FlyoutCursor.prototype.in = function() {
  return null;
};

/**
 * Find the previous connection, field, or block.
 * @return {Blockly.ASTNode} The previous element, or null if the current node
 *     is not set or there is no previous value.
 */
Blockly.FlyoutCursor.prototype.prev = function() {
  if (!this.isMarker_) {
    var curNode = this.getCurNode();
    if (!curNode) {
      return null;
    }
    var newNode = curNode.prev();
    
    if (newNode) {
      this.setLocation(newNode);
    }
    return newNode;
  }
};

/**
 * Find the out connection, field, or block.
 * @return {Blockly.ASTNode} The out element, or null if the current node is
 *     not set or there is no out value.
 */
Blockly.FlyoutCursor.prototype.out = function() {
  return null;
};
