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
const Extensions = goog.require('Blockly.Extensions');
const Procedures = goog.require('Blockly.Procedures');
const Variables = goog.require('Blockly.Variables');
const xmlUtils = goog.require('Blockly.utils.xml');
const {Align} = goog.require('Blockly.Input');
/* eslint-disable-next-line no-unused-vars */
const {Block} = goog.requireType('Blockly.Block');
// const {BlockDefinition} = goog.requireType('Blockly.blocks');
// TODO (6248): Properly import the BlockDefinition type.
/* eslint-disable-next-line no-unused-vars */
const BlockDefinition = Object;
const {ObservableProcedureModel} = goog.require('Blockly.procedures.ObservableProcedureModel');
const {ObservableParameterModel} = goog.require('Blockly.procedures.ObservableParameterModel');
const {config} = goog.require('Blockly.config');
/* eslint-disable-next-line no-unused-vars */
const {FieldLabel} = goog.require('Blockly.FieldLabel');
const {Msg} = goog.require('Blockly.Msg');
const {Mutator} = goog.require('Blockly.Mutator');
const {Names} = goog.require('Blockly.Names');
const serialization = goog.require('Blockly.serialization');
const {triggerProceduresUpdate} = goog.require('Blockly.procedures.updateProcedures');
/* eslint-disable-next-line no-unused-vars */
const {VariableModel} = goog.requireType('Blockly.VariableModel');
/* eslint-disable-next-line no-unused-vars */
const {Workspace} = goog.requireType('Blockly.Workspace');
const {createBlockDefinitionsFromJsonArray, defineBlocks} = goog.require('Blockly.common');
/** @suppress {extraRequire} */
goog.require('Blockly.Comment');
/** @suppress {extraRequire} */
goog.require('Blockly.Warning');


/**
 * A dictionary of the block definitions provided by this module.
 * @type {!Object<string, !BlockDefinition>}
 */
