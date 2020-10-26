/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
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

goog.requireType('Blockly.ShortcutRegistry');


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
 * @param {!Blockly.ShortcutRegistry.KeyboardShortcut} action The action to be handled.
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
