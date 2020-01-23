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
    var location = node.getLocation();
    if (type == Blockly.ASTNode.types.FIELD &&
        location && location.isTabNavigable() &&
        (/** @type {!Blockly.Field} */ (location)).isClickable()) {
      isValid = true;
    }
  }
  return isValid;
};