const blocks = createBlockDefinitionsFromJsonArray([
  {
    'type': 'procedures_defnoreturn',
    'message0': '%{BKY_PROCEDURES_DEFNORETURN_TITLE} %1 %2 %3',
    'message1': '%{BKY_PROCEDURES_DEFNORETURN_DO} %1',
    'args0': [
      {
        'type': 'field_input',
        'name': 'NAME',
        'text': '',
        'spellcheck': false,
      },
      {
        'type': 'field_label',
        'name': 'PARAMS',
        'text': '',
      },
      {
        'type': 'input_dummy',
        'name': 'TOP',
      },
    ],
    'args1': [
      {
        'type': 'input_statement',
        'name': 'STACK',
      },
    ],
    'style': 'procedure_blocks',
    'helpUrl': '%{BKY_PROCEDURES_DEFNORETURN_HELPURL}',
    'tooltip': '%{BKY_PROCEDURES_DEFNORETURN_TOOLTIP}',
    'extensions': [
      'procedure_def_get_def_mixin',
      'procedure_def_var_mixin',
      'procedure_def_update_shape_mixin',
      'procedure_def_context_menu_mixin',
      'procedure_def_onchange_mixin',
      'procedure_def_validator_helper',
      'procedure_defnoreturn_get_caller_block_mixin',
      'procedure_defnoreturn_set_comment_helper',
      'procedure_def_set_no_return_helper',
    ],
    'mutator': 'procedure_def_mutator',
  },
  {
    'type': 'procedures_callnoreturn',
    'message0': '%1 %2',
    'args0': [
      {'type': 'field_label', 'name': 'NAME', 'text': '%{BKY_UNNAMED_KEY}'},
      {
        'type': 'input_dummy',
        'name': 'TOPROW',
      },
    ],
    'nextStatement': null,
    'previousStatement': null,
    'style': 'procedure_blocks',
    'helpUrl': '%{BKY_PROCEDURES_CALLNORETURN_HELPURL}',
    'extensions': [
      'procedure_caller_get_def_mixin',
      'procedure_caller_update_shape_mixin',
      'procedure_caller_context_menu_mixin',
      'procedure_callernoreturn_get_def_block_mixin',
    ],
    'mutator': 'procedure_caller_mutator',
  },
  {
    'type': 'procedures_defreturn',
    'message0': '%{BKY_PROCEDURES_DEFRETURN_TITLE} %1 %2 %3',
    'message1': '%{BKY_PROCEDURES_DEFRETURN_DO} %1',
    'message2': '%{BKY_PROCEDURES_DEFRETURN_RETURN} %1',
    'args0': [
      {
        'type': 'field_input',
        'name': 'NAME',
        'text': '',
        'spellcheck': false,
      },
      {
        'type': 'field_label',
        'name': 'PARAMS',
        'text': '',
      },
      {
        'type': 'input_dummy',
        'name': 'TOP',
      },
    ],
    'args1': [
      {
        'type': 'input_statement',
        'name': 'STACK',
      },
    ],
    'args2': [
      {
        'type': 'input_value',
        'align': 'right',
        'name': 'RETURN',
      },
    ],
    'style': 'procedure_blocks',
    'helpUrl': '%{BKY_PROCEDURES_DEFRETURN_HELPURL}',
    'tooltip': '%{BKY_PROCEDURES_DEFRETURN_TOOLTIP}',
    'extensions': [
      'procedure_def_get_def_mixin',
      'procedure_def_var_mixin',
      'procedure_def_update_shape_mixin',
      'procedure_def_context_menu_mixin',
      'procedure_def_onchange_mixin',
      'procedure_def_validator_helper',
      'procedure_defreturn_get_caller_block_mixin',
      'procedure_defreturn_set_comment_helper',
      'procedure_def_set_return_helper',
    ],
    'mutator': 'procedure_def_mutator',
  },
  {
    'type': 'procedures_callreturn',
    'message0': '%1 %2',
    'args0': [
      {'type': 'field_label', 'name': 'NAME', 'text': '%{BKY_UNNAMED_KEY}'},
      {
        'type': 'input_dummy',
        'name': 'TOPROW',
      },
    ],
    'output': null,
    'style': 'procedure_blocks',
    'helpUrl': '%{BKY_PROCEDURES_CALLRETURN_HELPURL}',
    'extensions': [
      'procedure_caller_get_def_mixin',
      'procedure_caller_update_shape_mixin',
      'procedure_caller_context_menu_mixin',
      'procedure_callerreturn_get_def_block_mixin',
    ],
    'mutator': 'procedure_caller_mutator',
  },
  {
    'type': 'procedures_mutatorcontainer',
    'message0': '%{BKY_PROCEDURES_MUTATORCONTAINER_TITLE} %1 %2',
    'message1': '%{BKY_PROCEDURES_ALLOW_STATEMENTS} %1 %2',
    'args0': [
      {
        'type': 'input_dummy',
      },
      {
        'type': 'input_statement',
        'name': 'STACK',
      },
    ],
    'args1': [
      {
        'type': 'field_checkbox',
        'checked': true,
        'name': 'STATEMENTS',
      },
      {
        'type': 'input_dummy',
        'name': 'STATEMENT_INPUT',
      },
    ],
    'style': 'procedure_blocks',
    'tooltip': '%{BKY_PROCEDURES_MUTATORCONTAINER_TOOLTIP}',
    'enableContextMenu': false,
  },
  {
    'type': 'procedures_mutatorarg',
    'message0': '%{BKY_PROCEDURES_MUTATORARG_TITLE} %1',
    'args0': [
      {
        'type': 'field_input',
        'name': 'NAME',
      },
    ],
    'nextStatement': null,
    'previousStatement': null,
    'style': 'procedure_blocks',
    'tooltip': '%{BKY_PROCEDURES_MUTATORARG_TOOLTIP}',
    'enableContextMenu': false,
    'extensions': [
      'procedure_mutatorarg_validate_mixin',
      'procedure_mutatorarg_add_validator_helper',
    ],
  },
  {
    'type': 'procedures_ifreturn',
    'message0': '%{BKY_CONTROLS_IF_MSG_IF} %1',
    'message1': '%{BKY_PROCEDURES_DEFRETURN_RETURN} %1',
    'args0': [
      {
        'type': 'input_value',
        'name': 'CONDITION',
        'check': 'Boolean',
      },
    ],
    'args1': [
      {
        'type': 'input_value',
        'name': 'VALUE',
      },
    ],
    'inputsInline': true,
    'nextStatement': null,
    'previousStatement': null,
    'style': 'procedure_blocks',
    'tooltip': '%{BKY_PROCEDURES_IFRETURN_TOOLTIP}',
    'helpUrl': '%{BKY_PROCEDURES_IFRETURN_HELPURL}',
    'extensions': [
      'procedure_ifreturn_onchange_mixin',
      'procedure_ifreturn_function_types_mixin',
    ],
    'mutator': 'procedure_ifreturn_mutator',
  },
]);
exports.blocks = blocks;


