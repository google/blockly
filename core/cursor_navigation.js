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

goog.provide('Blockly.CursorNavigation');



/**
 * Get the parent input of a field.
 * TODO: Check on moving this to the block class.
 * @param {Blockly.Field} field Field to find parent for.
 * @return {Blockly.Input} The input that the field belongs to.
 */
Blockly.CursorNavigation.getFieldParentInput_ = function(field) {
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
 */
Blockly.CursorNavigation.getConnectionParentInput_ = function(connection) {
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
 */
Blockly.CursorNavigation.getParentInput_ = function(cursor) {
  var parentInput = null;
  if (cursor instanceof Blockly.Field) {
    parentInput = Blockly.CursorNavigation.getFieldParentInput_(cursor);
  } else if (cursor instanceof Blockly.Connection) {
    parentInput = Blockly.CursorNavigation.getConnectionParentInput_(cursor);
  }
  return parentInput;
};

/**
 * Find the first editable field in a list of inputs.
 * @param {Blockly.Input} input The input to look for fields on.
 * @return {Blockly.Field} The next editable field.
 */
Blockly.CursorNavigation.findFirstEditableField_ = function(input) {
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

/**
 * Get the first field or connection that is either editable or has connection
 * value of not null.
 * @param {Blockly.Connection|Blockly.Field} cursor Current place of cursor.
 * @param {Blockly.Input} parentInput The parent input of the field or connection.
 * @return {Blockly.Connection|Blockly.Field} The next field or connection.
 */
Blockly.CursorNavigation.findNextFieldOrInput_ = function(cursor, parentInput){
  var block = cursor.sourceBlock_;
  var inputs = block.inputList;
  var curIdx = inputs.indexOf(parentInput);
  var nxtIdx = curIdx + 1;
  var nextCursor = null;

  if (curIdx > -1 && nxtIdx < inputs.length) {

    for (var i = nxtIdx; i < inputs.length; i++) {
      var newInput = inputs[i];
      var field = Blockly.CursorNavigation.findFirstEditableField_(newInput);
      if (field) {
        nextCursor = field;
        break;
      } else if (newInput.connection) {
        nextCursor = newInput.connection;
        break;
      }
    }
  }
  return nextCursor;
};

Blockly.CursorNavigation.findPrevInputOrField_ = function(cursor, parentInput){
  var block = cursor.sourceBlock_;
  var inputs = block.inputList;
  var curIdx = inputs.indexOf(parentInput);
  var nextCursor = null;

  if (curIdx > -1 && curIdx < inputs.length) {

    for (var i = curIdx; i >= 0; i--) {
      var newInput = inputs[i];
      //TODO: This should be lastEditableField
      var field = Blockly.CursorNavigation.findFirstEditableField_(newInput);
      if (newInput.connection && newInput.connection !== parentInput.connection) {
        nextCursor = newInput.connection;
        break;
      } else if (field && field !== cursor) {
        nextCursor = field;
        break;
      }
    }
  }
  return nextCursor;
};

//TODO: Fix this to make less gross
Blockly.CursorNavigation.findTop = function(sourceBlock) {
  var targetConnection = sourceBlock.previousConnection.targetConnection;
  while (!Blockly.CursorNavigation.getParentInput_(targetConnection)
    && sourceBlock && sourceBlock.previousConnection
    && sourceBlock.previousConnection.targetBlock()) {
    sourceBlock = sourceBlock.previousConnection.targetBlock();
    targetConnection = sourceBlock.previousConnection.targetConnection;
  }
  return sourceBlock;
};

/**
 * Find the next connection, field, or block.
 * @param {Blockly.Field|Blockly.Block|Blockly.Connection} cursor The current
 * field, block, or connection.
 * @return {Blockly.Field|Blockly.Block|Blockly.Connection} The next element.
 */
Blockly.CursorNavigation.next = function(cursor) {
  if (!cursor) {return null;}
  var newCursor;
  var parentInput = Blockly.CursorNavigation.getParentInput_(cursor);

  if (cursor.type === Blockly.OUTPUT_VALUE) {
    newCursor = cursor.sourceBlock_;
  } else if (cursor instanceof Blockly.Field) {
    //TODO: Check for sibling fields.
    //TODO: Check that the parent input connection is not null???
    newCursor = parentInput.connection;
  } else if (parentInput) {
    newCursor = Blockly.CursorNavigation.findNextFieldOrInput_(cursor, parentInput);
  } else if (cursor instanceof Blockly.BlockSvg) {
    newCursor = cursor.nextConnection;
  } else if (cursor.type === Blockly.PREVIOUS_STATEMENT) {
    var output = cursor.outputConnection;
    newCursor = output ? output : cursor.sourceBlock_;
  } else if (cursor.type === Blockly.NEXT_STATEMENT) {
    var nextBlock = cursor.targetBlock();
    if (nextBlock && nextBlock.previousConnection) {
      newCursor = nextBlock.previousConnection;
    } else if (nextBlock && nextBlock.outputConnection) {
      newCursor = nextBlock.outputConnection;
    }
  }
  return newCursor;
};

/**
 * Find .
 * @param {Blockly.Field|Blockly.Block|Blockly.Connection} cursor The current
 * field, block, or connection.
 * @return {Blockly.Field|Blockly.Block|Blockly.Connection} The next element.
 */
Blockly.CursorNavigation.in = function(cursor) {
  if (!cursor) {return null;}
  var newCursor;
  var parentInput = Blockly.CursorNavigation.getParentInput_(cursor);

  if (cursor instanceof Blockly.BlockSvg) {
    var inputs = cursor.inputList;
    if (inputs && inputs.length > 0) {
      var input = inputs[0];
      var field = Blockly.CursorNavigation.findFirstEditableField_(input);
      if (field) {
        newCursor = field;
      } else {
        newCursor = input.connection;
      }
    }
  } else if (cursor.type === Blockly.OUTPUT_VALUE) {
    newCursor = null;
  } else if (cursor.type === Blockly.INPUT_VALUE || parentInput) {
    var nxtBlock = cursor.targetBlock();
    if (nxtBlock) {
      newCursor = nxtBlock.previousConnection ?
        nxtBlock.previousConnection : nxtBlock.outputConnection;
    }
  }
  return newCursor;
};

/**
 * Find .
 * @param {Blockly.Field|Blockly.Block|Blockly.Connection} cursor The current
 * field, block, or connection.
 * @return {Blockly.Field|Blockly.Block|Blockly.Connection} The next element.
 */
Blockly.CursorNavigation.prev = function(cursor) {
  if (!cursor) {return null;}
  var newCursor;
  var parentInput = Blockly.CursorNavigation.getParentInput_(cursor);

  if (cursor.type === Blockly.OUTPUT_VALUE) {
    if (cursor.sourceBlock_ && cursor.sourceBlock_.previousConnection) {
      newCursor = cursor.sourceBlock_.previousConnection;
    }
  } else if (cursor instanceof Blockly.Field) {
    newCursor = Blockly.CursorNavigation.findPrevInputOrField_(cursor, parentInput);

  } else if (parentInput) {
    newCursor = Blockly.CursorNavigation.findPrevInputOrField_(cursor, parentInput);
  } else if (cursor instanceof Blockly.BlockSvg) {
    var output = cursor.outputConnection;
    newCursor = output ? output : cursor.previousConnection;

  } else if (cursor.type === Blockly.PREVIOUS_STATEMENT) {
    var prevBlock = cursor.targetBlock();
    if (prevBlock) {
      newCursor = prevBlock.nextConnection;
    }

  } else if (cursor.type === Blockly.NEXT_STATEMENT) {
    newCursor = cursor.sourceBlock_;
  }

  return newCursor;
};

/**
 * Find .
 * @param {Blockly.Field|Blockly.Block|Blockly.Connection} cursor The current
 * field, block, or connection.
 * @return {Blockly.Field|Blockly.Block|Blockly.Connection} The next element.
 */
Blockly.CursorNavigation.out = function(cursor) {
  if (!cursor) {return null;}
  var newCursor;
  var parentInput = Blockly.CursorNavigation.getParentInput_(cursor);

  if (cursor.type === Blockly.OUTPUT_VALUE) {
    newCursor = cursor.targetConnection;
  } else if (cursor instanceof Blockly.Field || parentInput) {
    newCursor = cursor.sourceBlock_;
  } else if (cursor instanceof Blockly.BlockSvg) {
    //This needs to change
    var topBlock = Blockly.CursorNavigation.findTop(cursor);
    newCursor = topBlock.previousConnection.targetConnection;
  } else if (cursor.type === Blockly.PREVIOUS_STATEMENT) {
    var topBlock = Blockly.CursorNavigation.findTop(cursor.sourceBlock_);
    newCursor = topBlock.previousConnection.targetConnection;
  } else if (cursor.type === Blockly.NEXT_STATEMENT) {
    var topBlock = Blockly.CursorNavigation.findTop(cursor.sourceBlock_);
    newCursor = topBlock.previousConnection.targetConnection;
  }

  return newCursor;
};
