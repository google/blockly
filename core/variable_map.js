/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2017 Google Inc.
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
 * @fileoverview Object representing a map of variables and their types.
 * @author marisaleung@google.com (Marisa Leung)
 */
'use strict';

goog.provide('Blockly.VariableMap');


/**
 * Class for a variable map.  This contains a dictionary data structure with
 * variable types as keys and lists of variables as values.  The list of
 * variables are the type indicated by the key.
 * @param {!Blockly.Workspace} workspace The workspace this map belongs to.
 * @constructor
 */
Blockly.VariableMap = function(workspace) {
 /**
   * A map from variable type to list of variable names.  The lists contain all
   * of the named variables in the workspace, including variables
   * that are not currently in use.
   * @type {!Object.<string, !Array.<Blockly.VariableModel>>}
   * @private
   */
  this.variableMap_ = {};

  /**
   * The workspace this map belongs to.
   * @type {!Blockly.Workspace}
   */
  this.workspace = workspace;
};

/**
 * Clear the variable map.
 */
Blockly.VariableMap.prototype.clear = function() {
  this.variableMap_ = new Object(null);
};

/**
 * Rename the given variable by updating its name in the variable map.
 * @param {!Blockly.VariableModel} variable Variable to rename.
 * @param {string} newName New variable name.
 * @package
 */
Blockly.VariableMap.prototype.renameVariable = function(variable, newName) {
  var type = variable.type;
  var conflictVar = this.getVariable(newName, type);
  // The IDs may match if the rename is a simple case change (name1 -> Name1).
  if (!conflictVar || conflictVar.getId() == variable.getId()) {
    this.renameVariableNoConflict_(variable, newName);
  } else {
    this.renameVariableWithConflict_(variable, newName, conflictVar);
  }
};

/**
 * Update the name of the given variable and refresh all references to it.
 * The new name must not conflict with any existing variable names.
 * @param {!Blockly.VariableModel} variable Variable to rename.
 * @param {string} newName New variable name.
 * @private
 */
Blockly.VariableMap.prototype.renameVariableNoConflict_ = function(variable, newName) {
  Blockly.Events.fire(new Blockly.Events.VarRename(variable, newName));
  variable.name = newName;
  var blocks = this.workspace.getAllBlocks();
  for (var i = 0; i < blocks.length; i++) {
    blocks[i].updateVarName(variable);
  }
};

/**
 * Update the name of the given variable to the same name as an existing
 * variable.  The two variables are coalesced into a single variable with the ID
 * of the existing variable that was already using newName.
 * Refresh all references to the variable.
 * @param {!Blockly.VariableModel} variable Variable to rename.
 * @param {string} newName New variable name.
 * @param {!Blockly.VariableModel} conflictVar The variable that was already
 *     using newName.
 * @private
 */
Blockly.VariableMap.prototype.renameVariableWithConflict_ = function(variable,
    newName, conflictVar) {
  var type = variable.type;

  Blockly.Events.setGroup(true);
  Blockly.Events.fire(new Blockly.Events.VarRename(conflictVar, newName));
  var oldCase = conflictVar.name;
  conflictVar.name = newName;

  // These blocks refer to the same variable but the case may have changed.
  // No change events should be fired here.
  var blocks = this.workspace.getAllBlocks();
  if (newName != oldCase) {
    for (var i = 0; i < blocks.length; i++) {
      blocks[i].updateVarName(conflictVar);
    }
  }

  // These blocks now refer to a different variable.
  // These will fire change events.
  for (var i = 0; i < blocks.length; i++) {
    blocks[i].renameVarById(variable.getId(), conflictVar.getId());
  }

  // Finally delete the original variable, which is now unreferenced.
  Blockly.Events.fire(new Blockly.Events.VarDelete(variable));
  // And remove it from the list.
  var variableList = this.getVariablesOfType(type);
  var variableIndex = variableList.indexOf(variable);
  this.variableMap_[type].splice(variableIndex, 1);

  Blockly.Events.setGroup(false);
};

