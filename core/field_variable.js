/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Variable input field.
 */
'use strict';

/**
 * Variable input field.
 * @class
 */
goog.module('Blockly.FieldVariable');

const Variables = goog.require('Blockly.Variables');
const Xml = goog.require('Blockly.Xml');
const fieldRegistry = goog.require('Blockly.fieldRegistry');
const internalConstants = goog.require('Blockly.internalConstants');
const parsing = goog.require('Blockly.utils.parsing');
/* eslint-disable-next-line no-unused-vars */
const {Block} = goog.requireType('Blockly.Block');
const {Field} = goog.require('Blockly.Field');
const {FieldDropdown} = goog.require('Blockly.FieldDropdown');
/* eslint-disable-next-line no-unused-vars */
const {MenuItem} = goog.requireType('Blockly.MenuItem');
/* eslint-disable-next-line no-unused-vars */
const {Menu} = goog.requireType('Blockly.Menu');
const {Msg} = goog.require('Blockly.Msg');
/* eslint-disable-next-line no-unused-vars */
const {Sentinel} = goog.requireType('Blockly.utils.Sentinel');
const {Size} = goog.require('Blockly.utils.Size');
const {VariableModel} = goog.require('Blockly.VariableModel');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.BlockChange');


/**
 * Class for a variable's dropdown field.
 * @extends {FieldDropdown}
 * @alias Blockly.FieldVariable
 */
class FieldVariable extends FieldDropdown {
  /**
   * @param {?string|!Sentinel} varName The default name for the variable.
   *     If null, a unique variable name will be generated.
   *     Also accepts Field.SKIP_SETUP if you wish to skip setup (only used by
   *     subclasses that want to handle configuration and setting the field
   *     value after their own constructors have run).
   * @param {Function=} opt_validator A function that is called to validate
   *    changes to the field's value. Takes in a variable ID  & returns a
   *    validated variable ID, or null to abort the change.
   * @param {Array<string>=} opt_variableTypes A list of the types of variables
   *     to include in the dropdown. Will only be used if opt_config is not
   *     provided.
   * @param {string=} opt_defaultType The type of variable to create if this
   *     field's value is not explicitly set.  Defaults to ''. Will only be used
   *     if opt_config is not provided.
   * @param {Object=} opt_config A map of options used to configure the field.
   *    See the [field creation documentation]{@link
   *    https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/variable#creation}
   *    for a list of properties this parameter supports.
   */
  constructor(
      varName, opt_validator, opt_variableTypes, opt_defaultType, opt_config) {
    super(Field.SKIP_SETUP);

    /**
     * An array of options for a dropdown list,
     * or a function which generates these options.
     * @type {(!Array<!Array>|
     *    !function(this:FieldDropdown): !Array<!Array>)}
     * @protected
     */
    this.menuGenerator_ = FieldVariable.dropdownCreate;

    /**
     * The initial variable name passed to this field's constructor, or an
     * empty string if a name wasn't provided. Used to create the initial
     * variable.
     * @type {string}
     */
    this.defaultVariableName = typeof varName === 'string' ? varName : '';

    /**
     * The type of the default variable for this field.
     * @type {string}
     * @private
     */
    this.defaultType_ = '';

    /**
     * All of the types of variables that will be available in this field's
     * dropdown.
     * @type {?Array<string>}
     */
    this.variableTypes = [];

    /**
     * The size of the area rendered by the field.
     * @type {Size}
     * @protected
     * @override
     */
    this.size_ = new Size(0, 0);

    /**
     * The variable model associated with this field.
     * @type {?VariableModel}
     * @private
     */
    this.variable_ = null;

    /**
     * Serializable fields are saved by the serializer, non-serializable fields
     * are not. Editable fields should also be serializable.
     * @type {boolean}
     */
    this.SERIALIZABLE = true;

    if (varName === Field.SKIP_SETUP) return;

    if (opt_config) {
      this.configure_(opt_config);
    } else {
      this.setTypes_(opt_variableTypes, opt_defaultType);
    }
    if (opt_validator) this.setValidator(opt_validator);
  }

  /**
   * Configure the field based on the given map of options.
   * @param {!Object} config A map of options to configure the field based on.
   * @protected
   */
  configure_(config) {
    super.configure_(config);
    this.setTypes_(config['variableTypes'], config['defaultType']);
  }

