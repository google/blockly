/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The class representing a cursor that is used to navigate
 * between tab navigable fields.
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

goog.provide('Blockly.TabNavigateCursor');

goog.require('Blockly.ASTNode');
goog.require('Blockly.BasicCursor');
goog.require('Blockly.utils.object');


/**
 * A cursor for navigating between tab navigable fields.
 * @constructor
 * @extends {Blockly.BasicCursor}
 */
Blockly.TabNavigateCursor = function() {
  Blockly.TabNavigateCursor.superClass_.constructor.call(this);
};
Blockly.utils.object.inherits(Blockly.TabNavigateCursor, Blockly.BasicCursor);

/**
 * Skip all nodes except for tab navigable fields.
 * @param {Blockly.ASTNode} node The AST node to check whether it is valid.
 * @return {boolean} True if the node should be visited, false otherwise.
 * @override
 */
Blockly.TabNavigateCursor.prototype.validNode_ = function(node) {
  var isValid = false;
  var type = node && node.getType();
  if (node) {
    var location = /** @type {Blockly.Field} */ (node.getLocation());
    if (type == Blockly.ASTNode.types.FIELD &&
        location && location.isTabNavigable() && location.isClickable()) {
      isValid = true;
    }
  }
  return isValid;
};
