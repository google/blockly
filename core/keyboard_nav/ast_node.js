/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The class representing an AST node.
 * Used to traverse the Blockly AST.
 */
'use strict';

goog.provide('Blockly.ASTNode');

goog.require('Blockly.connectionTypes');
/** @suppress {extraRequire} */
goog.require('Blockly.constants');
goog.require('Blockly.utils.Coordinate');

goog.requireType('Blockly.Block');
goog.requireType('Blockly.Connection');
goog.requireType('Blockly.Field');
goog.requireType('Blockly.IASTNodeLocation');
goog.requireType('Blockly.IASTNodeLocationWithBlock');
goog.requireType('Blockly.Input');
goog.requireType('Blockly.Workspace');


/**
 * Class for an AST node.
 * It is recommended that you use one of the createNode methods instead of
 * creating a node directly.
 * @param {string} type The type of the location.
 *     Must be in Blockly.ASTNode.types.
 * @param {!Blockly.IASTNodeLocation} location The position in the AST.
 * @param {!Blockly.ASTNode.Params=} opt_params Optional dictionary of options.
 * @constructor
 */
Blockly.ASTNode = function(type, location, opt_params) {
  if (!location) {
    throw Error('Cannot create a node without a location.');
  }

  /**
   * The type of the location.
   * One of Blockly.ASTNode.types
   * @type {string}
   * @private
   */
  this.type_ = type;

  /**
   * Whether the location points to a connection.
   * @type {boolean}
   * @private
   */
  this.isConnection_ = Blockly.ASTNode.isConnectionType_(type);

  /**
   * The location of the AST node.
   * @type {!Blockly.IASTNodeLocation}
   * @private
   */
  this.location_ = location;

  /**
   * The coordinate on the workspace.
   * @type {Blockly.utils.Coordinate}
   * @private
   */
  this.wsCoordinate_ = null;

  this.processParams_(opt_params || null);
};

/**
 * @typedef {{
 *     wsCoordinate: Blockly.utils.Coordinate
 * }}
 */
Blockly.ASTNode.Params;

/**
 * Object holding different types for an AST node.
 * @enum {string}
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
 * True to navigate to all fields. False to only navigate to clickable fields.
 * @type {boolean}
 */
Blockly.ASTNode.NAVIGATE_ALL_FIELDS = false;

/**
 * The default y offset to use when moving the cursor from a stack to the
 * workspace.
 * @type {number}
 * @private
 */
Blockly.ASTNode.DEFAULT_OFFSET_Y = -20;

/**
 * Whether an AST node of the given type points to a connection.
 * @param {string} type The type to check.  One of Blockly.ASTNode.types.
 * @return {boolean} True if a node of the given type points to a connection.
 * @private
 */
Blockly.ASTNode.isConnectionType_ = function(type) {
  switch (type) {
    case Blockly.ASTNode.types.PREVIOUS:
    case Blockly.ASTNode.types.NEXT:
    case Blockly.ASTNode.types.INPUT:
    case Blockly.ASTNode.types.OUTPUT:
      return true;
  }
  return false;
};

/**
 * Create an AST node pointing to a field.
 * @param {Blockly.Field} field The location of the AST node.
 * @return {Blockly.ASTNode} An AST node pointing to a field.
 */
Blockly.ASTNode.createFieldNode = function(field) {
  if (!field) {
    return null;
  }
  return new Blockly.ASTNode(Blockly.ASTNode.types.FIELD, field);
};

/**
 * Creates an AST node pointing to a connection. If the connection has a parent
 * input then create an AST node of type input that will hold the connection.
 * @param {Blockly.Connection} connection This is the connection the node will
 *     point to.
 * @return {Blockly.ASTNode} An AST node pointing to a connection.
 */