  /**
   * Initialize the model for this field if it has not already been initialized.
   * If the value has not been set to a variable by the first render, we make up
   * a variable rather than let the value be invalid.
   * @package
   */
  initModel() {
    if (this.variable_) {
      return;  // Initialization already happened.
    }
    const variable = Variables.getOrCreateVariablePackage(
        this.sourceBlock_.workspace, null, this.defaultVariableName,
        this.defaultType_);

    // Don't call setValue because we don't want to cause a rerender.
    this.doValueUpdate_(variable.getId());
  }

  /**
   * @override
   */
  shouldAddBorderRect_() {
    return super.shouldAddBorderRect_() &&
        (!this.getConstants().FIELD_DROPDOWN_NO_BORDER_RECT_SHADOW ||
         this.sourceBlock_.type !== 'variables_get');
  }

  /**
   * Initialize this field based on the given XML.
   * @param {!Element} fieldElement The element containing information about the
   *    variable field's state.
   */
  fromXml(fieldElement) {
    const id = fieldElement.getAttribute('id');
    const variableName = fieldElement.textContent;
    // 'variabletype' should be lowercase, but until July 2019 it was sometimes
    // recorded as 'variableType'.  Thus we need to check for both.
    const variableType = fieldElement.getAttribute('variabletype') ||
        fieldElement.getAttribute('variableType') || '';

    const variable = Variables.getOrCreateVariablePackage(
        this.sourceBlock_.workspace, id, variableName, variableType);

    // This should never happen :)
    if (variableType !== null && variableType !== variable.type) {
      throw Error(
          'Serialized variable type with id \'' + variable.getId() +
          '\' had type ' + variable.type + ', and ' +
          'does not match variable field that references it: ' +
          Xml.domToText(fieldElement) + '.');
    }

    this.setValue(variable.getId());
  }

  /**
   * Serialize this field to XML.
   * @param {!Element} fieldElement The element to populate with info about the
   *    field's state.
   * @return {!Element} The element containing info about the field's state.
   */
  toXml(fieldElement) {
    // Make sure the variable is initialized.
    this.initModel();

    fieldElement.id = this.variable_.getId();
    fieldElement.textContent = this.variable_.name;
    if (this.variable_.type) {
      fieldElement.setAttribute('variabletype', this.variable_.type);
    }
    return fieldElement;
  }

  /**
   * Saves this field's value.
   * @param {boolean=} doFullSerialization If true, the variable field will
   *     serialize the full state of the field being referenced (ie ID, name,
   *     and type) rather than just a reference to it (ie ID).
   * @return {*} The state of the variable field.
   * @override
   * @package
   */
  saveState(doFullSerialization) {
    const legacyState = this.saveLegacyState(FieldVariable);
    if (legacyState !== null) {
      return legacyState;
    }
    // Make sure the variable is initialized.
    this.initModel();
    const state = {'id': this.variable_.getId()};
    if (doFullSerialization) {
      state['name'] = this.variable_.name;
      state['type'] = this.variable_.type;
    }
    return state;
  }

  /**
   * Sets the field's value based on the given state.
   * @param {*} state The state of the variable to assign to this variable
   *     field.
   * @override
   * @package
   */
  loadState(state) {
    if (this.loadLegacyState(FieldVariable, state)) {
      return;
    }
    // This is necessary so that blocks in the flyout can have custom var names.
    const variable = Variables.getOrCreateVariablePackage(
        this.sourceBlock_.workspace, state['id'] || null, state['name'],
        state['type'] || '');
    this.setValue(variable.getId());
  }

  /**
   * Attach this field to a block.
   * @param {!Block} block The block containing this field.
   */
  setSourceBlock(block) {
    if (block.isShadow()) {
      throw Error('Variable fields are not allowed to exist on shadow blocks.');
    }
    super.setSourceBlock(block);
  }

  /**
   * Get the variable's ID.
   * @return {?string} Current variable's ID.
   */
  getValue() {
    return this.variable_ ? this.variable_.getId() : null;
  }

  /**
   * Get the text from this field, which is the selected variable's name.
   * @return {string} The selected variable's name, or the empty string if no
   *     variable is selected.
   */
  getText() {
    return this.variable_ ? this.variable_.name : '';
  }

