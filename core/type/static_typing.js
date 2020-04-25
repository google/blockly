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
 * @fileoverview Object that defines static objects and methods to assign
 * Blockly types to Blockly blocks. These can then be converted to language
 * specific types in each language generator.
 * @author @carlosperate (Carlos Pereira Atencio) modified by Vittascience.com
 */
'use strict';

goog.provide('Blockly.StaticTyping');

goog.require('Blockly.Block');
goog.require('Blockly.Type');
goog.require('Blockly.Types');
goog.require('Blockly.Workspace');

/**
 * Class for Static Typing.
 * @constructor
 */
Blockly.StaticTyping = function() {
  this.varTypeDict = Object.create(null);
  this.pendingVarTypeDict = Object.create(null);
  this.functionVars = Object.create(null);
  this.listVars = Object.create(null);
};

/**
 * Navigates through all the statement blocks, collecting all variables and
 * their type into an associative array with the variable names as the keys and
 * the type as the values.
 * @param {Blockly.Workspace} workspace Blockly Workspace to collect variables.
 * @return {Object{ String: Blockly.Type, } Associative array with the variable
 *     names as the keys and the type as the values.
 */
Blockly.StaticTyping.prototype.collectVarsWithTypes = function(workspace) {
  this.varTypeDict = Object.create(null);
  this.pendingVarTypeDict = Object.create(null);
  var blocks = Blockly.StaticTyping.getAllStatementsOrdered(workspace);
  for (var i = 0; i < blocks.length; i++) {
    //blocks[i].select();  // for step debugging, highlights block in workspace
    // Each statement block iterates through its input children collecting vars
    var blockVarAndTypes = Blockly.StaticTyping.getBlockVars(blocks[i]);
    for (var j = 0; j < blockVarAndTypes.length; j++) {
      var variableName = blockVarAndTypes[j][0];
      var variableType = blockVarAndTypes[j][1];
      // If the type comes from a variable, so it's not directly defined, it
      // returns an Array<String(block type), String(source variable name)>
      if (Array.isArray(variableType)) {
        if (this.varTypeDict[variableType[1]]) {
          variableType = this.varTypeDict[variableType[1]];
        } else {
          // Dependant variable undefined, add this var to the pending list
          if (!Array.isArray(this.pendingVarTypeDict[variableType[1]])) {
            this.pendingVarTypeDict[variableType[1]] = [variableName];
          } else {
            this.pendingVarTypeDict[variableType[1]].push(variableName);
          }
          variableType = Blockly.Types.UNDEF;
        }
      }
      this.assignTypeToVars(blocks[i], variableName, variableType);
    }
  }
  return this.varTypeDict;
};

/**
 * Navigates through all the statement blocks, collecting all procedures
 * @param {Blockly.Workspace} workspace Blockly Workspace to collect variables.
 * @return {Object{ String: Array<ProcedureDefinition>, } Associative array with the variable
 *     names as the keys and the procedure as the values.
 */
Blockly.StaticTyping.prototype.collectProcedures = function(workspace) {
  this.functionVars = Object.create(null);
  var blocks = Blockly.StaticTyping.getAllStatementsOrdered(workspace);
  for (var i = 0; i < blocks.length; i++) {
    var getProcedureDef = blocks[i].getProcedureDef;
    if (getProcedureDef) {
      var procedure = blocks[i].getProcedureDef();
      var funcName = procedure[0];
      this.functionVars[funcName] = procedure;
    }
  }
  return this.functionVars;
};

/**
 * Navigates through all the procedures and return the type of the variable input 
 * if its an argument of procedure.
 * @param {Blockly.Workspace} workspace Blockly Workspace to collect variables.
 * @param {String} variable
 * @return {Blockly.Type} type of variable
 */
Blockly.StaticTyping.getProcedureVarType = function(workspace, variable) {
  var procedures = Blockly.StaticTyping.prototype.collectProcedures(workspace);
  for (var func in procedures) {
    var funcArgs = procedures[func][3];
    for (var arg in funcArgs) {
      if (arg == variable) {
        return funcArgs[arg];
      }
    }
  }
  return null;
};

