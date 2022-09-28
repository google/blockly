/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Procedure blocks for Blockly.
 * @suppress {checkTypes|visibility}
 */
'use strict';

goog.module('Blockly.libraryBlocks.procedures');

/* eslint-disable-next-line no-unused-vars */
const AbstractEvent = goog.requireType('Blockly.Events.Abstract');
const ContextMenu = goog.require('Blockly.ContextMenu');
const Events = goog.require('Blockly.Events');
const Procedures = goog.require('Blockly.Procedures');
const Variables = goog.require('Blockly.Variables');
const Xml = goog.require('Blockly.Xml');
const xmlUtils = goog.require('Blockly.utils.xml');
const {Align} = goog.require('Blockly.Input');
/* eslint-disable-next-line no-unused-vars */
const {Block} = goog.requireType('Blockly.Block');
/* eslint-disable-next-line no-unused-vars */
const {BlockDefinition} = goog.requireType('Blockly.blocks');
const {config} = goog.require('Blockly.config');
/* eslint-disable-next-line no-unused-vars */
const {FieldCheckbox} = goog.require('Blockly.FieldCheckbox');
const {FieldLabel} = goog.require('Blockly.FieldLabel');
const {FieldTextInput} = goog.require('Blockly.FieldTextInput');
const {Msg} = goog.require('Blockly.Msg');
const {Mutator} = goog.require('Blockly.Mutator');
const {Names} = goog.require('Blockly.Names');
/* eslint-disable-next-line no-unused-vars */
const {VariableModel} = goog.requireType('Blockly.VariableModel');
/* eslint-disable-next-line no-unused-vars */
const {Workspace} = goog.requireType('Blockly.Workspace');
const {defineBlocks} = goog.require('Blockly.common');
/** @suppress {extraRequire} */
goog.require('Blockly.Comment');
/** @suppress {extraRequire} */
goog.require('Blockly.Warning');


/**
 * A dictionary of the block definitions provided by this module.
 * @type {!Object<string, !BlockDefinition>}
 */
const blocks = {};
exports.blocks = blocks;

/**
 * Common properties for the procedure_defnoreturn and
 * procedure_defreturn blocks.
 */
