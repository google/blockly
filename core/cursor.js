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
 */
'use strict';

goog.provide('Blockly.Cursor');

/**
 * Class for a cursor.
 * @constructor
 */
Blockly.Cursor = function() {

  this.parentInput_ = null;

  this.isStack_ = false;

  this.stackBlock_ = null;

  this.isWorkspace_ = false;

  this.location_ = null;
};

/**
 * Set the location of the cursor and call the update method.
 * @param{Blockly.Field|Blockly.Block|Blockly.Connection} newLocation The new
 * location of the cursor.
 * @param{?Blockly.Input} opt_parent The parent input of a connection or a field.
 */
Blockly.Cursor.prototype.setLocation = function(newLocation, opt_parent) {
  this.location_ = newLocation;
  this.parentInput_ = opt_parent;
  this.update_();
};

/**
 * Decides if we are at the stack level or not.
 * Having a stack level is necessary in order to navigate to other stacks in the
 * worksapce.
 * @param{Boolean} isStack True if we are at the stack level false otherwise.
 * @param{Blockly.Block} topBlock The top block of a stack.
 */
Blockly.Cursor.prototype.setStack = function(isStack, topBlock) {
  this.isStack = isStack;
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
 * Gets the parent input of the current parent input of a field or connection.
 * @return {Blockly.Input} The parent input of the current field or connection.
 */
Blockly.Cursor.prototype.getParentInput = function() {
  return this.parentInput_;
};

/**
 * Whether or not we are at the worksapce level.
 * @return{Boolean} True if we are on the workspace level, false otherwise.
 */
Blockly.Cursor.prototype.isWorkspace = function() {
  return this.isWorkspace_;
};

/**
 * Whether or not we are at the stack level.
 * @return{Boolean} True if we are at the stack level, false otherwise.
 */
Blockly.Cursor.prototype.isStack = function() {
  return this.isStack_;
};

/**
 * Update method to be overwritten in cursor_svg.
 * @protected
 */
Blockly.Cursor.prototype.update_ = function() {};

/**
 * Search through the list of inputs and their list of fields in order to find
 * the parent input of a field.
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
 * Find the first editable field in a list of inputs.
 * @param {Blockly.Input} input The input to look for fields on.
 * @return {Blockly.Field} The next editable field.
 * @private
 */
Blockly.Cursor.prototype.findFirstEditableField_ = function(input) {
  var fieldRow = input.fieldRow;
  var nextField = null;
  for (var i = 0; i < fieldRow.length; i++) {
    var field = fieldRow[i];
    if (field.isCurrentlyEditable()) {
      nextField = field;
      break;
    }
  }
  return nextField;
};

Blockly.Cursor.prototype.findNextEditableField_ = function(location, parentInput) {
  var fieldRow = parentInput.fieldRow;
  var fieldIdx = fieldRow.indexOf(location);
  var nextField = null;
  for (var i = fieldIdx + 1; i < fieldRow.length; i++) {
    var field = fieldRow[i];
    if (field.isCurrentlyEditable()) {
      nextField = field;
      break;
    }
  }
  return nextField;
};

Blockly.Cursor.prototype.findLastEditableField_ = function(input) {
  var fieldRow = input.fieldRow;
  var nextField = null;
  for (var i = fieldRow.length - 1; i >= 0; i--) {
    var field = fieldRow[i];
    if (field.isCurrentlyEditable()) {
      nextField = field;
      break;
    }
  }
  return nextField;
};

Blockly.Cursor.prototype.findPreviousEditableField_ = function(location, parentInput) {
  var fieldRow = parentInput.fieldRow;
  var fieldIdx = fieldRow.indexOf(location);
  var nextField = null;
  for (var i = fieldIdx - 1; i >= 0; i--) {
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
 * @param {Blockly.Connection|Blockly.Field} location Current place of cursor.
 * @param {Blockly.Input} parentInput The parent input of the field or connection.
 * @return {Blockly.Connection|Blockly.Field} The next field or connection.
 * @private
 */
Blockly.Cursor.prototype.findNextFieldOrInput_ = function(location, parentInput){
  var block = location.sourceBlock_;
  var inputs = block.inputList;
  var curIdx = inputs.indexOf(parentInput);
  var nxtIdx = curIdx + 1;
  var nextLocation = null;

  if (location instanceof Blockly.Field) {
    nextLocation = this.findNextEditableField_(location, parentInput);
    if (!nextLocation) {
      nextLocation = parentInput.connection;
    }
  } else {
    if (curIdx > -1 && nxtIdx < inputs.length) {

      for (var i = nxtIdx; i < inputs.length; i++) {
        var newInput = inputs[i];
        var field = this.findFirstEditableField_(newInput);
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
    }
  }
  return nextLocation;
};

/**
 * Given the current selected field or connection find the previous connection
 * or field.
 * @param {Blockly.Connection|Blockly.Field} location The current location of
 * the cursor.
 * @param {Blockly.Input} parentInput Parent input of the connection or field.
 * @return {Array<Blockly.Field|Blockly.Connection, Blockly.Input>} The first
 * value is the next field or connection and the second value is the parent input.
 */
Blockly.Cursor.prototype.findPrevInputOrField_ = function(location, parentInput){
  var block = location.sourceBlock_;
  var inputs = block.inputList;
  var curIdx = inputs.indexOf(parentInput);
  var prevLocation = null;

  if (location instanceof Blockly.Field) {
    prevLocation = this.findPreviousEditableField_(location, parentInput);
    if (!prevLocation && curIdx - 1 > 0) {
      prevLocation = inputs[curIdx].connection;
    }
  } else {
    if (curIdx > -1 && curIdx < inputs.length) {

      for (var i = curIdx; i >= 0; i--) {
        var newInput = inputs[i];
        var field = this.findLastEditableField_(newInput);
        if (newInput.connection && newInput.connection
          !== parentInput.connection) {
          prevLocation = newInput.connection;
          this.parentInput_ = newInput;
          break;
        } else if (field && field !== location) {
          prevLocation = field;
          this.parentInput_ = newInput;
          break;
        }
      }
    }
  }
  return prevLocation;
};

//TODO: Fix this to make less gross
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
 */
Blockly.Cursor.prototype.isStack = function() {
  var cursor = this.getLocation();
  var isStack = false;
  if (cursor.type === Blockly.OUTPUT_VALUE
    || cursor.type === Blockly.PREVIOUS_STATEMENT) {
    var block = cursor.sourceBlock_;
    var topBlock = block.getRootBlock();
    isStack = block === topBlock;
  }
  return isStack;
};

/**
 * Find the first connection on a given block.
 * We are defining first connection as the highest connection point on a given
 * block. Therefore previous connection comes before output connection.
 * @param {Blockly.Field|Blockly.Block|Blockly.Connection} location The location
 * of the cursor.
 * @return {Blockly.Connection} The first connection.
 */
Blockly.Cursor.prototype.findTopConnection_ = function(location) {
  var previousConnection = location.previousConnection;
  var outputConnection = location.outputConnection;
  return previousConnection ? previousConnection : outputConnection;
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
  var newCursor;
  var newParentInput;
  var parentInput = this.getParentInput(location);

  if (this.isStack_) {
    var nextTopBlock = this.navigateBetweenStacks_(true);
    newCursor = this.findTopConnection_(nextTopBlock);
  } else if (location.type === Blockly.OUTPUT_VALUE) {
    newCursor = location.sourceBlock_;
  } else if (location instanceof Blockly.Field || parentInput) {
    newCursor = this.findNextFieldOrInput_(location, parentInput);
    newParentInput = this.getParentInput();
  } else if (location instanceof Blockly.Block) {
    newCursor = location.nextConnection;
  } else if (location.type === Blockly.PREVIOUS_STATEMENT) {
    var output = location.outputConnection;
    newCursor = output ? output : location.sourceBlock_;
  } else if (location.type === Blockly.NEXT_STATEMENT) {
    var nextBlock = location.targetBlock();
    if (nextBlock && nextBlock.previousConnection) {
      newCursor = nextBlock.previousConnection;
    } else if (nextBlock && nextBlock.outputConnection) {
      newCursor = nextBlock.outputConnection;
    }
  }
  if (newCursor) {
    this.setLocation(newCursor, newParentInput);
  }
  return newCursor;
};

/**
 * Find .
 * @param {Blockly.Field|Blockly.Block|Blockly.Connection} cursor The current
 * field, block, or connection.
 * @return {Blockly.Field|Blockly.Block|Blockly.Connection} The next element.
 */
Blockly.Cursor.prototype.in = function() {
  var location = this.getLocation();
  if (!location) {return null;}
  var newCursor;
  var newParentInput;
  this.isStack_ = false;

  if (location instanceof Blockly.Block) {
    var inputs = location.inputList;
    if (inputs && inputs.length > 0) {
      newParentInput = inputs[0];
      var field = this.findFirstEditableField_(newParentInput);
      if (field) {
        newCursor = field;
      } else {
        newCursor = newParentInput.connection;
      }
    }
  } else if (location.type === Blockly.OUTPUT_VALUE) {
    newCursor = null;
  } else if (location instanceof Blockly.Field) {
    newCursor = null;
  } else if (location.type === Blockly.INPUT_VALUE || this.getParentInput()) {
    var nxtBlock = location.targetBlock();
    if (nxtBlock) {
      newCursor = nxtBlock.previousConnection ?
        nxtBlock.previousConnection : nxtBlock.outputConnection;
    }
  }
  if (newCursor) {
    this.setLocation(newCursor, newParentInput);
  }
  return newCursor;
};

/**
 * Find .
 * @param {Blockly.Field|Blockly.Block|Blockly.Connection} cursor The current
 * field, block, or connection.
 * @return {Blockly.Field|Blockly.Block|Blockly.Connection} The next element.
 */
Blockly.Cursor.prototype.prev = function() {
  var location = this.getLocation();
  if (!location) {return null;}
  var newCursor;
  var parentInput = this.getParentInput(location);
  var newParentInput;

  if (this.isStack_) {
    var nextTopBlock = this.navigateBetweenStacks_(true);
    newCursor = this.findTopConnection_(nextTopBlock);
  } else if (location.type === Blockly.OUTPUT_VALUE) {
    if (location.sourceBlock_ && location.sourceBlock_.previousConnection) {
      newCursor = location.sourceBlock_.previousConnection;
    }
  } else if (location instanceof Blockly.Field || parentInput) {
    newCursor = this.findPrevInputOrField_(location, parentInput);
    newParentInput = this.getParentInput();
  } else if (location instanceof Blockly.Block) {
    var output = location.outputConnection;
    newCursor = output ? output : location.previousConnection;

  } else if (location.type === Blockly.PREVIOUS_STATEMENT) {
    var prevBlock = location.targetBlock();
    if (prevBlock) {
      newCursor = prevBlock.nextConnection;
    }

  } else if (location.type === Blockly.NEXT_STATEMENT) {
    newCursor = location.sourceBlock_;
  }
  this.isStack_ = this.isStack();

  if (newCursor) {
    this.setLocation(newCursor, newParentInput);
  }
  return newCursor;
};

/**
 * Find .
 * @param {Blockly.Field|Blockly.Block|Blockly.Connection} cursor The current
 * field, block, or connection.
 * @return {Blockly.Field|Blockly.Block|Blockly.Connection} The next element.
 */
Blockly.Cursor.prototype.out = function() {
  var location = this.getLocation();
  if (!location) {return null;}
  var newCursor;
  var parentInput = this.findParentInput_(location);
  var newParentInput;

  if (location.type === Blockly.OUTPUT_VALUE) {
    newCursor = location.targetConnection;
    newParentInput = this.findParentInput_(newCursor);
  } else if (location instanceof Blockly.Field || parentInput) {
    newCursor = location.sourceBlock_;
  } else if (location instanceof Blockly.Block) {
    if (location.outputConnection && location.outputConnection.targetConnection) {
      newCursor = location.outputConnection.targetConnection;
      newParentInput = this.findParentInput_(newCursor);
    } else if (location.outputConnection) {

      newCursor = null;
    } else {
      //This is the case where we are on a block that is nested inside a
      //statement input and we need to get the last input that connects to the
      //top block
      var topBlock = this.findTop_(location);
      var topConnection = topBlock.previousConnection.targetConnection;
      if (topConnection) {
        newCursor = topConnection;
      } else {
        newCursor = topBlock.previousConnection;
        this.isStack_ = true;
      }
    }
  } else if (location.type === Blockly.PREVIOUS_STATEMENT) {
    var topBlock = this.findTop_(location.sourceBlock_);
    var topConnection = topBlock.previousConnection.targetConnection;
    if (topConnection) {
      newCursor = topConnection;
    } else {
      newCursor = topConnection;
      this.isStack_ = true;
    }
  } else if (location.type === Blockly.NEXT_STATEMENT) {
    var topBlock = this.findTop_(location.sourceBlock_);
    newCursor = topBlock.previousConnection.targetConnection;
  }
  if (newCursor) {
    this.setLocation(newCursor,  newParentInput);
  }
  return newCursor;
};