/**
 * Navigates through all the statement blocks, collecting all variables and
 * indicates the list in case its a list variable, else return null.
 * @param {Blockly.Workspace} workspace Blockly Workspace to collect variables.
 * @return {Object{ String: Blockly.Type, } Associative array with the variable
 *     names as the keys and the list name as the values.
 */
Blockly.StaticTyping.prototype.collectListsId = function(workspace) {
  this.listVars = Object.create(null);
  var blocks = Blockly.StaticTyping.getAllStatementsOrdered(workspace);
  for (var i = 0; i < blocks.length; i++) {
    var blockVarAndTypes = Blockly.StaticTyping.getBlockVars(blocks[i]);
    for (var j = 0; j < blockVarAndTypes.length; j++) {
        var variableId = blockVarAndTypes[j][0];
        if (blocks[i].type=='variables_set') {
            var variableName = workspace.getVariableById(variableId ).name;
            var child = blocks[i].childBlocks_[0];
            var listName = blocks[i].getVarName();
            if (listName == variableName) {
                if (child && (child.type == 'lists_create_with' || child.type == 'lists_repeat')) {
                    this.listVars[variableId] = listName;
                }
                else this.listVars[variableId] = null
            }            
        }
        else this.listVars[variableId] = null
    }
  }
  return this.listVars
};

/**
 * Navigates through each top level block in the workspace to collect all
 * statement blocks, ordered from top left.
 * @param {Blockly.Workspace} workspace Blockly Workspace to collect blocks.
 * @return {Array<Blockly.Block>} Array containing all workspace statement
 *     blocks.
 */
Blockly.StaticTyping.getAllStatementsOrdered = function(workspace) {
  if (!workspace.getTopBlocks) {
    throw 'Not a valid workspace: ' + workspace;
  }

  /**
   * Navigates through each continuous block to collect all statement blocks.
   * Function required to use recursion for block input statements.
   * @param {Blockly.Block} startBlock Block to start iterating from..
   * @return {Array<Blockly.Block>} Array containing all continuous statement
   *     blocks.
   */
  var getAllContinuousStatements = function(startBlock) {
    var block = startBlock;
    var nextBlock = null;
    var connections = null;
    var blockNextConnection = null;
    var blocks = [];
    do {
      //block.select();    // for step debugging, highlights block in workspace
      blocks.push(block);
      blockNextConnection = block.nextConnection;
      connections = block.getConnections_();
      block = null;
      for (var j = 0; j < connections.length; j++) {
        if (connections[j].type == Blockly.NEXT_STATEMENT) {
          nextBlock = connections[j].targetBlock();
          if (nextBlock) {
            // If it is the next connection select it and move to the next block
            if (connections[j] === blockNextConnection) {
              block = nextBlock;
            } else {
              // Recursion as block children can have their own input statements
              blocks = blocks.concat(getAllContinuousStatements(nextBlock));
            }
          }
        }
      }
    } while (block);

    return blocks;
  };

  var allStatementBlocks = [];
  var topBlocks = workspace.getTopBlocks(true);
  for (var i = 0; i < topBlocks.length; i++) {
    allStatementBlocks = allStatementBlocks.concat(
        getAllContinuousStatements(topBlocks[i]));
  }

  return allStatementBlocks;
};

/**
  * Retrieves the input argument block variables with their set type.
  * @param {Blockly.Block} block Block to retrieve variables from.
  * @return {Array<Array<String, Blockly.Type>>} Two dimensional array with the
  *     block variable as the first item pair and variable type as the second.
  */
Blockly.StaticTyping.getBlockVars = function(block) {
  var blockVarAndTypes = [];
  var getVars = block.getVars;
  if (getVars) {
    var blockVariables = getVars.call(block);
    // Iterate through the variables used in this block
    for (var i = 0; i < blockVariables.length; i++) {
      var varName = blockVariables[i];
      var getVarType = block.getVarType;
      if (getVarType) {
        var varType = getVarType.call(block, varName);
        blockVarAndTypes.push([varName, varType]);
      }
    }
  } // else: !(block.getVars), block does not define variables, so do nothing
  return blockVarAndTypes;
};