Blockly.ASTNode.createConnectionNode = function(connection) {
  if (!connection) {
    return null;
  }
  var type = connection.type;
  if (type == Blockly.connectionTypes.INPUT_VALUE) {
    return Blockly.ASTNode.createInputNode(connection.getParentInput());
  } else if (type == Blockly.connectionTypes.NEXT_STATEMENT &&
      connection.getParentInput()) {
    return Blockly.ASTNode.createInputNode(connection.getParentInput());
  } else if (type == Blockly.connectionTypes.NEXT_STATEMENT) {
    return new Blockly.ASTNode(Blockly.ASTNode.types.NEXT, connection);
  } else if (type == Blockly.connectionTypes.OUTPUT_VALUE) {
    return new Blockly.ASTNode(Blockly.ASTNode.types.OUTPUT, connection);
  } else if (type == Blockly.connectionTypes.PREVIOUS_STATEMENT) {
    return new Blockly.ASTNode(Blockly.ASTNode.types.PREVIOUS, connection);
  }
  return null;
};

/**
 * Creates an AST node pointing to an input. Stores the input connection as the
 *     location.
 * @param {Blockly.Input} input The input used to create an AST node.
 * @return {Blockly.ASTNode} An AST node pointing to a input.
 */
Blockly.ASTNode.createInputNode = function(input) {
  if (!input || !input.connection) {
    return null;
  }
  return new Blockly.ASTNode(Blockly.ASTNode.types.INPUT, input.connection);
};

/**
 * Creates an AST node pointing to a block.
 * @param {Blockly.Block} block The block used to create an AST node.
 * @return {Blockly.ASTNode} An AST node pointing to a block.
 */
Blockly.ASTNode.createBlockNode = function(block) {
  if (!block) {
    return null;
  }
  return new Blockly.ASTNode(Blockly.ASTNode.types.BLOCK, block);
};

/**
 * Create an AST node of type stack. A stack, represented by its top block, is
 *     the set of all blocks connected to a top block, including the top block.
 * @param {Blockly.Block} topBlock A top block has no parent and can be found
 *     in the list returned by workspace.getTopBlocks().
 * @return {Blockly.ASTNode} An AST node of type stack that points to the top
 *     block on the stack.
 */
Blockly.ASTNode.createStackNode = function(topBlock) {
  if (!topBlock) {
    return null;
  }
  return new Blockly.ASTNode(Blockly.ASTNode.types.STACK, topBlock);
};

/**
 * Creates an AST node pointing to a workspace.
 * @param {!Blockly.Workspace} workspace The workspace that we are on.
 * @param {Blockly.utils.Coordinate} wsCoordinate The position on the workspace
 *     for this node.
 * @return {Blockly.ASTNode} An AST node pointing to a workspace and a position
 *     on the workspace.
 */
Blockly.ASTNode.createWorkspaceNode = function(workspace, wsCoordinate) {
  if (!wsCoordinate || !workspace) {
    return null;
  }
  var params = {
    wsCoordinate: wsCoordinate
  };
  return new Blockly.ASTNode(
      Blockly.ASTNode.types.WORKSPACE, workspace, params);
};

/**
 * Creates an AST node for the top position on a block.
 * This is either an output connection, previous connection, or block.
 * @param {!Blockly.Block} block The block to find the top most AST node on.
 * @return {Blockly.ASTNode} The AST node holding the top most position on the
 *     block.
 */
Blockly.ASTNode.createTopNode = function(block) {
  var astNode;
  var topConnection = block.previousConnection || block.outputConnection;
  if (topConnection) {
    astNode = Blockly.ASTNode.createConnectionNode(topConnection);
  } else {
    astNode = Blockly.ASTNode.createBlockNode(block);
  }
  return astNode;
};

/**
 * Parse the optional parameters.
 * @param {?Blockly.ASTNode.Params} params The user specified parameters.
 * @private
 */
Blockly.ASTNode.prototype.processParams_ = function(params) {
  if (!params) {
    return;
  }
  if (params.wsCoordinate) {
    this.wsCoordinate_ = params.wsCoordinate;
  }
};

