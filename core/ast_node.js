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
 * @fileoverview The class representing an ast node.
 * Used to traverse the blockly ast.
 */
'use strict';

goog.provide('Blockly.ASTNode');

/**
 * Class for an ast node.
 * It is recommended that you use one of the createNode methods instead of
 * creating a node directly.
 * @constructor
 * @param {!string} type The type of the location.
 *     Must be in Bockly.ASTNode.types.
 * @param {Blockly.Block|Blockly.Connection|Blockly.Field|Blockly.Workspace}
 *     location The position in the ast.
 * @param {Object=} params Optional dictionary of options.
 */
Blockly.ASTNode = function(type, location, params) {
  if (!location) {
    throw Error('Cannot create a node without a location.');
  }
  /*
   * The type of the location.
   * One of Blockly.ASTNode.types
   * @type {string}
   * @private
   */
  this.type_ = type;

  /*
   * The location of the ast node.
   * @type {!(Blockly.Block|Blockly.Connection|Blockly.Field|Blockly.Workspace)}
   * @private
   */
  this.location_ = location;

  this.processParams_(params || null);

};

/**
 * Object holding different types for an ast node.
 */
Blockly.ASTNode.types = {
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
 * The amount to move the workspace coordinate to the left or right.
 * This occurs when we get the next or previous node from a workspace node.
 * @type {number}
 * @private
 */
Blockly.ASTNode.wsMove_ = 10;

/**
 * The default y offset to use when moving the cursor from a stack to the
 * workspace.
 * @type {number}
 * @private
 */
Blockly.ASTNode.DEFAULT_OFFSET_Y = -20;

/**
 * Create an ast node pointing to a field.
 * @param {Blockly.Field} field The location of the ast node.
 * @return {Blockly.ASTNode} An ast node pointing to a field.
 */
Blockly.ASTNode.createFieldNode = function(field) {
  return new Blockly.ASTNode(Blockly.ASTNode.types.FIELD, field);
};

/**
 * Creates an ast node pointing to a connection. If the connection has a parent
 * input then create an ast node of type input that will hold the connection.
 * @param {Blockly.Connection} connection This is the connection the node will
 *     point to.
 * @return {Blockly.ASTNode} An ast node pointing to a connection.
 */
Blockly.ASTNode.createConnectionNode = function(connection) {
  if (!connection){
    return null;
  }
  if (connection.type === Blockly.INPUT_VALUE) {
    return Blockly.ASTNode.createInputNode(connection.getParentInput());
  } else if (connection.type === Blockly.NEXT_STATEMENT
      && connection.getParentInput()) {
    return Blockly.ASTNode.createInputNode(connection.getParentInput());
  } else if (connection.type === Blockly.NEXT_STATEMENT) {
    return new Blockly.ASTNode(Blockly.ASTNode.types.NEXT, connection);
  } else if (connection.type === Blockly.OUTPUT_VALUE) {
    return new Blockly.ASTNode(Blockly.ASTNode.types.OUTPUT, connection);
  } else if (connection.type === Blockly.PREVIOUS_STATEMENT) {
    return new Blockly.ASTNode(Blockly.ASTNode.types.PREVIOUS, connection);
  }
  return null;
};

/**
 * Creates an ast node pointing to an input. Stores the input connection as the
 *     location.
 * @param {Blockly.Input} input The input used to create an ast node.
 * @return {Blockly.ASTNode} An ast node pointing to a input.
 */
Blockly.ASTNode.createInputNode = function(input) {
  if (!input) {
    return null;
  }
  var params = {
    "input": input
  };
  return new Blockly.ASTNode(Blockly.ASTNode.types.INPUT, input.connection, params);
};

/**
 * Creates an ast node pointing to a block.
 * @param {Blockly.Block} block The block used to create an ast node.
 * @return {Blockly.ASTNode} An ast node pointing to a block.
 */
Blockly.ASTNode.createBlockNode = function(block) {
  return new Blockly.ASTNode(Blockly.ASTNode.types.BLOCK, block);
};

/**
 * Create an ast node of type stack. A stack, represented by its top block, is
 *     the set of all blocks connected to a top block, including the top block.
 * @param {Blockly.Block} topBlock A top block has no parent and can be found
 *     in the list returned by workspace.getTopBlocks().
 * @return {Blockly.ASTNode} An ast node of type stack that points to the top
 *     block on the stack.
 */
Blockly.ASTNode.createStackNode = function(topBlock) {
  return new Blockly.ASTNode(Blockly.ASTNode.types.STACK, topBlock);
};

/**
 * Creates an ast node pointing to a workpsace.
 * @param {Blockly.Workspace} workspace The workspace that we are on.
 * @param {goog.math.Coordinate} wsCoordinate The position on the workspace for
 *     this node.
 * @return {Blockly.ASTNode} An ast node pointing to a workspace and a position
 *     on the workspace.
 */
Blockly.ASTNode.createWorkspaceNode = function(workspace, wsCoordinate) {
  var params = {
    "wsCoordinate": wsCoordinate
  };
  return new Blockly.ASTNode(
      Blockly.ASTNode.types.WORKSPACE, workspace, params);
};

/**
 * Parse the optional parameters.
 * @param {Object} params The user specified parameters.
 * @private
 */
Blockly.ASTNode.prototype.processParams_ = function(params){
  if (!params) {
    return;
  }
  if (params['wsCoordinate']) {
    this.wsCoordinate_ = params['wsCoordinate'];
  } else if (params['input']) {
    this.parentInput_ = params['input'];
  }
};

/**
 * Gets the value pointed to by this node.
 * It is the callers responsibility to check the node type to figure out what
 * type of object they get back from this.
 * @return {!(Blockly.Field|Blockly.Connection|Blockly.Block|Blockly.Workspace)}
 * The current field, connection, workspace, or block the cursor is on.
 */
Blockly.ASTNode.prototype.getLocation = function() {
  return this.location_;
};

/**
 * The type of the current location.
 * One of Blockly.ASTNode.types
 * @return {string} The type of the location.
 */
Blockly.ASTNode.prototype.getType = function() {
  return this.type_;
};

/**
 * The coordinate on the workspace.
 * @return {goog.math.Coordinate} The workspace coordinate or null if the
 *     location is not a workspace.
 */
Blockly.ASTNode.prototype.getWsCoordinate = function() {
  return this.wsCoordinate_;
};

/**
 * Get the parent input of the location.
 * @return {Blockly.Input} The parent input of the location or null if the node
 * is not input type.
 * @package
 */
Blockly.ASTNode.prototype.getParentInput = function() {
  return this.parentInput_;
};

/**
 * Get either the next editable field, or the first editable field for the given
 * input.
 * @param {!(Blockly.Field|Blockly.Connection|Blockly.Block)} location The current
 *     location of the cursor.
 * @param {!Blockly.Input} parentInput The parentInput of the field.
 * @param {boolean=} opt_first If true find the first editable field otherwise
 *     get the next editable field.
 * @return {Blockly.ASTNode} The ast node holding the next field or null if no
 *     next field exists.
 * @private
 */
Blockly.ASTNode.prototype.findNextEditableField_ = function(location,
    parentInput, opt_first) {
  var fieldRow = parentInput.fieldRow;
  var fieldIdx = fieldRow.indexOf(location);
  var startIdx = opt_first ? 0 : fieldIdx + 1;
  for (var i = startIdx; i < fieldRow.length; i++) {
    var field = fieldRow[i];
    if (field.isCurrentlyEditable()) {
      return Blockly.ASTNode.createFieldNode(field);
    }
  }
  return null;
};

/**
 * Get either the previous editable field, or get the first editable field for
 * the given input.
 * @param {!(Blockly.Field|Blockly.Connection)} location The current location of
 *     the cursor, which must be a field or connection.
 * @param {!Blockly.Input} parentInput The parentInput of the field.
 * @param {boolean=} opt_last If true find the last editable field otherwise get
 *     the previous field.
 * @return {Blockly.ASTNode} The ast node holding the previous or last field or
 *     null if no previous field exists.
 * @private
 */
Blockly.ASTNode.prototype.findPreviousEditableField_ = function(location,
    parentInput, opt_last) {
  var fieldRow = parentInput.fieldRow;
  var fieldIdx = fieldRow.indexOf(location);
  var previousField = null;
  var startIdx = opt_last ? fieldRow.length - 1 : fieldIdx - 1;
  for (var i = startIdx; i >= 0; i--) {
    var field = fieldRow[i];
    if (field.isCurrentlyEditable()) {
      previousField = field;
      return Blockly.ASTNode.createFieldNode(previousField);
    }
  }
  return null;
};

/**
 * Get the first field or connection that is either editable or has connection
 * value of not null.
 * @param {!Blockly.Connection} location Current location in the ast.
 * @param {Blockly.Input} parentInput The parent input of the connection.
 * @return {Blockly.ASTNode} The ast node holding the next field or connection.
 * @private
 */
Blockly.ASTNode.prototype.findNextForInput_ = function(location, parentInput){
  if (!parentInput) {
    return null;
  }
  var inputs = location.getSourceBlock().inputList;
  var curIdx = inputs.indexOf(parentInput);
  if (curIdx <= -1) {
    return null;
  }
  var nxtIdx = curIdx + 1;

  for (var i = nxtIdx; i < inputs.length; i++) {
    var newInput = inputs[i];
    var field = this.findNextEditableField_(location, newInput, true);
    if (field) {
      return field;
    } else if (newInput.connection) {
      var connection = newInput.connection;
      return Blockly.ASTNode.createConnectionNode(connection);
    }
  }
  return null;
};

/**
 * Find the next input or field given a field location.
 * @param {Blockly.Field} location Current location in the ast.
 * @param {Blockly.Input} parentInput The parent input of the field.
 * @return {Blockly.ASTNode} The ast node holding the next field or connection.
 * @private
 */
Blockly.ASTNode.prototype.findNextForField_ = function(location, parentInput) {
  if (!parentInput) {
    return null;
  }
  var newAstNode = this.findNextEditableField_(location, parentInput);

  if (!newAstNode || !newAstNode.getLocation()) {
    newAstNode = Blockly.ASTNode.createConnectionNode(parentInput.connection);
  }
  return newAstNode;
};

/**
 * Given the current selected field or connection find the previous connection
 *     or field.
 * @param {!Blockly.Connection} location Current location in the ast.
 * @param {Blockly.Input} parentInput Parent input of the connection or field.
 * @return {Blockly.ASTNode} The ast node holding the previous field or
 *     connection.
 * @private
 */
Blockly.ASTNode.prototype.findPrevForInput_ = function(location, parentInput){
  if (!parentInput) {
    return null;
  }
  var block = location.getSourceBlock();
  var inputs = block.inputList;
  var curIdx = inputs.indexOf(parentInput);

  for (var i = curIdx; i >= 0; i--) {
    var newInput = inputs[i];
    var fieldNode = this.findPreviousEditableField_(location, newInput, true);
    if (newInput.connection && newInput.connection !== parentInput.connection) {
      return Blockly.ASTNode.createInputNode(newInput);
    } else if (fieldNode && fieldNode.getLocation()
        && fieldNode.getLocation() !== location) {
      return fieldNode;
    }
  }
  return null;
};

/**
 * Find the previous input or field given a field location.
 * @param {!Blockly.Field} location The current location of the cursor.
 * @param {Blockly.Input} parentInput The parent input of the field.
 * @return {Blockly.ASTNode} The ast node holding the previous input or field.
 * @private
 */
Blockly.ASTNode.prototype.findPrevForField_ = function(location, parentInput) {
  if (!parentInput) {
    return null;
  }
  var block = location.getSourceBlock();
  var inputs = block.inputList;
  var curIdx = inputs.indexOf(parentInput);
  var newAstNode = this.findPreviousEditableField_(location, parentInput);

  if (!newAstNode && curIdx - 1 >= 0) {
    newAstNode = Blockly.ASTNode.createInputNode(inputs[curIdx - 1]);
  }
  return newAstNode;
};

/**
 * Navigate between stacks of blocks on the workspace.
 * @param {boolean} forward True to go forward. False to go backwards.
 * @return {Blockly.ASTNode} The first block of the next stack or null if there
 * are no blocks on the workspace.
 * @private
 */
Blockly.ASTNode.prototype.navigateBetweenStacks_ = function(forward) {
  var curLocation = this.getLocation();
  if (!(curLocation instanceof Blockly.Block)) {
    curLocation = curLocation.getSourceBlock();
  }
  if (!curLocation) {
    return null;
  }
  var curRoot = curLocation.getRootBlock();
  var topBlocks = curRoot.workspace.getTopBlocks(true);
  for (var i = 0; i < topBlocks.length; i++) {
    var topBlock = topBlocks[i];
    if (curRoot.id == topBlock.id) {
      var offset = forward ? 1 : -1;
      var resultIndex = i + offset;
      if (resultIndex == -1) {
        resultIndex = topBlocks.length - 1;
      } else if (resultIndex == topBlocks.length) {
        resultIndex = 0;
      }
      return Blockly.ASTNode.createStackNode(topBlocks[resultIndex]);
    }
  }
  throw Error('Couldn\'t find ' + (forward ? 'next' : 'previous') +
      ' stack?!?!?!');
};

/**
 * Finds the top most ast node for a given block.
 * This is either the previous connection, output connection or block depending
 * on what kind of connections the block has.
 * @param {Blockly.Block} block The block that we want to find the top
 *     connection on.
 * @return {!Blockly.ASTNode} The ast node containing the top connection.
 * @private
 */
Blockly.ASTNode.prototype.findTopASTNodeForBlock_ = function(block) {
  var previousConnection = block.previousConnection;
  var outputConnection = block.outputConnection;
  if (previousConnection) {
    return Blockly.ASTNode.createConnectionNode(previousConnection);
  } else if (outputConnection) {
    return Blockly.ASTNode.createConnectionNode(outputConnection);
  } else {
    return Blockly.ASTNode.createBlockNode(block);
  }
};

/**
 * Get the ast node pointing to the input that the block is nested under or if
 * the block is not nested then get the stack ast node.
 * @param {Blockly.Block} block The source block of the current location.
 * @return {Blockly.ASTNode} The ast node pointing to the input connection or
 *     the top block of the stack this block is in.
 * @private
 */
Blockly.ASTNode.prototype.getOutAstNodeForBlock_ = function(block) {
  var topBlock = null;
  //If the block doesn't have a previous connection then it is the top of the
  //substack
  if (!block.previousConnection) {
    topBlock = block;
  } else {
    topBlock = this.findTopOfSubStack_(block);
  }
  var topConnection = topBlock.previousConnection || topBlock.outputConnection;
  //If the top connection has a parentInput, create an ast node pointing to that input
  if (topConnection && topConnection.targetConnection &&
        topConnection.targetConnection.getParentInput()) {
    return Blockly.ASTNode.createInputNode(
        topConnection.targetConnection.getParentInput());
  } else {
    //Go to stack level if you are not underneath an input
    return Blockly.ASTNode.createStackNode(topBlock);
  }
};

/**
 * Walk backwards from the given block up through the stack of blocks to find
 * the top block of the sub stack. If we are nested in a statement input only
 * find the top most nested block. Do not go all the way to the top of the
 * stack.
 * @param {!Blockly.Block} sourceBlock A block in the stack.
 * @return {!Blockly.Block} The top block in a stack.
 * @private
 */
Blockly.ASTNode.prototype.findTopOfSubStack_ = function(sourceBlock) {
  var topBlock = sourceBlock;
  while (topBlock && topBlock.previousConnection
    && topBlock.previousConnection.targetConnection
    && topBlock.previousConnection.targetBlock().nextConnection
    == topBlock.previousConnection.targetConnection) {
    topBlock = topBlock.previousConnection.targetBlock();
  }
  return topBlock;
};

/**
 * Find the element to the right of the current element in the ast.
 * @return {Blockly.ASTNode} An ast node that wraps the next field, connection,
 *     block, or workspace. Or null if there is no node to the right.
 */
Blockly.ASTNode.prototype.next = function() {
  switch (this.type_) {
    case Blockly.ASTNode.types.WORKSPACE:
      //TODO: Need to limit this. The view is bounded to half a screen beyond
      //the furthest block.
      var newX = this.wsCoordinate_.x + Blockly.ASTNode.wsMove_;
      var newWsCoordinate = new goog.math.Coordinate(newX, this.wsCoordinate_.y);
      var workspace = /** @type {Blockly.Workspace} */ (this.location_);
      return Blockly.ASTNode.createWorkspaceNode(workspace,
          newWsCoordinate);

    case Blockly.ASTNode.types.STACK:
      return this.navigateBetweenStacks_(true);

    case Blockly.ASTNode.types.OUTPUT:
      return Blockly.ASTNode.createBlockNode(this.location_.getSourceBlock());

    case Blockly.ASTNode.types.FIELD:
      var parentInput = this.location_.getParentInput();
      var field = /** @type {Blockly.Field} */ (this.location_);
      return this.findNextForField_(field, parentInput);

    case Blockly.ASTNode.types.INPUT:
      var inputConnection = /** @type {!Blockly.Connection} */ (this.location_);
      return this.findNextForInput_(inputConnection, this.getParentInput());

    case Blockly.ASTNode.types.BLOCK:
      var nextConnection = this.location_.nextConnection;
      return Blockly.ASTNode.createConnectionNode(nextConnection);

    case Blockly.ASTNode.types.PREVIOUS:
      var output = this.location_.outputConnection;
      if (output) {
        return Blockly.ASTNode.createConnectionNode(output);
      } else {
        var srcBlock = this.location_.getSourceBlock();
        return Blockly.ASTNode.createBlockNode(srcBlock);
      }

    case Blockly.ASTNode.types.NEXT:
      if (this.location_.targetBlock()) {
        return this.findTopASTNodeForBlock_(this.location_.targetBlock());
      }
      break;
  }

  return null;
};

/**
 * Find the element one level below and all the way to the left of the current
 * location.
 * @return {Blockly.ASTNode} An ast node that wraps the next field, connection,
 * workspace, or block. Or null if there is nothing below this node.
 */
Blockly.ASTNode.prototype.in = function() {
  switch (this.type_) {
    case Blockly.ASTNode.types.WORKSPACE:
      var firstTopBlock = this.location_.getTopBlocks(true)[0];
      return Blockly.ASTNode.createStackNode(firstTopBlock);

    case Blockly.ASTNode.types.STACK:
      var block = /** @type {!Blockly.Block} */ (this.location_);
      return this.findTopASTNodeForBlock_(block);

    case Blockly.ASTNode.types.BLOCK:
      var inputs = this.location_.inputList;
      if (inputs && inputs.length > 0) {
        var newParentInput = inputs[0];
        var block = /** @type {!Blockly.Block} */ (this.location_);
        var fieldNode =
            this.findNextEditableField_(block, newParentInput, true);
        if (fieldNode) {
          return fieldNode;
        } else {
          return Blockly.ASTNode.createInputNode(newParentInput);
        }
      }
      break;

    case Blockly.ASTNode.types.INPUT:
      var inputConnection = this.location_;
      if (inputConnection.targetBlock()) {
        return this.findTopASTNodeForBlock_(inputConnection.targetBlock());
      }
      break;

  }
  return null;
};

/**
 * Find the element to the left of the current element in the ast.
 * @return {Blockly.ASTNode} An ast node that wraps the previous field,
 * connection, workspace or block. Or null if no node exists to the left.
 * null.
 */
Blockly.ASTNode.prototype.prev = function() {
  switch (this.type_) {
    case Blockly.ASTNode.types.WORKSPACE:
      var newX = this.wsCoordinate_.x - Blockly.ASTNode.wsMove_;
      var newCoord = new goog.math.Coordinate(newX, this.wsCoordinate_.y);
      var ws = /** @type {Blockly.Workspace} */ (this.location_);
      return Blockly.ASTNode.createWorkspaceNode(ws, newCoord);

    case Blockly.ASTNode.types.STACK:
      return this.navigateBetweenStacks_(false);

    case Blockly.ASTNode.types.OUTPUT:
      var sourceBlock = this.location_.getSourceBlock();
      if (sourceBlock && sourceBlock.previousConnection) {
        var prevConnection = sourceBlock.previousConnection;
        return Blockly.ASTNode.createConnectionNode(prevConnection);
      }
      break;

    case Blockly.ASTNode.types.FIELD:
      var field = /** @type {!Blockly.Field} */ (this.location_);
      var parentInput = this.location_.getParentInput();
      return this.findPrevForField_(field, parentInput);

    case Blockly.ASTNode.types.INPUT:
      var connection = /** @type {!Blockly.Connection} */ (this.location_);
      return this.findPrevForInput_(connection, this.getParentInput());

    case Blockly.ASTNode.types.BLOCK:
      var output = this.location_.outputConnection;
      if (output) {
        return Blockly.ASTNode.createConnectionNode(output);
      } else {
        var prevConnection = this.location_.previousConnection;
        return Blockly.ASTNode.createConnectionNode(prevConnection);
      }

    case Blockly.ASTNode.types.PREVIOUS:
      var prevBlock = this.location_.targetBlock();
      if (prevBlock) {
        var nextConnection = prevBlock.nextConnection;
        return Blockly.ASTNode.createConnectionNode(nextConnection);
      }
      break;

    case Blockly.ASTNode.types.NEXT:
      return Blockly.ASTNode.createBlockNode(this.location_.getSourceBlock());
  }

  return null;
};

/**
 * Find the next element that is one position above and all the way to the left
 * of the current location.
 * @return {Blockly.ASTNode} An ast node that wraps the next field, connection,
 *     workspace or block. Or null if we are at the workspace level.
 */
Blockly.ASTNode.prototype.out = function() {
  switch (this.type_) {
    case Blockly.ASTNode.types.STACK:
      var blockPos = this.location_.getRelativeToSurfaceXY();
      //TODO: Make sure this is in the bounds of the workspace
      var wsCoordinate = new goog.math.Coordinate(
          blockPos.x, blockPos.y + Blockly.ASTNode.DEFAULT_OFFSET_Y);
      return Blockly.ASTNode.createWorkspaceNode(
          this.location_.workspace, wsCoordinate);

    case Blockly.ASTNode.types.OUTPUT:
      var target = this.location_.targetConnection;
      if (target) {
        return Blockly.ASTNode.createConnectionNode(target);
      } else {
        return Blockly.ASTNode.createStackNode(this.location_.getSourceBlock());
      }

    case Blockly.ASTNode.types.FIELD:
      return Blockly.ASTNode.createBlockNode(this.location_.getSourceBlock());

    case Blockly.ASTNode.types.INPUT:
      return Blockly.ASTNode.createBlockNode(this.location_.getSourceBlock());

    case Blockly.ASTNode.types.BLOCK:
      var block = /** @type {!Blockly.Block} */ (this.location_);
      return this.getOutAstNodeForBlock_(block);

    case Blockly.ASTNode.types.PREVIOUS:
      return this.getOutAstNodeForBlock_(this.location_.getSourceBlock());

    case Blockly.ASTNode.types.NEXT:
      return this.getOutAstNodeForBlock_(this.location_.getSourceBlock());
  }

  return null;
};