const PROCEDURE_DEF_COMMON = {
  /**
   * Add or remove the statement block from this function definition.
   * @param {boolean} hasStatements True if a statement block is needed.
   * @this {Block}
   */
  setStatements_: function(hasStatements) {
    if (this.hasStatements_ === hasStatements) {
      return;
    }
    if (hasStatements) {
      this.appendStatementInput('STACK').appendField(
          Msg['PROCEDURES_DEFNORETURN_DO']);
      if (this.getInput('RETURN')) {
        this.moveInputBefore('STACK', 'RETURN');
      }
    } else {
      this.removeInput('STACK', true);
    }
    this.hasStatements_ = hasStatements;
  },
  /**
   * Update the display of parameters for this procedure definition block.
   * @private
   * @this {Block}
   */
  updateParams_: function() {
    // Merge the arguments into a human-readable list.
    let paramString = '';
    if (this.arguments_.length) {
      paramString =
          Msg['PROCEDURES_BEFORE_PARAMS'] + ' ' + this.arguments_.join(', ');
    }
    // The params field is deterministic based on the mutation,
    // no need to fire a change event.
    Events.disable();
    try {
      this.setFieldValue(paramString, 'PARAMS');
    } finally {
      Events.enable();
    }
  },
  /**
   * Create XML to represent the argument inputs.
   * Backwards compatible serialization implementation.
   * @param {boolean=} opt_paramIds If true include the IDs of the parameter
   *     quarks.  Used by Procedures.mutateCallers for reconnection.
   * @return {!Element} XML storage element.
   * @this {Block}
   */
  mutationToDom: function(opt_paramIds) {
    const container = xmlUtils.createElement('mutation');
    if (opt_paramIds) {
      container.setAttribute('name', this.getFieldValue('NAME'));
    }
    for (let i = 0; i < this.argumentVarModels_.length; i++) {
      const parameter = xmlUtils.createElement('arg');
      const argModel = this.argumentVarModels_[i];
      parameter.setAttribute('name', argModel.name);
      parameter.setAttribute('varid', argModel.getId());
      if (opt_paramIds && this.paramIds_) {
        parameter.setAttribute('paramId', this.paramIds_[i]);
      }
      container.appendChild(parameter);
    }

    // Save whether the statement input is visible.
    if (!this.hasStatements_) {
      container.setAttribute('statements', 'false');
    }
    return container;
  },
  /**
   * Parse XML to restore the argument inputs.
   * Backwards compatible serialization implementation.
   * @param {!Element} xmlElement XML storage element.
   * @this {Block}
   */
  domToMutation: function(xmlElement) {
    this.arguments_ = [];
    this.argumentVarModels_ = [];
    for (let i = 0, childNode; (childNode = xmlElement.childNodes[i]); i++) {
      if (childNode.nodeName.toLowerCase() === 'arg') {
        const varName = childNode.getAttribute('name');
        const varId =
            childNode.getAttribute('varid') || childNode.getAttribute('varId');
        this.arguments_.push(varName);
        const variable = Variables.getOrCreateVariablePackage(
            this.workspace, varId, varName, '');
        if (variable !== null) {
          this.argumentVarModels_.push(variable);
        } else {
          console.log(
              'Failed to create a variable with name ' + varName +
              ', ignoring.');
        }
      }
    }
    this.updateParams_();
    Procedures.mutateCallers(this);

    // Show or hide the statement input.
    this.setStatements_(xmlElement.getAttribute('statements') !== 'false');
  },
  /**
   * Returns the state of this block as a JSON serializable object.
   * @return {?{params: (!Array<{name: string, id: string}>|undefined),
   *     hasStatements: (boolean|undefined)}} The state of this block, eg the
   *     parameters and statements.
   */
  saveExtraState: function() {
    if (!this.argumentVarModels_.length && this.hasStatements_) {
      return null;
    }
    const state = Object.create(null);
    if (this.argumentVarModels_.length) {
      state['params'] = [];
      for (let i = 0; i < this.argumentVarModels_.length; i++) {
        state['params'].push({
          // We don't need to serialize the name, but just in case we decide
          // to separate params from variables.
          'name': this.argumentVarModels_[i].name,
          'id': this.argumentVarModels_[i].getId(),
        });
      }
    }
    if (!this.hasStatements_) {
      state['hasStatements'] = false;
    }
    return state;
  },
  /**
   * Applies the given state to this block.
   * @param {*} state The state to apply to this block, eg the parameters and
   *     statements.
   */
  loadExtraState: function(state) {
    this.arguments_ = [];
    this.argumentVarModels_ = [];
    if (state['params']) {
      for (let i = 0; i < state['params'].length; i++) {
        const param = state['params'][i];
        const variable = Variables.getOrCreateVariablePackage(
            this.workspace, param['id'], param['name'], '');
        this.arguments_.push(variable.name);
        this.argumentVarModels_.push(variable);
      }
    }
    this.updateParams_();
    Procedures.mutateCallers(this);
    this.setStatements_(state['hasStatements'] === false ? false : true);
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Workspace} workspace Mutator's workspace.
   * @return {!Block} Root block in mutator.
   * @this {Block}
   */
  decompose: function(workspace) {
    /*
     * Creates the following XML:
     * <block type="procedures_mutatorcontainer">
     *   <statement name="STACK">
     *     <block type="procedures_mutatorarg">
     *       <field name="NAME">arg1_name</field>
     *       <next>etc...</next>
     *     </block>
     *   </statement>
     * </block>
     */

    const containerBlockNode = xmlUtils.createElement('block');
    containerBlockNode.setAttribute('type', 'procedures_mutatorcontainer');
    const statementNode = xmlUtils.createElement('statement');
    statementNode.setAttribute('name', 'STACK');
    containerBlockNode.appendChild(statementNode);

    let node = statementNode;
    for (let i = 0; i < this.arguments_.length; i++) {
      const argBlockNode = xmlUtils.createElement('block');
      argBlockNode.setAttribute('type', 'procedures_mutatorarg');
      const fieldNode = xmlUtils.createElement('field');
      fieldNode.setAttribute('name', 'NAME');
      const argumentName = xmlUtils.createTextNode(this.arguments_[i]);
      fieldNode.appendChild(argumentName);
      argBlockNode.appendChild(fieldNode);
      const nextNode = xmlUtils.createElement('next');
      argBlockNode.appendChild(nextNode);

      node.appendChild(argBlockNode);
      node = nextNode;
    }

    const containerBlock = Xml.domToBlock(containerBlockNode, workspace);

    if (this.type === 'procedures_defreturn') {
      containerBlock.setFieldValue(this.hasStatements_, 'STATEMENTS');
    } else {
      containerBlock.removeInput('STATEMENT_INPUT');
    }

    // Initialize procedure's callers with blank IDs.
    Procedures.mutateCallers(this);
    return containerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Block} containerBlock Root block in mutator.
   * @this {Block}
   */
  compose: function(containerBlock) {
    // Parameter list.
    this.arguments_ = [];
    this.paramIds_ = [];
    this.argumentVarModels_ = [];
    let paramBlock = containerBlock.getInputTargetBlock('STACK');
    while (paramBlock && !paramBlock.isInsertionMarker()) {
      const varName = paramBlock.getFieldValue('NAME');
      this.arguments_.push(varName);
      const variable = this.workspace.getVariable(varName, '');
      this.argumentVarModels_.push(variable);

      this.paramIds_.push(paramBlock.id);
      paramBlock =
          paramBlock.nextConnection && paramBlock.nextConnection.targetBlock();
    }
    this.updateParams_();
    Procedures.mutateCallers(this);

    // Show/hide the statement input.
    let hasStatements = containerBlock.getFieldValue('STATEMENTS');
    if (hasStatements !== null) {
      hasStatements = hasStatements === 'TRUE';
      if (this.hasStatements_ !== hasStatements) {
        if (hasStatements) {
          this.setStatements_(true);
          // Restore the stack, if one was saved.
          Mutator.reconnect(this.statementConnection_, this, 'STACK');
          this.statementConnection_ = null;
        } else {
          // Save the stack, then disconnect it.
          const stackConnection = this.getInput('STACK').connection;
          this.statementConnection_ = stackConnection.targetConnection;
          if (this.statementConnection_) {
            const stackBlock = stackConnection.targetBlock();
            stackBlock.unplug();
            stackBlock.bumpNeighbours();
          }
          this.setStatements_(false);
        }
      }
    }
  },
  /**
   * Return all variables referenced by this block.
   * @return {!Array<string>} List of variable names.
   * @this {Block}
   */
  getVars: function() {
    return this.arguments_;
  },
  /**
   * Return all variables referenced by this block.
   * @return {!Array<!VariableModel>} List of variable models.
   * @this {Block}
   */
  getVarModels: function() {
    return this.argumentVarModels_;
  },
  /**
   * Notification that a variable is renaming.
   * If the ID matches one of this block's variables, rename it.
   * @param {string} oldId ID of variable to rename.
   * @param {string} newId ID of new variable.  May be the same as oldId, but
   *     with an updated name.  Guaranteed to be the same type as the old
   *     variable.
   * @override
   * @this {Block}
   */
  renameVarById: function(oldId, newId) {
    const oldVariable = this.workspace.getVariableById(oldId);
    if (oldVariable.type !== '') {
      // Procedure arguments always have the empty type.
      return;
    }
    const oldName = oldVariable.name;
    const newVar = this.workspace.getVariableById(newId);

    let change = false;
    for (let i = 0; i < this.argumentVarModels_.length; i++) {
      if (this.argumentVarModels_[i].getId() === oldId) {
        this.arguments_[i] = newVar.name;
        this.argumentVarModels_[i] = newVar;
        change = true;
      }
    }
    if (change) {
      this.displayRenamedVar_(oldName, newVar.name);
      Procedures.mutateCallers(this);
    }
  },
  /**
   * Notification that a variable is renaming but keeping the same ID.  If the
   * variable is in use on this block, rerender to show the new name.
   * @param {!VariableModel} variable The variable being renamed.
   * @package
   * @override
   * @this {Block}
   */
  updateVarName: function(variable) {
    const newName = variable.name;
    let change = false;
    let oldName;
    for (let i = 0; i < this.argumentVarModels_.length; i++) {
      if (this.argumentVarModels_[i].getId() === variable.getId()) {
        oldName = this.arguments_[i];
        this.arguments_[i] = newName;
        change = true;
      }
    }
    if (change) {
      this.displayRenamedVar_(oldName, newName);
      Procedures.mutateCallers(this);
    }
  },
  /**
   * Update the display to reflect a newly renamed argument.
   * @param {string} oldName The old display name of the argument.
   * @param {string} newName The new display name of the argument.
   * @private
   * @this {Block}
   */
  displayRenamedVar_: function(oldName, newName) {
    this.updateParams_();
    // Update the mutator's variables if the mutator is open.
    if (this.mutator && this.mutator.isVisible()) {
      const blocks = this.mutator.workspace_.getAllBlocks(false);
      for (let i = 0, block; (block = blocks[i]); i++) {
        if (block.type === 'procedures_mutatorarg' &&
            Names.equals(oldName, block.getFieldValue('NAME'))) {
          block.setFieldValue(newName, 'NAME');
        }
      }
    }
  },
  /**
   * Add custom menu options to this block's context menu.
   * @param {!Array} options List of menu options to add to.
   * @this {Block}
   */
  customContextMenu: function(options) {
    if (this.isInFlyout) {
      return;
    }
    // Add option to create caller.
    const option = {enabled: true};
    const name = this.getFieldValue('NAME');
    option.text = Msg['PROCEDURES_CREATE_DO'].replace('%1', name);
    const xmlMutation = xmlUtils.createElement('mutation');
    xmlMutation.setAttribute('name', name);
    for (let i = 0; i < this.arguments_.length; i++) {
      const xmlArg = xmlUtils.createElement('arg');
      xmlArg.setAttribute('name', this.arguments_[i]);
      xmlMutation.appendChild(xmlArg);
    }
    const xmlBlock = xmlUtils.createElement('block');
    xmlBlock.setAttribute('type', this.callType_);
    xmlBlock.appendChild(xmlMutation);
    option.callback = ContextMenu.callbackFactory(this, xmlBlock);
    options.push(option);

    // Add options to create getters for each parameter.
    if (!this.isCollapsed()) {
      for (let i = 0; i < this.argumentVarModels_.length; i++) {
        const argOption = {enabled: true};
        const argVar = this.argumentVarModels_[i];
        argOption.text =
            Msg['VARIABLES_SET_CREATE_GET'].replace('%1', argVar.name);

        const argXmlField = Variables.generateVariableFieldDom(argVar);
        const argXmlBlock = xmlUtils.createElement('block');
        argXmlBlock.setAttribute('type', 'variables_get');
        argXmlBlock.appendChild(argXmlField);
        argOption.callback = ContextMenu.callbackFactory(this, argXmlBlock);
        options.push(argOption);
      }
    }
  },
};