/**
 * Gets the value pointed to by this node.
 * It is the callers responsibility to check the node type to figure out what
 * type of object they get back from this.
 * @return {!Blockly.IASTNodeLocation} The current field, connection, workspace, or
 *     block the cursor is on.
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
 * @return {Blockly.utils.Coordinate} The workspace coordinate or null if the
 *     location is not a workspace.
 */
Blockly.ASTNode.prototype.getWsCoordinate = function() {
  return this.wsCoordinate_;
};

/**
 * Whether the node points to a connection.
 * @return {boolean} [description]
 * @package
 */
Blockly.ASTNode.prototype.isConnection = function() {
  return this.isConnection_;
};

/**
 * Given an input find the next editable field or an input with a non null
 * connection in the same block. The current location must be an input
 * connection.
 * @return {Blockly.ASTNode} The AST node holding the next field or connection
 *     or null if there is no editable field or input connection after the given
 *     input.
 * @private
 */
Blockly.ASTNode.prototype.findNextForInput_ = function() {
  var location = /** @type {!Blockly.Connection} */ (this.location_);
  var parentInput = location.getParentInput();
  var block = parentInput.getSourceBlock();
  var curIdx = block.inputList.indexOf(parentInput);
  for (var i = curIdx + 1, input; (input = block.inputList[i]); i++) {
    var fieldRow = input.fieldRow;
    for (var j = 0, field; (field = fieldRow[j]); j++) {
      if (field.isClickable() || Blockly.ASTNode.NAVIGATE_ALL_FIELDS) {
        return Blockly.ASTNode.createFieldNode(field);
      }
    }
    if (input.connection) {
      return Blockly.ASTNode.createInputNode(input);
    }
  }
  return null;
};

/**
 * Given a field find the next editable field or an input with a non null
 * connection in the same block. The current location must be a field.
 * @return {Blockly.ASTNode} The AST node pointing to the next field or
 *     connection or null if there is no editable field or input connection
 *     after the given input.
 * @private
 */
Blockly.ASTNode.prototype.findNextForField_ = function() {
  var location = /** @type {!Blockly.Field} */ (this.location_);
  var input = location.getParentInput();
  var block = location.getSourceBlock();
  var curIdx = block.inputList.indexOf(/** @type {!Blockly.Input} */ (input));
  var fieldIdx = input.fieldRow.indexOf(location) + 1;
  for (var i = curIdx, newInput; (newInput = block.inputList[i]); i++) {
    var fieldRow = newInput.fieldRow;
    while (fieldIdx < fieldRow.length) {
      if (fieldRow[fieldIdx].isClickable() || Blockly.ASTNode.NAVIGATE_ALL_FIELDS) {
        return Blockly.ASTNode.createFieldNode(fieldRow[fieldIdx]);
      }
      fieldIdx++;
    }
    fieldIdx = 0;
    if (newInput.connection) {
      return Blockly.ASTNode.createInputNode(newInput);
    }
  }
  return null;
};

/**
 * Given an input find the previous editable field or an input with a non null
 * connection in the same block. The current location must be an input
 * connection.
 * @return {Blockly.ASTNode} The AST node holding the previous field or
 *     connection.
 * @private
 */
Blockly.ASTNode.prototype.findPrevForInput_ = function() {
  var location = /** @type {!Blockly.Connection} */ (this.location_);
  var parentInput = location.getParentInput();
  var block = parentInput.getSourceBlock();
  var curIdx = block.inputList.indexOf(parentInput);
  for (var i = curIdx, input; (input = block.inputList[i]); i--) {
    if (input.connection && input !== parentInput) {
      return Blockly.ASTNode.createInputNode(input);
    }
    var fieldRow = input.fieldRow;
    for (var j = fieldRow.length - 1, field; (field = fieldRow[j]); j--) {
      if (field.isClickable() || Blockly.ASTNode.NAVIGATE_ALL_FIELDS) {
        return Blockly.ASTNode.createFieldNode(field);
      }
    }
  }
  return null;
};

