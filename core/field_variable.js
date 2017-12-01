/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
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
 * @fileoverview Variable input field.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.FieldVariable');

goog.require('Blockly.FieldDropdown');
goog.require('Blockly.Msg');
goog.require('Blockly.VariableModel');
goog.require('Blockly.Variables');
goog.require('Blockly.VariableModel');
goog.require('goog.asserts');
goog.require('goog.string');


/**
 * Class for a variable's dropdown field.
 * @param {?string} varname The default name for the variable.  If null,
 *     a unique variable name will be generated.
 * @param {Function=} opt_validator A function that is executed when a new
 *     option is selected.  Its sole argument is the new option value.
 * @param {Array.<string>=} opt_variableTypes A list of the types of variables
 *     to include in the dropdown.
 * @extends {Blockly.FieldDropdown}
 * @constructor
 */
Blockly.FieldVariable = function(varname, opt_validator, opt_variableTypes) {
  // Don't call the FieldDropdown constructor.  It'll try too hard.
  this.menuGenerator_ = Blockly.FieldVariable.dropdownCreate;
  this.size_ = new goog.math.Size(0, Blockly.BlockSvg.MIN_BLOCK_Y);
  this.setValidator(opt_validator);
  //this.setValue(varname || '');
  // TODO: Add opt_default_type to match default value.  If not set, ''.
  this.defaultVariableName = (varname || '');
  this.defaultType_ = '';
  this.variableTypes = opt_variableTypes;
};
goog.inherits(Blockly.FieldVariable, Blockly.FieldDropdown);

Blockly.FieldVariable.getOrCreateVariable = function(workspace, text, type,
    id) {
  var potentialVariableMap = workspace.isFlyout ?
      workspace.targetWorkspace.potentialVariableMap_ : null;
  if (id) {
    var variable = workspace.getVariableById(id);
    if (!variable && potentialVariableMap) {
      variable = potentialVariableMap.getVariableById(id);
    }
  } else {
    var variable = workspace.getVariable(text, type);
    if (!variable && potentialVariableMap) {
      variable = potentialVariableMap.getVariable(text, type);
    }
  }
  // Didn't find the variable.
  if (!variable) {
    if (potentialVariableMap) {
      variable = potentialVariableMap.createVariable(text, type, id);
    } else {
      variable = workspace.createVariable(text, type, id);
    }
  }

  return variable;
};

/**
 * Install this dropdown on a block.
 */
Blockly.FieldVariable.prototype.init = function() {
  if (this.fieldGroup_) {
    // Dropdown has already been initialized once.
    return;
  }
  Blockly.FieldVariable.superClass_.init.call(this);

  // TODO (1010): Change from init/initModel to initView/initModel
  this.initModel();
};

Blockly.FieldVariable.prototype.initModel = function() {
  // this.workspace_ = this.sourceBlock_.isInFlyout ?
  //     this.sourceBlock_.workspace.targetWorkspace :
  //     this.sourceBlock_.workspace;
  // // TODO: Describe how the potential variable map is different from the variable
  // // map; use getters.
  // this.variableMap_ = this.sourceBlock_.isInFlyout ?
  //     this.workspace_.potentialVariableMap_ : this.workspace_.variableMap_;
  // var name = this.defaultValue;
  // if (!name) {
  //   // Variables without names get uniquely named for this workspace.
  //   name = Blockly.Variables.generateUniqueName(this.workspace_);
  // }
  // // If the selected variable doesn't exist yet, create it.
  // // For instance, some blocks in the toolbox have variable dropdowns filled
  // // in by default.

  // var variable = this.variableMap_.getVariable(name, this.defaultType_);
  // if (!variable) {
  //   variable = this.variableMap_.createVariable(name, this.defaultType_);
  // }
  if (this.variable_) {
    return; // Initialization already happened.
  }
  this.workspace_ = this.sourceBlock_.workspace;
  var variable = Blockly.FieldVariable.getOrCreateVariable(
      this.workspace_, this.defaultVariableName, this.defaultType_, null);
  this.setValue(variable.getId());
};

Blockly.FieldVariable.dispose = function() {
  Blockly.FieldVariable.superClass_.dispose.call(this);
  this.workspace_ = null;
  this.variableMap_ = null;
};

/**
 * Attach this field to a block.
 * @param {!Blockly.Block} block The block containing this field.
 */
Blockly.FieldVariable.prototype.setSourceBlock = function(block) {
  goog.asserts.assert(!block.isShadow(),
      'Variable fields are not allowed to exist on shadow blocks.');
  Blockly.FieldVariable.superClass_.setSourceBlock.call(this, block);
};

/**
 * Get the variable's name (use a variableDB to convert into a real name).
 * Unline a regular dropdown, variables are literal and have no neutral value.
 * @return {string} Current text.
 */
Blockly.FieldVariable.prototype.getValue = function() {
  //return this.getText();
  return this.variable_ ? this.variable_.getId() : '';
};

Blockly.FieldVariable.prototype.getText = function() {
  //return this.getText();
  return this.variable_ ? this.variable_.name : '';
};

/**
 * Set the variable ID.
 * @param {string} id New variable ID, which must reference an existing
 *     variable.
 */