blocks['procedures_defnoreturn'] = {
  ...PROCEDURE_DEF_COMMON,
  /**
   * Block for defining a procedure with no return value.
   * @this {Block}
   */
  init: function() {
    const initName = Procedures.findLegalName('', this);
    const nameField = new FieldTextInput(initName, Procedures.rename);
    nameField.setSpellcheck(false);
    this.appendDummyInput()
        .appendField(Msg['PROCEDURES_DEFNORETURN_TITLE'])
        .appendField(nameField, 'NAME')
        .appendField('', 'PARAMS');
    this.setMutator(new Mutator(['procedures_mutatorarg']));
    if ((this.workspace.options.comments ||
         (this.workspace.options.parentWorkspace &&
          this.workspace.options.parentWorkspace.options.comments)) &&
        Msg['PROCEDURES_DEFNORETURN_COMMENT']) {
      this.setCommentText(Msg['PROCEDURES_DEFNORETURN_COMMENT']);
    }
    this.setStyle('procedure_blocks');
    this.setTooltip(Msg['PROCEDURES_DEFNORETURN_TOOLTIP']);
    this.setHelpUrl(Msg['PROCEDURES_DEFNORETURN_HELPURL']);
    this.arguments_ = [];
    this.argumentVarModels_ = [];
    this.setStatements_(true);
    this.statementConnection_ = null;
  },
  /**
   * Return the signature of this procedure definition.
   * @return {!Array} Tuple containing three elements:
   *     - the name of the defined procedure,
   *     - a list of all its arguments,
   *     - that it DOES NOT have a return value.
   * @this {Block}
   */
  getProcedureDef: function() {
    return [this.getFieldValue('NAME'), this.arguments_, false];
  },
  callType_: 'procedures_callnoreturn',
};