/**
 * Given a field find the previous editable field or an input with a non null
 * connection in the same block. The current location must be a field.
 * @return {Blockly.ASTNode} The AST node holding the previous input or field.
 * @private
 */
Blockly.ASTNode.prototype.findPrevForField_ = function() {
  var location = /** @type {!Blockly.Field} */ (this.location_);
  var parentInput = location.getParentInput();
  var block = location.getSourceBlock();
  var curIdx = block.inputList.indexOf(
      /** @type {!Blockly.Input} */ (parentInput));
  var fieldIdx = parentInput.fieldRow.indexOf(location) - 1;
  for (var i = curIdx, input; (input = block.inputList[i]); i--) {
    if (input.connection && input !== parentInput) {
      return Blockly.ASTNode.createInputNode(input);
    }
    var fieldRow = input.fieldRow;
    while (fieldIdx > -1) {
      if (fieldRow[fieldIdx].isClickable() || Blockly.ASTNode.NAVIGATE_ALL_FIELDS) {
        return Blockly.ASTNode.createFieldNode(fieldRow[fieldIdx]);
      }
      fieldIdx--;
    }
    // Reset the fieldIdx to the length of the field row of the previous input.
    if (i - 1 >= 0) {
      fieldIdx = block.inputList[i - 1].fieldRow.length - 1;
    }
  }
  return null;
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
    curLocation = /** @type {!Blockly.IASTNodeLocationWithBlock} */ (
      curLocation).getSourceBlock();
  }
  if (!curLocation || !curLocation.workspace) {
    return null;
  }
  var curRoot = curLocation.getRootBlock();
  var topBlocks = curRoot.workspace.getTopBlocks(true);
  for (var i = 0, topBlock; (topBlock = topBlocks[i]); i++) {
    if (curRoot.id == topBlock.id) {
      var offset = forward ? 1 : -1;
      var resultIndex = i + offset;
      if (resultIndex == -1 || resultIndex == topBlocks.length) {
        return null;
      }
      return Blockly.ASTNode.createStackNode(topBlocks[resultIndex]);
    }
  }
  throw Error('Couldn\'t find ' + (forward ? 'next' : 'previous') + ' stack?!');
};

/**
 * Finds the top most AST node for a given block.
 * This is either the previous connection, output connection or block depending
 * on what kind of connections the block has.
 * @param {!Blockly.Block} block The block that we want to find the top
 *     connection on.
 * @return {!Blockly.ASTNode} The AST node containing the top connection.
 * @private
 */
Blockly.ASTNode.prototype.findTopASTNodeForBlock_ = function(block) {
  var topConnection = block.previousConnection || block.outputConnection;
  if (topConnection) {
    return /** @type {!Blockly.ASTNode} */ (Blockly.ASTNode.createConnectionNode(
        topConnection));
  } else {
    return /** @type {!Blockly.ASTNode} */ (Blockly.ASTNode.createBlockNode(
        block));
  }
};

/**
 * Get the AST node pointing to the input that the block is nested under or if
 * the block is not nested then get the stack AST node.
 * @param {Blockly.Block} block The source block of the current location.
 * @return {Blockly.ASTNode} The AST node pointing to the input connection or
 *     the top block of the stack this block is in.
 * @private
 */
Blockly.ASTNode.prototype.getOutAstNodeForBlock_ = function(block) {
  if (!block) {
    return null;
  }
  var topBlock;
  // If the block doesn't have a previous connection then it is the top of the
  // substack.
  topBlock = block.getTopStackBlock();
  var topConnection = topBlock.previousConnection || topBlock.outputConnection;
  // If the top connection has a parentInput, create an AST node pointing to
  // that input.
  if (topConnection && topConnection.targetConnection &&
      topConnection.targetConnection.getParentInput()) {
    return Blockly.ASTNode.createInputNode(
        topConnection.targetConnection.getParentInput());
  } else {
    // Go to stack level if you are not underneath an input.
    return Blockly.ASTNode.createStackNode(topBlock);
  }
};

