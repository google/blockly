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
 * Class for an ASTNode.
 * It is recommended that you use one of the createNode methods instead of
 * creating a node directly.
 * @constructor
 * @param {!String} type This is the type of the location using
 *     Blockly.ASTNode.types.
 * @param {Blockly.Block|Blockly.Connection|Blockly.Field|Blockly.Workspace}
 *     location The position in the ast.
 * @param {Object?} params Optional dictionary of options.
 */
Blockly.ASTNode = function(type, location, params) {
  if (!location) {
    throw Error('Cannot create a node without a location.');
  }
  /*
   * The type of the location.
   * One of Blockly.ASTNode.types
   * @type String
   * @private
   */
  this.type_ = type;

  /*
   * The location of the astnode.
   * @private
   */
  this.location_ = location;

  this.processParams_(params);

};

/**
 * Object holding different types for an ASTNode.
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
 * The amount to move the workspace coordinate.
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
 * Create an ast node from a field.
 * @param {?Blockly.Field} field The location of the ast node.
 * @return {?Blockly.ASTNode} An ast node for a field.
 */
Blockly.ASTNode.createFieldNode = function(field) {
  if (!field){return;}
  return new Blockly.ASTNode(Blockly.ASTNode.types.FIELD, field);
};

/**
 * Creates an ast node from a connection. If the connection has a parent input
 * then create an ast node of type input that will hold the connection.
 * @param {?Blockly.Connection} connection The connection for the node.
 * @return {?Blockly.ASTNode} An ast node for the connection.
 */
Blockly.ASTNode.createConnectionNode = function(connection) {
  var astNode;
  if (!connection){return;}
  if (connection.type === Blockly.INPUT_VALUE) {
    astNode = new Blockly.ASTNode.createInputNode(connection.getParentInput());
  } else if (connection.type === Blockly.NEXT_STATEMENT
      && connection.getParentInput()) {
    astNode = new Blockly.ASTNode.createInputNode(connection.getParentInput());
  } else if (connection.type === Blockly.NEXT_STATEMENT) {
    astNode = new Blockly.ASTNode(Blockly.ASTNode.types.NEXT, connection);
  } else if (connection.type === Blockly.OUTPUT_VALUE) {
    astNode = new Blockly.ASTNode(Blockly.ASTNode.types.OUTPUT, connection);
  } else if (connection.type === Blockly.PREVIOUS_STATEMENT) {
    astNode = new Blockly.ASTNode(Blockly.ASTNode.types.PREVIOUS, connection);
  }
  return astNode;
};

/**
 * Creates an ast node from an input. Stores the input connection as the
 * location.
 * @param {?Blockly.Input} input The input used to create an ast node.
 * @return {?Blockly.ASTNode} The ast node for the input.
 */
Blockly.ASTNode.createInputNode = function(input) {
  if (!input){return null;}
  var params = {
    "input": input
  };
  return new Blockly.ASTNode(Blockly.ASTNode.types.INPUT, input.connection, params);
};

/**
 * Creates an ast node for a block.
 * @param {?Blockly.Block} block The block used to create an ast node.
 * @return {?Blockly.ASTNode} The ast node for the block.
 */
Blockly.ASTNode.createBlockNode = function(block) {
  if (!block){return null;}
  return new Blockly.ASTNode(Blockly.ASTNode.types.BLOCK, block);
};

/**
 * Create an ast node of type stack. A stack, represented by its top block, is
 *     the set of all blocks connected to a top block, including the top block.
 * @param {?Blockly.Block} topBlock A top block has no parent and can be found
 *     in the list returned by workspace.getTopBlocks().
 * @return {?Blockly.ASTNode} The node for a stack.
 */
Blockly.ASTNode.createStackNode = function(topBlock) {
  if (!topBlock){return null;}
  return new Blockly.ASTNode(Blockly.ASTNode.types.STACK, topBlock);
};

