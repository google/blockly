/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
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
 * @fileoverview The class representing a cursor.
 * Used primarily for keyboard navigation.
 */
'use strict';

goog.provide('Blockly.Cursor');

/**
 * Class for a cursor.
 * @constructor
 */
Blockly.Cursor = function() {

  /*
   * The parent input of a field or connection.
   * @type ?Blockly.Input
   * @private
   */
  this.parentInput_ = null;

  /*
   * Whether we are at the stack level or not.
   * @type Boolean
   * @private
   */
  this.isStack_ = false;

  /*
   * The top block of the current stack.
   * @type ?Blockly.Block
   * @private
   */
  this.stackBlock_ = null;

  /*
   * Whether we are at the workspace level.
   * @type Boolean
   * @private
   */
  this.isWorkspace_ = false;

  /*
   * The current location of the cursor.
   * @type Blockly.Field|Blockly.Connection|Blockly.Block
   * @private
   */
  this.location_ = null;

  /*
   * The type of the current connection.
   * @type Boolean
   * @private
   */
  this.type_ = null;
};

/**
 * Object holding different types for a cursor.
 */
Blockly.Cursor.prototype.types = {
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
 * Sets whether we are at the stack level or not.
 * Having a stack level is necessary in order to navigate to other stacks in the
 * worksapce.
 * @param{Boolean} isStack True if we are at the stack level false otherwise.
 * @param{Blockly.Block} topBlock The top block of a stack.
 */
Blockly.Cursor.prototype.setStack = function(isStack, topBlock) {
  this.isStack_ = isStack;
  this.stackBlock_ = topBlock;
};

/**
 * Sets whether or not our cursor is on the worksapce or not.
 * @param{Boolean} isWorkspace Decides whether we are on the worksapce level or
 * not.
 */
Blockly.Cursor.prototype.setWorkspace = function(isWorkspace) {
  this.isWorkspace_ = isWorkspace;
};

/**
 * Gets the current location of the cursor.
 * @return{?Blockly.Field|Blockly.Connection|Blockly.Block} The current field,
 * connection, or block the cursor is on.
 */
Blockly.Cursor.prototype.getLocation = function() {
  return this.location_;
};

/**
 * Gets the parent input of the current location.
 * @return {?Blockly.Input} The parent input of the current location. Should be
 * null if the current location is a block.
 * TODO: Do I need this?
 */
Blockly.Cursor.prototype.getParentInput = function() {
  return this.parentInput_;
};

/**
 * Whether or not we are at the worksapce level.
 * @return{Boolean} True if we are on the workspace level false otherwise.
 */
Blockly.Cursor.prototype.isWorkspace = function() {
  return this.isWorkspace_;
};

/**
 * Whether or not we are at the stack level.
 * @return{Boolean} True if we are at the stack level false otherwise.
 */
Blockly.Cursor.prototype.isStack = function() {
  return this.isStack_;
};

/**
 * Set the location of the cursor and call the update method.
 * @param{Blockly.Field|Blockly.Block|Blockly.Connection} newLocation The new
 * location of the cursor.
 * @param{?Blockly.Input} opt_parent The parent input of a connection or a field.
 * TODO: Check if it would be better to have a helper function find the parent
 * when an input or field is passed in and the parent is not supplied.
 */
Blockly.Cursor.prototype.setLocation = function(newLocation, opt_parent) {
  this.location_ = newLocation;
  this.parentInput_ = opt_parent;
  this.setType_();
  this.update_();
};

/**
 * Set the type for the current position of the cursor.
 * @private
 */
Blockly.Cursor.prototype.setType_ = function() {
  var location = this.getLocation();
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
  }
};

/**
 * Update method to be overwritten in cursor_svg.
 * @protected
 */
Blockly.Cursor.prototype.update_ = function() {};

/**
 * Search through the list of inputs and their fields in order to find the
 * parent input of a field.
 * TODO: Check on moving this to the block class.
 * @param {Blockly.Field} field Field to find parent for.
 * @return {Blockly.Input} The input that the field belongs to.
 * @private
 */
Blockly.Cursor.prototype.getFieldParentInput_ = function(field) {
  var parentInput = null;
  var block = field.sourceBlock_;
  var inputs = block.inputList;

  for (var idx = 0; idx < block.inputList.length; idx++) {
    var input = inputs[idx];
    var fieldRows = input.fieldRow;
    for (var j = 0; j < fieldRows.length; j++) {
      if (fieldRows[j] === field) {
        parentInput = input;
        break;
      }
    }
  }
  return parentInput;
};

/**
 * Get the parent input of a connection.
 * TODO: Check on moving this to the block class.
 * @param {Blockly.Connection} connection Connection to find parent for.
 * @return {Blockly.Input} The input that the connection belongs to.
 * @private
 */