/** @this {Block} */
const procedureDefGetDefMixin = function() {
  const mixin = {
    model_: null,

    /**
     * Returns the data model for this procedure block.
     * @return {!IProcedureModel} The data model for this procedure
     *     block.
     */
    getProcedureModel() {
      return this.model_;
    },

    /**
     * Return all variables referenced by this block.
     * @return {!Array<string>} List of variable names.
     * @this {Block}
     */
    getVars: function() {
      return this.getProcedureModel().getParameters()
          .map((p) => p.getVariableModel().name);
    },

    /**
     * Return all variables referenced by this block.
     * @return {!Array<!VariableModel>} List of variable models.
     * @this {Block}
     */
    getVarModels: function() {
      return this.getProcedureModel().getParameters()
          .map((p) => p.getVariableModel());
    },

    /**
     * Disposes of the data model for this procedure block when the block is
     * disposed.
     */
    destroy: function() {
      if (this.isInsertionMarker()) return;
      this.workspace.getProcedureMap().delete(this.getProcedureModel().getId());
    },
  };

  mixin.model_ = new ObservableProcedureModel(
      this.workspace,
      Procedures.findLegalName(this.getFieldValue('NAME'), this));
  this.workspace.getProcedureMap().add(mixin.getProcedureModel());

  this.mixin(mixin, true);
};
// Using register instead of registerMixin to avoid triggering warnings about
// overriding built-ins.
Extensions.register('procedure_def_get_def_mixin', procedureDefGetDefMixin);

/** @this {Block} */
const procedureDefVarMixin = function() {
  const mixin = {
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
      const oldVar = this.workspace.getVariableById(oldId);
      const model = this.getProcedureModel();
      const index = model.getParameters()
          .findIndex((p) => p.getVariableModel() === oldVar);
      if (index === -1) return;  // Not found.
      const newVar = this.workspace.getVariableById(newId);
      const oldParam = model.getParameter(index);
      model.deleteParameter(index);
      model.insertParameter(
          new ObservableParameterModel(
              this.workspace, newVar.name, oldParam.getId()),
          index);
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
      const containsVar = this.getProcedureModel().getParameters()
          .some((p) => p.getVariableModel() === variable);
      if (containsVar) {
        triggerProceduresUpdate(this.workspace);
      }
    },
  };

  this.mixin(mixin, true);
};
// Using register instead of registerMixin to avoid triggering warnings about
// overriding built-ins.
Extensions.register('procedure_def_var_mixin', procedureDefVarMixin);

const procedureDefUpdateShapeMixin = {
  /**
   * Updates the block to reflect the state of the procedure model.
   */
  doProcedureUpdate: function() {
    this.setFieldValue(this.getProcedureModel().getName(), 'NAME');
    this.setEnabled(this.getProcedureModel().getEnabled());
    this.updateParameters_();
    this.updateMutator_();
  },

  /**
   * Updates the parameters field to reflect the parameters in the procedure
   * model.
   */
  updateParameters_: function() {
    const params =
        this.getProcedureModel().getParameters().map((p) => p.getName());
    const paramString = params.length ?
        `${Msg['PROCEDURES_BEFORE_PARAMS']} ${params.join(', ')}` :
        '';

    // The field is deterministic based on other events, no need to fire.
    Events.disable();
    try {
      this.setFieldValue(paramString, 'PARAMS');
    } finally {
      Events.enable();
    }
  },

  updateMutator_: function() {
    if (!this.mutator?.isVisible()) return;

    const mutatorWorkspace = this.mutator.getWorkspace();
    for (const p of this.getProcedureModel().getParameters()) {
      const block = mutatorWorkspace.getBlockById(p.getId());
      if (!block) continue;  // Should not happen.
      if (block.getFieldValue('NAME') !== p.getName()) {
        block.setFieldValue(p.getName(), 'NAME');
      }
    }
  },

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
      this.removeInput('STACK', true);
    }
    this.hasStatements_ = hasStatements;
  },
};
Extensions.registerMixin(
    'procedure_def_update_shape_mixin', procedureDefUpdateShapeMixin);

/** @this {Block} */
const procedureDefValidatorHelper = function() {
  const nameField = this.getField('NAME');
  nameField.setValue(Procedures.findLegalName('', this));
  nameField.setValidator(Procedures.rename);
};
Extensions.register(
    'procedure_def_validator_helper', procedureDefValidatorHelper);

