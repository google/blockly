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

 goog.module('Blockly.libraryBlocks.proceduresLocalArgument');

 /* eslint-disable-next-line no-unused-vars */
 const AbstractEvent = goog.requireType('Blockly.Events.Abstract');
 const ContextMenu = goog.require('Blockly.ContextMenu');
 const Events = goog.require('Blockly.Events');
 const ProceduresLocalArgument = goog.require('Blockly.ProceduresLocalArgument');
 const Variables = goog.require('Blockly.Variables');
 const Xml = goog.require('Blockly.Xml');
 const xmlUtils = goog.require('Blockly.utils.xml');
 const {Align} = goog.require('Blockly.Input');
 const {ConnectionType} = goog.require('Blockly.ConnectionType');
 /* eslint-disable-next-line no-unused-vars */
 const {Block} = goog.requireType('Blockly.Block');
 /* eslint-disable-next-line no-unused-vars */
 const {Gesture} = goog.require('Blockly.Gesture');
 const {FieldCheckbox} = goog.require('Blockly.FieldCheckbox');
 const {FieldLabel} = goog.require('Blockly.FieldLabel');
 const {FieldTextInput} = goog.require('Blockly.FieldTextInput');
 const {Msg} = goog.require('Blockly.Msg');
 const idGenerator = goog.require('Blockly.utils.idGenerator');
 const {Mutator} = goog.require('Blockly.Mutator');
 const {Names} = goog.require('Blockly.Names');
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

