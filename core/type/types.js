/**
 * @license
 * Copyright 2016 Google LLC
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
 * @fileoverview Blockly Types declarations and helper functions to identify
 * types.
 * @author @carlosperate (Carlos Pereira Atencio)
 */
'use strict';

goog.provide('Blockly.Types');

goog.require('Blockly.Type');

/** Single character. */
Blockly.Types.CHARACTER = new Blockly.Type({
  typeId: 'Character',
  typeMsgName: 'ARD_TYPE_CHAR',
  compatibleTypes: []
});

/** Text string. */
Blockly.Types.TEXT = new Blockly.Type({
  typeId: 'Text',
  typeMsgName: 'ARD_TYPE_TEXT',
  compatibleTypes: [Blockly.Types.CHARACTER]
});

/** Boolean. */
Blockly.Types.BOOLEAN = new Blockly.Type({
  typeId: 'Boolean',
  typeMsgName: 'ARD_TYPE_BOOL',
  compatibleTypes: []
});

/** Short integer number. */
Blockly.Types.SHORT_NUMBER = new Blockly.Type({
  typeId: 'Short Number',
  typeMsgName: 'ARD_TYPE_SHORT',
  compatibleTypes: []    // Circular dependencies, add after all declarations
});

/** Integer number. */
Blockly.Types.NUMBER = new Blockly.Type({
  typeId: 'Number',
  typeMsgName: 'ARD_TYPE_NUMBER',
  compatibleTypes: []    // Circular dependencies, add after all declarations
});

/** Large integer number. */
Blockly.Types.LARGE_NUMBER = new Blockly.Type({
  typeId: 'Large Number',
  typeMsgName: 'ARD_TYPE_LONG',
  compatibleTypes: []    // Circular dependencies, add after all declarations
});

/** Decimal/floating point number. */
Blockly.Types.DECIMAL = new Blockly.Type({
  typeId: 'Decimal',
  typeMsgName: 'ARD_TYPE_DECIMAL',
  compatibleTypes: [Blockly.Types.BOOLEAN,
                    Blockly.Types.SHORT_NUMBER,
                    Blockly.Types.NUMBER,
                    Blockly.Types.LARGE_NUMBER]
});

/** Array/List of items. */
Blockly.Types.ARRAY = new Blockly.Type({
  typeId: 'Array',
  typeMsgName: 'ARD_TYPE_ARRAY',
  compatibleTypes: []
});

/** Null indicate there is no type. */
Blockly.Types.NULL = new Blockly.Type({
  typeId: 'Null',
  typeMsgName: 'ARD_TYPE_NULL',
  compatibleTypes: []
});

/** Type not defined, or not yet defined. */
Blockly.Types.UNDEF = new Blockly.Type({
  typeId: 'Undefined',
  typeMsgName: 'ARD_TYPE_UNDEF',
  compatibleTypes: []
});

/** Set when no child block (meant to define the variable type) is connected. */
Blockly.Types.CHILD_BLOCK_MISSING = new Blockly.Type({
  typeId: 'ChildBlockMissing',
  typeMsgName: 'ARD_TYPE_CHILDBLOCKMISSING',
  compatibleTypes: []
});

/**
 * Some Types have circular dependencies on their compatibilities, so add them
 * after declaration.
 */
Blockly.Types.NUMBER.addCompatibleTypes([
    Blockly.Types.BOOLEAN,
    Blockly.Types.SHORT_NUMBER,
    Blockly.Types.LARGE_NUMBER,
    Blockly.Types.DECIMAL]);

Blockly.Types.SHORT_NUMBER.addCompatibleTypes([
    Blockly.Types.BOOLEAN,
    Blockly.Types.NUMBER,
    Blockly.Types.LARGE_NUMBER,
    Blockly.Types.DECIMAL]);

Blockly.Types.LARGE_NUMBER.addCompatibleTypes([
    Blockly.Types.BOOLEAN,
    Blockly.Types.SHORT_NUMBER,
    Blockly.Types.NUMBER,
    Blockly.Types.DECIMAL]);


/**
 * Adds another type to the Blockly.Types collection.
 * @param {string} typeId_ Identifiable name of the type.
 * @param {string} typeMsgName_ Name of the member variable from Blockly.Msg
 *     object to identify the translateble string.for the Type name.
 * @param {Array<Blockly.Type>} compatibleTypes_ List of types this Type is
 *     compatible with.
 */
