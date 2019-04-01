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
 * @constructor
 * @param{String} type This is the type of what is being passed in. Either
 * block, field, nextConnection...
 * @param{Blockly.Block}
 * @param{String} The name of the connection or field.
 */
Blockly.ASTNode = function(type, location, params) {

  /*
   * The type of the location.
   * @type String
   * @private
   */
  this.type_ = type;

  /*
   * In the case of a connection or field this is the block that the
   * connection or field is on. In the case of a block this is just holds
   * the block object.
   * @private
   */
  this.location_ = location;

  this.processParams(params);

};

/**
 * Object holding different types for a cursor.
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

Blockly.ASTNode.prototype.processParams = function(params){
  if (!params) {return;}
  if (params['position']) {
    this.position_ = params['position'];
  }

  if (params['block']) {
    this.block_ = params['block'];
  }

  if (params['name']) {
    this.name_ = params['name'];
  }
};

/**
 * Gets the current location of the cursor.
 * @return {Blockly.Field|Blockly.Connection|Blockly.Block} The current field,
 * connection, or block the cursor is on.
 */
Blockly.ASTNode.prototype.getLocation = function() {
  return this.location_;
};

/**
 * The type of the current location.
 * @return {String} The type of the location.
 */
Blockly.ASTNode.prototype.getLocationType = function() {
  return this.type_;
};


/**
 * Set the type for the current position of the cursor.
 * @private
 */
Blockly.ASTNode.prototype.setType_ = function() {
  var location = this.location_;
  var hasParent = this.parentInput_;
  if (this.isStack_) {
    this.type_ = this.types.STACK;
  } else if (location.type === Blockly.OUTPUT_VALUE) {
    this.type_ = this.types.OUTPUT;
  } else if (location instanceof Blockly.Field) {
    this.type_ = this.types.FIELD;
  } else if (location.type === Blockly.INPUT_VALUE || hasParent) {
    this.type_ = this.types.INPUT;
  } else if (location instanceof Blockly.Block) {
    this.type_ = this.types.BLOCK;
  } else if (location.type === Blockly.PREVIOUS_STATEMENT) {
    this.type_ = this.types.PREVIOUS;
  } else if (location.type === Blockly.NEXT_STATEMENT) {
    this.type_ = this.types.NEXT;
  } else if (location instanceof Blockly.Workspace) {
    this.type_ = this.types.WORKSPACE;
  }
};

/**
 * Get the parent input of the current location of the cursor.
 * @return {Blockly.Input} The input that the connection belongs to.
 * @private
 */
Blockly.ASTNode.prototype.findParentInput_ = function() {
  var parentInput = null;
  var location = this.getLocation();

  if (location instanceof Blockly.Field
    || location instanceof Blockly.Connection) {
    parentInput = location.getParentInput();
  }
  return parentInput;
};

/**
 * Get either the next editable field, or the first field for the given input.
 * @param {!Blockly.Field} location The current location of the cursor.
 * @param {!Blockly.Input} parentInput The parentInput of the field.
 * @param {?Boolean} opt_first If true find the first editable field otherwise get
 * the next field.
 * @return {Blockly.Field} The next field or null if no next field exists.
 * @private
 */
Blockly.ASTNode.prototype.findNextEditableField_ = function(location,
    parentInput, opt_first) {
  var fieldRow = parentInput.fieldRow;
  var fieldIdx = fieldRow.indexOf(location);
  var nextField = null;
  var startIdx = opt_first ? 0 : fieldIdx + 1;
  var astNode;
  for (var i = startIdx; i < fieldRow.length; i++) {
    var field = fieldRow[i];
    if (field.isCurrentlyEditable()) {
      nextField = field;
      astNode = new Blockly.ASTNode(Blockly.ASTNode.types.FIELD,
          nextField.sourceBlock_, nextField.name);
      break;
    }
  }
  return astNode;
};

/**
 * Get either the previous editable field, or get the first field for the given
 * input.
 * @param {!Blockly.Field} location The current location of the cursor.
 * @param {!Blockly.Input} parentInput The parentInput of the field.
 * @param {?Boolean} opt_last If true find the last editable field otherwise get
 * the previous field.
 * @return {Blockly.Field} The previous or last field or null if no next field
 * exists.
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
  return new Blockly.ASTNode(Blockly.ASTNode.types.FIELD,
      previousField.sourceBlock_, previousField.name);
};


/**
 * Get the first field or connection that is either editable or has connection
 * value of not null.
 * @param {!Blockly.Connection} location Current place of cursor.
 * @param {!Blockly.Input} parentInput The parent input of the field or connection.
 * @return {Blockly.Connection|Blockly.Field} The next field or connection.
 * @private
 */