/**
 * Creates an ast node for a workpsace.
 * @param {?Blockly.Workspace} workspace The workspace that we are on.
 * @param {?goog.math.Coordinate} wsCoordinate The position on the workspace for
 *     this node.
 * @return {?Blockly.ASTNode} The node for a position on a workspace.
 */
Blockly.ASTNode.createWorkspaceNode = function(workspace, wsCoordinate) {
  if (!workspace || !wsCoordinate){return null;}

  var params = {
    "wsCoordinate": wsCoordinate
  };
  return new Blockly.ASTNode(
      Blockly.ASTNode.types.WORKSPACE, workspace, params);
};

/**
 * Parse the optional parameters.
 * @param {?Object} params The user specified parameters.
 * @private
 */
Blockly.ASTNode.prototype.processParams_ = function(params){
  if (!params) {return;}

  if (params['wsCoordinate']) {
    this.wsCoordinate_ = params['wsCoordinate'];
  } else if (params['input']) {
    this.parentInput_ = params['input'];
  }
};

/**
 * Gets the current location of the cursor.
 * @return {!Blockly.Field|Blockly.Connection|Blockly.Block|Blockly.Workspace}
 * The current field, connection, workspace, or block the cursor is on.
 */
Blockly.ASTNode.prototype.getLocation = function() {
  return this.location_;
};

/**
 * The type of the current location.
 * One of Blockly.ASTNode.types
 * @return {String} The type of the location.
 */
Blockly.ASTNode.prototype.getType = function() {
  return this.type_;
};

/**
 * The coordinate on the workspace.
 * @return {?goog.math.Coordinate} The workspace coordinate or null if the
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
 * @param {!Blockly.Field} location The current location of the cursor.
 * @param {!Blockly.Input} parentInput The parentInput of the field.
 * @param {?Boolean} opt_first If true find the first editable field otherwise
 *     get the next editable field.
 * @return {?Blockly.ASTNode} The ast node holding the next field or null if no
 *     next field exists.
 * @private
 */
Blockly.ASTNode.prototype.findNextEditableField_ = function(location,
    parentInput, opt_first) {
  var fieldRow = parentInput.fieldRow;
  var fieldIdx = fieldRow.indexOf(location);
  var startIdx = opt_first ? 0 : fieldIdx + 1;
  var astNode;
  for (var i = startIdx; i < fieldRow.length; i++) {
    var field = fieldRow[i];
    if (field.isCurrentlyEditable()) {
      astNode = Blockly.ASTNode.createFieldNode(field);
      break;
    }
  }
  return astNode;
};

/**
 * Get either the previous editable field, or get the first editable field for
 * the given input.
 * @param {!Blockly.Field} location The current location of the cursor.
 * @param {!Blockly.Input} parentInput The parentInput of the field.
 * @param {?Boolean} opt_last If true find the last editable field otherwise get
 *     the previous field.
 * @return {?Blockly.ASTNode} The ast node holding the previous or last field or
 *     null if no next field exists.
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
      break;
    }
  }
  return Blockly.ASTNode.createFieldNode(previousField);
};

/**
 * Get the first field or connection that is either editable or has connection
 * value of not null.
 * @param {!Blockly.Connection} location Current location in the ast.
 * @param {!Blockly.Input} parentInput The parent input of the field or
 *     connection.
 * @return {?Blockly.ASTNode} The ast node holding the next field or connection.
 * @private
 */
Blockly.ASTNode.prototype.findNextForInput_ = function(location, parentInput){
  var inputs = location.sourceBlock_.inputList;
  var curIdx = inputs.indexOf(parentInput);
  if (curIdx <= -1) {return;}
  var nxtIdx = curIdx + 1;
  var newAstNode = null;

  for (var i = nxtIdx; i < inputs.length; i++) {
    var newInput = inputs[i];
    var field = this.findNextEditableField_(location, newInput, true);
    if (field) {
      newAstNode = field;
      break;
    } else if (newInput.connection) {
      var connection = newInput.connection;
      newAstNode = Blockly.ASTNode.createConnectionNode(connection);
      break;
    }
  }
  return newAstNode;
};

