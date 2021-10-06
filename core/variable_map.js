/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object representing a map of variables and their types.
 * @author marisaleung@google.com (Marisa Leung)
 */
'use strict';

goog.provide('Blockly.VariableMap');

goog.require('Blockly.Events');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.VarDelete');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.VarRename');
goog.require('Blockly.Msg');
goog.require('Blockly.utils');
goog.require('Blockly.utils.object');

goog.requireType('Blockly.Block');
goog.requireType('Blockly.VariableModel');
goog.requireType('Blockly.Workspace');


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
   * @type {!Object<string, !Array<Blockly.VariableModel>>}
   * @private
   */
  this.variableMap_ = Object.create(null);

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
  this.variableMap_ = Object.create(null);
};

/* Begin functions for renaming variables. */

/**
 * Rename the given variable by updating its name in the variable map.
 * @param {!Blockly.VariableModel} variable Variable to rename.
 * @param {string} newName New variable name.
 * @package
 */
Blockly.VariableMap.prototype.renameVariable = function(variable, newName) {
  var type = variable.type;
  var conflictVar = this.getVariable(newName, type);
  var blocks = this.workspace.getAllBlocks(false);
  Blockly.Events.setGroup(true);
  try {
    // The IDs may match if the rename is a simple case change (name1 -> Name1).
    if (!conflictVar || conflictVar.getId() == variable.getId()) {
      this.renameVariableAndUses_(variable, newName, blocks);
    } else {
      this.renameVariableWithConflict_(variable, newName, conflictVar, blocks);
    }
  } finally {
    Blockly.Events.setGroup(false);
  }
};

/**
 * Rename a variable by updating its name in the variable map. Identify the
 * variable to rename with the given ID.
 * @param {string} id ID of the variable to rename.
 * @param {string} newName New variable name.
 */
Blockly.VariableMap.prototype.renameVariableById = function(id, newName) {
  var variable = this.getVariableById(id);
  if (!variable) {
    throw Error('Tried to rename a variable that didn\'t exist. ID: ' + id);
  }

  this.renameVariable(variable, newName);
};

/**
 * Update the name of the given variable and refresh all references to it.
 * The new name must not conflict with any existing variable names.
 * @param {!Blockly.VariableModel} variable Variable to rename.
 * @param {string} newName New variable name.
 * @param {!Array<!Blockly.Block>} blocks The list of all blocks in the
 *     workspace.
 * @private
 */