Blockly.ASTNode.prototype.findNextForInput_ = function(location, parentInput){
  var inputs = location.sourceBlock_.inputList;
  var curIdx = inputs.indexOf(parentInput);
  if (curIdx <= -1) {return;}
  var nxtIdx = curIdx + 1;
  var nextLocation = null;

  for (var i = nxtIdx; i < inputs.length; i++) {
    var newInput = inputs[i];
    var field = this.findNextEditableField_(location, newInput, true);
    if (field) {
      nextLocation = new Blockly.ASTNode(Blockly.ASTNode.types.FIELD, field);
      break;
    } else if (newInput.connection) {
      var connection = newInput.connection;
      nextLocation = new Blockly.ASTNode(Blockly.ASTNode.types.INPUT, connection);
      break;
    }
  }
  return nextLocation;
};

/**
 * Find the next input or field given a field location.
 * @param {!Blockly.Field} location The current location of the cursor.
 * @param {!Blockly.Input} parentInput The parent input of the field.
 * @return {Blockly.Field|Blockly.Connection} The next location.
 * @private
 */
Blockly.ASTNode.prototype.findNextForField_ = function(location, parentInput) {
  var nextLocation = this.findNextEditableField_(location, parentInput);

  if (!nextLocation) {
    nextLocation = parentInput.connection;
    nextLocation = new Blockly.ASTNode(Blockly.ASTNode.types.INPUT, parentInput.connection);
  }
  return nextLocation;
};


/**
 * Given the current selected field or connection find the previous connection
 * or field.
 * @param {!Blockly.Connection} location The current location of
 * the cursor.
 * @param {!Blockly.Input} parentInput Parent input of the connection or field.
 * @return {Array<Blockly.Field|Blockly.Connection, Blockly.Input>} The first
 * value is the next field or connection and the second value is the parent input.
 * @private
 */
Blockly.ASTNode.prototype.findPrevForInput_ = function(location, parentInput){
  var block = location.sourceBlock_;
  var inputs = block.inputList;
  var curIdx = inputs.indexOf(parentInput);
  var prevLocation = null;

  for (var i = curIdx; i >= 0; i--) {
    var newInput = inputs[i];
    var field = this.findPreviousEditableField_(location, newInput, true);
    if (newInput.connection && newInput.connection !== parentInput.connection) {
      var connection = newInput.connection;
      prevLocation = new Blockly.ASTNode(Blockly.ASTNode.types.INPUT, newInput.connection);
      this.parentInput_ = newInput;
      break;
    } else if (field && field !== location) {
      prevLocation = new Blockly.ASTNode(Blockly.ASTNode.types.FIELD, field.getLocation());
      this.parentInput_ = newInput;
      break;
    }
  }
  return prevLocation;
};

/**
 * Find the previous input or field given a field location.
 * @param {!Blockly.Field} location The current location of the cursor.
 * @param {!Blockly.Input} parentInput The parent input of the field.
 * @return {Blockly.Field|Blockly.Connection} The previous location.
 * @private
 */
Blockly.ASTNode.prototype.findPrevForField_ = function(location, parentInput) {
  var block = location.sourceBlock_;
  var inputs = block.inputList;
  var curIdx = inputs.indexOf(parentInput);
  var prevLocation = this.findPreviousEditableField_(location, parentInput);
  var astNode;

  if (!prevLocation && curIdx - 1 >= 0) {
    prevLocation = inputs[curIdx - 1].connection;
    astNode = new Blockly.ASTNode(Blockly.ASTNode.types.INPUT, prevLocation);
    this.parentInput_ = inputs[curIdx - 1];
  }
  return astNode;
};

/**
 * Walk from the given block back up through the stack of blocks to find the top
 * block. If we are nested in a statement input only find the top most nested
 * block. Do not go all the way to the top of the stack.
 * @param {!Blockly.Block} sourceBlock A block in the stack.
 * @return {Blockly.Block} The top block in a stack
 * @private
 */
Blockly.ASTNode.prototype.findTop_ = function(sourceBlock) {
  var topBlock = sourceBlock;
  var targetConnection = sourceBlock.previousConnection.targetConnection;
  //while the target is not an input and it is connected to another block
  while (targetConnection && !targetConnection.getParentInput() && topBlock
    && topBlock.previousConnection
    && topBlock.previousConnection.targetBlock()) {
    topBlock = topBlock.previousConnection.targetBlock();
    targetConnection = topBlock.previousConnection.targetConnection;
  }
  return topBlock;
};