const procedureDefMutator = {
  hasStatements_: true,

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

    const params = this.getProcedureModel().getParameters();
    for (let i = 0; i < params.length; i++) {
      const parameter = xmlUtils.createElement('arg');
      const varModel = params[i].getVariableModel();
      parameter.setAttribute('name', varModel.name);
      parameter.setAttribute('varid', varModel.getId());
      if (opt_paramIds) {
        parameter.setAttribute('paramId', params[i].getId());
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
    for (let i = 0; i < xmlElement.childNodes.length; i++) {
      const node = xmlElement.childNodes[i];
      if (node.nodeName.toLowerCase() !== 'arg') continue;
      const varId = node.getAttribute('varid');
      this.getProcedureModel().insertParameter(
          new ObservableParameterModel(
              this.workspace, node.getAttribute('name'), undefined, varId),
          i);
    }
    this.setStatements_(xmlElement.getAttribute('statements') !== 'false');

    // Call mutate callers for backwards compatibility.
    Procedures.mutateCallers(this);
  },

  /**
   * Returns the state of this block as a JSON serializable object.
   * @return {?{params: (!Array<{name: string, id: string}>|undefined),
   *     hasStatements: (boolean|undefined)}} The state of this block, eg the
   *     parameters and statements.
   */
  saveExtraState: function() {
    const state = Object.create(null);
    state['procedureId'] = this.getProcedureModel().getId();

    const params = this.getProcedureModel().getParameters();
    if (!params.length && this.hasStatements_) return state;

    if (params.length) {
      state['params'] = params.map((p) => {
        return {
          'name': p.getName(),
          'id': p.getVariableModel().getId(),
          // Ideally this would be id, and the other would be varId,
          // but backwards compatibility :/
          'paramId': p.getId(),
        };
      });
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
    const map = this.workspace.getProcedureMap();
    const procedureId = state['procedureId'];
    if (procedureId && procedureId != this.model_.getId() &&
        map.has(procedureId)) {
      if (map.has(this.model_.getId())) {
        map.delete(this.model_.getId());
      }
      this.model_ = map.get(procedureId);
    }

    if (state['params']) {
      for (let i = 0; i < state['params'].length; i++) {
        const {name, id, paramId} = state['params'][i];
        this.getProcedureModel().insertParameter(
            new ObservableParameterModel(this.workspace, name, paramId, id), i);
      }
    }

    this.setStatements_(state['hasStatements'] === false ? false : true);

    // Call mutate callers for backwards compatibility.
    Procedures.mutateCallers(this);
  },

  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Workspace} workspace Mutator's workspace.
   * @return {!Block} Root block in mutator.
   * @this {Block}
   */
  decompose: function(workspace) {
    const containerBlockDef = {
      'type': 'procedures_mutatorcontainer',
      'inputs': {
        'STACK': {},
      },
    };

    let connDef = containerBlockDef['inputs']['STACK'];
    for (const param of this.getProcedureModel().getParameters()) {
      connDef['block'] = {
        'type': 'procedures_mutatorarg',
        'id': param.getId(),
        'fields': {
          'NAME': param.getName(),
        },
        'next': {},
      };
      connDef = connDef['block']['next'];
    }

    const containerBlock = serialization.blocks.append(
        containerBlockDef, workspace, {recordUndo: false});

    if (this.type === 'procedures_defreturn') {
      containerBlock.setFieldValue(this.hasStatements_, 'STATEMENTS');
    } else {
      containerBlock.removeInput('STATEMENT_INPUT');
    }

    // Update callers (called for backwards compatibility).
    Procedures.mutateCallers(this);

    return containerBlock;
  },

  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Block} containerBlock Root block in mutator.
   * @this {Block}
   */
  compose: function(containerBlock) {
    const model = this.getProcedureModel();
    const count = model.getParameters().length;
    model.startBulkUpdate();
    for (let i = count - 1; i >= 0; i--) {
      model.deleteParameter(i);
    }

    let i = 0;
    let paramBlock = containerBlock.getInputTargetBlock('STACK');
    while (paramBlock && !paramBlock.isInsertionMarker()) {
      model.insertParameter(
          new ObservableParameterModel(
              this.workspace, paramBlock.getFieldValue('NAME'), paramBlock.id),
          i);
      paramBlock =
          paramBlock.nextConnection && paramBlock.nextConnection.targetBlock();
      i++;
    }
    model.endBulkUpdate();

    const hasStatements = containerBlock.getFieldValue('STATEMENTS');
    if (hasStatements !== null) {
      this.setStatements_(hasStatements === 'TRUE');
    }

    // Call mutate callers for backwards compatibility.
    Procedures.mutateCallers(this);
  },
};
Extensions.registerMutator(
    'procedure_def_mutator', procedureDefMutator, undefined,
    ['procedures_mutatorarg']);