blocks['procedures_defreturn'] = {
  ...PROCEDURE_DEF_COMMON,
  /**
   * Block for defining a procedure with a return value.
   * @this {Block}
   */
  init: function() {
    const initName = Procedures.findLegalName('', this);
    const nameField = new FieldTextInput(initName, Procedures.rename);
    nameField.setSpellcheck(false);
    this.appendDummyInput()
        .appendField(Msg['PROCEDURES_DEFRETURN_TITLE'])
        .appendField(nameField, 'NAME')
        .appendField('', 'PARAMS');
    this.appendValueInput('RETURN')
        .setAlign(Align.RIGHT)
        .appendField(Msg['PROCEDURES_DEFRETURN_RETURN']);
    this.setMutator(new Mutator(['procedures_mutatorarg']));
    if ((this.workspace.options.comments ||
         (this.workspace.options.parentWorkspace &&
          this.workspace.options.parentWorkspace.options.comments)) &&
        Msg['PROCEDURES_DEFRETURN_COMMENT']) {
      this.setCommentText(Msg['PROCEDURES_DEFRETURN_COMMENT']);
    }
    this.setStyle('procedure_blocks');
    this.setTooltip(Msg['PROCEDURES_DEFRETURN_TOOLTIP']);
    this.setHelpUrl(Msg['PROCEDURES_DEFRETURN_HELPURL']);
    this.arguments_ = [];
    this.argumentVarModels_ = [];
    this.setStatements_(true);
    this.statementConnection_ = null;
  },
  /**
   * Return the signature of this procedure definition.
   * @return {!Array} Tuple containing three elements:
   *     - the name of the defined procedure,
   *     - a list of all its arguments,
   *     - that it DOES have a return value.
   * @this {Block}
   */
  getProcedureDef: function() {
    return [this.getFieldValue('NAME'), this.arguments_, true];
  },
  callType_: 'procedures_callreturn',
};

blocks['procedures_mutatorcontainer'] = {
  /**
   * Mutator block for procedure container.
   * @this {Block}
   */
  init: function() {
    this.appendDummyInput().appendField(
        Msg['PROCEDURES_MUTATORCONTAINER_TITLE']);
    this.appendStatementInput('STACK');
    this.appendDummyInput('STATEMENT_INPUT')
        .appendField(Msg['PROCEDURES_ALLOW_STATEMENTS'])
        .appendField(new FieldCheckbox('TRUE'), 'STATEMENTS');
    this.setStyle('procedure_blocks');
    this.setTooltip(Msg['PROCEDURES_MUTATORCONTAINER_TOOLTIP']);
    this.contextMenu = false;
  },
};

