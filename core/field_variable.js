/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Variable input field.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.FieldVariable');

goog.require('Blockly.Events');
goog.require('Blockly.Events.BlockChange');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.fieldRegistry');
goog.require('Blockly.Msg');
goog.require('Blockly.utils');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.Size');
goog.require('Blockly.VariableModel');
goog.require('Blockly.Variables');
goog.require('Blockly.Xml');



/**
 * Class for a variable's dropdown field.
 * @param {?string} varName The default name for the variable.  If null,
 *     a unique variable name will be generated.
 * @param {Function=} opt_validator A function that is called to validate
 *    changes to the field's value. Takes in a variable ID  & returns a
 *    validated variable ID, or null to abort the change.
 * @param {Array.<string>=} opt_variableTypes A list of the types of variables
 *     to include in the dropdown.
 * @param {string=} opt_defaultType The type of variable to create if this
 *     field's value is not explicitly set.  Defaults to ''.
 * @param {Object=} opt_config A map of options used to configure the field.
 *    See the [field creation documentation]{@link https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/variable#creation}
 *    for a list of properties this parameter supports.
 * @extends {Blockly.FieldDropdown}
 * @constructor
 */
Blockly.FieldVariable = function(varName, opt_validator, opt_variableTypes,
    opt_defaultType, opt_config) {
  // The FieldDropdown constructor expects the field's initial value to be
  // the first entry in the menu generator, which it may or may not be.
  // Just do the relevant parts of the constructor.

  /**
   * An array of options for a dropdown list,
   * or a function which generates these options.
   * @type {(!Array.<!Array>|
   *    !function(this:Blockly.FieldDropdown): !Array.<!Array>)}
   * @protected
   */
  this.menuGenerator_ = Blockly.FieldVariable.dropdownCreate;

  /**
   * The initial variable name passed to this field's constructor, or an
   * empty string if a name wasn't provided. Used to create the initial
   * variable.
   * @type {string}
   */
  this.defaultVariableName = varName || '';

  /**
   * The size of the area rendered by the field.
   * @type {Blockly.utils.Size}
   * @protected
   * @override
   */
  this.size_ = new Blockly.utils.Size(0, 0);

  opt_config && this.configure_(opt_config);
  opt_validator && this.setValidator(opt_validator);

  if (!opt_config) {  // Only do one kind of configuration or the other.
    this.setTypes_(opt_variableTypes, opt_defaultType);
  }
};
Blockly.utils.object.inherits(Blockly.FieldVariable, Blockly.FieldDropdown);

/**
 * Construct a FieldVariable from a JSON arg object,
 * dereferencing any string table references.
 * @param {!Object} options A JSON object with options (variable,
 *                          variableTypes, and defaultType).
 * @return {!Blockly.FieldVariable} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldVariable.fromJson = function(options) {
  var varName = Blockly.utils.replaceMessageReferences(options['variable']);
  return new Blockly.FieldVariable(
      varName, undefined, undefined, undefined, options);
};

/**
 * The workspace that this variable field belongs to.
 * @type {?Blockly.Workspace}
 * @private
 */
Blockly.FieldVariable.prototype.workspace_ = null;

/**
 * Serializable fields are saved by the XML renderer, non-serializable fields
 * are not. Editable fields should also be serializable.
 * @type {boolean}
 */
Blockly.FieldVariable.prototype.SERIALIZABLE = true;

/**
 * Configure the field based on the given map of options.
 * @param {!Object} config A map of options to configure the field based on.
 * @protected
 */
Blockly.FieldVariable.prototype.configure_ = function(config) {
  Blockly.FieldVariable.superClass_.configure_.call(this, config);
  this.setTypes_(config['variableTypes'], config['defaultType']);
};

/**
 * Initialize the model for this field if it has not already been initialized.
 * If the value has not been set to a variable by the first render, we make up a
 * variable rather than let the value be invalid.
 * @package
 */
Blockly.FieldVariable.prototype.initModel = function() {
  if (this.variable_) {
    return; // Initialization already happened.
  }
  var variable = Blockly.Variables.getOrCreateVariablePackage(
      this.sourceBlock_.workspace, null,
      this.defaultVariableName, this.defaultType_);

  // Don't call setValue because we don't want to cause a rerender.
  this.doValueUpdate_(variable.getId());
};

/**
 * @override
 */
Blockly.FieldVariable.prototype.shouldAddBorderRect_ = function() {
  return Blockly.FieldVariable.superClass_.shouldAddBorderRect_.call(this) &&
    (!this.getConstants().FIELD_DROPDOWN_NO_BORDER_RECT_SHADOW ||
        this.sourceBlock_.type != 'variables_get');
};

/**
 * Initialize this field based on the given XML.
 * @param {!Element} fieldElement The element containing information about the
 *    variable field's state.
 */