Blockly.VariableMap.prototype.renameVariableAndUses_ = function(variable,
    newName, blocks) {
  Blockly.Events.fire(new (Blockly.Events.get(Blockly.Events.VAR_RENAME))(
      variable, newName));
  variable.name = newName;
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
 * @param {!Array<!Blockly.Block>} blocks The list of all blocks in the
 *     workspace.
 * @private
 */
Blockly.VariableMap.prototype.renameVariableWithConflict_ = function(variable,
    newName, conflictVar, blocks) {
  var type = variable.type;
  var oldCase = conflictVar.name;

  if (newName != oldCase) {
    // Simple rename to change the case and update references.
    this.renameVariableAndUses_(conflictVar, newName, blocks);
  }

  // These blocks now refer to a different variable.
  // These will fire change events.
  for (var i = 0; i < blocks.length; i++) {
    blocks[i].renameVarById(variable.getId(), conflictVar.getId());
  }

  // Finally delete the original variable, which is now unreferenced.
  Blockly.Events.fire(new (Blockly.Events.get(Blockly.Events.VAR_DELETE))(
      variable));
  // And remove it from the list.
  var variableList = this.getVariablesOfType(type);
  var variableIndex = variableList.indexOf(variable);
  this.variableMap_[type].splice(variableIndex, 1);

};

/* End functions for renaming variables. */

/**
 * Create a variable with a given name, optional type, and optional ID.
 * @param {string} name The name of the variable. This must be unique across
 *     variables and procedures.
 * @param {?string=} opt_type The type of the variable like 'int' or 'string'.
 *     Does not need to be unique. Field_variable can filter variables based on
 *     their type. This will default to '' which is a specific type.
 * @param {?string=} opt_id The unique ID of the variable. This will default to
 *     a UUID.
 * @return {!Blockly.VariableModel} The newly created variable.
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
  var id = opt_id || Blockly.utils.genUid();
  var type = opt_type || '';
  variable = new Blockly.VariableModel(this.workspace, name, type, id);

  var variables = this.variableMap_[type] || [];
  variables.push(variable);
  // Delete the list of variables of this type, and re-add it so that
  // the most recent addition is at the end.
  // This is used so the toolbox's set block is set to the most recent variable.
  delete this.variableMap_[type];
  this.variableMap_[type] = variables;

  return variable;
};

/* Begin functions for variable deletion. */

/**
 * Delete a variable.
 * @param {!Blockly.VariableModel} variable Variable to delete.
 */
Blockly.VariableMap.prototype.deleteVariable = function(variable) {
  var variableList = this.variableMap_[variable.type];
  for (var i = 0, tempVar; (tempVar = variableList[i]); i++) {
    if (tempVar.getId() == variable.getId()) {
      variableList.splice(i, 1);
      Blockly.Events.fire(new (Blockly.Events.get(Blockly.Events.VAR_DELETE))(
          variable));
      return;
    }
  }
};

/**
 * Delete a variables by the passed in ID and all of its uses from this
 * workspace. May prompt the user for confirmation.
 * @param {string} id ID of variable to delete.
 */
Blockly.VariableMap.prototype.deleteVariableById = function(id) {
  var variable = this.getVariableById(id);
  if (variable) {
    // Check whether this variable is a function parameter before deleting.
    var variableName = variable.name;
    var uses = this.getVariableUsesById(id);
    for (var i = 0, block; (block = uses[i]); i++) {
      if (block.type == 'procedures_defnoreturn' ||
        block.type == 'procedures_defreturn') {
        var procedureName = block.getFieldValue('NAME');
        var deleteText = Blockly.Msg['CANNOT_DELETE_VARIABLE_PROCEDURE'].
            replace('%1', variableName).
            replace('%2', procedureName);
        Blockly.alert(deleteText);
        return;
      }
    }

    var map = this;
    if (uses.length > 1) {
      // Confirm before deleting multiple blocks.
      var confirmText = Blockly.Msg['DELETE_VARIABLE_CONFIRMATION'].
          replace('%1', String(uses.length)).
          replace('%2', variableName);
      Blockly.confirm(confirmText,
          function(ok) {
            if (ok && variable) {
              map.deleteVariableInternal(variable, uses);
            }
          });
    } else {
      // No confirmation necessary for a single block.
      map.deleteVariableInternal(variable, uses);
    }
  } else {
    console.warn("Can't delete non-existent variable: " + id);
  }
};

/**
 * Deletes a variable and all of its uses from this workspace without asking the
 * user for confirmation.
 * @param {!Blockly.VariableModel} variable Variable to delete.
 * @param {!Array<!Blockly.Block>} uses An array of uses of the variable.
 * @package
 */
Blockly.VariableMap.prototype.deleteVariableInternal = function(variable,
    uses) {
  var existingGroup = Blockly.Events.getGroup();
  if (!existingGroup) {
    Blockly.Events.setGroup(true);
  }
  try {
    for (var i = 0; i < uses.length; i++) {
      uses[i].dispose(true);
    }
    this.deleteVariable(variable);
  } finally {
    if (!existingGroup) {
      Blockly.Events.setGroup(false);
    }
  }
};

/* End functions for variable deletion. */

/**
 * Find the variable by the given name and type and return it.  Return null if
 *     it is not found.
 * @param {string} name The name to check for.
 * @param {?string=} opt_type The type of the variable.  If not provided it
 *     defaults to the empty string, which is a specific type.
 * @return {?Blockly.VariableModel} The variable with the given name, or null if
 *     it was not found.
 */
Blockly.VariableMap.prototype.getVariable = function(name, opt_type) {
  var type = opt_type || '';
  var list = this.variableMap_[type];
  if (list) {
    for (var j = 0, variable; (variable = list[j]); j++) {
      if (Blockly.Names.equals(variable.name, name)) {
        return variable;
      }
    }
  }
  return null;
};

/**
 * Find the variable by the given ID and return it.  Return null if not found.
 * @param {string} id The ID to check for.
 * @return {?Blockly.VariableModel} The variable with the given ID.
 */
Blockly.VariableMap.prototype.getVariableById = function(id) {
  var keys = Object.keys(this.variableMap_);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    for (var j = 0, variable; (variable = this.variableMap_[key][j]); j++) {
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
 * @return {!Array<!Blockly.VariableModel>} The sought after variables of the
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
 * Return all variable and potential variable types.  This list always contains
 * the empty string.
 * @param {?Blockly.Workspace} ws The workspace used to look for potential
 * variables. This can be different than the workspace stored on this object
 * if the passed in ws is a flyout workspace.
 * @return {!Array<string>} List of variable types.
 * @package
 */
Blockly.VariableMap.prototype.getVariableTypes = function(ws) {
  var variableMap = {};
  Blockly.utils.object.mixin(variableMap, this.variableMap_);
  if (ws && ws.getPotentialVariableMap()) {
    Blockly.utils.object.mixin(variableMap,
        ws.getPotentialVariableMap().variableMap_);
  }
  var types = Object.keys(variableMap);
  var hasEmpty = false;
  for (var i = 0; i < types.length; i++) {
    if (types[i] == '') {
      hasEmpty = true;
    }
  }
  if (!hasEmpty) {
    types.push('');
  }
  return types;
};

/**
 * Return all variables of all types.
 * @return {!Array<!Blockly.VariableModel>} List of variable models.
 */
Blockly.VariableMap.prototype.getAllVariables = function() {
  var all_variables = [];
  for (var key in this.variableMap_) {
    all_variables = all_variables.concat(this.variableMap_[key]);
  }
  return all_variables;
};

/**
 * Returns all of the variable names of all types.
 * @return {!Array<string>} All of the variable names of all types.
 */
Blockly.VariableMap.prototype.getAllVariableNames = function() {
  var allNames = [];
  for (var key in this.variableMap_) {
    var variables = this.variableMap_[key];
    for (var i = 0, variable; (variable = variables[i]); i++) {
      allNames.push(variable.name);
    }
  }
  return allNames;
};

/**
 * Find all the uses of a named variable.
 * @param {string} id ID of the variable to find.
 * @return {!Array<!Blockly.Block>} Array of block usages.
 */
Blockly.VariableMap.prototype.getVariableUsesById = function(id) {
  var uses = [];
  var blocks = this.workspace.getAllBlocks(false);
  // Iterate through every block and check the name.
  for (var i = 0; i < blocks.length; i++) {
    var blockVariables = blocks[i].getVarModels();
    if (blockVariables) {
      for (var j = 0; j < blockVariables.length; j++) {
        if (blockVariables[j].getId() == id) {
          uses.push(blocks[i]);
        }
      }
    }
  }
  return uses;
};