/**
 * Navigate between stacks of blocks on the workspace.
 * @param {?Boolean} forward True to go forward. False to go backwards.
 * @return {Blockly.BlockSvg} The first block of the next stack.
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
      return topBlocks[resultIndex];
    }
  }
  throw Error('Couldn\'t find ' + (forward ? 'next' : 'previous') +
      ' stack?!?!?!');
};

/**
 * Find the first connection on a given block.
 * We are defining first connection as the highest connection point on a given
 * block. Therefore previous connection comes before output connection.
 * @param {!Blockly.Field|Blockly.Block|Blockly.Connection} location The location
 * of the cursor.
 * @return {Blockly.Connection} The first connection.
 * @private
 */
Blockly.ASTNode.prototype.findTopConnection_ = function(location) {
  var previousConnection = location.previousConnection;
  var outputConnection = location.outputConnection;
  return previousConnection ? previousConnection : outputConnection;
};

Blockly.ASTNode.prototype.findTopASTConnection = function(block) {
  var previousConnection = block.previousConnection;
  var outputConnection = block.outputConnection;
  var astNode;
  if (previousConnection) {
    astNode = new Blockly.ASTNode(Blockly.ASTNode.types.PREVIOUS, previousConnection);
  } else if (outputConnection) {
    astNode = new Blockly.ASTNode(Blockly.ASTNode.types.OUTPUT, outputConnection);
  }
  return astNode;
};


/**
 * Given a location in a stack of blocks find the next out connection. If the
 * location is nested the next out location should be the connected input.
 * @param {!Blockly.Block} location The source block for the current location.
 * @return {Blockly.Connection|Blockly.Block} The next out connection or block.
 * @private
 */
Blockly.ASTNode.prototype.findOutLocationForStack_ = function(location) {
  var newLocation;
  var topBlock = this.findTop_(location);
  var astNode;
  newLocation = topBlock.previousConnection.targetConnection;
  astNode = Blockly.ASTNode(Blockly.ASTNode.types.NEXT, newLocation);
  if (!newLocation) {
    newLocation = topBlock.previousConnection;
    astNode = Blockly.ASTNode(Blockly.ASTNode.types.PREVIOUS, newLocation);
    this.isStack_ = true;
    this.stackBlock_ = topBlock;
  }
  return newLocation;
};

/**
 * Find the next connection, field, or block.
 * @return {Blockly.Field|Blockly.Block|Blockly.Connection} The next element.
 */
Blockly.ASTNode.prototype.next = function() {
  var location = this.getLocation();
  if (!location) {return null;}
  var newAstNode;
  var parentInput = this.findParentInput_();

  switch (this.type_) {
    case Blockly.ASTNode.types.STACK:
      var nextTopBlock = this.navigateBetweenStacks_(true);
      newAstNode = this.findTopASTConnection(nextTopBlock);
      isStack = true;
      break;

    case Blockly.ASTNode.types.OUTPUT:
      newAstNode = new Blockly.ASTNode(Blockly.ASTNode.types.BLOCK,
          location.sourceBlock_);
      break;

    case Blockly.ASTNode.types.FIELD:
      newAstNode = this.findNextForField_(location, parentInput);
      break;

    case Blockly.ASTNode.types.INPUT:
      newAstNode = this.findNextForInput_(location, parentInput);
      break;

    case Blockly.ASTNode.types.BLOCK:
      newAstNode = new Blockly.ASTNode(Blockly.ASTNode.types.NEXT, location.nextConnection);
      break;

    case Blockly.ASTNode.types.PREVIOUS:
      var output = location.outputConnection;
      if (output) {
        newAstNode = new Blockly.ASTNode(Blockly.ASTNode.types.OUTPUT,
            output);
      } else {
        newAstNode = new Blockly.ASTNode(Blockly.ASTNode.types.BLOCK,
            location.sourceBlock_);
      }
      break;

    case Blockly.ASTNode.types.NEXT:
      if (location.targetBlock()) {
        newAstNode = this.findTopASTConnection(location.targetBlock());
      }
      break;
  }

  return newAstNode;
};

/**
 * Find the next in connection or field.
 * @return {Blockly.Field|Blockly.Block|Blockly.Connection} The next element.
 */