Blockly.FieldVariable.prototype.fromXml = function(fieldElement) {
  var id = fieldElement.getAttribute('id');
  var variableName = fieldElement.textContent;
  // 'variabletype' should be lowercase, but until July 2019 it was sometimes
  // recorded as 'variableType'.  Thus we need to check for both.
  var variableType = fieldElement.getAttribute('variabletype') ||
      fieldElement.getAttribute('variableType') || '';

  var variable = Blockly.Variables.getOrCreateVariablePackage(
      this.sourceBlock_.workspace, id, variableName, variableType);

  // This should never happen :)
  if (variableType != null && variableType !== variable.type) {
    throw Error('Serialized variable type with id \'' +
      variable.getId() + '\' had type ' + variable.type + ', and ' +
      'does not match variable field that references it: ' +
      Blockly.Xml.domToText(fieldElement) + '.');
  }

  this.setValue(variable.getId());
};

/**
 * Serialize this field to XML.
 * @param {!Element} fieldElement The element to populate with info about the
 *    field's state.
 * @return {!Element} The element containing info about the field's state.
 */
Blockly.FieldVariable.prototype.toXml = function(fieldElement) {
  // Make sure the variable is initialized.
  this.initModel();

  fieldElement.id = this.variable_.getId();
  fieldElement.textContent = this.variable_.name;
  if (this.variable_.type) {
    fieldElement.setAttribute('variabletype', this.variable_.type);
  }
  return fieldElement;
};

/**
 * Attach this field to a block.
 * @param {!Blockly.Block} block The block containing this field.
 */
Blockly.FieldVariable.prototype.setSourceBlock = function(block) {
  if (block.isShadow()) {
    throw Error('Variable fields are not allowed to exist on shadow blocks.');
  }
  Blockly.FieldVariable.superClass_.setSourceBlock.call(this, block);
};

/**
 * Get the variable's ID.
 * @return {string} Current variable's ID.
 */
Blockly.FieldVariable.prototype.getValue = function() {
  return this.variable_ ? this.variable_.getId() : null;
};

/**
 * Get the text from this field, which is the selected variable's name.
 * @return {string} The selected variable's name, or the empty string if no
 *     variable is selected.
 */
Blockly.FieldVariable.prototype.getText = function() {
  return this.variable_ ? this.variable_.name : '';
};

/**
 * Get the variable model for the selected variable.
 * Not guaranteed to be in the variable map on the workspace (e.g. if accessed
 * after the variable has been deleted).
 * @return {Blockly.VariableModel} The selected variable, or null if none was
 *     selected.
 * @package
 */
Blockly.FieldVariable.prototype.getVariable = function() {
  return this.variable_;
};

/**
 * Gets the validation function for this field, or null if not set.
 * Returns null if the variable is not set, because validators should not
 * run on the initial setValue call, because the field won't be attached to
 * a block and workspace at that point.
 * @return {Function} Validation function, or null.
 */
Blockly.FieldVariable.prototype.getValidator = function() {
  // Validators shouldn't operate on the initial setValue call.
  // Normally this is achieved by calling setValidator after setValue, but
  // this is not a possibility with variable fields.
  if (this.variable_) {
    return this.validator_;
  }
  return null;
};

/**
 * Ensure that the id belongs to a valid variable of an allowed type.
 * @param {*=} opt_newValue The id of the new variable to set.
 * @return {?string} The validated id, or null if invalid.
 * @protected
 */
Blockly.FieldVariable.prototype.doClassValidation_ = function(opt_newValue) {
  if (opt_newValue === null) {
    return null;
  }
  var newId = /** @type {string} */ (opt_newValue);
  var variable = Blockly.Variables.getVariable(
      this.sourceBlock_.workspace, newId);
  if (!variable) {
    console.warn('Variable id doesn\'t point to a real variable! ' +
        'ID was ' + newId);
    return null;
  }
  // Type Checks.
  var type = variable.type;
  if (!this.typeIsAllowed_(type)) {
    console.warn('Variable type doesn\'t match this field!  Type was ' + type);
    return null;
  }
  return newId;
};

/**
 * Update the value of this variable field, as well as its variable and text.
 *
 * The variable ID should be valid at this point, but if a variable field
 * validator returns a bad ID, this could break.
 * @param {*} newId The value to be saved.
 * @protected
 */
Blockly.FieldVariable.prototype.doValueUpdate_ = function(newId) {
  this.variable_ = Blockly.Variables.getVariable(
      this.sourceBlock_.workspace, /** @type {string} */ (newId));
  Blockly.FieldVariable.superClass_.doValueUpdate_.call(this, newId);
};

/**
 * Check whether the given variable type is allowed on this field.
 * @param {string} type The type to check.
 * @return {boolean} True if the type is in the list of allowed types.
 * @private
 */
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
  // TODO (#1513): Try to avoid calling this every time the field is edited.
  var variableTypes = this.variableTypes;
  if (variableTypes === null) {
    // If variableTypes is null, return all variable types.
    if (this.sourceBlock_ && this.sourceBlock_.workspace) {
      return this.sourceBlock_.workspace.getVariableTypes();
    }
  }
  variableTypes = variableTypes || [''];
  if (variableTypes.length == 0) {
    // Throw an error if variableTypes is an empty list.
    var name = this.getText();
    throw Error('\'variableTypes\' of field variable ' +
      name + ' was an empty list');
  }
  return variableTypes;
};