  /**
   * Get the variable model for the selected variable.
   * Not guaranteed to be in the variable map on the workspace (e.g. if accessed
   * after the variable has been deleted).
   * @return {?VariableModel} The selected variable, or null if none was
   *     selected.
   * @package
   */
  getVariable() {
    return this.variable_;
  }

  /**
   * Gets the validation function for this field, or null if not set.
   * Returns null if the variable is not set, because validators should not
   * run on the initial setValue call, because the field won't be attached to
   * a block and workspace at that point.
   * @return {?Function} Validation function, or null.
   */
  getValidator() {
    // Validators shouldn't operate on the initial setValue call.
    // Normally this is achieved by calling setValidator after setValue, but
    // this is not a possibility with variable fields.
    if (this.variable_) {
      return this.validator_;
    }
    return null;
  }

  /**
   * Ensure that the ID belongs to a valid variable of an allowed type.
   * @param {*=} opt_newValue The ID of the new variable to set.
   * @return {?string} The validated ID, or null if invalid.
   * @protected
   */
  doClassValidation_(opt_newValue) {
    if (opt_newValue === null) {
      return null;
    }
    const newId = /** @type {string} */ (opt_newValue);
    const variable = Variables.getVariable(this.sourceBlock_.workspace, newId);
    if (!variable) {
      console.warn(
          'Variable id doesn\'t point to a real variable! ' +
          'ID was ' + newId);
      return null;
    }
    // Type Checks.
    const type = variable.type;
    if (!this.typeIsAllowed_(type)) {
      console.warn(
          'Variable type doesn\'t match this field!  Type was ' + type);
      return null;
    }
    return newId;
  }

  /**
   * Update the value of this variable field, as well as its variable and text.
   *
   * The variable ID should be valid at this point, but if a variable field
   * validator returns a bad ID, this could break.
   * @param {*} newId The value to be saved.
   * @protected
   */
  doValueUpdate_(newId) {
    this.variable_ = Variables.getVariable(
        this.sourceBlock_.workspace, /** @type {string} */ (newId));
    super.doValueUpdate_(newId);
  }

  /**
   * Check whether the given variable type is allowed on this field.
   * @param {string} type The type to check.
   * @return {boolean} True if the type is in the list of allowed types.
   * @private
   */
  typeIsAllowed_(type) {
    const typeList = this.getVariableTypes_();
    if (!typeList) {
      return true;  // If it's null, all types are valid.
    }
    for (let i = 0; i < typeList.length; i++) {
      if (type === typeList[i]) {
        return true;
      }
    }
    return false;
  }

  /**
   * Return a list of variable types to include in the dropdown.
   * @return {!Array<string>} Array of variable types.
   * @throws {Error} if variableTypes is an empty array.
   * @private
   */
  getVariableTypes_() {
    // TODO (#1513): Try to avoid calling this every time the field is edited.
    let variableTypes = this.variableTypes;
    if (variableTypes === null) {
      // If variableTypes is null, return all variable types.
      if (this.sourceBlock_ && this.sourceBlock_.workspace) {
        return this.sourceBlock_.workspace.getVariableTypes();
      }
    }
    variableTypes = variableTypes || [''];
    if (variableTypes.length === 0) {
      // Throw an error if variableTypes is an empty list.
      const name = this.getText();
      throw Error(
          '\'variableTypes\' of field variable ' + name + ' was an empty list');
    }
    return variableTypes;
  }

  /**
   * Parse the optional arguments representing the allowed variable types and
   * the default variable type.
   * @param {Array<string>=} opt_variableTypes A list of the types of variables
   *     to include in the dropdown.  If null or undefined, variables of all
   * types will be displayed in the dropdown.
   * @param {string=} opt_defaultType The type of the variable to create if this
   *     field's value is not explicitly set.  Defaults to ''.
   * @private
   */
  setTypes_(opt_variableTypes, opt_defaultType) {
    // If you expected that the default type would be the same as the only entry
    // in the variable types array, tell the Blockly team by commenting on
    // #1499.
    const defaultType = opt_defaultType || '';
    let variableTypes;
    // Set the allowable variable types.  Null means all types on the workspace.
    if (opt_variableTypes === null || opt_variableTypes === undefined) {
      variableTypes = null;
    } else if (Array.isArray(opt_variableTypes)) {
      variableTypes = opt_variableTypes;
      // Make sure the default type is valid.
      let isInArray = false;
      for (let i = 0; i < variableTypes.length; i++) {
        if (variableTypes[i] === defaultType) {
          isInArray = true;
        }
      }
      if (!isInArray) {
        throw Error(
            'Invalid default type \'' + defaultType + '\' in ' +
            'the definition of a FieldVariable');
      }
    } else {
      throw Error(
          '\'variableTypes\' was not an array in the definition of ' +
          'a FieldVariable');
    }
    // Only update the field once all checks pass.
    this.defaultType_ = defaultType;
    this.variableTypes = variableTypes;
  }

