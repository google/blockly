/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Logic blocks for Blockly.
 * @suppress {checkTypes}
 */
'use strict';

goog.module('Blockly.libraryBlocks.logic');

/* eslint-disable-next-line no-unused-vars */
const AbstractEvent = goog.requireType('Blockly.Events.Abstract');
const Events = goog.require('Blockly.Events');
const Extensions = goog.require('Blockly.Extensions');
const xmlUtils = goog.require('Blockly.utils.xml');
/* eslint-disable-next-line no-unused-vars */
const {Block} = goog.requireType('Blockly.Block');
/* eslint-disable-next-line no-unused-vars */
const {BlockDefinition} = goog.requireType('Blockly.blocks');
const {Msg} = goog.require('Blockly.Msg');
const {Mutator} = goog.require('Blockly.Mutator');
/* eslint-disable-next-line no-unused-vars */
const {RenderedConnection} = goog.requireType('Blockly.RenderedConnection');
/* eslint-disable-next-line no-unused-vars */
const {Workspace} = goog.requireType('Blockly.Workspace');
const {createBlockDefinitionsFromJsonArray, defineBlocks} = goog.require('Blockly.common');
/** @suppress {extraRequire} */
goog.require('Blockly.FieldDropdown');
/** @suppress {extraRequire} */
goog.require('Blockly.FieldLabel');


/**
 * A dictionary of the block definitions provided by this module.
 * @type {!Object<string, !BlockDefinition>}
 */