/**
 * Find the first editable field or input with a connection on a given block.
 * @param {!Blockly.Block} block The source block of the current location.
 * @return {Blockly.ASTNode} An AST node pointing to the first field or input.
 * Null if there are no editable fields or inputs with connections on the block.
 * @private
 */
Blockly.ASTNode.prototype.findFirstFieldOrInput_ = function(block) {
  var inputs = block.inputList;
  for (var i = 0, input; (input = inputs[i]); i++) {
    var fieldRow = input.fieldRow;
    for (var j = 0, field; (field = fieldRow[j]); j++) {
      if (field.isClickable() || Blockly.ASTNode.NAVIGATE_ALL_FIELDS) {
        return Blockly.ASTNode.createFieldNode(field);
      }
    }
    if (input.connection) {
      return Blockly.ASTNode.createInputNode(input);
    }
  }
  return null;
};

/**
 * Finds the source block of the location of this node.
 * @return {Blockly.Block} The source block of the location, or null if the node
 * is of type workspace.
 */
Blockly.ASTNode.prototype.getSourceBlock = function() {
  if (this.getType() === Blockly.ASTNode.types.BLOCK) {
    return /** @type {Blockly.Block} */ (this.getLocation());
  } else if (this.getType() === Blockly.ASTNode.types.STACK) {
    return /** @type {Blockly.Block} */ (this.getLocation());
  } else if (this.getType() === Blockly.ASTNode.types.WORKSPACE) {
    return null;
  } else {
    return /** @type {Blockly.IASTNodeLocationWithBlock} */ (
      this.getLocation()).getSourceBlock();
  }
};

/**
 * Find the element to the right of the current element in the AST.
 * @return {Blockly.ASTNode} An AST node that wraps the next field, connection,
 *     block, or workspace. Or null if there is no node to the right.
 */
Blockly.ASTNode.prototype.next = function() {
  switch (this.type_) {
    case Blockly.ASTNode.types.STACK:
      return this.navigateBetweenStacks_(true);

    case Blockly.ASTNode.types.OUTPUT:
      var connection = /** @type {!Blockly.Connection} */ (this.location_);
      return Blockly.ASTNode.createBlockNode(connection.getSourceBlock());

    case Blockly.ASTNode.types.FIELD:
      return this.findNextForField_();

    case Blockly.ASTNode.types.INPUT:
      return this.findNextForInput_();

    case Blockly.ASTNode.types.BLOCK:
      var block = /** @type {!Blockly.Block} */ (this.location_);
      var nextConnection = block.nextConnection;
      return Blockly.ASTNode.createConnectionNode(nextConnection);

    case Blockly.ASTNode.types.PREVIOUS:
      var connection = /** @type {!Blockly.Connection} */ (this.location_);
      return Blockly.ASTNode.createBlockNode(connection.getSourceBlock());

    case Blockly.ASTNode.types.NEXT:
      var connection = /** @type {!Blockly.Connection} */ (this.location_);
      var targetConnection = connection.targetConnection;
      return Blockly.ASTNode.createConnectionNode(targetConnection);
  }

  return null;
};

/**
 * Find the element one level below and all the way to the left of the current
 * location.
 * @return {Blockly.ASTNode} An AST node that wraps the next field, connection,
 * workspace, or block. Or null if there is nothing below this node.
 */
Blockly.ASTNode.prototype.in = function() {
  switch (this.type_) {
    case Blockly.ASTNode.types.WORKSPACE:
      var workspace = /** @type {!Blockly.Workspace} */ (this.location_);
      var topBlocks = workspace.getTopBlocks(true);
      if (topBlocks.length > 0) {
        return Blockly.ASTNode.createStackNode(topBlocks[0]);
      }
      break;

    case Blockly.ASTNode.types.STACK:
      var block = /** @type {!Blockly.Block} */ (this.location_);
      return this.findTopASTNodeForBlock_(block);

    case Blockly.ASTNode.types.BLOCK:
      var block = /** @type {!Blockly.Block} */ (this.location_);
      return this.findFirstFieldOrInput_(block);

    case Blockly.ASTNode.types.INPUT:
      var connection = /** @type {!Blockly.Connection} */ (this.location_);
      var targetConnection = connection.targetConnection;
      return Blockly.ASTNode.createConnectionNode(targetConnection);
  }

  return null;
};