Blockly.FieldVariable.prototype.setValue = function(id) {
  var workspace = this.sourceBlock_.workspace;
  //var variable = this.variableMap_.getVariableById(id);
  var potentialVariableMap = workspace.isFlyout ?
      workspace.targetWorkspace.potentialVariableMap_ : null;
  var variable = workspace.getVariableById(id);
  if (!variable && potentialVariableMap) {
    variable = potentialVariableMap.getVariableById(id);
  }
  if (!variable) {
    throw new Error('Variable id doesn\'t point to a real variable!  ID was ' +
        id);
  }
  // Type checks!
  var type = variable.type;
  if (!this.typeIsAllowed_(type)) {
    throw new Error('Variable type doesn\'t match this field!  Type was ' +
        type);
  }
  this.variable_ = variable;
  this.setText(variable.name);
};

Blockly.FieldVariable.prototype.typeIsAllowed_ = function(type) {
  var typeList = this.getVariableTypes_();
  if (!typeList) {
    return true; // If it's null, all types are valid.
  }
  for (var i = 0; i < typeList.length; i++) {
    if (type == typeList[i]) {
      return true;
    }
  }
  return false;
};

/**
 * Return a list of variable types to include in the dropdown.
 * @return {!Array.<string>} Array of variable types.
 * @throws {Error} if variableTypes is an empty array.
 * @private
 */
Blockly.FieldVariable.prototype.getVariableTypes_ = function() {
  // TODO: Why does this happen every time, instead of once when the workspace
  // is set?  Do we expect the variable types to change that much?
  var variableTypes = this.variableTypes;
  if (variableTypes === null || variableTypes === undefined) {
    // If variableTypes is null, return all variable types.
    if (this.sourceBlock_) {
      var workspace = this.sourceBlock_.workspace;
      return workspace.getVariableTypes();
    }
  }
  variableTypes = variableTypes || [''];
  if (variableTypes.length == 0) {
    // Throw an error if variableTypes is an empty list.
    var name = this.getText();
    throw new Error('\'variableTypes\' of field variable ' +
      name + ' was an empty list');
  }
  return variableTypes;
};

/**
 * Return a sorted list of variable names for variable dropdown menus.
 * Include a special option at the end for creating a new variable name.
 * @return {!Array.<string>} Array of variable names.
 * @this {Blockly.FieldVariable}
 */
Blockly.FieldVariable.dropdownCreate = function() {
  var variableModelList = [];
  var name = this.getText();
  // Don't create a new variable if there is nothing selected.
  var createSelectedVariable = name ? true : false;
  var workspace = null;
  if (this.sourceBlock_) {
    workspace = this.sourceBlock_.workspace;
  }
  if (workspace) {
    var variableTypes = this.getVariableTypes_();
    var variableModelList = [];
    // Get a copy of the list, so that adding rename and new variable options
    // doesn't modify the workspace's list.
    for (var i = 0; i < variableTypes.length; i++) {
      var variableType = variableTypes[i];
      var variables = workspace.getVariablesOfType(variableType);
      variableModelList = variableModelList.concat(variables);
    }
    for (var i = 0; i < variableModelList.length; i++) {
      if (createSelectedVariable &&
          goog.string.caseInsensitiveEquals(variableModelList[i].name, name)) {
        createSelectedVariable = false;
        break;
      }
    }
  }
  // Ensure that the currently selected variable is an option.
  if (createSelectedVariable && workspace) {
    var newVar = workspace.createVariable(name);
    variableModelList.push(newVar);
  }
  variableModelList.sort(Blockly.VariableModel.compareByName);
  var options = [];
  for (var i = 0; i < variableModelList.length; i++) {
    // Set the UUID as the internal representation of the variable.
    options[i] = [variableModelList[i].name, variableModelList[i].getId()];
  }
  options.push([Blockly.Msg.RENAME_VARIABLE, Blockly.RENAME_VARIABLE_ID]);
  if (Blockly.Msg.DELETE_VARIABLE) {
    options.push([Blockly.Msg.DELETE_VARIABLE.replace('%1', name),
        Blockly.DELETE_VARIABLE_ID]);
  }
  return options;
};

/**
 * Handle the selection of an item in the variable dropdown menu.
 * Special case the 'Rename variable...' and 'Delete variable...' options.
 * In the rename case, prompt the user for a new name.
 * @param {!goog.ui.Menu} menu The Menu component clicked.
 * @param {!goog.ui.MenuItem} menuItem The MenuItem selected within menu.
 */
Blockly.FieldVariable.prototype.onItemSelected = function(menu, menuItem) {
  var id = menuItem.getValue();
  // TODO(marisaleung): change setValue() to take in an ID as the parameter.
  // Then remove itemText.
  if (this.sourceBlock_ && this.sourceBlock_.workspace) {
    var workspace = this.sourceBlock_.workspace;
    var variable = workspace.getVariableById(id);
    // If the item selected is a variable, set itemText to the variable name.
    if (id == Blockly.RENAME_VARIABLE_ID) {
      // Rename variable.
      variable = this.variable_;
      Blockly.Variables.renameVariable(workspace, variable);
      return;
    } else if (id == Blockly.DELETE_VARIABLE_ID) {
      // Delete variable.
      workspace.deleteVariableById(this.variable_.getId());
      return;
    }

    // TODO: Call any validation function, and allow it to override.
    // For now it's unclear whether the validator should act on the id.
    //var validatedId = this.callValidator(variable.getId());
  }
  // if (variable.getId() !== null) {
  //   this.setValue(validatedId);
  // }
  this.setValue(id);
};