const blocks = createBlockDefinitionsFromJsonArray([
  // Block for boolean data type: true and false.
  {
    'type': 'logic_boolean',
    'message0': '%1',
    'args0': [
      {
        'type': 'field_dropdown',
        'name': 'BOOL',
        'options': [
          ['%{BKY_LOGIC_BOOLEAN_TRUE}', 'TRUE'],
          ['%{BKY_LOGIC_BOOLEAN_FALSE}', 'FALSE'],
        ],
      },
    ],
    'output': 'Boolean',
    'style': 'logic_blocks',
    'tooltip': '%{BKY_LOGIC_BOOLEAN_TOOLTIP}',
    'helpUrl': '%{BKY_LOGIC_BOOLEAN_HELPURL}',
  },
  // Block for if/elseif/else condition.
  {
    'type': 'controls_if',
    'message0': '%{BKY_CONTROLS_IF_MSG_IF} %1',
    'args0': [
      {
        'type': 'input_value',
        'name': 'IF0',
        'check': 'Boolean',
      },
    ],
    'message1': '%{BKY_CONTROLS_IF_MSG_THEN} %1',
    'args1': [
      {
        'type': 'input_statement',
        'name': 'DO0',
      },
    ],
    'previousStatement': null,
    'nextStatement': null,
    'style': 'logic_blocks',
    'helpUrl': '%{BKY_CONTROLS_IF_HELPURL}',
    'suppressPrefixSuffix': true,
    'mutator': 'controls_if_mutator',
    'extensions': ['controls_if_tooltip'],
  },
  // If/else block that does not use a mutator.
  {
    'type': 'controls_ifelse',
    'message0': '%{BKY_CONTROLS_IF_MSG_IF} %1',
    'args0': [
      {
        'type': 'input_value',
        'name': 'IF0',
        'check': 'Boolean',
      },
    ],
    'message1': '%{BKY_CONTROLS_IF_MSG_THEN} %1',
    'args1': [
      {
        'type': 'input_statement',
        'name': 'DO0',
      },
    ],
    'message2': '%{BKY_CONTROLS_IF_MSG_ELSE} %1',
    'args2': [
      {
        'type': 'input_statement',
        'name': 'ELSE',
      },
    ],
    'previousStatement': null,
    'nextStatement': null,
    'style': 'logic_blocks',
    'tooltip': '%{BKYCONTROLS_IF_TOOLTIP_2}',
    'helpUrl': '%{BKY_CONTROLS_IF_HELPURL}',
    'suppressPrefixSuffix': true,
    'extensions': ['controls_if_tooltip'],
  },
  // Block for comparison operator.
  {
    'type': 'logic_compare',
    'message0': '%1 %2 %3',
    'args0': [
      {
        'type': 'input_value',
        'name': 'A',
      },
      {
        'type': 'field_dropdown',
        'name': 'OP',
        'options': [
          ['=', 'EQ'],
          ['\u2260', 'NEQ'],
          ['\u200F<', 'LT'],
          ['\u200F\u2264', 'LTE'],
          ['\u200F>', 'GT'],
          ['\u200F\u2265', 'GTE'],
        ],
      },
      {
        'type': 'input_value',
        'name': 'B',
      },
    ],
    'inputsInline': true,
    'output': 'Boolean',
    'style': 'logic_blocks',
    'helpUrl': '%{BKY_LOGIC_COMPARE_HELPURL}',
    'extensions': ['logic_compare', 'logic_op_tooltip'],
  },
  // Block for logical operations: 'and', 'or'.
  {
    'type': 'logic_operation',
    'message0': '%1 %2 %3',
    'args0': [
      {
        'type': 'input_value',
        'name': 'A',
        'check': 'Boolean',
      },
      {
        'type': 'field_dropdown',
        'name': 'OP',
        'options': [
          ['%{BKY_LOGIC_OPERATION_AND}', 'AND'],
          ['%{BKY_LOGIC_OPERATION_OR}', 'OR'],
        ],
      },
      {
        'type': 'input_value',
        'name': 'B',
        'check': 'Boolean',
      },
    ],
    'inputsInline': true,
    'output': 'Boolean',
    'style': 'logic_blocks',
    'helpUrl': '%{BKY_LOGIC_OPERATION_HELPURL}',
    'extensions': ['logic_op_tooltip'],
  },
  // Block for negation.
  {
    'type': 'logic_negate',
    'message0': '%{BKY_LOGIC_NEGATE_TITLE}',
    'args0': [
      {
        'type': 'input_value',
        'name': 'BOOL',
        'check': 'Boolean',
      },
    ],
    'output': 'Boolean',
    'style': 'logic_blocks',
    'tooltip': '%{BKY_LOGIC_NEGATE_TOOLTIP}',
    'helpUrl': '%{BKY_LOGIC_NEGATE_HELPURL}',
  },
  // Block for null data type.
  {
    'type': 'logic_null',
    'message0': '%{BKY_LOGIC_NULL}',
    'output': null,
    'style': 'logic_blocks',
    'tooltip': '%{BKY_LOGIC_NULL_TOOLTIP}',
    'helpUrl': '%{BKY_LOGIC_NULL_HELPURL}',
  },
  // Block for ternary operator.
  {
    'type': 'logic_ternary',
    'message0': '%{BKY_LOGIC_TERNARY_CONDITION} %1',
    'args0': [
      {
        'type': 'input_value',
        'name': 'IF',
        'check': 'Boolean',
      },
    ],
    'message1': '%{BKY_LOGIC_TERNARY_IF_TRUE} %1',
    'args1': [
      {
        'type': 'input_value',
        'name': 'THEN',
      },
    ],
    'message2': '%{BKY_LOGIC_TERNARY_IF_FALSE} %1',
    'args2': [
      {
        'type': 'input_value',
        'name': 'ELSE',
      },
    ],
    'output': null,
    'style': 'logic_blocks',
    'tooltip': '%{BKY_LOGIC_TERNARY_TOOLTIP}',
    'helpUrl': '%{BKY_LOGIC_TERNARY_HELPURL}',
    'extensions': ['logic_ternary'],
  },
  // Block representing the if statement in the controls_if mutator.
  {
    'type': 'controls_if_if',
    'message0': '%{BKY_CONTROLS_IF_IF_TITLE_IF}',
    'nextStatement': null,
    'enableContextMenu': false,
    'style': 'logic_blocks',
    'tooltip': '%{BKY_CONTROLS_IF_IF_TOOLTIP}',
  },
  // Block representing the else-if statement in the controls_if mutator.
  {
    'type': 'controls_if_elseif',
    'message0': '%{BKY_CONTROLS_IF_ELSEIF_TITLE_ELSEIF}',
    'previousStatement': null,
    'nextStatement': null,
    'enableContextMenu': false,
    'style': 'logic_blocks',
    'tooltip': '%{BKY_CONTROLS_IF_ELSEIF_TOOLTIP}',
  },
  // Block representing the else statement in the controls_if mutator.
  {
    'type': 'controls_if_else',
    'message0': '%{BKY_CONTROLS_IF_ELSE_TITLE_ELSE}',
    'previousStatement': null,
    'enableContextMenu': false,
    'style': 'logic_blocks',
    'tooltip': '%{BKY_CONTROLS_IF_ELSE_TOOLTIP}',
  },
]);
exports.blocks = blocks;

/**
 * Tooltip text, keyed by block OP value. Used by logic_compare and
 * logic_operation blocks.
 * @see {Extensions#buildTooltipForDropdown}
 * @readonly
 */