Blockly.Types.addType = function(typeId_, typeMsgName_, compatibleTypes_) {
  // The Id is used as the key from the value pair in the BlocklyTypes object
  var key = typeId_.toUpperCase().replace(/ /g, '_');
  if (Blockly.Types[key] !== undefined) {
    throw 'The Blockly type ' + key + ' already exists.';
  }
  Blockly.Types[key] = new Blockly.Type({
    typeId: typeId_,
    typeName: typeMsgName_,
    compatibleTypes: compatibleTypes_
  });
};

/**
 * Converts the static types dictionary in to a an array with 2-item arrays.
 * This array only contains the valid types, excluding any error or temp types.
 * @return {!Array<Array<string>>} Blockly types in the format described above.
 */
Blockly.Types.getValidTypeArray = function() {
  var typesArray = [];
  for (var typeKey in Blockly.Types) {
    if ((typeKey !== 'UNDEF') && (typeKey !== 'CHILD_BLOCK_MISSING') &&
        (typeKey !== 'NULL') && (typeKey !== 'ARRAY') &&
        (typeof Blockly.Types[typeKey] !== 'function') &&
        !(Blockly.Types[typeKey] instanceof RegExp)) {
      typesArray.push([Blockly.Types[typeKey].typeName, typeKey]);
    }
  }
  return typesArray;
};

/**
 * VITTAWARNING _ added to get type for variables top declaration
 */

/**
 * Method used several times in the function getChildBlockType() and in arduino_uncompressed.js file
 * @param {Blockly.Type.typeId}
 * @return {Blockly.Type}
 */
Blockly.Types.getValidTypeWithId=function(typeId) {
  switch (typeId) {
      case Blockly.Types.CHARACTER.typeId: return Blockly.Types.CHARACTER;
      case Blockly.Types.TEXT.typeId: return Blockly.Types.TEXT;
      case Blockly.Types.BOOLEAN.typeId: return Blockly.Types.BOOLEAN;
      case Blockly.Types.SHORT_NUMBER.typeId: return Blockly.Types.SHORT_NUMBER;
      case Blockly.Types.NUMBER.typeId: return Blockly.Types.NUMBER;
      case Blockly.Types.LARGE_NUMBER.typeId: return Blockly.Types.LARGE_NUMBER;
      case Blockly.Types.DECIMAL.typeId: return Blockly.Types.DECIMAL;
      case Blockly.Types.ARRAY.typeId: return Blockly.Types.ARRAY;
      case Blockly.Types.NULL.typeId: return Blockly.Types.NULL;
      case Blockly.Types.UNDEF.typeId: return Blockly.Types.UNDEF;
      default: return Blockly.Types.CHILD_BLOCK_MISSING
  }
};

/**
* Function used recursively to get type of variables_get block
* @param {Blockly.Block} block
* @return {Blockly.Type} type
*/
Blockly.Types.variables_get_getType = function(currentBlock) {
for (let block of Object.entries(currentBlock.workspace.blockDB_)) {
    if (block[1].inputList[0].fieldRow[1]) {
        if (block[1].inputList[0].fieldRow[1].text_ == currentBlock.inputList[0].fieldRow[0].text_ && block[1].type == 'variables_set') {
            return Blockly.Types.getChildBlockType(block[1]);
        }
    }
}
};

/** Function used recursively to get type of get_defreturn block
* @param {Blockly.Block} block
* @return {Blockly.Type} type
*/
Blockly.Types.procedures_callreturn_getType = function(parent, currentBlock) {
  let typeCheck = Blockly.Types.CHILD_BLOCK_MISSING;
  for (let block of Object.entries(parent.workspace.blockDB_)) {
      if (block[1].inputList[0].fieldRow[1]) {
          if (block[1].inputList[0].fieldRow[1].value_ == currentBlock.inputList[0].fieldRow[0].value_ && block[1].type == 'procedures_defreturn') {
              if (block[1].childBlocks_) {
                  block[1].childBlocks_.forEach(child => {
                      typeCheck = Blockly.Types.getChildBlockType(child);
                  });
              }
          }
      }
  }
  return typeCheck;
};