/**
 * Manages the associative array of variables with their type.
 * @param {Blockly.Block} block Blockly providing the variable to manage.
 * @param {string} varName Name of the variable to manage.
 * @param {Blockly.Type} varType Type assigned by current block.
 */
Blockly.StaticTyping.prototype.assignTypeToVars =
    function(block, varName, varType) {
  switch (this.varTypeDict[varName]) {
    // First time variable is encountered, or previously undefined
    case undefined:
    case Blockly.Types.UNDEF:
      this.varTypeDict[varName] = varType;
      if ((varType != Blockly.Types.UNDEF) &&
          (this.pendingVarTypeDict[varName] !== undefined)) {
        for (var i = 0; i < this.pendingVarTypeDict[varName].length; i++) {
          this.assignTypeToVars(
              block, this.pendingVarTypeDict[varName][i], varType);
        }
      }
      break;
    // Variable with valid type already registered
    default:
      this.setBlockTypeWarning(
          block, varType, varName, this.varTypeDict[varName]);
      break;
  }
};

/**
 * When a block uses a variable this function can compare its type with the
 * variable type and set a warning if they are not the same or compatible.
 * @param {!Blockly.Block} block The block to manage its warning.
 * @param {!Blockly.Type} blockType The type of this block.
 * @param {!string} varName The variable name.
 */
Blockly.StaticTyping.prototype.setBlockTypeWarning = function(block, blockType, varId) {
  var warningLabel = 'varType';
  var variable = block.workspace.getVariableById(varId);
  if(variable) {
    var varName = variable.name;
  }
  if ((blockType == Blockly.Types.CHILD_BLOCK_MISSING) ||
      (this.varTypeDict[varId] == Blockly.Types.CHILD_BLOCK_MISSING)) {
    // User still has to attach a block to this variable or its first
    // declaration, so for now do not display any warning
    block.setWarningText(null, warningLabel);
  } else if (blockType !== Blockly.Types.UNDEF && block.type != 'variables_get') {
      if (this.varTypeDict[varId] !== blockType) {
        var warningText = Blockly.Msg['VARIABLES_SET_WARNING'];
        var previousType = this.varTypeDict[varId];
        var nextType = blockType;
        if (previousType == Blockly.Types.NUMBER && nextType == Blockly.Types.DECIMAL) {
          var warningNumber = '\n' + Blockly.Msg['VARIABLES_SET_WARNING_NUMBERS'];
          warningText = warningText + warningNumber;
        }
        if (Blockly.Arduino.getArduinoType_) {
          previousType = Blockly.Arduino.getArduinoType_(previousType);
          nextType = Blockly.Arduino.getArduinoType_(nextType)
        } else {
          previousType = previousType.typeName;
          nextType = nextType.typeName;
        }
        warningText = warningText.replace('%1', varName);
        warningText = warningText.replace('%2', previousType);
        warningText = warningText.replace('%3', nextType);
        block.setWarningText(warningText, warningLabel);
      }
  } else {
    block.setWarningText(null, warningLabel);
  }
};

/**
 * Iterates through the list of top level blocks and sets the function arguments
 * types.
 * @param {Blockly.Workspace} workspace Blockly Workspace to collect variables.
 */
Blockly.StaticTyping.prototype.setProcedureArgs = function(workspace) {
  var blocks = workspace.getTopBlocks();
  for (var i = 0, length_ = blocks.length; i < length_; i++) {
    var setArgsType = blocks[i].setArgsType;
    if (setArgsType) {
      setArgsType.call(blocks[i], this.varTypeDict);
    }
  }
};

/**
 * Iterates through the parents of input block and return the space.
 * @param {Blockly.Block} block
 */
// Blockly.StaticTyping.getParentSpaceBlock = function(block) {
//   var hasParent = true,
//       parent;
//   parent = block.getParent();
//   if (parent) {
//     while (hasParent) {
//       if (parent && parent.type != 'forever' 
//                  && parent.type != 'on_start'
//                  && parent.type != 'procedures_def' 
//                  && parent.type != 'procedures_defnoreturn') {
//         parent = parent.getParent();
//       }
//       else hasParent = false;
//     }
//     return parent;
//   }
//   else return null    
// };