const TOOLTIPS_BY_OP = {
  // logic_compare
  'EQ': '%{BKY_LOGIC_COMPARE_TOOLTIP_EQ}',
  'NEQ': '%{BKY_LOGIC_COMPARE_TOOLTIP_NEQ}',
  'LT': '%{BKY_LOGIC_COMPARE_TOOLTIP_LT}',
  'LTE': '%{BKY_LOGIC_COMPARE_TOOLTIP_LTE}',
  'GT': '%{BKY_LOGIC_COMPARE_TOOLTIP_GT}',
  'GTE': '%{BKY_LOGIC_COMPARE_TOOLTIP_GTE}',

  // logic_operation
  'AND': '%{BKY_LOGIC_OPERATION_TOOLTIP_AND}',
  'OR': '%{BKY_LOGIC_OPERATION_TOOLTIP_OR}',
};

Extensions.register(
    'logic_op_tooltip',
    Extensions.buildTooltipForDropdown('OP', TOOLTIPS_BY_OP));

/**
 * Mutator methods added to controls_if blocks.
 * @mixin
 * @augments Block
 * @readonly
 */
const CONTROLS_IF_MUTATOR_MIXIN = {
  elseifCount_: 0,
  elseCount_: 0,

  /**
   * Create XML to represent the number of else-if and else inputs.
   * Backwards compatible serialization implementation.
   * @return {Element} XML storage element.
   * @this {Block}
   */
  mutationToDom: function() {
    if (!this.elseifCount_ && !this.elseCount_) {
      return null;
    }
    const container = xmlUtils.createElement('mutation');
    if (this.elseifCount_) {
      container.setAttribute('elseif', this.elseifCount_);
    }
    if (this.elseCount_) {
      container.setAttribute('else', 1);
    }
    return container;
  },
  /**
   * Parse XML to restore the else-if and else inputs.
   * Backwards compatible serialization implementation.
   * @param {!Element} xmlElement XML storage element.
   * @this {Block}
   */
  domToMutation: function(xmlElement) {
    this.elseifCount_ = parseInt(xmlElement.getAttribute('elseif'), 10) || 0;
    this.elseCount_ = parseInt(xmlElement.getAttribute('else'), 10) || 0;
    this.rebuildShape_();
  },
  /**
   * Returns the state of this block as a JSON serializable object.
   * @return {?{elseIfCount: (number|undefined), haseElse: (boolean|undefined)}}
   *     The state of this block, ie the else if count and else state.
   */
  saveExtraState: function() {
    if (!this.elseifCount_ && !this.elseCount_) {
      return null;
    }
    const state = Object.create(null);
    if (this.elseifCount_) {
      state['elseIfCount'] = this.elseifCount_;
    }
    if (this.elseCount_) {
      state['hasElse'] = true;
    }
    return state;
  },
  /**
   * Applies the given state to this block.
   * @param {*} state The state to apply to this block, ie the else if count and
   *     else state.
   */
  loadExtraState: function(state) {
    this.elseifCount_ = state['elseIfCount'] || 0;
    this.elseCount_ = state['hasElse'] ? 1 : 0;
    this.updateShape_();
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Workspace} workspace Mutator's workspace.
   * @return {!Block} Root block in mutator.
   * @this {Block}
   */
  decompose: function(workspace) {
    const containerBlock = workspace.newBlock('controls_if_if');
    containerBlock.initSvg();
    let connection = containerBlock.nextConnection;
    for (let i = 1; i <= this.elseifCount_; i++) {
      const elseifBlock = workspace.newBlock('controls_if_elseif');
      elseifBlock.initSvg();
      connection.connect(elseifBlock.previousConnection);
      connection = elseifBlock.nextConnection;
    }
    if (this.elseCount_) {
      const elseBlock = workspace.newBlock('controls_if_else');
      elseBlock.initSvg();
      connection.connect(elseBlock.previousConnection);
    }
    return containerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Block} containerBlock Root block in mutator.
   * @this {Block}
   */
  compose: function(containerBlock) {
    let clauseBlock = containerBlock.nextConnection.targetBlock();
    // Count number of inputs.
    this.elseifCount_ = 0;
    this.elseCount_ = 0;
    const valueConnections = [null];
    const statementConnections = [null];
    let elseStatementConnection = null;
    while (clauseBlock && !clauseBlock.isInsertionMarker()) {
      switch (clauseBlock.type) {
        case 'controls_if_elseif':
          this.elseifCount_++;
          valueConnections.push(clauseBlock.valueConnection_);
          statementConnections.push(clauseBlock.statementConnection_);
          break;
        case 'controls_if_else':
          this.elseCount_++;
          elseStatementConnection = clauseBlock.statementConnection_;
          break;
        default:
          throw TypeError('Unknown block type: ' + clauseBlock.type);
      }
      clauseBlock = clauseBlock.nextConnection &&
          clauseBlock.nextConnection.targetBlock();
    }
    this.updateShape_();
    // Reconnect any child blocks.
    this.reconnectChildBlocks_(
        valueConnections, statementConnections, elseStatementConnection);
  },
  /**
   * Store pointers to any connected child blocks.
   * @param {!Block} containerBlock Root block in mutator.
   * @this {Block}
   */
  saveConnections: function(containerBlock) {
    let clauseBlock = containerBlock.nextConnection.targetBlock();
    let i = 1;
    while (clauseBlock) {
      switch (clauseBlock.type) {
        case 'controls_if_elseif': {
          const inputIf = this.getInput('IF' + i);
          const inputDo = this.getInput('DO' + i);
          clauseBlock.valueConnection_ =
              inputIf && inputIf.connection.targetConnection;
          clauseBlock.statementConnection_ =
              inputDo && inputDo.connection.targetConnection;
          i++;
          break;
        }
        case 'controls_if_else': {
          const inputDo = this.getInput('ELSE');
          clauseBlock.statementConnection_ =
              inputDo && inputDo.connection.targetConnection;
          break;
        }
        default:
          throw TypeError('Unknown block type: ' + clauseBlock.type);
      }
      clauseBlock = clauseBlock.nextConnection &&
          clauseBlock.nextConnection.targetBlock();
    }
  },
  /**
   * Reconstructs the block with all child blocks attached.
   * @this {Block}
   */
  rebuildShape_: function() {
    const valueConnections = [null];
    const statementConnections = [null];
    let elseStatementConnection = null;

    if (this.getInput('ELSE')) {
      elseStatementConnection =
          this.getInput('ELSE').connection.targetConnection;
    }
    for (let i = 1; this.getInput('IF' + i); i++) {
      const inputIf = this.getInput('IF' + i);
      const inputDo = this.getInput('DO' + i);
      valueConnections.push(inputIf.connection.targetConnection);
      statementConnections.push(inputDo.connection.targetConnection);
    }
    this.updateShape_();
    this.reconnectChildBlocks_(
        valueConnections, statementConnections, elseStatementConnection);
  },
  /**
   * Modify this block to have the correct number of inputs.
   * @this {Block}
   * @private
   */
  updateShape_: function() {
    // Delete everything.
    if (this.getInput('ELSE')) {
      this.removeInput('ELSE');
    }
    for (let i = 1; this.getInput('IF' + i); i++) {
      this.removeInput('IF' + i);
      this.removeInput('DO' + i);
    }
    // Rebuild block.
    for (let i = 1; i <= this.elseifCount_; i++) {
      this.appendValueInput('IF' + i).setCheck('Boolean').appendField(
          Msg['CONTROLS_IF_MSG_ELSEIF']);
      this.appendStatementInput('DO' + i).appendField(
          Msg['CONTROLS_IF_MSG_THEN']);
    }
    if (this.elseCount_) {
      this.appendStatementInput('ELSE').appendField(
          Msg['CONTROLS_IF_MSG_ELSE']);
    }
  },
  /**
   * Reconnects child blocks.
   * @param {!Array<?RenderedConnection>} valueConnections List of
   * value connections for 'if' input.
   * @param {!Array<?RenderedConnection>} statementConnections List of
   * statement connections for 'do' input.
   * @param {?RenderedConnection} elseStatementConnection Statement
   * connection for else input.
   * @this {Block}
   */
  reconnectChildBlocks_: function(
      valueConnections, statementConnections, elseStatementConnection) {
    for (let i = 1; i <= this.elseifCount_; i++) {
      Mutator.reconnect(valueConnections[i], this, 'IF' + i);
      Mutator.reconnect(statementConnections[i], this, 'DO' + i);
    }
    Mutator.reconnect(elseStatementConnection, this, 'ELSE');
  },
};