Blockly.Cursor.prototype.getConnectionParentInput_ = function(connection) {
  var parentInput = null;
  var block = connection.sourceBlock_;
  var inputs = block.inputList;
  for (var idx = 0; idx < block.inputList.length; idx++) {
    if (inputs[idx].connection === connection) {
      parentInput = inputs[idx];
      break;
    }
  }
  return parentInput;
};

/**
 * Get the parent input of the cursor.
 * TODO: Check on moving this to the block class.
 * @param {Blockly.Connection|Blockly.Field} cursor Field or connection to find
 * parent for.
 * @return {Blockly.Input} The input that the connection belongs to.
 * @private
 */
Blockly.Cursor.prototype.findParentInput_ = function(cursor) {
  var parentInput = null;
  if (cursor instanceof Blockly.Field) {
    parentInput = this.getFieldParentInput_(cursor);
  } else if (cursor instanceof Blockly.Connection) {
    parentInput = this.getConnectionParentInput_(cursor);
  }
  return parentInput;
};

/**
 * Get either the next editable field, or the first field for the given input.
 * @param{Blockly.Field} location The current location of the cursor.
 * @param{Blockly.Input} parentInput The parentInput of the field.
 * @param{Boolean} opt_first If true find the first editable field otherwise get
 * the next field.
 * @return{Blockly.Field} The next field or null if no next field exists.
 * @private
 */
Blockly.Cursor.prototype.findNextEditableField_ = function(location,
    parentInput, opt_first) {
  var fieldRow = parentInput.fieldRow;
  var fieldIdx = fieldRow.indexOf(location);
  var nextField = null;
  var startIdx = opt_first ? 0 : fieldIdx + 1;
  for (var i = startIdx; i < fieldRow.length; i++) {
    var field = fieldRow[i];
    if (field.isCurrentlyEditable()) {
      nextField = field;
      break;
    }
  }
  return nextField;
};

/**
 * Get either the previous editable field, or get the first field for the given
 * input.
 * @param{Blockly.Field} location The current location of the cursor.
 * @param{Blockly.Input} parentInput The parentInput of the field.
 * @param{Boolean} opt_last If true find the last editable field otherwise get
 * the previous field.
 * @return{Blockly.Field} The previous or last field or null if no next field
 * exists.
 * @private
 */
Blockly.Cursor.prototype.findPreviousEditableField_ = function(location,
    parentInput, opt_last) {
  var fieldRow = parentInput.fieldRow;
  var fieldIdx = fieldRow.indexOf(location);
  var nextField = null;
  var startIdx = opt_last ? fieldRow.length - 1 : fieldIdx - 1;
  for (var i = startIdx; i >= 0; i--) {
    var field = fieldRow[i];
    if (field.isCurrentlyEditable()) {
      nextField = field;
      break;
    }
  }
  return nextField;
};


/**
 * Get the first field or connection that is either editable or has connection
 * value of not null.
 * @param {Blockly.Connection} location Current place of cursor.
 * @param {Blockly.Input} parentInput The parent input of the field or connection.
 * @return {Blockly.Connection|Blockly.Field} The next field or connection.
 * @private
 */
Blockly.Cursor.prototype.findNextForInput_ = function(location, parentInput){
  var inputs = location.sourceBlock_.inputList;
  var curIdx = inputs.indexOf(parentInput);
  if (curIdx <= -1) {return;}
  var nxtIdx = curIdx + 1;
  var nextLocation = null;

  for (var i = nxtIdx; i < inputs.length; i++) {
    var newInput = inputs[i];
    var field = this.findNextEditableField_(location, newInput, true);
    if (field) {
      nextLocation = field;
      this.parentInput_ = newInput;
      break;
    } else if (newInput.connection) {
      nextLocation = newInput.connection;
      this.parentInput_ = newInput;
      break;
    }
  }
  return nextLocation;
};

/**
 * Find the next input or field given a field location.
 * @param{Blockly.Field} location The current location of the cursor.
 * @param{Blockly.Input} parentInput The parent input of the field.
 * @return {Blockly.Field|Blockly.Connection} The next location.
 * @private
 */
Blockly.Cursor.prototype.findNextForField_ = function(location, parentInput) {
  var nextLocation = this.findNextEditableField_(location, parentInput);

  if (!nextLocation) {
    nextLocation = parentInput.connection;
  }
  return nextLocation;
};


/**
 * Given the current selected field or connection find the previous connection
 * or field.
 * @param {Blockly.Connection} location The current location of
 * the cursor.
 * @param {Blockly.Input} parentInput Parent input of the connection or field.
 * @return {Array<Blockly.Field|Blockly.Connection, Blockly.Input>} The first
 * value is the next field or connection and the second value is the parent input.
 */