/**
 * Parse the optional arguments representing the allowed variable types and the
 * default variable type.
 * @param {Array.<string>=} opt_variableTypes A list of the types of variables
 *     to include in the dropdown.  If null or undefined, variables of all types
 *     will be displayed in the dropdown.
 * @param {string=} opt_defaultType The type of the variable to create if this
 *     field's value is not explicitly set.  Defaults to ''.
 * @private
 */
Blockly.FieldVariable.prototype.setTypes_ = function(opt_variableTypes,
    opt_defaultType) {
  // If you expected that the default type would be the same as the only entry
  // in the variable types array, tell the Blockly team by commenting on #1499.
  var defaultType = opt_defaultType || '';
  // Set the allowable variable types.  Null means all types on the workspace.
  if (opt_variableTypes == null || opt_variableTypes == undefined) {
    var variableTypes = null;
  } else if (Array.isArray(opt_variableTypes)) {
    var variableTypes = opt_variableTypes;
    // Make sure the default type is valid.
    var isInArray = false;
    for (var i = 0; i < variableTypes.length; i++) {
      if (variableTypes[i] == defaultType) {
        isInArray = true;
      }
    }
    if (!isInArray) {
      throw Error('Invalid default type \'' + defaultType + '\' in ' +
          'the definition of a FieldVariable');
    }
  } else {
    throw Error('\'variableTypes\' was not an array in the definition of ' +
        'a FieldVariable');
  }
  // Only update the field once all checks pass.
  this.defaultType_ = defaultType;
  this.variableTypes = variableTypes;
};

/**
 * Refreshes the name of the variable by grabbing the name of the model.
 * Used when a variable gets renamed, but the ID stays the same. Should only
 * be called by the block.
 * @package
 */
Blockly.FieldVariable.prototype.refreshVariableName = function() {
  this.forceRerender();
};

/**
 * Return a sorted list of variable names for variable dropdown menus.
 * Include a special option at the end for creating a new variable name.
 * @return {!Array.<!Array>} Array of variable names/id tuples.
 * @this {Blockly.FieldVariable}
 */
Blockly.FieldVariable.dropdownCreate = function() {
  if (!this.variable_) {
    throw Error('Tried to call dropdownCreate on a variable field with no' +
        ' variable selected.');
  }
  var name = this.getText();
  var variableModelList = [];
  if (this.sourceBlock_ && this.sourceBlock_.workspace) {
    var variableTypes = this.getVariableTypes_();
    // Get a copy of the list, so that adding rename and new variable options
    // doesn't modify the workspace's list.
    for (var i = 0; i < variableTypes.length; i++) {
      var variableType = variableTypes[i];
      var variables =
        this.sourceBlock_.workspace.getVariablesOfType(variableType);
      variableModelList = variableModelList.concat(variables);
    }
  }
  variableModelList.sort(Blockly.VariableModel.compareByName);

  var options = [];
  for (var i = 0; i < variableModelList.length; i++) {
    // Set the UUID as the internal representation of the variable.
    options[i] = [variableModelList[i].name, variableModelList[i].getId()];
  }
  options.push([Blockly.Msg['RENAME_VARIABLE'], Blockly.RENAME_VARIABLE_ID]);
  if (Blockly.Msg['DELETE_VARIABLE']) {
    options.push(
        [
          Blockly.Msg['DELETE_VARIABLE'].replace('%1', name),
          Blockly.DELETE_VARIABLE_ID
        ]
    );
  }

  return options;
};

/**
 * Handle the selection of an item in the variable dropdown menu.
 * Special case the 'Rename variable...' and 'Delete variable...' options.
 * In the rename case, prompt the user for a new name.
 * @param {!Blockly.Menu} menu The Menu component clicked.
 * @param {!Blockly.MenuItem} menuItem The MenuItem selected within menu.
 * @protected
 */
Blockly.FieldVariable.prototype.onItemSelected_ = function(menu, menuItem) {
  var id = menuItem.getValue();
  // Handle special cases.
  if (this.sourceBlock_ && this.sourceBlock_.workspace) {
    if (id == Blockly.RENAME_VARIABLE_ID) {
      // Rename variable.
      Blockly.Variables.renameVariable(
          this.sourceBlock_.workspace, this.variable_);
      return;
    } else if (id == Blockly.DELETE_VARIABLE_ID) {
      // Delete variable.
      this.sourceBlock_.workspace.deleteVariableById(this.variable_.getId());
      return;
    }
  }
  // Handle unspecial case.
  this.setValue(id);
};

/**
 * Overrides referencesVariables(), indicating this field refers to a variable.
 * @return {boolean} True.
 * @package
 * @override
 */
Blockly.FieldVariable.prototype.referencesVariables = function() {
  return true;
};

Blockly.fieldRegistry.register('field_variable', Blockly.FieldVariable);