Extensions.registerMutator(
    'controls_if_mutator', CONTROLS_IF_MUTATOR_MIXIN, null,
    ['controls_if_elseif', 'controls_if_else']);
/**
 * "controls_if" extension function. Adds mutator, shape updating methods, and
 * dynamic tooltip to "controls_if" blocks.
 * @this {Block}
 */
const CONTROLS_IF_TOOLTIP_EXTENSION = function() {
  this.setTooltip(function() {
    if (!this.elseifCount_ && !this.elseCount_) {
      return Msg['CONTROLS_IF_TOOLTIP_1'];
    } else if (!this.elseifCount_ && this.elseCount_) {
      return Msg['CONTROLS_IF_TOOLTIP_2'];
    } else if (this.elseifCount_ && !this.elseCount_) {
      return Msg['CONTROLS_IF_TOOLTIP_3'];
    } else if (this.elseifCount_ && this.elseCount_) {
      return Msg['CONTROLS_IF_TOOLTIP_4'];
    }
    return '';
  }.bind(this));
};

Extensions.register('controls_if_tooltip', CONTROLS_IF_TOOLTIP_EXTENSION);

/**
 * Adds dynamic type validation for the left and right sides of a logic_compare
 * block.
 * @mixin
 * @augments Block
 * @readonly
 */