Blockly.Cursor.prototype.findPrevForInput_ = function(location, parentInput){
  var block = location.sourceBlock_;
  var inputs = block.inputList;
  var curIdx = inputs.indexOf(parentInput);
  var prevLocation = null;

  for (var i = curIdx; i >= 0; i--) {
    var newInput = inputs[i];
    var field = this.findPreviousEditableField_(location, newInput, true);
    if (newInput.connection && newInput.connection !== parentInput.connection) {
      prevLocation = newInput.connection;
      this.parentInput_ = newInput;
      break;
    } else if (field && field !== location) {
      prevLocation = field;
      this.parentInput_ = newInput;
      break;
    }
  }
  return prevLocation;
};

/**
 * Find the previous input or field given a field location.
 * @param{Blockly.Field} location The current location of the cursor.
 * @param{Blockly.Input} parentInput The parent input of the field.
 * @return {Blockly.Field|Blockly.Connection} The previous location.
 * @private
 */
Blockly.Cursor.prototype.findPrevForField_ = function(location, parentInput) {
  var block = location.sourceBlock_;
  var inputs = block.inputList;
  var curIdx = inputs.indexOf(parentInput);
  var prevLocation = this.findPreviousEditableField_(location, parentInput);

  if (!prevLocation && curIdx - 1 >= 0) {
    prevLocation = inputs[curIdx - 1].connection;
    this.parentInput_ = inputs[curIdx - 1];
  }
  return prevLocation;
};

/**
 * Walk from the given block back up through the stack of blocks to find the top
 * block. If we are nested in a statement input only find the top most nested
 * block. Do not go all the way to the top of the stack.
 * @param {Blockly.Block} sourceBlock A block in the stack.
 * @return {Blockly.Block} The top block in a stack
 * @private
 */
Blockly.Cursor.prototype.findTop_ = function(sourceBlock) {
  var topBlock = sourceBlock;
  var targetConnection = sourceBlock.previousConnection.targetConnection;
  //while the target is not an input and it is connected to another block
  while (!this.findParentInput_(targetConnection)
    && topBlock && topBlock.previousConnection
    && topBlock.previousConnection.targetBlock()) {
    topBlock = topBlock.previousConnection.targetBlock();
    targetConnection = topBlock.previousConnection.targetConnection;
  }
  return topBlock;
};

/**
 * Navigate between stacks of blocks on the workspace.
 * @param {Boolean} forward True to go forward. False to go backwards.
 * @return {Blockly.BlockSvg} The first block of the next stack.
 * @private
 */