  /**
   * Refreshes the name of the variable by grabbing the name of the model.
   * Used when a variable gets renamed, but the ID stays the same. Should only
   * be called by the block.
   * @override
   * @package
   */
  refreshVariableName() {
    this.forceRerender();
  }

  /**
   * Handle the selection of an item in the variable dropdown menu.
   * Special case the 'Rename variable...' and 'Delete variable...' options.
   * In the rename case, prompt the user for a new name.
   * @param {!Menu} menu The Menu component clicked.
   * @param {!MenuItem} menuItem The MenuItem selected within menu.
   * @protected
   */
  onItemSelected_(menu, menuItem) {
    const id = menuItem.getValue();
    // Handle special cases.
    if (this.sourceBlock_ && this.sourceBlock_.workspace) {
      if (id === internalConstants.RENAME_VARIABLE_ID) {
        // Rename variable.
        Variables.renameVariable(
            this.sourceBlock_.workspace,
            /** @type {!VariableModel} */ (this.variable_));
        return;
      } else if (id === internalConstants.DELETE_VARIABLE_ID) {
        // Delete variable.
        this.sourceBlock_.workspace.deleteVariableById(this.variable_.getId());
        return;
      }
    }
    // Handle unspecial case.
    this.setValue(id);
  }

  /**
   * Overrides referencesVariables(), indicating this field refers to a
   * variable.
   * @return {boolean} True.
   * @package
   * @override
   */
  referencesVariables() {
    return true;
  }

  /**
   * Construct a FieldVariable from a JSON arg object,
   * dereferencing any string table references.
   * @param {!Object} options A JSON object with options (variable,
   *                          variableTypes, and defaultType).
   * @return {!FieldVariable} The new field instance.
   * @package
   * @nocollapse
   * @override
   */
  static fromJson(options) {
    const varName = parsing.replaceMessageReferences(options['variable']);
    // `this` might be a subclass of FieldVariable if that class doesn't
    // override the static fromJson method.
    return new this(varName, undefined, undefined, undefined, options);
  }

  /**
   * Return a sorted list of variable names for variable dropdown menus.
   * Include a special option at the end for creating a new variable name.
   * @return {!Array<!Array>} Array of variable names/id tuples.
   * @this {FieldVariable}
   */
  static dropdownCreate() {
    if (!this.variable_) {
      throw Error(
          'Tried to call dropdownCreate on a variable field with no' +
          ' variable selected.');
    }
    const name = this.getText();
    let variableModelList = [];
    if (this.sourceBlock_ && this.sourceBlock_.workspace) {
      const variableTypes = this.getVariableTypes_();
      // Get a copy of the list, so that adding rename and new variable options
      // doesn't modify the workspace's list.
      for (let i = 0; i < variableTypes.length; i++) {
        const variableType = variableTypes[i];
        const variables =
            this.sourceBlock_.workspace.getVariablesOfType(variableType);
        variableModelList = variableModelList.concat(variables);
      }
    }
    variableModelList.sort(VariableModel.compareByName);

    const options = [];
    for (let i = 0; i < variableModelList.length; i++) {
      // Set the UUID as the internal representation of the variable.
      options[i] = [variableModelList[i].name, variableModelList[i].getId()];
    }
    options.push(
        [Msg['RENAME_VARIABLE'], internalConstants.RENAME_VARIABLE_ID]);
    if (Msg['DELETE_VARIABLE']) {
      options.push([
        Msg['DELETE_VARIABLE'].replace('%1', name),
        internalConstants.DELETE_VARIABLE_ID,
      ]);
    }

    return options;
  }
}

fieldRegistry.register('field_variable', FieldVariable);

exports.FieldVariable = FieldVariable;
