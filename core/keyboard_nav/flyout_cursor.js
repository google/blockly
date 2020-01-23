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
 * @fileoverview The class representing a cursor used to navigate the flyout.
 * Used primarily for keyboard navigation.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */
'use strict';

goog.provide('Blockly.FlyoutCursor');

goog.require('Blockly.Cursor');
goog.require('Blockly.navigation');
goog.require('Blockly.utils.object');


/**
 * Class for a flyout cursor.
 * This controls how a user navigates blocks in the flyout.
 * @constructor
 * @extends {Blockly.Cursor}
 */
Blockly.FlyoutCursor = function() {
  Blockly.FlyoutCursor.superClass_.constructor.call(this);
};
Blockly.utils.object.inherits(Blockly.FlyoutCursor, Blockly.Cursor);

/**
 * Handles the given action.
 * This is only triggered when keyboard navigation is enabled.
 * @param {!Blockly.Action} action The action to be handled.
 * @return {boolean} True if the action has been handled, false otherwise.
 * @override
 */
Blockly.FlyoutCursor.prototype.onBlocklyAction = function(action) {
  switch (action.name) {
    case Blockly.navigation.actionNames.PREVIOUS:
      this.prev();
      return true;
    case Blockly.navigation.actionNames.NEXT:
      this.next();
      return true;
    default:
      return false;
  }
};

/**
 * Find the next connection, field, or block.
 * @return {Blockly.ASTNode} The next element, or null if the current node is
 *     not set or there is no next value.
 * @override
 */
Blockly.FlyoutCursor.prototype.next = function() {
  var curNode = this.getCurNode();
  if (!curNode) {
    return null;
  }
  var newNode = curNode.next();

  if (newNode) {
    this.setCurNode(newNode);
  }
  return newNode;
};

/**
 * This is a  no-op since a flyout cursor can not go in.
 * @return {null} Always null.
 * @override
 */
Blockly.FlyoutCursor.prototype.in = function() {
  return null;
};

/**
 * Find the previous connection, field, or block.
 * @return {Blockly.ASTNode} The previous element, or null if the current node
 *     is not set or there is no previous value.
 * @override
 */
Blockly.FlyoutCursor.prototype.prev = function() {
  var curNode = this.getCurNode();
  if (!curNode) {
    return null;
  }
  var newNode = curNode.prev();

  if (newNode) {
    this.setCurNode(newNode);
  }
  return newNode;
};

/**
 * This is a  no-op since a flyout cursor can not go out.
 * @return {null} Always null.
 * @override
 */
Blockly.FlyoutCursor.prototype.out = function() {
  return null;
};