/**
 * Find the next input or field given a field location.
 * @param {!Blockly.Field} location Current location in the ast.
 * @param {!Blockly.Input} parentInput The parent input of the field.
 * @return {?Blockly.ASTNode} The ast node holding the next field or connection.
 * @private
 */
Blockly.ASTNode.prototype.findNextForField_ = function(location, parentInput) {
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
 * @param {!Blockly.Input} parentInput Parent input of the connection or field.
 * @return {?Blockly.ASTNode} The ast node holding the previous field or
 *     connection.
 * @private
 */
Blockly.ASTNode.prototype.findPrevForInput_ = function(location, parentInput){
  var block = location.sourceBlock_;
  var inputs = block.inputList;
  var curIdx = inputs.indexOf(parentInput);
  var newAstNode = null;

  for (var i = curIdx; i >= 0; i--) {
    var newInput = inputs[i];
    var fieldNode = this.findPreviousEditableField_(location, newInput, true);
    if (newInput.connection && newInput.connection !== parentInput.connection) {
      newAstNode = Blockly.ASTNode.createInputNode(newInput);
      break;
    } else if (fieldNode && fieldNode.getLocation() && fieldNode !== location) {
      newAstNode = fieldNode;
      break;
    }
  }
  return newAstNode;
};

/**
 * Find the previous input or field given a field location.
 * @param {!Blockly.Field} location The current location of the cursor.
 * @param {!Blockly.Input} parentInput The parent input of the field.
 * @return {?Blockly.ASTNode} The ast node holding the previous input or field.
 * @private
 */
Blockly.ASTNode.prototype.findPrevForField_ = function(location, parentInput) {
  var block = location.sourceBlock_;
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
 * @param {?Boolean} forward True to go forward. False to go backwards.
 * @return {?Blockly.ASTNode} The first block of the next stack.
 * @private
 */
Blockly.ASTNode.prototype.navigateBetweenStacks_ = function(forward) {
  var curLocation = this.getLocation();
  if (!(curLocation instanceof Blockly.Block)) {
    curLocation = curLocation.sourceBlock_;
  }
  if (!curLocation) {
    return null;
  }
  var curRoot = curLocation.getRootBlock();
  var topBlocks = curRoot.workspace.getTopBlocks();
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
 * Create an ast node from the top connection on the block.
 * @param {Blockly.Block} block The block that we want to find the top
 *     connection on.
 * @return {?Blockly.ASTNode} The astnode containing the top connection.
 * @private
 */
Blockly.ASTNode.prototype.findTopASTConnection_ = function(block) {
  var previousConnection = block.previousConnection;
  var outputConnection = block.outputConnection;
  var newAstNode;
  if (previousConnection) {
    newAstNode = Blockly.ASTNode.createConnectionNode(previousConnection);
  } else if (outputConnection) {
    newAstNode = Blockly.ASTNode.createConnectionNode(outputConnection);
  } else {
    newAstNode = Blockly.ASTNode.createBlockNode(block);
  }
  return newAstNode;
};


/**
 * Given a location in a stack of blocks find the next out connection. If the
 * location is nested the next out location should be the connected input.
 * @param {!Blockly.Block} block The source block for the current location.
 * @return {?Blockly.ASTNode} The ast node holding thenext out connection or
 *     block.
 * @private
 */
Blockly.ASTNode.prototype.findOutLocationForBlock_ = function(block) {
  var newLocation = null;
  var newAstNode = null;

  newLocation = block.previousConnection.targetConnection;
  newAstNode = Blockly.ASTNode.createConnectionNode(newLocation);
  if (!newLocation) {
    newAstNode = Blockly.ASTNode.createStackNode(block);
  }
  return newAstNode;
};

/**
 * Find the element to the right of the current element in the ast.
 * @return {?Blockly.ASTNode} An ast node that wraps the next field, connection,
 *     block, or workspace. Return null if there is no value to the right.
 */
Blockly.ASTNode.prototype.next = function() {
  var newAstNode = null;

  switch (this.type_) {
    case Blockly.ASTNode.types.WORKSPACE:
      //TODO: Need to limit this. The view is bounded to half a screen beyond
      //the furthest block.
      var newX = this.wsCoordinate_.x + Blockly.ASTNode.wsMove_;
      var newWsCoordinate = new goog.math.Coordinate(newX, this.wsCoordinate_.y);
      newAstNode = Blockly.ASTNode.createWorkspaceNode(this.location_,
          newWsCoordinate);
      break;

    case Blockly.ASTNode.types.STACK:
      var newAstNode = this.navigateBetweenStacks_(true);
      break;

    case Blockly.ASTNode.types.OUTPUT:
      newAstNode = Blockly.ASTNode.createBlockNode(this.location_.sourceBlock_);
      break;

    case Blockly.ASTNode.types.FIELD:
      var parentInput = this.location_.getParentInput();
      newAstNode = this.findNextForField_(this.location_, parentInput);
      break;

    case Blockly.ASTNode.types.INPUT:
      newAstNode = this.findNextForInput_(this.location_, this.getParentInput());
      break;

    case Blockly.ASTNode.types.BLOCK:
      var nextConnection = this.location_.nextConnection;
      newAstNode = Blockly.ASTNode.createConnectionNode(nextConnection);
      break;

    case Blockly.ASTNode.types.PREVIOUS:
      var output = this.location_.outputConnection;
      if (output) {
        newAstNode = Blockly.ASTNode.createConnectionNode(output);
      } else {
        var srcBlock = this.location_.sourceBlock_;
        newAstNode = Blockly.ASTNode.createBlockNode(srcBlock);
      }
      break;

    case Blockly.ASTNode.types.NEXT:
      if (this.location_.targetBlock()) {
        newAstNode = this.findTopASTConnection_(this.location_.targetBlock());
      }
      break;
  }

  return newAstNode;
};

/**
 * Find the element one level below and all the way to the left of the current
 * location.
 * @return {?Blockly.ASTNode} An ast node that wraps the next field, connection,
 * workspace, or block. Returns null if there is nothing below this node.
 */
Blockly.ASTNode.prototype.in = function() {
  var newAstNode = null;

  switch (this.type_) {
    case Blockly.ASTNode.types.WORKSPACE:
      var firstTopBlock = this.location_.getTopBlocks()[0];
      newAstNode = Blockly.ASTNode.createStackNode(firstTopBlock);
      break;

    case Blockly.ASTNode.types.STACK:
      newAstNode = this.findTopASTConnection_(this.location_);
      break;

    case Blockly.ASTNode.types.BLOCK:
      var inputs = this.location_.inputList;
      if (inputs && inputs.length > 0) {
        var newParentInput = inputs[0];
        var fieldNode =
            this.findNextEditableField_(this.location_, newParentInput, true);
        if (fieldNode) {
          newAstNode = fieldNode;
        } else {
          newAstNode = Blockly.ASTNode.createInputNode(newParentInput);
        }
      }
      break;

    case Blockly.ASTNode.types.INPUT:
      var inputConnection = this.location_;
      if (inputConnection.targetBlock()) {
        newAstNode = this.findTopASTConnection_(inputConnection.targetBlock());
      }
      break;

  }
  return newAstNode;
};

/**
 * Find the element to the left of the current element in the ast.
 * @return {?Blockly.ASTNode} An ast node that wraps the previous field,
 * connection, workspace or block. If no element exists to the left then return
 * null.
 */
Blockly.ASTNode.prototype.prev = function() {
  var newAstNode = null;

  switch (this.type_) {
    case Blockly.ASTNode.types.WORKSPACE:
      var newX = this.wsCoordinate_.x - Blockly.ASTNode.wsMove_;
      var newCoord = new goog.math.Coordinate(newX, this.wsCoordinate_.y);
      newAstNode = Blockly.ASTNode.createWorkspaceNode(this.location_, newCoord);
      break;
    case Blockly.ASTNode.types.STACK:
      var newAstNode = this.navigateBetweenStacks_(false);
      break;

    case Blockly.ASTNode.types.OUTPUT:
      var sourceBlock = this.location_.sourceBlock_;
      if (sourceBlock && sourceBlock.previousConnection) {
        var prevConnection = sourceBlock.previousConnection;
        newAstNode = Blockly.ASTNode.createConnectionNode(prevConnection);
      }
      break;

    case Blockly.ASTNode.types.FIELD:
      var parentInput = this.location_.getParentInput();
      newAstNode = this.findPrevForField_(this.location_, parentInput);
      break;

    case Blockly.ASTNode.types.INPUT:
      newAstNode = this.findPrevForInput_(this.location_, this.getParentInput());
      break;

    case Blockly.ASTNode.types.BLOCK:
      var output = this.location_.outputConnection;
      if (output) {
        newAstNode = Blockly.ASTNode.createConnectionNode(output);
      } else {
        var prevConnection = this.location_.previousConnection;
        newAstNode = Blockly.ASTNode.createConnectionNode(prevConnection);
      }
      break;

    case Blockly.ASTNode.types.PREVIOUS:
      var prevBlock = this.location_.targetBlock();
      if (prevBlock) {
        var nextConnection = prevBlock.nextConnection;
        newAstNode = Blockly.ASTNode.createConnectionNode(nextConnection);
      }
      break;

    case Blockly.ASTNode.types.NEXT:
      newAstNode = Blockly.ASTNode.createBlockNode(this.location_.sourceBlock_);
      break;
  }

  return newAstNode;
};

/**
 * Find the next element that is one position above and all the way to the left
 * of the current location.
 * @return {?Blockly.ASTNode} An ast node that wraps the next field, connection,
 *     workspace or block. Returns null if we are at the workspace level.
 */
Blockly.ASTNode.prototype.out = function() {
  var newAstNode = null;

  switch (this.type_) {
    case Blockly.ASTNode.types.STACK:
      var blockPos = this.location_.getRelativeToSurfaceXY();
      var wsCoordinate = new goog.math.Coordinate(
          blockPos.x, blockPos.y + Blockly.ASTNode.DEFAULT_OFFSET_Y);
      newAstNode = Blockly.ASTNode.createWorkspaceNode(
          this.location_.workspace, wsCoordinate);
      break;

    case Blockly.ASTNode.types.OUTPUT:
      var target = this.location_.targetConnection;
      newAstNode = Blockly.ASTNode.createConnectionNode(target);
      if (!newAstNode) {
        newAstNode.type_ = Blockly.ASTNode.types.STACK;
      }
      break;

    case Blockly.ASTNode.types.FIELD:
      newAstNode = Blockly.ASTNode.createBlockNode(this.location_.sourceBlock_);
      break;

    case Blockly.ASTNode.types.INPUT:
      newAstNode = Blockly.ASTNode.createBlockNode(this.location_.sourceBlock_);
      break;

    case Blockly.ASTNode.types.BLOCK:
      var outputConnection = this.location_.outputConnection;
      if (outputConnection && outputConnection.targetConnection) {
        var target = outputConnection.targetConnection;
        newAstNode = Blockly.ASTNode.createConnectionNode(target);
      } else if (outputConnection) {
        newAstNode = Blockly.ASTNode.createConnectionNode(outputConnection);
      } else {
        //This is the case where we are on a block that is nested inside a
        //statement input and we need to get the input that connects to the
        //top block
        newAstNode = this.findOutLocationForBlock_(this.location_);
      }
      break;

    case Blockly.ASTNode.types.PREVIOUS:
      newAstNode = this.findOutLocationForBlock_(this.location_.sourceBlock_);
      break;

    case Blockly.ASTNode.types.NEXT:
      newAstNode = this.findOutLocationForBlock_(this.location_.sourceBlock_);
      break;
  }

  return newAstNode;
};