Blockly.ASTNode.prototype.in = function() {
  var location = this.getLocation();
  if (!location) {return null;}
  var newLocation = null;
  var newParentInput;

  switch (this.type_) {
    case Blockly.ASTNode.types.STACK:
      this.isStack_ = false;
      this.setType_();
      break;
    case Blockly.ASTNode.types.BLOCK:
      var inputs = location.inputList;
      if (inputs && inputs.length > 0) {
        newParentInput = inputs[0];
        var field = this.findNextEditableField_(location, newParentInput, true);
        if (field) {
          newLocation = field;
        } else {
          newLocation = newParentInput.connection;
        }
      }
      break;

    case Blockly.ASTNode.types.INPUT:
      if (location.targetBlock()) {
        newLocation = this.findTopConnection_(location.targetBlock());
      }
      break;
  }

  return newLocation;
};

/**
 * Find the previous connection, field, or block.
 * @return {Blockly.Field|Blockly.Block|Blockly.Connection} The next element.
 */
Blockly.ASTNode.prototype.prev = function() {
  var location = this.getLocation();
  if (!location) {return null;}
  var newLocation;
  var parentInput = this.findParentInput_();
  var isStack = false;
  var newAstNode;

  switch (this.type_) {
    case Blockly.ASTNode.types.STACK:
      var nextTopBlock = this.navigateBetweenStacks_(true);
      newLocation = this.findTopConnection_(nextTopBlock);
      isStack = true;
      break;

    case Blockly.ASTNode.types.OUTPUT:
      if (location.sourceBlock_ && location.sourceBlock_.previousConnection) {
        newAstNode = new Blockly.ASTNode(Blockly.ASTNode.types.PREVIOUS,
            location.sourceBlock_.previousConnection);
      }
      break;

    case Blockly.ASTNode.types.FIELD:
      newAstNode = this.findPrevForField_(location, parentInput);
      break;

    case Blockly.ASTNode.types.INPUT:
      newAstNode = this.findPrevForInput_(location, parentInput);
      break;

    case Blockly.ASTNode.types.BLOCK:
      var output = location.outputConnection;
      if (output) {
        newAstNode = new Blockly.ASTNode(Blockly.ASTNode.types.OUTPUT,
            output);
      } else {
        newAstNode = new Blockly.ASTNode(Blockly.ASTNode.types.PREVIOUS,
            location.previousConnection);
      }
      break;

    case Blockly.ASTNode.types.PREVIOUS:
      var prevBlock = location.targetBlock();
      if (prevBlock) {
        newAstNode = new Blockly.ASTNode(Blockly.ASTNode.types.NEXT,
            prevBlock.nextConnection);
      }
      break;

    case Blockly.ASTNode.types.NEXT:
      newLocation = location.sourceBlock_;
      newAstNode = new Blockly.ASTNode(Blockly.ASTNode.types.BLOCK,
          location.sourceBlock_);
      break;
  }

  return newAstNode;
};

/**
 * Find the next out connection, field, or block.
 * @return {Blockly.Field|Blockly.Block|Blockly.Connection} The next element.
 */
Blockly.ASTNode.prototype.out = function() {
  var location = this.getLocation();
  if (!location) {return null;}
  var newLocation;
  var isStack = false;

  switch (this.type_) {
    case Blockly.ASTNode.types.STACK:
      break;

    case Blockly.ASTNode.types.OUTPUT:
      newLocation = location.targetConnection;
      if (!newLocation) {
        isStack = true;
        this.stackBlock_ = location.sourceBlock_;
        this.setType_();
      }
      break;

    case Blockly.ASTNode.types.FIELD:
      newLocation = location.sourceBlock_;
      break;

    case Blockly.ASTNode.types.INPUT:
      newLocation = location.sourceBlock_;
      break;

    case Blockly.ASTNode.types.BLOCK:
      var outputConnection = location.outputConnection;
      if (outputConnection && outputConnection.targetConnection) {
        newLocation = outputConnection.targetConnection;
      } else if (outputConnection) {
        newLocation = outputConnection;
      } else {
        //This is the case where we are on a block that is nested inside a
        //statement input and we need to get the input that connects to the
        //top block
        newLocation = this.findOutLocationForStack_(location);
        isStack = this.isStack_;
      }
      break;

    case Blockly.ASTNode.types.PREVIOUS:
      newLocation = this.findOutLocationForStack_(location.sourceBlock_);
      isStack = this.isStack_;
      break;

    case Blockly.ASTNode.types.NEXT:
      newLocation = this.findOutLocationForStack_(location.sourceBlock_);
      isStack = this.isStack_;
      break;
  }

  return newLocation;
};