Blockly.Cursor.prototype.navigateBetweenStacks_ = function(forward) {
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
 * Return whether or not the cursor is at the stack level. To be at the stack
 * level the cursor must be at the highest connection on the top block in a
 * stack.
 * @return {Boolean} Whether or not we are on the top of the stack.
 # @private
 */
Blockly.Cursor.prototype.checkIfStack_ = function() {
  var cursor = this.getLocation();
  var isStack_ = false;
  if (cursor.type === Blockly.OUTPUT_VALUE
    || cursor.type === Blockly.PREVIOUS_STATEMENT) {
    var block = cursor.sourceBlock_;
    var topBlock = block.getRootBlock();
    isStack_ = block === topBlock;
  }
  return isStack_;
};

/**
 * Find the first connection on a given block.
 * We are defining first connection as the highest connection point on a given
 * block. Therefore previous connection comes before output connection.
 * @param {Blockly.Field|Blockly.Block|Blockly.Connection} location The location
 * of the cursor.
 * @return {Blockly.Connection} The first connection.
 * @private
 */
Blockly.Cursor.prototype.findTopConnection_ = function(location) {
  var previousConnection = location.previousConnection;
  var outputConnection = location.outputConnection;
  return previousConnection ? previousConnection : outputConnection;
};

/**
 * Given a location in a stack of blocks find the next out connection. If the
 * location is nested the next out location should be the connected input.
 * @param{Blockly.Block} location The source block for the current location.
 * @return {Blockly.Connection|Blockly.Block} The next out connection or block.
 * @private
 */
Blockly.Cursor.prototype.findOutLocationForStack_ = function(location) {
  var newLocation;
  var topBlock = this.findTop_(location);
  newLocation = topBlock.previousConnection.targetConnection;
  if (!newLocation) {
    newLocation = topBlock.previousConnection;
    this.setStack(true, topBlock);
  }
  return newLocation;
};

/**
 * Find the next connection, field, or block.
 * @param {Blockly.Field|Blockly.Block|Blockly.Connection} cursor The current
 * field, block, or connection.
 * @return {Blockly.Field|Blockly.Block|Blockly.Connection} The next element.
 */
Blockly.Cursor.prototype.next = function() {
  var location = this.getLocation();
  if (!location) {return null;}
  var newLocation;
  var newParentInput;
  var parentInput = this.parentInput_;

  switch (this.type_) {
    case this.types.STACK:
      var nextTopBlock = this.navigateBetweenStacks_(true);
      newLocation = this.findTopConnection_(nextTopBlock);
      break;

    case this.types.OUTPUT:
      newLocation = location.sourceBlock_;
      break;

    case this.types.FIELD:
      newLocation = this.findNextForField_(location, parentInput);
      newParentInput = this.parentInput_;
      break;

    case this.types.INPUT:
      newLocation = this.findNextForInput_(location, parentInput);
      newParentInput = this.parentInput_;
      break;

    case this.types.BLOCK:
      newLocation = location.nextConnection;
      break;

    case this.types.PREVIOUS:
      var output = location.outputConnection;
      newLocation = output ? output : location.sourceBlock_;
      break;

    case this.types.NEXT:
      if (location.targetBlock()) {
        newLocation = this.findTopConnection_(location.targetBlock());
      }
      break;
  }

  if (newLocation) {
    this.setLocation(newLocation, newParentInput);
  }
  return newLocation;
};

/**
 * Find the next in connection or field.
 * @param {Blockly.Field|Blockly.Block|Blockly.Connection} cursor The current
 * field, block, or connection.
 * @return {Blockly.Field|Blockly.Block|Blockly.Connection} The next element.
 */
Blockly.Cursor.prototype.in = function() {
  var location = this.getLocation();
  if (!location) {return null;}
  var newLocation = null;
  var newParentInput;

  switch (this.type_) {
    case this.types.STACK:
      this.setStack(false);
      this.setType_();
      break;
    case this.types.BLOCK:
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

    case this.types.INPUT:
      if (location.targetBlock()) {
        newLocation = this.findTopConnection_(location.targetBlock());
      }
      break;
  }
  if (newLocation) {
    this.setLocation(newLocation, newParentInput);
  }
  return newLocation;
};

/**
 * Find the previous connection, field, or block.
 * @param {Blockly.Field|Blockly.Block|Blockly.Connection} cursor The current
 * field, block, or connection.
 * @return {Blockly.Field|Blockly.Block|Blockly.Connection} The next element.
 */
Blockly.Cursor.prototype.prev = function() {
  var location = this.getLocation();
  if (!location) {return null;}
  var newLocation;
  var parentInput = this.parentInput_;
  var newParentInput;

  switch (this.type_) {
    case this.types.STACK:
      var nextTopBlock = this.navigateBetweenStacks_(true);
      newLocation = this.findTopConnection_(nextTopBlock);
      break;

    case this.types.OUTPUT:
      if (location.sourceBlock_ && location.sourceBlock_.previousConnection) {
        newLocation = location.sourceBlock_.previousConnection;
      }
      break;

    case this.types.FIELD:
      newLocation = this.findPrevForField_(location, parentInput);
      newParentInput = this.parentInput_;
      break;

    case this.types.INPUT:
      newLocation = this.findPrevForInput_(location, parentInput);
      newParentInput = this.parentInput_;
      break;

    case this.types.BLOCK:
      var output = location.outputConnection;
      newLocation = output ? output : location.previousConnection;
      break;

    case this.types.PREVIOUS:
      var prevBlock = location.targetBlock();
      if (prevBlock) {
        newLocation = prevBlock.nextConnection;
      }
      break;

    case this.types.NEXT:
      newLocation = location.sourceBlock_;
      break;
  }
  if (newLocation) {
    this.setLocation(newLocation, newParentInput);
  }
  return newLocation;
};

/**
 * Find the next out connection, field, or block.
 * @param {Blockly.Field|Blockly.Block|Blockly.Connection} cursor The current
 * field, block, or connection.
 * @return {Blockly.Field|Blockly.Block|Blockly.Connection} The next element.
 */
Blockly.Cursor.prototype.out = function() {
  var location = this.getLocation();
  if (!location) {return null;}
  var newLocation;

  switch (this.type_) {
    case this.types.STACK:
      break;

    case this.types.OUTPUT:
      newLocation = location.targetConnection;
      if (!newLocation) {
        this.setStack(true, location.sourceBlock_);
        this.setType_();
      }
      break;

    case this.types.FIELD:
      newLocation = location.sourceBlock_;
      break;

    case this.types.INPUT:
      newLocation = location.sourceBlock_;
      break;

    case this.types.BLOCK:
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
      }
      break;

    case this.types.PREVIOUS:
      newLocation = this.findOutLocationForStack_(location.sourceBlock_);
      break;

    case this.types.NEXT:
      newLocation = this.findOutLocationForStack_(location.sourceBlock_);
      break;
  }

  if (newLocation) {
    this.setLocation(newLocation, this.findParentInput_(newLocation));
  }
  return newLocation;
};