const procedureDefContextMenuMixin = {
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
    const params = this.getProcedureModel().getParameters();
    for (const param of params) {
      const xmlArg = xmlUtils.createElement('arg');
      xmlArg.setAttribute('name', param.getName());
      xmlMutation.appendChild(xmlArg);
    }
    const xmlBlock = xmlUtils.createElement('block');
    xmlBlock.setAttribute('type', this.callType_);
    xmlBlock.appendChild(xmlMutation);
    option.callback = ContextMenu.callbackFactory(this, xmlBlock);
    options.push(option);

    // Add options to create getters for each parameter.
    if (this.isCollapsed()) return;

    for (const param of params) {
      const argOption = {enabled: true};
      const argVar = param.getVariableModel();
      argOption.text =
          Msg['VARIABLES_SET_CREATE_GET'].replace('%1', argVar.name);

      const argXmlField = Variables.generateVariableFieldDom(argVar);
      const argXmlBlock = xmlUtils.createElement('block');
      argXmlBlock.setAttribute('type', 'variables_get');
      argXmlBlock.appendChild(argXmlField);
      argOption.callback = ContextMenu.callbackFactory(this, argXmlBlock);
      options.push(argOption);
    }
  },
};
Extensions.registerMixin(
    'procedure_def_context_menu_mixin', procedureDefContextMenuMixin);

const procedureDefOnChangeMixin = {
  onchange: function(e) {
    if (e.type === Events.BLOCK_CHANGE && e.blockId === this.id &&
        e.element === 'disabled') {
      this.getProcedureModel().setEnabled(!e.newValue);
    }
  },
};
Extensions.registerMixin(
    'procedure_def_onchange_mixin', procedureDefOnChangeMixin);

/** @this {Block} */
const procedureDefNoReturnSetCommentHelper = function() {
  if ((this.workspace.options.comments ||
       (this.workspace.options.parentWorkspace &&
        this.workspace.options.parentWorkspace.options.comments)) &&
      Msg['PROCEDURES_DEFNORETURN_COMMENT']) {
    this.setCommentText(Msg['PROCEDURES_DEFNORETURN_COMMENT']);
  }
};
Extensions.register(
    'procedure_defnoreturn_set_comment_helper',
    procedureDefNoReturnSetCommentHelper);

/** @this {Block} */
const procedureDefReturnSetCommentHelper = function() {
  if ((this.workspace.options.comments ||
       (this.workspace.options.parentWorkspace &&
        this.workspace.options.parentWorkspace.options.comments)) &&
      Msg['PROCEDURES_DEFRETURN_COMMENT']) {
    this.setCommentText(Msg['PROCEDURES_DEFRETURN_COMMENT']);
  }
};
Extensions.register(
    'procedure_defreturn_set_comment_helper',
    procedureDefReturnSetCommentHelper);

const procedureDefNoReturnGetCallerBlockMixin = {
  /**
   * Return the signature of this procedure definition.
   * @return {!Array} Tuple containing three elements:
   *     - the name of the defined procedure,
   *     - a list of all its arguments,
   *     - that it DOES NOT have a return value.
   * @this {Block}
   */
  getProcedureDef: function() {
    return [this.getFieldValue('NAME'), this.getVars(), false];
  },

  callType_: 'procedures_callnoreturn',
};
Extensions.registerMixin(
    'procedure_defnoreturn_get_caller_block_mixin',
    procedureDefNoReturnGetCallerBlockMixin);

const procedureDefReturnGetCallerBlockMixin = {
  /**
   * Return the signature of this procedure definition.
   * @return {!Array} Tuple containing three elements:
   *     - the name of the defined procedure,
   *     - a list of all its arguments,
   *     - that it DOES have a return value.
   * @this {Block}
   */
  getProcedureDef: function() {
    return [this.getFieldValue('NAME'), this.getVars(), true];
  },

  callType_: 'procedures_callreturn',
};
Extensions.registerMixin(
    'procedure_defreturn_get_caller_block_mixin',
    procedureDefReturnGetCallerBlockMixin);

/** @this {Block} */
const procedureDefSetNoReturnHelper = function() {
  this.getProcedureModel().setReturnTypes(null);
};
Extensions.register(
    'procedure_def_set_no_return_helper', procedureDefSetNoReturnHelper);

/** @this {Block} */
const procedureDefSetReturnHelper = function() {
  this.getProcedureModel().setReturnTypes([]);
};
Extensions.register(
    'procedure_def_set_return_helper', procedureDefSetReturnHelper);

