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
   * @type {!Object<string, !Array.<Blockly.VariableModel>>}
   * A map from variable type to list of variable names.  The lists contain all
   * of the named variables in the workspace, including variables
   * that are not currently in use.
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
 * @param {?Blockly.VariableModel} variable Variable to rename.
 * @param {string} newName New variable name.
 */
Blockly.VariableMap.prototype.renameVariable = function(variable, newName) {
  var newVariable = this.getVariable(newName);
  var variableIndex = -1;
  var newVariableIndex = -1;
  var type = '';
  if (variable || newVariable) {
    type = (variable || newVariable).type;
  }

  var variableList = this.getVariablesOfType(type);
  if (variable) {
    variableIndex = variableList.indexOf(variable);
  }
  if (newVariable){ // see if I can get rid of newVariable dependency
    newVariableIndex = variableList.indexOf(newVariable);
  }

  if (variableIndex == -1 && newVariableIndex == -1) {
    this.createVariable(newName, '');
    console.log('Tried to rename an non-existent variable.');
  } else if (variableIndex == newVariableIndex ||
      variableIndex != -1 && newVariableIndex == -1) {
    // Only changing case, or renaming to a completely novel name.
    var variableToRename = this.variableMap_[type][variableIndex];
    Blockly.Events.fire(new Blockly.Events.VarRename(variableToRename,
      newName));
    variableToRename.name = newName;
  } else if (variableIndex != -1 && newVariableIndex != -1) {
    // Renaming one existing variable to another existing variable.
    // The case might have changed, so we update the destination ID.
    var variableToRename = this.variableMap_[type][newVariableIndex];
    Blockly.Events.fire(new Blockly.Events.VarRename(variableToRename,
      newName));
    var variableToDelete = this.variableMap_[type][variableIndex];
    Blockly.Events.fire(new Blockly.Events.VarDelete(variableToDelete));
    variableToRename.name = newName;
    this.variableMap_[type].splice(variableIndex, 1);
  }
};

/**
 * Create a variable with a given name, optional type, and optional id.
 * @param {!string} name The name of the variable. This must be unique across
 *     variables and procedures.
 * @param {?string} opt_type The type of the variable like 'int' or 'string'.
 *     Does not need to be unique. Field_variable can filter variables based on
 *     their type. This will default to '' which is a specific type.
 * @param {?string} opt_id The unique id of the variable. This will default to
 *     a UUID.
 * @return {?Blockly.VariableModel} The newly created variable.
 */
Blockly.VariableMap.prototype.createVariable = function(name, opt_type, opt_id) {
  var variable = this.getVariable(name);
  if (variable) {
    if (opt_type && variable.type != opt_type) {
      throw Error('Variable "' + name + '" is already in use and its type is "'
                  + variable.type + '" which conflicts with the passed in ' +
                  'type, "' + opt_type + '".');
    }
    if (opt_id && variable.getId() != opt_id) {
      throw Error('Variable "' + name + '" is already in use and its id is "'
                  + variable.getId() + '" which conflicts with the passed in ' +
                  'id, "' + opt_id + '".');
    }
    // The variable already exists and has the same id and type.
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
 * @param {Blockly.VariableModel} variable Variable to delete.
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
 * Find the variable by the given name and return it. Return null if it is not
 *     found.
 * @param {!string} name The name to check for.
 * @return {?Blockly.VariableModel} The variable with the given name, or null if
 *     it was not found.
 */
Blockly.VariableMap.prototype.getVariable = function(name) {
  var keys = Object.keys(this.variableMap_);
  for (var i = 0; i < keys.length; i++ ) {
    var key = keys[i];
    for (var j = 0, variable; variable = this.variableMap_[key][j]; j++) {
      if (Blockly.Names.equals(variable.name, name)) {
        return variable;
      }
    }
  }
  return null;
};

/**
 * Find the variable by the given id and return it. Return null if it is not
 *     found.
 * @param {!string} id The id to check for.
 * @return {?Blockly.VariableModel} The variable with the given id.
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
 * @return {Array.<Blockly.VariableModel>} The sought after variables of the
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
 * @return {!Array.<Blockly.VariableModel>} List of variable models.
 */
Blockly.VariableMap.prototype.getAllVariables = function() {
  var all_variables = [];
  var keys = Object.keys(this.variableMap_);
  for (var i = 0; i < keys.length; i++ ) {
    all_variables = all_variables.concat(this.variableMap_[keys[i]]);
  }
  return all_variables;
};