/**
* Function used recursively to get type of logic_ternary block
* @param {Blockly.Block} block
* @return {Blockly.Type} type
*/
Blockly.Types.logic_ternary_getType = function(currentBlock) {
  let typeCheck = Blockly.Types.CHILD_BLOCK_MISSING;
  var child_iftrue = currentBlock.inputList[1].connection.targetBlock();
  var child_iffalse = currentBlock.inputList[2].connection.targetBlock();
  if (child_iftrue && child_iffalse) {
      typeCheck = Blockly.Types.getChildBlockType(child_iftrue);
  }
  return typeCheck;
};

/**
* Function used recursively to get type of lists_get_index block
* @param {Blockly.Block} block
* @return {Blockly.Type} type
*/
Blockly.Types.lists_getIndex_getType = function(currentBlock){
  let typeCheck = Blockly.Types.CHILD_BLOCK_MISSING;
  let varList = currentBlock.childBlocks_[0];
  typeCheck = Blockly.Types.getChildBlockType(varList);
  if (typeCheck == 'Array') typeCheck = Blockly.Types.CHILD_BLOCK_MISSING;
  return typeCheck;
};

/**
* Function used recursively to get type of lists_create_with block
* @param {Blockly.Block} block
* @return {Blockly.Type} type
*/
Blockly.Types.lists_getType = function(currentBlock){
  let typeCheck = Blockly.Types.CHILD_BLOCK_MISSING;
  var child = currentBlock.inputList[0].connection.targetBlock();
  if (child) typeCheck = Blockly.Types.getChildBlockType(child);
  return typeCheck;
};

/**
* Procedure to get child type of a block
* @param {Blockly.Block} block
* @return {Blockly.Type}
*/
Blockly.Types.getChildBlockType = function(currentBlock) {
  var child = currentBlock;
  if (currentBlock.type == 'variables_set') {
      if (!currentBlock.inputList[0].connection.targetBlock()) {
          return Blockly.Types.CHILD_BLOCK_MISSING;
      }
      child = currentBlock.inputList[0].connection.targetBlock();
  }
  if (child.type == 'variables_get') {
      return Blockly.Types.variables_get_getType(currentBlock); //variables_get
  } else if (child.type == 'procedures_callreturn') {
      return Blockly.Types.procedures_callreturn_getType(currentBlock, child); //procedures_callreturn
  } else if (child.type == 'logic_ternary') {
      return Blockly.Types.logic_ternary_getType(child); //logic_ternary
  } else if (child.type == 'lists_getIndex') {
      return Blockly.Types.lists_getIndex_getType(currentBlock, child); //lists_getIndex
  } else if (child.type == 'lists_create_with' || child.type == 'lists_repeat') {
      return Blockly.Types.lists_getType(child); //lists
  } else if (child.type == 'math_number') {
      return child.getBlockType(); //math_number
  } else if (child.getBlockType) {
      for (var b = currentBlock; b && void 0 === b.getBlockType && 0 < b.inputList.length;) b = b.inputList[0].connection.targetBlock();
      return b === currentBlock ? Blockly.Types.CHILD_BLOCK_MISSING : null === b ? Blockly.Types.CHILD_BLOCK_MISSING : b.getBlockType ? b.getBlockType() : Blockly.Types.NULL
  } else if (child.outputConnection.check_) {
      var typeCheck = child.outputConnection.check_[0];
      return Blockly.Types.getValidTypeWithId(typeCheck);
  } else {
      return Blockly.Types.CHILD_BLOCK_MISSING;
  }
};

/**
 * Regular expressions to identify an integer.
 * @private
 */
Blockly.Types.regExpInt_ = new RegExp(/^-?\d+$/);

/**
 * Regular expressions to identify a decimal.
 * @private
 */
Blockly.Types.regExpFloat_ = new RegExp(/^-?[0-9]*[.][0-9]+$/);

/**
 * Uses regular expressions to identify if the input number is an integer or a
 * floating point.
 * @param {string} numberString String of the number to identify.
 * @return {!Blockly.Type} Blockly type.
 */
Blockly.Types.identifyNumber = function(numberString) {
    if (Blockly.Types.regExpInt_.test(numberString)) {
      var intValue = parseInt(numberString);
      if (isNaN(intValue)) {
        return Blockly.Types.NULL;
      }
      if (intValue > 32767 || intValue < -32768) {
        return Blockly.Types.LARGE_NUMBER;
      }
      return Blockly.Types.NUMBER;
    } else if (Blockly.Types.regExpFloat_.test(numberString)) {
      return Blockly.Types.DECIMAL;
    }
    return Blockly.Types.NULL;
};