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

goog.module('Blockly.ASTNode');
goog.module.declareLegacyNamespace();

goog.require('Blockly.connectionTypes');
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
 *     Must be in ASTNode.types.
 * @param {!Blockly.IASTNodeLocation} location The position in the AST.
 * @param {!ASTNode.Params=} opt_params Optional dictionary of options.
 * @constructor
 */
const ASTNode = function(type, location, opt_params) {
  if (!location) {
    throw Error('Cannot create a node without a location.');
  }

  /**
   * The type of the location.
   * One of ASTNode.types
   * @type {string}
   * @private
   */
  this.type_ = type;

  /**
   * Whether the location points to a connection.
   * @type {boolean}
   * @private
   */
  this.isConnection_ = ASTNode.isConnectionType_(type);

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
ASTNode.Params;

/**
 * Object holding different types for an AST node.
 * @enum {string}
 */
ASTNode.types = {
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
ASTNode.NAVIGATE_ALL_FIELDS = false;

/**
 * The default y offset to use when moving the cursor from a stack to the
 * workspace.
 * @type {number}
 * @private
 */
ASTNode.DEFAULT_OFFSET_Y = -20;

/**
 * Whether an AST node of the given type points to a connection.
 * @param {string} type The type to check.  One of ASTNode.types.
 * @return {boolean} True if a node of the given type points to a connection.
 * @private
 */
ASTNode.isConnectionType_ = function(type) {
  switch (type) {
    case ASTNode.types.PREVIOUS:
    case ASTNode.types.NEXT:
    case ASTNode.types.INPUT:
    case ASTNode.types.OUTPUT:
      return true;
  }
  return false;
};

/**
 * Create an AST node pointing to a field.
 * @param {Blockly.Field} field The location of the AST node.
 * @return {ASTNode} An AST node pointing to a field.
 */
ASTNode.createFieldNode = function(field) {
  if (!field) {
    return null;
  }
  return new ASTNode(ASTNode.types.FIELD, field);
};

/**
 * Creates an AST node pointing to a connection. If the connection has a parent
 * input then create an AST node of type input that will hold the connection.
 * @param {Blockly.Connection} connection This is the connection the node will
 *     point to.
 * @return {ASTNode} An AST node pointing to a connection.
 */
ASTNode.createConnectionNode = function(connection) {
  if (!connection) {
    return null;
  }
  const type = connection.type;
  if (type == Blockly.connectionTypes.INPUT_VALUE) {
    return ASTNode.createInputNode(connection.getParentInput());
  } else if (type == Blockly.connectionTypes.NEXT_STATEMENT &&
      connection.getParentInput()) {
    return ASTNode.createInputNode(connection.getParentInput());
  } else if (type == Blockly.connectionTypes.NEXT_STATEMENT) {
    return new ASTNode(ASTNode.types.NEXT, connection);
  } else if (type == Blockly.connectionTypes.OUTPUT_VALUE) {
    return new ASTNode(ASTNode.types.OUTPUT, connection);
  } else if (type == Blockly.connectionTypes.PREVIOUS_STATEMENT) {
    return new ASTNode(ASTNode.types.PREVIOUS, connection);
  }
  return null;
};

/**
 * Creates an AST node pointing to an input. Stores the input connection as the
 *     location.
 * @param {Blockly.Input} input The input used to create an AST node.
 * @return {ASTNode} An AST node pointing to a input.
 */
ASTNode.createInputNode = function(input) {
  if (!input || !input.connection) {
    return null;
  }
  return new ASTNode(ASTNode.types.INPUT, input.connection);
};

/**
 * Creates an AST node pointing to a block.
 * @param {Blockly.Block} block The block used to create an AST node.
 * @return {ASTNode} An AST node pointing to a block.
 */
ASTNode.createBlockNode = function(block) {
  if (!block) {
    return null;
  }
  return new ASTNode(ASTNode.types.BLOCK, block);
};

/**
 * Create an AST node of type stack. A stack, represented by its top block, is
 *     the set of all blocks connected to a top block, including the top block.
 * @param {Blockly.Block} topBlock A top block has no parent and can be found
 *     in the list returned by workspace.getTopBlocks().
 * @return {ASTNode} An AST node of type stack that points to the top
 *     block on the stack.
 */
ASTNode.createStackNode = function(topBlock) {
  if (!topBlock) {
    return null;
  }
  return new ASTNode(ASTNode.types.STACK, topBlock);
};

/**
 * Creates an AST node pointing to a workspace.
 * @param {!Blockly.Workspace} workspace The workspace that we are on.
 * @param {Blockly.utils.Coordinate} wsCoordinate The position on the workspace
 *     for this node.
 * @return {ASTNode} An AST node pointing to a workspace and a position
 *     on the workspace.
 */
ASTNode.createWorkspaceNode = function(workspace, wsCoordinate) {
  if (!wsCoordinate || !workspace) {
    return null;
  }
  const params = {
    wsCoordinate: wsCoordinate
  };
  return new ASTNode(
      ASTNode.types.WORKSPACE, workspace, params);
};

/**
 * Creates an AST node for the top position on a block.
 * This is either an output connection, previous connection, or block.
 * @param {!Blockly.Block} block The block to find the top most AST node on.
 * @return {ASTNode} The AST node holding the top most position on the
 *     block.
 */
ASTNode.createTopNode = function(block) {
  let astNode;
  const topConnection = block.previousConnection || block.outputConnection;
  if (topConnection) {
    astNode = ASTNode.createConnectionNode(topConnection);
  } else {
    astNode = ASTNode.createBlockNode(block);
  }
  return astNode;
};

/**
 * Parse the optional parameters.
 * @param {?ASTNode.Params} params The user specified parameters.
 * @private
 */
ASTNode.prototype.processParams_ = function(params) {
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
ASTNode.prototype.getLocation = function() {
  return this.location_;
};

/**
 * The type of the current location.
 * One of ASTNode.types
 * @return {string} The type of the location.
 */
ASTNode.prototype.getType = function() {
  return this.type_;
};

/**
 * The coordinate on the workspace.
 * @return {Blockly.utils.Coordinate} The workspace coordinate or null if the
 *     location is not a workspace.
 */
ASTNode.prototype.getWsCoordinate = function() {
  return this.wsCoordinate_;
};

/**
 * Whether the node points to a connection.
 * @return {boolean} [description]
 * @package
 */
ASTNode.prototype.isConnection = function() {
  return this.isConnection_;
};

/**
 * Given an input find the next editable field or an input with a non null
 * connection in the same block. The current location must be an input
 * connection.
 * @return {ASTNode} The AST node holding the next field or connection
 *     or null if there is no editable field or input connection after the given
 *     input.
 * @private
 */
ASTNode.prototype.findNextForInput_ = function() {
  const location = /** @type {!Blockly.Connection} */ (this.location_);
  const parentInput = location.getParentInput();
  const block = parentInput.getSourceBlock();
  const curIdx = block.inputList.indexOf(parentInput);
  let i = curIdx + 1, input;
  for (; (input = block.inputList[i]); i++) {
    const fieldRow = input.fieldRow;
    let j = 0, field;
    for (; (field = fieldRow[j]); j++) {
      if (field.isClickable() || ASTNode.NAVIGATE_ALL_FIELDS) {
        return ASTNode.createFieldNode(field);
      }
    }
    if (input.connection) {
      return ASTNode.createInputNode(input);
    }
  }
  return null;
};

/**
 * Given a field find the next editable field or an input with a non null
 * connection in the same block. The current location must be a field.
 * @return {ASTNode} The AST node pointing to the next field or
 *     connection or null if there is no editable field or input connection
 *     after the given input.
 * @private
 */
ASTNode.prototype.findNextForField_ = function() {
  const location = /** @type {!Blockly.Field} */ (this.location_);
  const input = location.getParentInput();
  const block = location.getSourceBlock();
  const curIdx = block.inputList.indexOf(/** @type {!Blockly.Input} */ (input));
  let fieldIdx = input.fieldRow.indexOf(location) + 1;
  let i = curIdx, newInput;
  for (; (newInput = block.inputList[i]); i++) {
    const fieldRow = newInput.fieldRow;
    while (fieldIdx < fieldRow.length) {
      if (fieldRow[fieldIdx].isClickable() || ASTNode.NAVIGATE_ALL_FIELDS) {
        return ASTNode.createFieldNode(fieldRow[fieldIdx]);
      }
      fieldIdx++;
    }
    fieldIdx = 0;
    if (newInput.connection) {
      return ASTNode.createInputNode(newInput);
    }
  }
  return null;
};

/**
 * Given an input find the previous editable field or an input with a non null
 * connection in the same block. The current location must be an input
 * connection.
 * @return {ASTNode} The AST node holding the previous field or
 *     connection.
 * @private
 */
ASTNode.prototype.findPrevForInput_ = function() {
  const location = /** @type {!Blockly.Connection} */ (this.location_);
  const parentInput = location.getParentInput();
  const block = parentInput.getSourceBlock();
  const curIdx = block.inputList.indexOf(parentInput);
  let i = curIdx, input;
  for (; (input = block.inputList[i]); i--) {
    if (input.connection && input !== parentInput) {
      return ASTNode.createInputNode(input);
    }
    const fieldRow = input.fieldRow;
    let j = fieldRow.length - 1, field;
    for (; (field = fieldRow[j]); j--) {
      if (field.isClickable() || ASTNode.NAVIGATE_ALL_FIELDS) {
        return ASTNode.createFieldNode(field);
      }
    }
  }
  return null;
};

/**
 * Given a field find the previous editable field or an input with a non null
 * connection in the same block. The current location must be a field.
 * @return {ASTNode} The AST node holding the previous input or field.
 * @private
 */
ASTNode.prototype.findPrevForField_ = function() {
  const location = /** @type {!Blockly.Field} */ (this.location_);
  const parentInput = location.getParentInput();
  const block = location.getSourceBlock();
  const curIdx = block.inputList.indexOf(
      /** @type {!Blockly.Input} */ (parentInput));
  let fieldIdx = parentInput.fieldRow.indexOf(location) - 1;
  let i = curIdx, input;
  for (; (input = block.inputList[i]); i--) {
    if (input.connection && input !== parentInput) {
      return ASTNode.createInputNode(input);
    }
    const fieldRow = input.fieldRow;
    while (fieldIdx > -1) {
      if (fieldRow[fieldIdx].isClickable() || ASTNode.NAVIGATE_ALL_FIELDS) {
        return ASTNode.createFieldNode(fieldRow[fieldIdx]);
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
 * @return {ASTNode} The first block of the next stack or null if there
 * are no blocks on the workspace.
 * @private
 */
ASTNode.prototype.navigateBetweenStacks_ = function(forward) {
  var curLocation = this.getLocation();
  if (curLocation.getSourceBlock) {
    curLocation = /** @type {!Blockly.IASTNodeLocationWithBlock} */ (
      curLocation).getSourceBlock();
  }
  if (!curLocation || !curLocation.workspace) {
    return null;
  }
  const curRoot = curLocation.getRootBlock();
  const topBlocks = curRoot.workspace.getTopBlocks(true);
  let i = 0, topBlock;
  for (; (topBlock = topBlocks[i]); i++) {
    if (curRoot.id == topBlock.id) {
      const offset = forward ? 1 : -1;
      const resultIndex = i + offset;
      if (resultIndex == -1 || resultIndex == topBlocks.length) {
        return null;
      }
      return ASTNode.createStackNode(topBlocks[resultIndex]);
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
 * @return {!ASTNode} The AST node containing the top connection.
 * @private
 */
ASTNode.prototype.findTopASTNodeForBlock_ = function(block) {
  const topConnection = block.previousConnection || block.outputConnection;
  if (topConnection) {
    return /** @type {!ASTNode} */ (ASTNode.createConnectionNode(
        topConnection));
  } else {
    return /** @type {!ASTNode} */ (ASTNode.createBlockNode(
        block));
  }
};

/**
 * Get the AST node pointing to the input that the block is nested under or if
 * the block is not nested then get the stack AST node.
 * @param {Blockly.Block} block The source block of the current location.
 * @return {ASTNode} The AST node pointing to the input connection or
 *     the top block of the stack this block is in.
 * @private
 */
ASTNode.prototype.getOutAstNodeForBlock_ = function(block) {
  if (!block) {
    return null;
  }
  let topBlock;
  // If the block doesn't have a previous connection then it is the top of the
  // substack.
  topBlock = block.getTopStackBlock();
  const topConnection =
      topBlock.previousConnection || topBlock.outputConnection;
  // If the top connection has a parentInput, create an AST node pointing to
  // that input.
  if (topConnection && topConnection.targetConnection &&
      topConnection.targetConnection.getParentInput()) {
    return ASTNode.createInputNode(
        topConnection.targetConnection.getParentInput());
  } else {
    // Go to stack level if you are not underneath an input.
    return ASTNode.createStackNode(topBlock);
  }
};

/**
 * Find the first editable field or input with a connection on a given block.
 * @param {!Blockly.Block} block The source block of the current location.
 * @return {ASTNode} An AST node pointing to the first field or input.
 * Null if there are no editable fields or inputs with connections on the block.
 * @private
 */
ASTNode.prototype.findFirstFieldOrInput_ = function(block) {
  const inputs = block.inputList;
  let i = 0, input;
  for (; (input = inputs[i]); i++) {
    const fieldRow = input.fieldRow;
    let j = 0, field;
    for (; (field = fieldRow[j]); j++) {
      if (field.isClickable() || ASTNode.NAVIGATE_ALL_FIELDS) {
        return ASTNode.createFieldNode(field);
      }
    }
    if (input.connection) {
      return ASTNode.createInputNode(input);
    }
  }
  return null;
};

/**
 * Finds the source block of the location of this node.
 * @return {Blockly.Block} The source block of the location, or null if the node
 * is of type workspace.
 */
ASTNode.prototype.getSourceBlock = function() {
  if (this.getType() === ASTNode.types.BLOCK) {
    return /** @type {Blockly.Block} */ (this.getLocation());
  } else if (this.getType() === ASTNode.types.STACK) {
    return /** @type {Blockly.Block} */ (this.getLocation());
  } else if (this.getType() === ASTNode.types.WORKSPACE) {
    return null;
  } else {
    return /** @type {Blockly.IASTNodeLocationWithBlock} */ (
      this.getLocation()).getSourceBlock();
  }
};

/**
 * Find the element to the right of the current element in the AST.
 * @return {ASTNode} An AST node that wraps the next field, connection,
 *     block, or workspace. Or null if there is no node to the right.
 */
ASTNode.prototype.next = function() {
  let connection, block, nextConnection, targetConnection;
  switch (this.type_) {
    case ASTNode.types.STACK:
      return this.navigateBetweenStacks_(true);

    case ASTNode.types.OUTPUT:
      connection = /** @type {!Blockly.Connection} */ (this.location_);
      return ASTNode.createBlockNode(connection.getSourceBlock());

    case ASTNode.types.FIELD:
      return this.findNextForField_();

    case ASTNode.types.INPUT:
      return this.findNextForInput_();

    case ASTNode.types.BLOCK:
      block = /** @type {!Blockly.Block} */ (this.location_);
      nextConnection = block.nextConnection;
      return ASTNode.createConnectionNode(nextConnection);

    case ASTNode.types.PREVIOUS:
      connection = /** @type {!Blockly.Connection} */ (this.location_);
      return ASTNode.createBlockNode(connection.getSourceBlock());

    case ASTNode.types.NEXT:
      connection = /** @type {!Blockly.Connection} */ (this.location_);
      targetConnection = connection.targetConnection;
      return ASTNode.createConnectionNode(targetConnection);
  }

  return null;
};

/**
 * Find the element one level below and all the way to the left of the current
 * location.
 * @return {ASTNode} An AST node that wraps the next field, connection,
 * workspace, or block. Or null if there is nothing below this node.
 */
ASTNode.prototype.in = function() {
  let workspace, topBlocks, block, connection, targetConnection;
  switch (this.type_) {
    case ASTNode.types.WORKSPACE:
      workspace = /** @type {!Blockly.Workspace} */ (this.location_);
      topBlocks = workspace.getTopBlocks(true);
      if (topBlocks.length > 0) {
        return ASTNode.createStackNode(topBlocks[0]);
      }
      break;

    case ASTNode.types.STACK:
      block = /** @type {!Blockly.Block} */ (this.location_);
      return this.findTopASTNodeForBlock_(block);

    case ASTNode.types.BLOCK:
      block = /** @type {!Blockly.Block} */ (this.location_);
      return this.findFirstFieldOrInput_(block);

    case ASTNode.types.INPUT:
      connection = /** @type {!Blockly.Connection} */ (this.location_);
      targetConnection = connection.targetConnection;
      return ASTNode.createConnectionNode(targetConnection);
  }

  return null;
};

/**
 * Find the element to the left of the current element in the AST.
 * @return {ASTNode} An AST node that wraps the previous field,
 * connection, workspace or block. Or null if no node exists to the left.
 * null.
 */
ASTNode.prototype.prev = function() {
  let block, topConnection, connection, targetConnection;
  switch (this.type_) {
    case ASTNode.types.STACK:
      return this.navigateBetweenStacks_(false);

    case ASTNode.types.OUTPUT:
      return null;

    case ASTNode.types.FIELD:
      return this.findPrevForField_();

    case ASTNode.types.INPUT:
      return this.findPrevForInput_();

    case ASTNode.types.BLOCK:
      block = /** @type {!Blockly.Block} */ (this.location_);
      topConnection = block.previousConnection || block.outputConnection;
      return ASTNode.createConnectionNode(topConnection);

    case ASTNode.types.PREVIOUS:
      connection = /** @type {!Blockly.Connection} */ (this.location_);
      targetConnection = connection.targetConnection;
      if (targetConnection && !targetConnection.getParentInput()) {
        return ASTNode.createConnectionNode(targetConnection);
      }
      break;

    case ASTNode.types.NEXT:
      connection = /** @type {!Blockly.Connection} */ (this.location_);
      return ASTNode.createBlockNode(connection.getSourceBlock());
  }

  return null;
};

/**
 * Find the next element that is one position above and all the way to the left
 * of the current location.
 * @return {ASTNode} An AST node that wraps the next field, connection,
 *     workspace or block. Or null if we are at the workspace level.
 */
ASTNode.prototype.out = function() {
  let block, blockPos, wsCoordinate, connection, target, field;
  switch (this.type_) {
    case ASTNode.types.STACK:
      block = /** @type {!Blockly.Block} */ (this.location_);
      blockPos = block.getRelativeToSurfaceXY();
      // TODO: Make sure this is in the bounds of the workspace.
      wsCoordinate = new Blockly.utils.Coordinate(
          blockPos.x, blockPos.y + ASTNode.DEFAULT_OFFSET_Y);
      return ASTNode.createWorkspaceNode(block.workspace, wsCoordinate);

    case ASTNode.types.OUTPUT:
      connection = /** @type {!Blockly.Connection} */ (this.location_);
      target = connection.targetConnection;
      if (target) {
        return ASTNode.createConnectionNode(target);
      }
      return ASTNode.createStackNode(connection.getSourceBlock());

    case ASTNode.types.FIELD:
      field = /** @type {!Blockly.Field} */ (this.location_);
      return ASTNode.createBlockNode(field.getSourceBlock());

    case ASTNode.types.INPUT:
      connection = /** @type {!Blockly.Connection} */ (this.location_);
      return ASTNode.createBlockNode(connection.getSourceBlock());

    case ASTNode.types.BLOCK:
      block = /** @type {!Blockly.Block} */ (this.location_);
      return this.getOutAstNodeForBlock_(block);

    case ASTNode.types.PREVIOUS:
      connection = /** @type {!Blockly.Connection} */ (this.location_);
      return this.getOutAstNodeForBlock_(connection.getSourceBlock());

    case ASTNode.types.NEXT:
      connection = /** @type {!Blockly.Connection} */ (this.location_);
      return this.getOutAstNodeForBlock_(connection.getSourceBlock());
  }

  return null;
};

exports = ASTNode;