const PROCEDURES_WITH_ARGUMENT = {
    /**
   * Disconnect old blocks from all value inputs on this block, but hold onto them
   * in case they can be reattached later. Also save the shadow DOM if it exists.
   * The result is a map from argument ID to information that was associated with
   * that argument at the beginning of the mutation.
   * @return {!Object.<string, {shadow: Element, block: Blockly.Block}>} An object
   *     mapping argument IDs to blocks and shadow DOMs.
   * @private
   * @this Blockly.Block
   */
  disconnectOldBlocks_: function() {
    // Remove old stuff
    const connectionMap = {};

    for (let i = 0, input; (input = this.inputList[i]); i++) {
      if (input.name !== 'STACK' && input.connection) {
        const target = input.connection.targetBlock();
        const saveInfo = {
          shadow: input.connection.getShadowDom(),
          block: target,
        };
        connectionMap[input.name] = saveInfo;

        // Remove the shadow DOM, then disconnect the block. Otherwise a shadow
        // block will respawn instantly, and we'd have to remove it when we remove
        // the input.
        input.connection.setShadowDom(null, true);
        if (input.connection.targetConnection && input.name !== 'RETURN') {
          input.connection.disconnect();
        }
      }
    }

    return connectionMap;
  },

  /**
   * Removes all value inputs on the block.
   * @private
   * @this Block
   */
  removeValueInputs_: function() {
    // Delete inputs directly instead of with block.removeInput to avoid splicing
    // out of the input list at every index.
    const newInputList = [];

    for (let i = 0, input; (input = this.inputList[i]); i++) {
      if (input.type === ConnectionType.INPUT_VALUE && input.name !== 'RETURN') {
        input.dispose();
      } else {
        newInputList.push(input);
      }
    }

    this.inputList = newInputList;
  },

  /**
   * Delete all shadow blocks in the given map.
   * @param {!Object.<string, Blockly.Block>} connectionMap An object mapping
   *     argument IDs to the blocks that were connected to those IDs at the
   *     beginning of the mutation.
   * @private
   * @this Blockly.Block
   */
  deleteShadows_: function(connectionMap) {
    // Get rid of all of the old shadow blocks if they aren't connected.
    if (connectionMap) {
      for (const id in connectionMap) {
        const saveInfo = connectionMap[id];
        if (saveInfo) {
          const block = saveInfo['block'];
          if (block && block.isShadow()) {
            block.dispose();
            delete connectionMap[id];
          }
        }
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
        Msg.PROCEDURES_DEFNORETURN_DO);
      if (this.getInput('RETURN')) {
        this.moveInputBefore('STACK', 'RETURN');
      }
    } else {
      this.removeInput('STACK', true);
    }
    this.hasStatements_ = hasStatements;
  },

  /**
   * Build a DOM node representing a shadow block of the given type.
   * @param {string} name Name argument block.
   * @param {string} argId Id argument block.
   * @return {!Element} The DOM node representing the new shadow block.
   * @private
   * @this Block
   */
  buildArgumentBlock_: function(name, argId) {
    const block = xmlUtils.createElement('shadow');
    block.setAttribute('type', 'argument_local');

    const data = xmlUtils.createElement('data');
    data.appendChild(xmlUtils.createTextNode(argId));
    block.appendChild(data);

    const field = xmlUtils.createElement('field');
    field.setAttribute('name', 'VALUE');
    field.setAttribute('value', name);
    field.textContent = name;

    block.appendChild(field);
    return block;
  },

  /**
   * Create inputs in def block
   */
  createInputs_: function() {
    this.argumentModels_ = [];

    for (let i = 0, argument; (argument = this.updatedArguments_[i]); i++) {
      const argumentBlock = this.buildArgumentBlock_(argument.name, argument.id);

      this.argumentModels_.push({id: argument.id, name: argument.name});
      this.appendValueInput(argument.id)
        .setCheck(argument.id)
        .setAlign(Align.RIGHT)
        .setShadowDom(argumentBlock);
      this.moveInputBefore(argument.id, 'PARAMS');
    }
  },

  /**
  * Remove unused arguments in procedures.
  * @private
  */
  removeArguments_: function() {
    if (!this.argumentModels_.length) {
      return;
    }

    const updatesArgumentsId = this.updatedArguments_.map((a) => a.id);

    const shouldRemove = this.argumentModels_.filter((a) => !updatesArgumentsId.includes(a.id));

    const shouldRename = this.updatedArguments_.filter((arg) => {
      const existArgument = this.argumentModels_.find((a) => a.id === arg.id);
      return existArgument && arg.name !== existArgument.name;
    });

    const allBlocks = this.getDescendants();
    const argumentsInProcedures = allBlocks.filter((block) => block.type === 'argument_local' && !block.isShadow());

    if (!argumentsInProcedures.length) {
      return;
    }

    for (let i = 0, argumentBlock; (argumentBlock = argumentsInProcedures[i]); i++) {
      const argumentShouldRename = shouldRename.find((a) => a.id === argumentBlock.data);
      if (shouldRename.length && argumentShouldRename) {
        const parentBlock = argumentBlock.getRootBlock();
        argumentBlock.changeArgumentName.call(argumentBlock, argumentShouldRename.name, parentBlock);
      }

      const argumentShouldRemove = shouldRemove.find((f) => f.id === argumentBlock.data);
      if (shouldRemove.length && argumentShouldRemove) {
        argumentBlock.dispose();
      }
    }
  },

  /**
  * Update the display of parameters for this procedure definition block.
  * @private
  * @this {Block}
  */
  updateParams_: function() {
    Events.disable();
    try {
      const connectionMap = this.disconnectOldBlocks_();
      this.removeArguments_();
      this.removeValueInputs_();
      this.deleteShadows_(connectionMap);
      this.createInputs_();
    } finally {
      Events.enable();
    }
  },

  /**
    * Create XML to represent the argument inputs.
    * Backwards compatible serialization implementation.
    * @param {boolean=} optParamIds If true include the IDs of the parameter
    *     quarks.  Used by Blockly.ProceduresLocalArgument.mutateCallers for reconnection.
    * @return {!Element} XML storage element.
    * @this {Block}
    */
  mutationToDom: function(optParamIds) {
    const container = xmlUtils.createElement('mutation');
    if (optParamIds) {
      container.setAttribute('name', this.getFieldValue('NAME'));
    }
    for (let i = 0; i < this.argumentModels_.length; i++) {
      const parameter = xmlUtils.createElement('arg');
      const argModel = this.argumentModels_[i];
      parameter.setAttribute('name', argModel.name);
      parameter.setAttribute('value', argModel.name);
      parameter.setAttribute('varid', argModel.id);
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
    this.argumentModels_ = [];
    this.updatedArguments_ = [];
    for (let i = 0, childNode; (childNode = xmlElement.childNodes[i]); i++) {
      if (childNode.nodeName.toLowerCase() === 'arg') {
        const varName = childNode.getAttribute('name');
        const varId = childNode.getAttribute('varid') || childNode.getAttribute('varId');
        if (varName !== null && varId !== null) {
          this.arguments_.push(varName);
          this.argumentModels_.push({id: varId, name: varName});
          this.updatedArguments_.push({id: varId, name: varName});
        } else {
          console.info('Failed to create a variable with name ' + varName + ', ignoring.');
        }
      }
    }
    this.updateParams_();
    ProceduresLocalArgument.mutateCallers(this);

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
    if (!this.argumentModels_.length && this.hasStatements_) {
      return null;
    }
    const state = Object.create(null);
    if (this.argumentModels_.length) {
      state.params = [];
      for (let i = 0; i < this.argumentModels_.length; i++) {
        state.params.push({
          'name': this.argumentModels_[i].name,
          'value': this.argumentModels_[i].name,
          'id': this.argumentModels_[i].id,
        });
      }
    }
    if (!this.hasStatements_) {
      state.hasStatements = false;
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
    this.argumentModels_ = [];
    this.updatedArguments_ = [];
    if (state.params) {
      for (let i = 0; i < state.params.length; i++) {
        const param = state.params[i];
        this.arguments_.push(param.name);
        this.argumentModels_.push({id: param.id, name: param.name});
        this.updatedArguments_.push({id: param.id, name: param.name});
      }
    }
    this.updateParams_();
    ProceduresLocalArgument.mutateCallers(this);
    this.setStatements_(state.hasStatements !== false);
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
      * <block type="procedures_local_mutatorcontainer">
      *   <statement name="STACK">
      *     <block type="procedures_local_mutatorarg">
      *       <data>arg1_id</data>
      *       <field name="NAME">arg1_name</field>
      *       <next>etc...</next>
      *     </block>
      *   </statement>
      * </block>
      */

    const containerBlockNode = xmlUtils.createElement('block');
    containerBlockNode.setAttribute('type', 'procedures_local_mutatorcontainer');
    const statementNode = xmlUtils.createElement('statement');
    statementNode.setAttribute('name', 'STACK');
    containerBlockNode.appendChild(statementNode);

    let node = statementNode;
    for (let i = 0; i < this.argumentModels_.length; i++) {
      const argBlockNode = xmlUtils.createElement('block');

      const data = xmlUtils.createElement('data');
      data.appendChild(xmlUtils.createTextNode(this.argumentModels_[i].id));
      argBlockNode.appendChild(data);

      argBlockNode.setAttribute('type', 'procedures_local_mutatorarg');
      const fieldNode = xmlUtils.createElement('field');
      fieldNode.setAttribute('name', 'NAME');
      const argumentName = xmlUtils.createTextNode(this.argumentModels_[i].name);
      fieldNode.appendChild(argumentName);
      argBlockNode.appendChild(fieldNode);
      const nextNode = xmlUtils.createElement('next');
      argBlockNode.appendChild(nextNode);

      node.appendChild(argBlockNode);
      node = nextNode;
    }

    const containerBlock = Xml.domToBlock(containerBlockNode, workspace);

    if (this.type === 'procedures_with_argument_defreturn') {
      containerBlock.setFieldValue(this.hasStatements_, 'STATEMENTS');
    } else {
      containerBlock.removeInput('STATEMENT_INPUT');
    }

    // Initialize procedure's callers with blank IDs.
    ProceduresLocalArgument.mutateCallers(this);
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
    this.updatedArguments_ = [];
    let paramBlock = containerBlock.getInputTargetBlock('STACK');

    while (paramBlock && !paramBlock.isInsertionMarker()) {
      const argumentName = paramBlock.getFieldValue('NAME');
      const argumentId = paramBlock.getData();
      this.updatedArguments_.push({id: argumentId, name: argumentName});
      this.arguments_.push(argumentName);

      paramBlock =
      paramBlock.nextConnection && paramBlock.nextConnection.targetBlock();
    }

    this.updateParams_();
    ProceduresLocalArgument.mutateCallers(this);

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
  getArguments: function() {
    return this.arguments_;
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
    option.text = Msg.PROCEDURES_CREATE_DO.replace('%1', name);
    const xmlMutation = xmlUtils.createElement('mutation');
    xmlMutation.setAttribute('name', name);
    for (let i = 0; i < this.argumentModels_.length; i++) {
      const xmlArg = xmlUtils.createElement('arg');
      xmlArg.setAttribute('name', this.argumentModels_[i].name);
      xmlArg.setAttribute('varId', this.argumentModels_[i].id);
      xmlMutation.appendChild(xmlArg);
    }
    const xmlBlock = xmlUtils.createElement('block');
    xmlBlock.setAttribute('type', this.callType_);
    xmlBlock.appendChild(xmlMutation);
    option.callback = ContextMenu.callbackFactory(this, xmlBlock);
    options.push(option);
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

};

blocks['procedures_with_argument_defnoreturn'] = {
  /**
    * Block for defining a procedure with no return value.
    * @this {Block}
    */
  init: function() {
    const initName = ProceduresLocalArgument.findLegalName('', this);
    const nameField = new FieldTextInput(initName, ProceduresLocalArgument.rename);
    nameField.setSpellcheck(false);
    this.appendDummyInput()
      .appendField(Msg.PROCEDURES_DEFNORETURN_TITLE)
      .appendField(nameField, 'NAME');
    this.appendDummyInput('PARAMS');
    this.setMutator(new Mutator(['procedures_local_mutatorarg']));
    if ((this.workspace.options.comments ||
          (this.workspace.options.parentWorkspace &&
           this.workspace.options.parentWorkspace.options.comments)) &&
         Msg.PROCEDURES_DEFNORETURN_COMMENT) {
      this.setCommentText(Msg.PROCEDURES_DEFNORETURN_COMMENT);
    }
    this.setInputsInline(true);
    this.setStyle('procedure_blocks');
    this.setTooltip(Msg.PROCEDURES_DEFNORETURN_TOOLTIP);
    this.setHelpUrl(Msg.PROCEDURES_DEFNORETURN_HELPURL);
    this.arguments_ = [];
    this.argumentModels_ = [];
    this.updatedArguments_ = [];
    this.setStatements_(true);
    this.statementConnection_ = null;
  },

  ...PROCEDURES_WITH_ARGUMENT,
  callType_: 'procedures_with_argument_callnoreturn',
};

blocks['procedures_with_argument_defreturn'] = {
  /**
    * Block for defining a procedure with a return value.
    * @this {Block}
    */
  init: function() {
    const initName = ProceduresLocalArgument.findLegalName('', this);
    const nameField = new FieldTextInput(initName, ProceduresLocalArgument.rename);
    nameField.setSpellcheck(false);
    this.appendDummyInput()
      .appendField(Msg.PROCEDURES_DEFRETURN_TITLE)
      .appendField(nameField, 'NAME');
    this.appendDummyInput('PARAMS');
    this.appendValueInput('RETURN')
      .setAlign(Align.RIGHT)
      .appendField(Msg.PROCEDURES_DEFRETURN_RETURN);
    this.setMutator(new Mutator(['procedures_local_mutatorarg']));
    if ((this.workspace.options.comments ||
          (this.workspace.options.parentWorkspace &&
           this.workspace.options.parentWorkspace.options.comments)) &&
         Msg.PROCEDURES_DEFRETURN_COMMENT) {
      this.setCommentText(Msg.PROCEDURES_DEFRETURN_COMMENT);
    }
    this.setInputsInline(true);
    this.setStyle('procedure_blocks');
    this.setTooltip(Msg.PROCEDURES_DEFRETURN_TOOLTIP);
    this.setHelpUrl(Msg.PROCEDURES_DEFRETURN_HELPURL);
    this.arguments_ = [];
    this.argumentModels_ = [];
    this.updatedArguments_ = [];
    this.setStatements_(true);
    this.statementConnection_ = null;
  },

  ...PROCEDURES_WITH_ARGUMENT,
  callType_: 'procedures_with_argument_callreturn',
};

blocks['procedures_local_mutatorcontainer'] = {
  /**
    * Mutator block for procedure container.
    * @this {Block}
    */
  init: function() {
    this.appendDummyInput().appendField(
      Msg.PROCEDURES_MUTATORCONTAINER_TITLE);
    this.appendStatementInput('STACK');
    this.appendDummyInput('STATEMENT_INPUT')
      .appendField(Msg.PROCEDURES_ALLOW_STATEMENTS)
      .appendField(new FieldCheckbox('TRUE'), 'STATEMENTS');
    this.setStyle('procedure_blocks');
    this.setTooltip(Msg.PROCEDURES_MUTATORCONTAINER_TOOLTIP);
    this.contextMenu = false;
  },
};

blocks['procedures_local_mutatorarg'] = {
  /**
    * Mutator block for procedure argument.
    * @this {Block}
    */
  init: function() {
    const field = new FieldTextInput(ProceduresLocalArgument.DEFAULT_ARG, this.validator_);

    this.appendDummyInput()
      .appendField(Msg.PROCEDURES_MUTATORARG_TITLE)
      .appendField(field, 'NAME');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setStyle('procedure_blocks');
    this.setTooltip(Msg.PROCEDURES_MUTATORARG_TOOLTIP);
    this.contextMenu = false;
    this.argumentId_ = null;
  },

  /**
    * Obtain a valid name for the procedure argument. Create a variable if
    * necessary.
    * Merge runs of whitespace.  Strip leading and trailing whitespace.
    * Beyond this, all names are legal.
    * @param {string} argumentName User-supplied name.
    * @return {?string} Valid name, or null if a name was not specified.
    * @private
    * @this {FieldTextInput}
    */
  validator_: function(argumentName) {
    const sourceBlock = this.getSourceBlock();
    argumentName = argumentName.replace(/[\s\xa0]+/g, ' ').replace(/^ | $/g, '');
    if (!argumentName) {
      return null;
    }

    // Prevents duplicate parameter names in functions
    const workspace =
         sourceBlock.workspace.targetWorkspace || sourceBlock.workspace;
    const blocks =
         workspace.getAllBlocks(false).filter((block) => block.id !== this.getSourceBlock().id);

    if (sourceBlock.isInFlyout) {
      return argumentName;
    }

    const existArgumentsName = blocks
      .filter((b) => b.getFieldValue('NAME'))
      .map((block) => block.getFieldValue('NAME'));

    if (!sourceBlock.getData()) {
      sourceBlock.setData(idGenerator.genUid());
    }

    if (!existArgumentsName.includes(argumentName)) {
      return argumentName;
    }

    const newArgumentName = Variables.generateUniqueNameFromOptions(
      ProceduresLocalArgument.DEFAULT_ARG, existArgumentsName);

    return newArgumentName;
  },

  getData: function() {
    return this.data;
  },

  setData: function(id) {
    this.data = id;
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
        Msg.PROCEDURES_CALLRETURN_TOOLTIP :
        Msg.PROCEDURES_CALLNORETURN_TOOLTIP;
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
         ProceduresLocalArgument.getDefinition(this.getProcedureCall(), this.workspace);
    const mutatorOpen =
         defBlock && defBlock.mutator && defBlock.mutator.isVisible();
    if (!mutatorOpen) {
      this.quarkConnections_ = {};
      this.quarkIds_ = null;
    }
    if (!paramIds) {
      // Reset the quarks (a mutator is about to open).
      return;
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
    this.setCollapsed(false);
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
    this.argumentModels_ = [];
    for (let i = 0; i < this.arguments_.length; i++) {
      this.argumentModels_.push(this.arguments_[i]);
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
          topRow.appendField(Msg.PROCEDURES_CALL_BEFORE_PARAMS, 'WITH');
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
      if (this.quarkIds_ && this.quarkIds_[i]) {
        parameter.setAttribute('varid', this.quarkIds_[i]);
      }
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
        paramIds.push(childNode.getAttribute('varid'));
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
    state.name = this.getProcedureCall();
    if (this.arguments_.length) {
      state.params = this.arguments_;
    }
    return state;
  },
  /**
    * Applies the given state to this block.
    * @param {*} state The state to apply to this block, ie the params and
    *     procedure name.
    */
  loadExtraState: function(state) {
    this.renameProcedure(this.getProcedureCall(), state.name);
    const params = state.params;
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
  getArguments: function() {
    return this.arguments_;
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
      let def = ProceduresLocalArgument.getDefinition(name, this.workspace);
      if (def &&
           (def.type !== this.defType_ ||
            JSON.stringify(def.getArguments()) !== JSON.stringify(this.arguments_))) {
        // The signatures don't match.
        def = null;
      }
      if (!def) {
        Events.setGroup(event.group);
        /**
          * Create matching definition block.
          * <xml xmlns="https://developers.google.com/blockly/xml">
          *   <block type="procedures_with_argument_defreturn" x="10" y="20">
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
        const x = xy.x + 6 * (this.RTL ? -1 : 1);
        const y = xy.y + 6 * 2;
        block.setAttribute('x', x);
        block.setAttribute('y', y);
        const mutation = this.mutationToDom();
        block.appendChild(mutation);
        const field = xmlUtils.createElement('field');
        field.setAttribute('name', 'NAME');
        let callName = this.getProcedureCall();
        if (!callName) {
          // Rename if name is empty string.
          callName = ProceduresLocalArgument.findLegalName('', this);
          this.renameProcedure('', callName);
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
      const def = ProceduresLocalArgument.getDefinition(name, this.workspace);
      if (!def) {
        Events.setGroup(event.group);
        this.dispose(true);
        Events.setGroup(false);
      }
    } else if (event.type === Events.CHANGE && event.element === 'disabled') {
      const name = this.getProcedureCall();
      const def = ProceduresLocalArgument.getDefinition(name, this.workspace);
      if (def && def.id === event.blockId) {
        // in most cases the old group should be ''
        const oldGroup = Events.getGroup();
        if (oldGroup) {
          // This should only be possible programmatically and may indicate a
          // problem with event grouping. If you see this message please
          // investigate. If the use ends up being valid we may need to reorder
          // events in the undo stack.
          console.info('Saw an existing group while responding to a definition change');
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
    option.text = Msg.PROCEDURES_HIGHLIGHT_DEF;
    const name = this.getProcedureCall();
    const workspace = this.workspace;

    option.callback = function() {
      let def = ProceduresLocalArgument.getDefinition(name, workspace);

      if (def) {
        if (!def.inActiveModule()) {
          workspace.getModuleManager()
          .activateModule(workspace.getModuleManager().getModuleById(def.getModuleId()));
          def = workspace.getBlockById(def.id);
        }
        workspace.centerOnBlock(def.id);
        def.select();
      }
    };
    options.push(option);
  },
};

blocks.procedures_with_argument_callnoreturn = {
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
    this.setHelpUrl(Msg.PROCEDURES_CALLNORETURN_HELPURL);
    this.arguments_ = [];
    this.argumentModels_ = [];
    this.quarkConnections_ = {};
    this.quarkIds_ = null;
    this.previousEnabledState_ = true;
  },

  defType_: 'procedures_with_argument_defnoreturn',
};

blocks.procedures_with_argument_callreturn = {
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
    this.setHelpUrl(Msg.PROCEDURES_CALLRETURN_HELPURL);
    this.arguments_ = [];
    this.argumentModels_ = [];
    this.quarkConnections_ = {};
    this.quarkIds_ = null;
    this.previousEnabledState_ = true;
  },

  defType_: 'procedures_with_argument_defreturn',
};

// Register provided blocks.
defineBlocks(blocks);