blocks['procedures_mutatorarg'] = {
  /**
   * Mutator block for procedure argument.
   * @this {Block}
   */
  init: function() {
    const field = new FieldTextInput(Procedures.DEFAULT_ARG, this.validator_);
    // Hack: override showEditor to do just a little bit more work.
    // We don't have a good place to hook into the start of a text edit.
    field.oldShowEditorFn_ = field.showEditor_;
    /**
     * @this {FieldTextInput}
     */
    const newShowEditorFn = function() {
      this.createdVariables_ = [];
      this.oldShowEditorFn_();
    };
    field.showEditor_ = newShowEditorFn;

    this.appendDummyInput()
        .appendField(Msg['PROCEDURES_MUTATORARG_TITLE'])
        .appendField(field, 'NAME');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setStyle('procedure_blocks');
    this.setTooltip(Msg['PROCEDURES_MUTATORARG_TOOLTIP']);
    this.contextMenu = false;

    // Create the default variable when we drag the block in from the flyout.
    // Have to do this after installing the field on the block.
    field.onFinishEditing_ = this.deleteIntermediateVars_;
    // Create an empty list so onFinishEditing_ has something to look at, even
    // though the editor was never opened.
    field.createdVariables_ = [];
    field.onFinishEditing_('x');
  },

  /**
   * Obtain a valid name for the procedure argument. Create a variable if
   * necessary.
   * Merge runs of whitespace.  Strip leading and trailing whitespace.
   * Beyond this, all names are legal.
   * @param {string} varName User-supplied name.
   * @return {?string} Valid name, or null if a name was not specified.
   * @private
   * @this {FieldTextInput}
   */
  validator_: function(varName) {
    const sourceBlock = this.getSourceBlock();
    const outerWs = Mutator.findParentWs(sourceBlock.workspace);
    varName = varName.replace(/[\s\xa0]+/g, ' ').replace(/^ | $/g, '');
    if (!varName) {
      return null;
    }

    // Prevents duplicate parameter names in functions
    const workspace =
        sourceBlock.workspace.targetWorkspace || sourceBlock.workspace;
    const blocks = workspace.getAllBlocks(false);
    const caselessName = varName.toLowerCase();
    for (let i = 0; i < blocks.length; i++) {
      if (blocks[i].id === this.getSourceBlock().id) {
        continue;
      }
      // Other blocks values may not be set yet when this is loaded.
      const otherVar = blocks[i].getFieldValue('NAME');
      if (otherVar && otherVar.toLowerCase() === caselessName) {
        return null;
      }
    }

    // Don't create variables for arg blocks that
    // only exist in the mutator's flyout.
    if (sourceBlock.isInFlyout) {
      return varName;
    }

    let model = outerWs.getVariable(varName, '');
    if (model && model.name !== varName) {
      // Rename the variable (case change)
      outerWs.renameVariableById(model.getId(), varName);
    }
    if (!model) {
      model = outerWs.createVariable(varName, '');
      if (model && this.createdVariables_) {
        this.createdVariables_.push(model);
      }
    }
    return varName;
  },

  /**
   * Called when focusing away from the text field.
   * Deletes all variables that were created as the user typed their intended
   * variable name.
   * @param {string} newText The new variable name.
   * @private
   * @this {FieldTextInput}
   */
  deleteIntermediateVars_: function(newText) {
    const outerWs = Mutator.findParentWs(this.getSourceBlock().workspace);
    if (!outerWs) {
      return;
    }
    for (let i = 0; i < this.createdVariables_.length; i++) {
      const model = this.createdVariables_[i];
      if (model.name !== newText) {
        outerWs.deleteVariableById(model.getId());
      }
    }
  },
};

/**
 * Common properties for the procedure_callnoreturn and
 * procedure_callreturn blocks.
 */