/**
 * Create a variable with a given name, optional type, and optional ID.
 * @param {string} name The name of the variable. This must be unique across
 *     variables and procedures.
 * @param {string=} opt_type The type of the variable like 'int' or 'string'.
 *     Does not need to be unique. Field_variable can filter variables based on
 *     their type. This will default to '' which is a specific type.
 * @param {string=} opt_id The unique ID of the variable. This will default to
 *     a UUID.
 * @return {Blockly.VariableModel} The newly created variable.
 */
Blockly.VariableMap.prototype.createVariable = function(name,
    opt_type, opt_id) {
  var variable = this.getVariable(name, opt_type);
  if (variable) {
    if (opt_id && variable.getId() != opt_id) {
      throw Error('Variable "' + name + '" is already in use and its id is "' +
                  variable.getId() + '" which conflicts with the passed in ' +
                  'id, "' + opt_id + '".');
    }
    // The variable already exists and has the same ID.
    return variable;
  }
  if (opt_id && this.getVariableById(opt_id)) {
    throw Error('Variable id, "' + opt_id + '", is already in use.');
  }
  opt_id = opt_id || Blockly.utils.genUid();
  opt_type = opt_type || '';

  variable = new Blockly.VariableModel(this.workspace, name, opt_type, opt_id);
  // If opt_type is not a key, create a new list.
  if (!this.variableMap_[opt_type]) {
    this.variableMap_[opt_type] = [variable];
  } else {
  // Else append the variable to the preexisting list.
    this.variableMap_[opt_type].push(variable);
  }
  return variable;
};

/**
 * Delete a variable.
 * @param {!Blockly.VariableModel} variable Variable to delete.
 */
Blockly.VariableMap.prototype.deleteVariable = function(variable) {
  var variableList = this.variableMap_[variable.type];
  for (var i = 0, tempVar; tempVar = variableList[i]; i++) {
    if (tempVar.getId() == variable.getId()) {
      variableList.splice(i, 1);
      Blockly.Events.fire(new Blockly.Events.VarDelete(variable));
      return;
    }
  }
};

/**
 * Find the variable by the given name and type and return it.  Return null if
 *     it is not found.
 * @param {string} name The name to check for.
 * @param {string=} opt_type The type of the variable.  If not provided it
 *     defaults to the empty string, which is a specific type.
 * @return {Blockly.VariableModel} The variable with the given name, or null if
 *     it was not found.
 */
Blockly.VariableMap.prototype.getVariable = function(name, opt_type) {
  var type = opt_type || '';
  var list = this.variableMap_[type];
  if (list) {
    for (var j = 0, variable; variable = list[j]; j++) {
      if (Blockly.Names.equals(variable.name, name)) {
        return variable;
      }
    }
  }
  return null;
};

/**
 * Find the variable by the given ID and return it. Return null if it is not
 *     found.
 * @param {string} id The ID to check for.
 * @return {Blockly.VariableModel} The variable with the given ID.
 */
Blockly.VariableMap.prototype.getVariableById = function(id) {
  var keys = Object.keys(this.variableMap_);
  for (var i = 0; i < keys.length; i++ ) {
    var key = keys[i];
    for (var j = 0, variable; variable = this.variableMap_[key][j]; j++) {
      if (variable.getId() == id) {
        return variable;
      }
    }
  }
  return null;
};

/**
 * Get a list containing all of the variables of a specified type. If type is
 *     null, return list of variables with empty string type.
 * @param {?string} type Type of the variables to find.
 * @return {!Array.<!Blockly.VariableModel>} The sought after variables of the
 *     passed in type. An empty array if none are found.
 */
Blockly.VariableMap.prototype.getVariablesOfType = function(type) {
  type = type || '';
  var variable_list = this.variableMap_[type];
  if (variable_list) {
    return variable_list.slice();
  }
  return [];
};

/**
 * Return all variable types.
 * @return {!Array.<string>} List of variable types.
 */
Blockly.VariableMap.prototype.getVariableTypes = function() {
  return Object.keys(this.variableMap_);
};

/**
 * Return all variables of all types.
 * @return {!Array.<!Blockly.VariableModel>} List of variable models.
 */
Blockly.VariableMap.prototype.getAllVariables = function() {
  var all_variables = [];
  var keys = Object.keys(this.variableMap_);
  for (var i = 0; i < keys.length; i++ ) {
    all_variables = all_variables.concat(this.variableMap_[keys[i]]);
  }
  return all_variables;
};