const LOGIC_COMPARE_ONCHANGE_MIXIN = {
  /**
   * Called whenever anything on the workspace changes.
   * Prevent mismatched types from being compared.
   * @param {!AbstractEvent} e Change event.
   * @this {Block}
   */
  onchange: function(e) {
    if (!this.prevBlocks_) {
      this.prevBlocks_ = [null, null];
    }

    const blockA = this.getInputTargetBlock('A');
    const blockB = this.getInputTargetBlock('B');
    // Disconnect blocks that existed prior to this change if they don't match.
    if (blockA && blockB &&
        !this.workspace.connectionChecker.doTypeChecks(
            blockA.outputConnection, blockB.outputConnection)) {
      // Mismatch between two inputs.  Revert the block connections,
      // bumping away the newly connected block(s).
      Events.setGroup(e.group);
      const prevA = this.prevBlocks_[0];
      if (prevA !== blockA) {
        blockA.unplug();
        if (prevA && !prevA.isDisposed() && !prevA.isShadow()) {
          // The shadow block is automatically replaced during unplug().
          this.getInput('A').connection.connect(prevA.outputConnection);
        }
      }
      const prevB = this.prevBlocks_[1];
      if (prevB !== blockB) {
        blockB.unplug();
        if (prevB && !prevB.isDisposed() && !prevB.isShadow()) {
          // The shadow block is automatically replaced during unplug().
          this.getInput('B').connection.connect(prevB.outputConnection);
        }
      }
      this.bumpNeighbours();
      Events.setGroup(false);
    }
    this.prevBlocks_[0] = this.getInputTargetBlock('A');
    this.prevBlocks_[1] = this.getInputTargetBlock('B');
  },
};

/**
 * "logic_compare" extension function. Adds type left and right side type
 * checking to "logic_compare" blocks.
 * @this {Block}
 * @readonly
 */
const LOGIC_COMPARE_EXTENSION = function() {
  // Add onchange handler to ensure types are compatible.
  this.mixin(LOGIC_COMPARE_ONCHANGE_MIXIN);
};

Extensions.register('logic_compare', LOGIC_COMPARE_EXTENSION);

/**
 * Adds type coordination between inputs and output.
 * @mixin
 * @augments Block
 * @readonly
 */
const LOGIC_TERNARY_ONCHANGE_MIXIN = {
  prevParentConnection_: null,

  /**
   * Called whenever anything on the workspace changes.
   * Prevent mismatched types.
   * @param {!AbstractEvent} e Change event.
   * @this {Block}
   */
  onchange: function(e) {
    const blockA = this.getInputTargetBlock('THEN');
    const blockB = this.getInputTargetBlock('ELSE');
    const parentConnection = this.outputConnection.targetConnection;
    // Disconnect blocks that existed prior to this change if they don't match.
    if ((blockA || blockB) && parentConnection) {
      for (let i = 0; i < 2; i++) {
        const block = (i === 1) ? blockA : blockB;
        if (block &&
            !block.workspace.connectionChecker.doTypeChecks(
                block.outputConnection, parentConnection)) {
          // Ensure that any disconnections are grouped with the causing event.
          Events.setGroup(e.group);
          if (parentConnection === this.prevParentConnection_) {
            this.unplug();
            parentConnection.getSourceBlock().bumpNeighbours();
          } else {
            block.unplug();
            block.bumpNeighbours();
          }
          Events.setGroup(false);
        }
      }
    }
    this.prevParentConnection_ = parentConnection;
  },
};

Extensions.registerMixin('logic_ternary', LOGIC_TERNARY_ONCHANGE_MIXIN);

// Register provided blocks.
defineBlocks(blocks);