const PROCEDURE_CALL_COMMON = {
  /**
   * Returns the name of the procedure this block calls.
   * @return {string} Procedure name.
   * @this {Block}
   */
  getProcedureCall: function() {
    // The NAME field is guaranteed to exist, null will never be returned.
    return /** @type {string} */ (this.getFieldValue('NAME'));
  },
  /**
   * Notification that a procedure is renaming.
   * If the name matches this block's procedure, rename it.
   * @param {string} oldName Previous name of procedure.
   * @param {string} newName Renamed procedure.
   * @this {Block}
   */
  renameProcedure: function(oldName, newName) {
    if (Names.equals(oldName, this.getProcedureCall())) {
      this.setFieldValue(newName, 'NAME');
      const baseMsg = this.outputConnection ?
          Msg['PROCEDURES_CALLRETURN_TOOLTIP'] :
          Msg['PROCEDURES_CALLNORETURN_TOOLTIP'];
      this.setTooltip(baseMsg.replace('%1', newName));
    }
  },
  /**
   * Notification that the procedure's parameters have changed.
   * @param {!Array<string>} paramNames New param names, e.g. ['x', 'y', 'z'].
   * @param {!Array<string>} paramIds IDs of params (consistent for each
   *     parameter through the life of a mutator, regardless of param renaming),
   *     e.g. ['piua', 'f8b_', 'oi.o'].
   * @private
   * @this {Block}
   */
  setProcedureParameters_: function(paramNames, paramIds) {
    // Data structures:
    // this.arguments = ['x', 'y']
    //     Existing param names.
    // this.quarkConnections_ {piua: null, f8b_: Connection}
    //     Look-up of paramIds to connections plugged into the call block.
    // this.quarkIds_ = ['piua', 'f8b_']
    //     Existing param IDs.
    // Note that quarkConnections_ may include IDs that no longer exist, but
    // which might reappear if a param is reattached in the mutator.
    const defBlock =
        Procedures.getDefinition(this.getProcedureCall(), this.workspace);
    const mutatorOpen =
        defBlock && defBlock.mutator && defBlock.mutator.isVisible();
    if (!mutatorOpen) {
      this.quarkConnections_ = {};
      this.quarkIds_ = null;
    } else {
      // fix #6091 - this call could cause an error when outside if-else
      // expanding block while mutating prevents another error (ancient fix)
      this.setCollapsed(false);
    }
    // Test arguments (arrays of strings) for changes. '\n' is not a valid
    // argument name character, so it is a valid delimiter here.
    if (paramNames.join('\n') === this.arguments_.join('\n')) {
      // No change.
      this.quarkIds_ = paramIds;
      return;
    }
    if (paramIds.length !== paramNames.length) {
      throw RangeError('paramNames and paramIds must be the same length.');
    }
    if (!this.quarkIds_) {
      // Initialize tracking for this block.
      this.quarkConnections_ = {};
      this.quarkIds_ = [];
    }
    // Switch off rendering while the block is rebuilt.
    const savedRendered = this.rendered;
    this.rendered = false;
    // Update the quarkConnections_ with existing connections.
    for (let i = 0; i < this.arguments_.length; i++) {
      const input = this.getInput('ARG' + i);
      if (input) {
        const connection = input.connection.targetConnection;
        this.quarkConnections_[this.quarkIds_[i]] = connection;
        if (mutatorOpen && connection &&
            paramIds.indexOf(this.quarkIds_[i]) === -1) {
          // This connection should no longer be attached to this block.
          connection.disconnect();
          connection.getSourceBlock().bumpNeighbours();
        }
      }
    }
    // Rebuild the block's arguments.
    this.arguments_ = [].concat(paramNames);
    // And rebuild the argument model list.
    this.argumentVarModels_ = [];
    for (let i = 0; i < this.arguments_.length; i++) {
      const variable = Variables.getOrCreateVariablePackage(
          this.workspace, null, this.arguments_[i], '');
      this.argumentVarModels_.push(variable);
    }

    this.updateShape_();
    this.quarkIds_ = paramIds;
    // Reconnect any child blocks.
    if (this.quarkIds_) {
      for (let i = 0; i < this.arguments_.length; i++) {
        const quarkId = this.quarkIds_[i];
        if (quarkId in this.quarkConnections_) {
          const connection = this.quarkConnections_[quarkId];
          if (!Mutator.reconnect(connection, this, 'ARG' + i)) {
            // Block no longer exists or has been attached elsewhere.
            delete this.quarkConnections_[quarkId];
          }
        }
      }
    }
    // Restore rendering and show the changes.
    this.rendered = savedRendered;
    if (this.rendered) {
      this.render();
    }
  },
  /**
   * Modify this block to have the correct number of arguments.
   * @private
   * @this {Block}
   */
  updateShape_: function() {
    for (let i = 0; i < this.arguments_.length; i++) {
      const argField = this.getField('ARGNAME' + i);
      if (argField) {
        // Ensure argument name is up to date.
        // The argument name field is deterministic based on the mutation,
        // no need to fire a change event.
        Events.disable();
        try {
          argField.setValue(this.arguments_[i]);
        } finally {
          Events.enable();
        }
      } else {
        // Add new input.
        const newField = new FieldLabel(this.arguments_[i]);
        const input = this.appendValueInput('ARG' + i)
                          .setAlign(Align.RIGHT)
                          .appendField(newField, 'ARGNAME' + i);
        input.init();
      }
    }
    // Remove deleted inputs.
    for (let i = this.arguments_.length; this.getInput('ARG' + i); i++) {
      this.removeInput('ARG' + i);
    }
    // Add 'with:' if there are parameters, remove otherwise.
    const topRow = this.getInput('TOPROW');
    if (topRow) {
      if (this.arguments_.length) {
        if (!this.getField('WITH')) {
          topRow.appendField(Msg['PROCEDURES_CALL_BEFORE_PARAMS'], 'WITH');
          topRow.init();
        }
      } else {
        if (this.getField('WITH')) {
          topRow.removeField('WITH');
        }
      }
    }
  },
  /**
   * Create XML to represent the (non-editable) name and arguments.
   * Backwards compatible serialization implementation.
   * @return {!Element} XML storage element.
   * @this {Block}
   */
  mutationToDom: function() {
    const container = xmlUtils.createElement('mutation');
    container.setAttribute('name', this.getProcedureCall());
    for (let i = 0; i < this.arguments_.length; i++) {
      const parameter = xmlUtils.createElement('arg');
      parameter.setAttribute('name', this.arguments_[i]);
      container.appendChild(parameter);
    }
    return container;
  },
  /**
   * Parse XML to restore the (non-editable) name and parameters.
   * Backwards compatible serialization implementation.
   * @param {!Element} xmlElement XML storage element.
   * @this {Block}
   */
  domToMutation: function(xmlElement) {
    const name = xmlElement.getAttribute('name');
    this.renameProcedure(this.getProcedureCall(), name);
    const args = [];
    const paramIds = [];
    for (let i = 0, childNode; (childNode = xmlElement.childNodes[i]); i++) {
      if (childNode.nodeName.toLowerCase() === 'arg') {
        args.push(childNode.getAttribute('name'));
        paramIds.push(childNode.getAttribute('paramId'));
      }
    }
    this.setProcedureParameters_(args, paramIds);
  },
  /**
   * Returns the state of this block as a JSON serializable object.
   * @return {{name: string, params:(!Array<string>|undefined)}} The state of
   *     this block, ie the params and procedure name.
   */
  saveExtraState: function() {
    const state = Object.create(null);
    state['name'] = this.getProcedureCall();
    if (this.arguments_.length) {
      state['params'] = this.arguments_;
    }
    return state;
  },
  /**
   * Applies the given state to this block.
   * @param {*} state The state to apply to this block, ie the params and
   *     procedure name.
   */
  loadExtraState: function(state) {
    this.renameProcedure(this.getProcedureCall(), state['name']);
    const params = state['params'];
    if (params) {
      const ids = [];
      ids.length = params.length;
      ids.fill(null);
      this.setProcedureParameters_(params, ids);
    }
  },
  /**
   * Return all variables referenced by this block.
   * @return {!Array<string>} List of variable names.
   * @this {Block}
   */
  getVars: function() {
    return this.arguments_;
  },
  /**
   * Return all variables referenced by this block.
   * @return {!Array<!VariableModel>} List of variable models.
   * @this {Block}
   */
  getVarModels: function() {
    return this.argumentVarModels_;
  },
  /**
   * Procedure calls cannot exist without the corresponding procedure
   * definition.  Enforce this link whenever an event is fired.
   * @param {!AbstractEvent} event Change event.
   * @this {Block}
   */
  onchange: function(event) {
    if (!this.workspace || this.workspace.isFlyout) {
      // Block is deleted or is in a flyout.
      return;
    }
    if (!event.recordUndo) {
      // Events not generated by user. Skip handling.
      return;
    }
    if (event.type === Events.BLOCK_CREATE &&
        event.ids.indexOf(this.id) !== -1) {
      // Look for the case where a procedure call was created (usually through
      // paste) and there is no matching definition.  In this case, create
      // an empty definition block with the correct signature.
      const name = this.getProcedureCall();
      let def = Procedures.getDefinition(name, this.workspace);
      if (def &&
          (def.type !== this.defType_ ||
           JSON.stringify(def.getVars()) !== JSON.stringify(this.arguments_))) {
        // The signatures don't match.
        def = null;
      }
      if (!def) {
        Events.setGroup(event.group);
        /**
         * Create matching definition block.
         * <xml xmlns="https://developers.google.com/blockly/xml">
         *   <block type="procedures_defreturn" x="10" y="20">
         *     <mutation name="test">
         *       <arg name="x"></arg>
         *     </mutation>
         *     <field name="NAME">test</field>
         *   </block>
         * </xml>
         */
        const xml = xmlUtils.createElement('xml');
        const block = xmlUtils.createElement('block');
        block.setAttribute('type', this.defType_);
        const xy = this.getRelativeToSurfaceXY();
        const x = xy.x + config.snapRadius * (this.RTL ? -1 : 1);
        const y = xy.y + config.snapRadius * 2;
        block.setAttribute('x', x);
        block.setAttribute('y', y);
        const mutation = this.mutationToDom();
        block.appendChild(mutation);
        const field = xmlUtils.createElement('field');
        field.setAttribute('name', 'NAME');
        const callName = this.getProcedureCall();
        const newName = Procedures.findLegalName(callName, this);
        if (callName !== newName) {
          this.renameProcedure(callName, newName);
        }
        field.appendChild(xmlUtils.createTextNode(callName));
        block.appendChild(field);
        xml.appendChild(block);
        Xml.domToWorkspace(xml, this.workspace);
        Events.setGroup(false);
      }
    } else if (event.type === Events.BLOCK_DELETE) {
      // Look for the case where a procedure definition has been deleted,
      // leaving this block (a procedure call) orphaned.  In this case, delete
      // the orphan.
      const name = this.getProcedureCall();
      const def = Procedures.getDefinition(name, this.workspace);
      if (!def) {
        Events.setGroup(event.group);
        this.dispose(true);
        Events.setGroup(false);
      }
    } else if (event.type === Events.CHANGE && event.element === 'disabled') {
      const name = this.getProcedureCall();
      const def = Procedures.getDefinition(name, this.workspace);
      if (def && def.id === event.blockId) {
        // in most cases the old group should be ''
        const oldGroup = Events.getGroup();
        if (oldGroup) {
          // This should only be possible programmatically and may indicate a
          // problem with event grouping. If you see this message please
          // investigate. If the use ends up being valid we may need to reorder
          // events in the undo stack.
          console.log(
              'Saw an existing group while responding to a definition change');
        }
        Events.setGroup(event.group);
        if (event.newValue) {
          this.previousEnabledState_ = this.isEnabled();
          this.setEnabled(false);
        } else {
          this.setEnabled(this.previousEnabledState_);
        }
        Events.setGroup(oldGroup);
      }
    }
  },
  /**
   * Add menu option to find the definition block for this call.
   * @param {!Array} options List of menu options to add to.
   * @this {Block}
   */
  customContextMenu: function(options) {
    if (!this.workspace.isMovable()) {
      // If we center on the block and the workspace isn't movable we could
      // loose blocks at the edges of the workspace.
      return;
    }

    const option = {enabled: true};
    option.text = Msg['PROCEDURES_HIGHLIGHT_DEF'];
    const name = this.getProcedureCall();
    const workspace = this.workspace;
    option.callback = function() {
      const def = Procedures.getDefinition(name, workspace);
      if (def) {
        workspace.centerOnBlock(def.id);
        def.select();
      }
    };
    options.push(option);
  },
};