/**
 * Find the element to the left of the current element in the AST.
 * @return {Blockly.ASTNode} An AST node that wraps the previous field,
 * connection, workspace or block. Or null if no node exists to the left.
 * null.
 */
Blockly.ASTNode.prototype.prev = function() {
  switch (this.type_) {
    case Blockly.ASTNode.types.STACK:
      return this.navigateBetweenStacks_(false);

    case Blockly.ASTNode.types.OUTPUT:
      return null;

    case Blockly.ASTNode.types.FIELD:
      return this.findPrevForField_();

    case Blockly.ASTNode.types.INPUT:
      return this.findPrevForInput_();

    case Blockly.ASTNode.types.BLOCK:
      var block = /** @type {!Blockly.Block} */ (this.location_);
      var topConnection = block.previousConnection || block.outputConnection;
      return Blockly.ASTNode.createConnectionNode(topConnection);

    case Blockly.ASTNode.types.PREVIOUS:
      var connection = /** @type {!Blockly.Connection} */ (this.location_);
      var targetConnection = connection.targetConnection;
      if (targetConnection && !targetConnection.getParentInput()) {
        return Blockly.ASTNode.createConnectionNode(targetConnection);
      }
      break;

    case Blockly.ASTNode.types.NEXT:
      var connection = /** @type {!Blockly.Connection} */ (this.location_);
      return Blockly.ASTNode.createBlockNode(connection.getSourceBlock());
  }

  return null;
};

/**
 * Find the next element that is one position above and all the way to the left
 * of the current location.
 * @return {Blockly.ASTNode} An AST node that wraps the next field, connection,
 *     workspace or block. Or null if we are at the workspace level.
 */
Blockly.ASTNode.prototype.out = function() {
  switch (this.type_) {
    case Blockly.ASTNode.types.STACK:
      var block = /** @type {!Blockly.Block} */ (this.location_);
      var blockPos = block.getRelativeToSurfaceXY();
      // TODO: Make sure this is in the bounds of the workspace.
      var wsCoordinate = new Blockly.utils.Coordinate(
          blockPos.x, blockPos.y + Blockly.ASTNode.DEFAULT_OFFSET_Y);
      return Blockly.ASTNode.createWorkspaceNode(block.workspace, wsCoordinate);

    case Blockly.ASTNode.types.OUTPUT:
      var connection = /** @type {!Blockly.Connection} */ (this.location_);
      var target = connection.targetConnection;
      if (target) {
        return Blockly.ASTNode.createConnectionNode(target);
      }
      return Blockly.ASTNode.createStackNode(connection.getSourceBlock());

    case Blockly.ASTNode.types.FIELD:
      var field = /** @type {!Blockly.Field} */ (this.location_);
      return Blockly.ASTNode.createBlockNode(field.getSourceBlock());

    case Blockly.ASTNode.types.INPUT:
      var connection = /** @type {!Blockly.Connection} */ (this.location_);
      return Blockly.ASTNode.createBlockNode(connection.getSourceBlock());

    case Blockly.ASTNode.types.BLOCK:
      var block = /** @type {!Blockly.Block} */ (this.location_);
      return this.getOutAstNodeForBlock_(block);

    case Blockly.ASTNode.types.PREVIOUS:
      var connection = /** @type {!Blockly.Connection} */ (this.location_);
      return this.getOutAstNodeForBlock_(connection.getSourceBlock());

    case Blockly.ASTNode.types.NEXT:
      var connection = /** @type {!Blockly.Connection} */ (this.location_);
      return this.getOutAstNodeForBlock_(connection.getSourceBlock());
  }

  return null;
};
