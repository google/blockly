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
Blockly.Types.getValidTypeWithId = function(typeId) {
  switch (typeId) {
      case Blockly.Types.CHARACTER.typeId:
          return Blockly.Types.CHARACTER;
      case Blockly.Types.TEXT.typeId:
          return Blockly.Types.TEXT;
      case "String":
          return Blockly.Types.TEXT;
      case Blockly.Types.BOOLEAN.typeId:
          return Blockly.Types.BOOLEAN;
      case Blockly.Types.SHORT_NUMBER.typeId:
          return Blockly.Types.SHORT_NUMBER;
      case Blockly.Types.NUMBER.typeId:
          return Blockly.Types.NUMBER;
      case Blockly.Types.LARGE_NUMBER.typeId:
          return Blockly.Types.LARGE_NUMBER;
      case Blockly.Types.DECIMAL.typeId:
          return Blockly.Types.DECIMAL;
      case Blockly.Types.ARRAY.typeId:
          return Blockly.Types.ARRAY;
      case Blockly.Types.NULL.typeId:
          return Blockly.Types.NULL;
      case Blockly.Types.UNDEF.typeId:
          return Blockly.Types.UNDEF;
      default:
          return Blockly.Types.CHILD_BLOCK_MISSING;
  }
};
Blockly.Types.getChildEntryType = function(a) {
  var b = Blockly.Types.CHILD_BLOCK_MISSING;
  if(a) {
      if (a.outputConnection) {
          // if child is a "normal" block
          if(a.outputConnection.check_) b = a.outputConnection.check_[0];
          // if child is a 'variable'
          else if(a.type == 'variables_get'){
              for (let block of Object.entries(a.workspace.blockDB_)) {
                  if(block[1].inputList[0].fieldRow[1]){
                      if(block[1].inputList[0].fieldRow[1].text_ == a.inputList[0].fieldRow[0].text_ && block[1].type == 'variables_set'){
                          b = Blockly.Types.getChildBlockType(block[1]).typeId;
                      }
                  }
              }
          
          }else if (a.type == 'math_number') b = a.getBlockType().typeId;
      }
  }
  return b;
};

// Enable to update type of variable in the top of the Arduino code (the list of variables in workspace)
Blockly.Types.getChildBlockType = function(a) {
  if(!a.inputList[0].connection.targetBlock()){
      return Blockly.Types.CHILD_BLOCK_MISSING;
  // GET TYPE OF THE CALL RETURN PROCEDURES
  }else if(a.inputList[0].connection.targetBlock().type == 'procedures_callreturn'){
      for (let key of Object.entries(a.workspace.blockDB_)) {
          if(key[1].inputList[0].fieldRow[1]){
              if((key[1].inputList[0].fieldRow[1].text_ == a.inputList[0].connection.targetBlock().inputList[0].fieldRow[0].text_) && (key[1].type == 'procedures_defreturn')){
                  if(key[1].childBlocks_){
                      let typeCheck = Blockly.Types.NULL.typeId;
                      key[1].childBlocks_.forEach(child =>{
                          typeCheck = Blockly.Types.getChildEntryType(child);
                      });
                      return Blockly.Types.getValidTypeWithId(typeCheck);
                  }
              }
          }
      }
  // GET TYPE OF THE LOGIC TERNARY RETURN
  }else if(a.inputList[0].connection.targetBlock().type == 'logic_ternary') {
      let typeCheck = Blockly.Types.CHILD_BLOCK_MISSING;
      if (a.inputList[0].connection.targetBlock().childBlocks_.length == 3) {
          var trueReturn = a.inputList[0].connection.targetBlock().childBlocks_[1];
          var falseReturn = a.inputList[0].connection.targetBlock().childBlocks_[2];
          if (trueReturn && falseReturn) {
              typeCheck = Blockly.Types.getChildEntryType(trueReturn);
          }
      }
      return Blockly.Types.getValidTypeWithId(typeCheck);
  // GET TYPE OF THE LIST ENTRY IN LIST GET INDEX
  }else if(a.inputList[0].connection.targetBlock().type == 'lists_getIndex') {
      let typeCheck = Blockly.Types.CHILD_BLOCK_MISSING;
      let varList = a.inputList[0].connection.targetBlock().childBlocks_[0];
      if (varList) {
          if (varList.outputConnection) {
              for (let block of Object.entries(a.workspace.blockDB_)) {
                  if(block[1].inputList[0].fieldRow[1]){
                      if(block[1].inputList[0].fieldRow[1].text_ == varList.inputList[0].fieldRow[0].text_ && block[1].type == 'variables_set'){
                          if (block[1].inputList[0].connection.targetBlock()) {
                              var firstEntryList = block[1].inputList[0].connection.targetBlock().childBlocks_[0];
                              typeCheck = Blockly.Types.getChildEntryType(firstEntryList);
                          }
                      }
                  }
              }
          }
      }
      return Blockly.Types.getValidTypeWithId(typeCheck);
  // GET TYPE OF THE VARIABLES_SET TARGET BLOCK WITH THE GET BLOCK TYPE METHOD
  }else if(a.inputList[0].connection.targetBlock().getBlockType){
      for (var b = a; b && void 0 === b.getBlockType && 0 < b.inputList.length;) b = b.inputList[0].connection.targetBlock();
      return b === a ? Blockly.Types.CHILD_BLOCK_MISSING : null === b ? Blockly.Types.CHILD_BLOCK_MISSING : b.getBlockType ? b.getBlockType() : Blockly.Types.NULL
  // GET TYPE OF THE VARIABLES_SET TARGET BLOCK WITH THE OUTPUTCONNECTION VALUE
  }else if(a.inputList[0].connection.targetBlock()){
      let currentChildBlockType = a.inputList[0].connection.targetBlock().outputConnection.check_[0];
      return Blockly.Types.getValidTypeWithId(currentChildBlockType);
  }else{
      return Blockly.Types.CHILD_BLOCK_MISSING;
  }
};

/**
 * END VITTAWARNING
 */

/**
 * Navigates through child blocks of the argument block to get this block type.
 * @param {!Blockly.Block} block Block to navigate through children.
 * @return {Blockly.Type} Type of the input block.
 */
Blockly.Types.getChildBlockType = function(block) {
  var blockType = null;
  var nextBlock = block;
  // Only checks first input block, so it decides the type. Incoherences amongst
  // multiple inputs dealt at a per-block level with their own block warnings
  while (nextBlock && (nextBlock.getBlockType === undefined) &&
         (nextBlock.inputList.length > 0) &&
         (nextBlock.inputList[0].connection)) {
    nextBlock = nextBlock.inputList[0].connection.targetBlock();
  }
  if (nextBlock === block) {
    // Set variable block is empty, so no type yet
    blockType = Blockly.Types.CHILD_BLOCK_MISSING;
  } else if (nextBlock === null) {
    // Null return from targetBlock indicates no block connected
    blockType = Blockly.Types.CHILD_BLOCK_MISSING;
  } else {
    var func = nextBlock.getBlockType;
    if (func) {
      blockType = nextBlock.getBlockType();
    } else {
      // Most inner block, supposed to define a type, is missing getBlockType()
      blockType = Blockly.Types.NULL;
    }
  }
  return blockType;
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