blocks['procedures_callnoreturn'] = {
  ...PROCEDURE_CALL_COMMON,
  /**
   * Block for calling a procedure with no return value.
   * @this {Block}
   */
  init: function() {
    this.appendDummyInput('TOPROW').appendField('', 'NAME');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setStyle('procedure_blocks');
    // Tooltip is set in renameProcedure.
    this.setHelpUrl(Msg['PROCEDURES_CALLNORETURN_HELPURL']);
    this.arguments_ = [];
    this.argumentVarModels_ = [];
    this.quarkConnections_ = {};
    this.quarkIds_ = null;
    this.previousEnabledState_ = true;
  },

  defType_: 'procedures_defnoreturn',
};

blocks['procedures_callreturn'] = {
  ...PROCEDURE_CALL_COMMON,
  /**
   * Block for calling a procedure with a return value.
   * @this {Block}
   */
  init: function() {
    this.appendDummyInput('TOPROW').appendField('', 'NAME');
    this.setOutput(true);
    this.setStyle('procedure_blocks');
    // Tooltip is set in domToMutation.
    this.setHelpUrl(Msg['PROCEDURES_CALLRETURN_HELPURL']);
    this.arguments_ = [];
    this.argumentVarModels_ = [];
    this.quarkConnections_ = {};
    this.quarkIds_ = null;
    this.previousEnabledState_ = true;
  },

  defType_: 'procedures_defreturn',
};