const validateProcedureParamMixin = {
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
   * @this {FieldTextInput}
   * @param {string} newText The new variable name.
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
Extensions.registerMixin(
    'procedure_mutatorarg_validate_mixin', validateProcedureParamMixin);

/** @this {Block} */
const addValidatorToParamFieldHelper = function() {
  const nameField = this.getField('NAME');

  nameField.setValidator(this.validator_);

  // TODO: We can probably just handle this in onFinishedEditing_.
  // Hack: override showEditor to do just a little bit more work.
  // We don't have a good place to hook into the start of a text edit.
  nameField.oldShowEditorFn_ = nameField.showEditor_;
  /** @this {FieldTextInput} */
  const newShowEditorFn = function() {
    this.createdVariables_ = [];
    this.oldShowEditorFn_();
  };
  nameField.showEditor_ = newShowEditorFn;

  nameField.onFinishEditing_ = this.deleteIntermediateVars_;
  // Create an empty list so onFinishEditing_ has something to look at, even
  // though the editor was never opened.
  nameField.createdVariables_ = [];
  nameField.onFinishEditing_('x');
};
Extensions.register(
    'procedure_mutatorarg_add_validator_helper',
    addValidatorToParamFieldHelper);

/** @this {Block} */
const procedureCallerGetDefMixin = function() {
  const mixin = {
    model_: null,

    prevParams_: [],

    argsMap_: new Map(),

    /**
     * @return {IProcedureModel} The procedure model associated with this
     *     block.
     */
    getProcedureModel() {
      return this.model_;
    },

    /**
     * @param {string} name The name of the procedure model to find.
     * @param {string[]} params The param names of the procedure model to find.
     * @return {IProcedureModel} The procedure model that was found.
     */
    findProcedureModel_(name, params = []) {
      const workspace = this.getTargetWorkspace_();
      const model = workspace.getProcedureMap().getProcedures().find(
          (proc) => proc.getName() === name);
      if (!model) return null;

      const returnTypes = model.getReturnTypes();
      const hasMatchingReturn = this.hasReturn ? returnTypes : !returnTypes;
      if (!hasMatchingReturn) return this.createDef_(name, params);

      const hasMatchingParams =
          model.getParameters().every((p, i) => p.getName() === params[i]);
      if (!hasMatchingParams) return null;

      return model;
    },

    /**
     * Creates a procedure definition block with the given name and params,
     * and returns the procedure model associated with it.
     * @param {string} name The name of the procedure to create.
     * @param {string[]} params The names of the parameters to create.
     * @return {IProcedureModel} The procedure model associated with the new
     *     procedure definition block.
     */
    createDef_(name, params = []) {
      const xy = this.getRelativeToSurfaceXY();
      const newName = Procedures.findLegalName(name, this);
      this.renameProcedure(name, newName);

      const blockDef = {
        'type': this.defType_,
        'x': xy.x + config.snapRadius * (this.RTL ? -1 : 1),
        'y': xy.y + config.snapRadius * 2,
        'extraState': {
          'params': params.map((p) => ({'name': p})),
        },
        'fields': {'NAME': newName},
      };
      return serialization.blocks.append(blockDef, this.getTargetWorkspace_())
          .getProcedureModel();
    },

    /**
     * @return {Workspace} The main workspace (i.e. not the flyout workspace)
     *     associated with this block.
     */
    getTargetWorkspace_() {
      return this.workspace.isFlyout ? this.workspace.targetWorkspace :
                                       this.workspace;
    },

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
     * Return all variables referenced by this block.
     * @return {!Array<string>} List of variable names.
     * @this {Block}
     */
    getVars: function() {
      return this.getProcedureModel().getParameters().map(
          (p) => p.getVariableModel().name);
    },

    /**
     * Return all variables referenced by this block.
     * @return {!Array<!VariableModel>} List of variable models.
     * @this {Block}
     */
    getVarModels: function() {
      return this.getProcedureModel().getParameters().map(
          (p) => p.getVariableModel());
    },
  };

  this.mixin(mixin, true);
};
// Using register instead of registerMixin to avoid triggering warnings about
// overriding built-ins.
Extensions.register(
    'procedure_caller_get_def_mixin', procedureCallerGetDefMixin);

const procedureCallerMutator = {
  previousEnabledState_: true,

  paramsFromSerializedState_: [],

  /**
   * Create XML to represent the (non-editable) name and arguments.
   * Backwards compatible serialization implementation.
   * @return {!Element} XML storage element.
   * @this {Block}
   */
  mutationToDom: function() {
    const container = xmlUtils.createElement('mutation');
    const model = this.getProcedureModel();
    container.setAttribute('name', model.getName());
    for (const param of model.getParameters()) {
      const arg = xmlUtils.createElement('arg');
      arg.setAttribute('name', param.getName());
      container.appendChild(arg);
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
    const params = [];
    for (const n of xmlElement.childNodes) {
      if (n.nodeName.toLowerCase() === 'arg') {
        params.push(n.getAttribute('name'));
      }
    }
    this.deserialize_(name, params);
  },

  /**
   * Returns the state of this block as a JSON serializable object.
   * @return {{name: string, params:(!Array<string>|undefined)}} The state of
   *     this block, ie the params and procedure name.
   */
  saveExtraState: function() {
    const state = Object.create(null);
    const model = this.getProcedureModel();
    state['name'] = model.getName();
    if (model.getParameters().length) {
      state['params'] = model.getParameters().map((p) => p.getName());
    }
    return state;
  },

  /**
   * Applies the given state to this block.
   * @param {*} state The state to apply to this block, ie the params and
   *     procedure name.
   */
  loadExtraState: function(state) {
    this.deserialize_(state['name'], state['params'] || []);
  },

  /**
   * Applies the given name and params from the serialized state to the block.
   * @param {string} name The name to apply to the block.
   * @param {!Array<!string>} params The parameters to apply to the block.
   */
  deserialize_: function(name, params) {
    this.setFieldValue(name, 'NAME');
    if (!this.model_) this.model_ = this.findProcedureModel_(name, params);
    if (this.getProcedureModel()) {
      this.initBlockWithProcedureModel_();
    } else {
      // We need to create/find our procedure def in our change listener.
      this.paramsFromSerializedState_ = params;
      // Create inputs based on the mutation so that children can be connected.
      this.createArgInputs_(params);
    }

    // Temporarily maintained for logic that relies on arguments_
    this.arguments_ = params;
  },
};
Extensions.registerMutator('procedure_caller_mutator', procedureCallerMutator);

const procedureCallerUpdateShapeMixin = {
  /**
   * Renders the block for the first time based on the procedure model.
   */
  initBlockWithProcedureModel_() {
    this.prevParams_ = [...this.getProcedureModel().getParameters()];
    this.doProcedureUpdate();
  },

  /**
   * Updates the shape of this block to reflect the state of the data model.
   */
  doProcedureUpdate: function() {
    if (!this.getProcedureModel()) return;
    const id = this.getProcedureModel().getId();
    if (!this.getTargetWorkspace_().getProcedureMap().has(id)) {
      this.dispose();
      return;
    }
    this.updateName_();
    this.updateEnabled_();
    this.updateParameters_();
  },

  /**
   * Updates the name field of this block to match the state of the data model.
   */
  updateName_: function() {
    const name = this.getProcedureModel().getName();
    this.setFieldValue(name, 'NAME');
    const baseMsg = this.outputConnection ?
        Msg['PROCEDURES_CALLRETURN_TOOLTIP'] :
        Msg['PROCEDURES_CALLNORETURN_TOOLTIP'];
    this.setTooltip(baseMsg.replace('%1', name));
  },

  /**
   * Updates the enabled state of this block to match the state of the data
   *     model.
   */
  updateEnabled_: function() {
    if (!this.getProcedureModel().getEnabled()) {
      this.previousEnabledState_ = this.isEnabled();
      this.setEnabled(false);
    } else {
      this.setEnabled(this.previousEnabledState_);
    }
  },

  /**
   * Updates the parameter fields/inputs of this block to match the state of the
   * data model.
   */
  updateParameters_: function() {
    this.updateArgsMap_();
    this.deleteAllArgInputs_();
    this.addParametersLabel__();
    this.createArgInputs_();
    this.reattachBlocks_();
    this.prevParams_ = [...this.getProcedureModel().getParameters()];
  },

  /**
   * Saves a map of parameter IDs to target blocks attached to the inputs
   * of this caller block.
   */
  updateArgsMap_: function() {
    for (const [i, p] of this.prevParams_.entries()) {
      const target = this.getInputTargetBlock(`ARG${i}`);
      if (target) this.argsMap_.set(p.getId(), target);
    }
  },

  /**
   * Deletes all the parameter inputs on this block.
   */
  deleteAllArgInputs_: function() {
    let i = 0;
    while (this.getInput(`ARG${i}`)) {
      this.removeInput(`ARG${i}`);
      i++;
    }
  },

  /**
   * Adds or removes the parameter label to match the state of the data model.
   */
  addParametersLabel__: function() {
    const topRow = this.getInput('TOPROW');
    if (this.getProcedureModel().getParameters().length) {
      if (!this.getField('WITH')) {
        topRow.appendField(Msg['PROCEDURES_CALL_BEFORE_PARAMS'], 'WITH');
        topRow.init();
      }
    } else if (this.getField('WITH')) {
      topRow.removeField('WITH');
    }
  },

  /**
   * Creates all of the parameter inputs to match the state of the data model.
   * @param {Array<string>} params The params to add to the block, or null to
   *     use the params defined in the procedure model.
   */
  createArgInputs_: function(params = null) {
    if (!params) {
      params = this.getProcedureModel().getParameters().map((p) => p.getName());
    }
    for (const [i, p] of params.entries()) {
      this.appendValueInput(`ARG${i}`)
          .appendField(new FieldLabel(p), `ARGNAME${i}`)
          .setAlign(Align.RIGHT);
    }
  },

  /**
   * Reattaches blocks to this blocks' inputs based on the data saved in the
   * argsMap_.
   */
  reattachBlocks_: function() {
    const params = this.getProcedureModel().getParameters();
    for (const [i, p] of params.entries()) {
      if (!this.argsMap_.has(p.getId())) continue;
      this.getInput(`ARG${i}`).connection.connect(
          this.argsMap_.get(p.getId()).outputConnection);
    }
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
};
Extensions.registerMixin(
    'procedure_caller_update_shape_mixin', procedureCallerUpdateShapeMixin);

const procedureCallerOnChangeMixin = {
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
    // TODO: Clean this up to call createDef_.
    if (event.type === Events.BLOCK_CREATE &&
        (event.blockId === this.id || event.ids.indexOf(this.id) !== -1)) {
      // Look for the case where a procedure call was created (usually through
      // paste) and there is no matching definition.  In this case, create
      // an empty definition block with the correct signature.
      const name = this.getProcedureCall();
      let def = Procedures.getDefinition(name, this.workspace);
      if (!this.defMatches_(def)) def = null;
      if (!def) {
        // We have no def nor procedure model.
        Events.setGroup(event.group);
        this.model_ = this.createDef_(
            this.getFieldValue('NAME'), this.paramsFromSerializedState_);
        Events.setGroup(false);
      }
      if (!this.getProcedureModel()) {
        // We have a def, but no reference to its model.
        this.model_ = this.findProcedureModel_(
            this.getFieldValue('NAME'), this.paramsFromSerializedState_);
      }
      this.initBlockWithProcedureModel_();
    }
  },

  defMatches_(defBlock) {
    return defBlock && defBlock.type === this.defType_ &&
        JSON.stringify(defBlock.getVars()) === JSON.stringify(this.arguments_);
  },
};
Extensions.registerMixin(
    'procedure_caller_onchange_mixin', procedureCallerOnChangeMixin);

const procedureCallerContextMenuMixin = {
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
Extensions.registerMixin(
    'procedure_caller_context_menu_mixin', procedureCallerContextMenuMixin);

const procedureCallerNoReturnGetDefBlockMixin = {
  hasReturn: false,
  defType_: 'procedures_defnoreturn',
};
Extensions.registerMixin(
    'procedure_callernoreturn_get_def_block_mixin',
    procedureCallerNoReturnGetDefBlockMixin);

const procedureCallerReturnGetDefBlockMixin = {
  hasReturn: true,
  defType_: 'procedures_defreturn',
};
Extensions.registerMixin(
    'procedure_callerreturn_get_def_block_mixin',
    procedureCallerReturnGetDefBlockMixin);

const procedureIfReturnMutator = {
  hasReturnValue_: true,

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
};

Extensions.registerMutator(
    'procedure_ifreturn_mutator', procedureIfReturnMutator);

const procedureIfReturnOnChangeMixin = {
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
};

Extensions.registerMixin(
    'procedure_ifreturn_onchange_mixin', procedureIfReturnOnChangeMixin);

const procedureIfReturnFunctionTypesMixin = {
  /**
   * List of block types that are functions and thus do not need warnings.
   * To add a new function type add this to your code:
   * Blocks['procedures_ifreturn'].FUNCTION_TYPES.push('custom_func');
   */
  FUNCTION_TYPES: ['procedures_defnoreturn', 'procedures_defreturn'],
};

Extensions.registerMixin(
    'procedure_ifreturn_function_types_mixin',
    procedureIfReturnFunctionTypesMixin);

// Register provided blocks.
defineBlocks(blocks);
