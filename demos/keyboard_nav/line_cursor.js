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
 * @fileoverview The class representing a basic cursor.
 * Used to demo switching between different cursors.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */
'use strict';


/**
 * Class for a line cursor.
 * This will allow the user to get to all nodes in the AST by hitting next or
 * previous.
 * @constructor
 * @extends {Blockly.LineCursor}
 */
Blockly.LineCursor = function() {
  Blockly.LineCursor.superClass_.constructor.call(this);
};
Blockly.utils.object.inherits(Blockly.LineCursor, Blockly.BasicCursor);


/**
 * Find the next node in the pre order traversal.
 * @return {Blockly.ASTNode} The next node, or null if the current node is
 *     not set or there is no next value.
 * @override
 */
Blockly.LineCursor.prototype.next = function() {
  var curNode = this.getCurNode();
  if (!curNode) {
    return null;
  }
  var newNode = this.getNextNode_(curNode, this.validNode_);

  // Skip the input or next value if there is a connected block.
  if (newNode && (newNode.getType() == Blockly.ASTNode.types.INPUT ||
      newNode.getType() == Blockly.ASTNode.types.NEXT) &&
      newNode.getLocation().targetBlock()) {
    newNode = this.getNextNode_(newNode, this.validNode_);
  }
  if (newNode) {
    this.setCurNode(newNode);
  }
  return newNode;
};

/**
 * For a basic cursor we only have the ability to go next and previous, so
 * in will also allow the user to get to the next node in the pre order traversal.
 * @return {Blockly.ASTNode} The next node, or null if the current node is
 *     not set or there is no next value.
 * @override
 */
Blockly.LineCursor.prototype.in = function() {
  var curNode = this.getCurNode();
  if (!curNode) {
    return null;
  }
  var newNode = this.getNextNode_(curNode, this.validInNode_);

  if (newNode) {
    this.setCurNode(newNode);
  }
  return newNode;
};

/**
 * Find the previous node in the pre order traversal.
 * @return {Blockly.ASTNode} The previous node, or null if the current node
 *     is not set or there is no previous value.
 * @override
 */
Blockly.LineCursor.prototype.prev = function() {
  var curNode = this.getCurNode();
  if (!curNode) {
    return null;
  }
  var newNode = this.getPreviousNode_(curNode, this.validNode_);
  
  if (newNode && (newNode.getType() == Blockly.ASTNode.types.INPUT ||
    newNode.getType() == Blockly.ASTNode.types.NEXT) &&
    newNode.getLocation().targetBlock()) {
    newNode = this.getPreviousNode_(newNode, this.validNode_);
  }

  if (newNode) {
    this.setCurNode(newNode);
  }
  return newNode;
};

/**
 * For a basic cursor we only have the ability to go next and previou, so
 * out will allow the user to get to the previous node in the pre order traversal.
 * @return {Blockly.ASTNode} The previous node, or null if the current node is
 *     not set or there is no previous value.
 * @override
 */
Blockly.LineCursor.prototype.out = function() {
  var curNode = this.getCurNode();
  if (!curNode) {
    return null;
  }
  var newNode = this.getPreviousNode_(curNode, this.validInNode_);

  if (newNode) {
    this.setCurNode(newNode);
  }
  return newNode;

};

/**
 * Decides what nodes to traverse and which ones to skip. Currently, it
 * skips output, stack and workspace nodes.
 * @param {Blockly.ASTNode} node The AST node to check whether it is valid.
 * @return {boolean} True if the node should be visited, false otherwise.
 * @private
 */
Blockly.LineCursor.prototype.validNode_ = function(node) {
  if (!node) {
    return false;
  }
  var isValid = false;
  var location = node.getLocation();
  var type = node && node.getType();
  if (type == Blockly.ASTNode.types.BLOCK) {
    if (location.outputConnection === null) {
      isValid = true;
    }
  } else if (type == Blockly.ASTNode.types.INPUT && 
      location.type == Blockly.NEXT_STATEMENT) {
    isValid = true;
  } else if (type == Blockly.ASTNode.types.NEXT) {
    isValid = true;
  }
  return isValid;
};

/**
 * 
 */
Blockly.LineCursor.prototype.validInNode_ = function(node) {
  if (!node) {
    return false;
  }
  var isValid = false;
  var location = node.getLocation();
  var type = node && node.getType();
  if (type == Blockly.ASTNode.types.FIELD) {
      isValid = true;
  } else if (type == Blockly.ASTNode.types.INPUT &&
      location.type == Blockly.INPUT_VALUE) {
      isValid = true;
  }
  return isValid;
};