blocks['procedures_ifreturn'] = {
  /**
   * Block for conditionally returning a value from a procedure.
   * @this {Block}
   */
  init: function() {
    this.appendValueInput('CONDITION')
        .setCheck('Boolean')
        .appendField(Msg['CONTROLS_IF_MSG_IF']);
    this.appendValueInput('VALUE').appendField(
        Msg['PROCEDURES_DEFRETURN_RETURN']);
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setStyle('procedure_blocks');
    this.setTooltip(Msg['PROCEDURES_IFRETURN_TOOLTIP']);
    this.setHelpUrl(Msg['PROCEDURES_IFRETURN_HELPURL']);
    this.hasReturnValue_ = true;
  },
  /**
   * Create XML to represent whether this block has a return value.
   * @return {!Element} XML storage element.
   * @this {Block}
   */
  mutationToDom: function() {
    const container = xmlUtils.createElement('mutation');
    container.setAttribute('value', Number(this.hasReturnValue_));
    return container;
  },
  /**
   * Parse XML to restore whether this block has a return value.
   * @param {!Element} xmlElement XML storage element.
   * @this {Block}
   */
  domToMutation: function(xmlElement) {
    const value = xmlElement.getAttribute('value');
    this.hasReturnValue_ = (value === '1');
    if (!this.hasReturnValue_) {
      this.removeInput('VALUE');
      this.appendDummyInput('VALUE').appendField(
          Msg['PROCEDURES_DEFRETURN_RETURN']);
    }
  },

  // This block does not need JSO serialization hooks (saveExtraState and
  // loadExtraState) because the state of this block is already encoded in the
  // block's position in the workspace.
  // XML hooks are kept for backwards compatibility.

  /**
   * Called whenever anything on the workspace changes.
   * Add warning if this flow block is not nested inside a loop.
   * @param {!AbstractEvent} e Move event.
   * @this {Block}
   */
  onchange: function(e) {
    if (this.workspace.isDragging && this.workspace.isDragging() ||
        e.type !== Events.BLOCK_MOVE) {
      return;  // Don't change state at the start of a drag.
    }
    let legal = false;
    // Is the block nested in a procedure?
    let block = this;
    do {
      if (this.FUNCTION_TYPES.indexOf(block.type) !== -1) {
        legal = true;
        break;
      }
      block = block.getSurroundParent();
    } while (block);
    if (legal) {
      // If needed, toggle whether this block has a return value.
      if (block.type === 'procedures_defnoreturn' && this.hasReturnValue_) {
        this.removeInput('VALUE');
        this.appendDummyInput('VALUE').appendField(
            Msg['PROCEDURES_DEFRETURN_RETURN']);
        this.hasReturnValue_ = false;
      } else if (
          block.type === 'procedures_defreturn' && !this.hasReturnValue_) {
        this.removeInput('VALUE');
        this.appendValueInput('VALUE').appendField(
            Msg['PROCEDURES_DEFRETURN_RETURN']);
        this.hasReturnValue_ = true;
      }
      this.setWarningText(null);
    } else {
      this.setWarningText(Msg['PROCEDURES_IFRETURN_WARNING']);
    }
    if (!this.isInFlyout) {
      const group = Events.getGroup();
      // Makes it so the move and the disable event get undone together.
      Events.setGroup(e.group);
      this.setEnabled(legal);
      Events.setGroup(group);
    }
  },
  /**
   * List of block types that are functions and thus do not need warnings.
   * To add a new function type add this to your code:
   * Blocks['procedures_ifreturn'].FUNCTION_TYPES.push('custom_func');
   */
  FUNCTION_TYPES: ['procedures_defnoreturn', 'procedures_defreturn'],
};

// Register provided blocks.
defineBlocks(blocks);
