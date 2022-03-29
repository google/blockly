/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Loop blocks for Blockly.
 * @suppress {checkTypes}
 */
'use strict';

goog.module('Blockly.libraryBlocks.loops');

/* eslint-disable-next-line no-unused-vars */
const AbstractEvent = goog.requireType('Blockly.Events.Abstract');
const ContextMenu = goog.require('Blockly.ContextMenu');
const Events = goog.require('Blockly.Events');
const Extensions = goog.require('Blockly.Extensions');
const Variables = goog.require('Blockly.Variables');
const xmlUtils = goog.require('Blockly.utils.xml');
/* eslint-disable-next-line no-unused-vars */
const {Block} = goog.requireType('Blockly.Block');
/* eslint-disable-next-line no-unused-vars */
const {BlockDefinition} = goog.requireType('Blockly.blocks');
const {Msg} = goog.require('Blockly.Msg');
const {createBlockDefinitionsFromJsonArray, defineBlocks} = goog.require('Blockly.common');
/** @suppress {extraRequire} */
goog.require('Blockly.FieldDropdown');
/** @suppress {extraRequire} */
goog.require('Blockly.FieldLabel');
/** @suppress {extraRequire} */
goog.require('Blockly.FieldNumber');
/** @suppress {extraRequire} */
goog.require('Blockly.FieldVariable');
/** @suppress {extraRequire} */
goog.require('Blockly.Warning');


/**
 * A dictionary of the block definitions provided by this module.
 * @type {!Object<string, !BlockDefinition>}
 */
const blocks = createBlockDefinitionsFromJsonArray([
  // Block for repeat n times (external number).
  {
    'type': 'controls_repeat_ext',
    'message0': '%{BKY_CONTROLS_REPEAT_TITLE}',
    'args0': [{
      'type': 'input_value',
      'name': 'TIMES',
      'check': 'Number',
    }],
    'message1': '%{BKY_CONTROLS_REPEAT_INPUT_DO} %1',
    'args1': [{
      'type': 'input_statement',
      'name': 'DO',
    }],
    'previousStatement': null,
    'nextStatement': null,
    'style': 'loop_blocks',
    'tooltip': '%{BKY_CONTROLS_REPEAT_TOOLTIP}',
    'helpUrl': '%{BKY_CONTROLS_REPEAT_HELPURL}',
  },
  // Block for repeat n times (internal number).
  // The 'controls_repeat_ext' block is preferred as it is more flexible.
  {
    'type': 'controls_repeat',
    'message0': '%{BKY_CONTROLS_REPEAT_TITLE}',
    'args0': [{
      'type': 'field_number',
      'name': 'TIMES',
      'value': 10,
      'min': 0,
      'precision': 1,
    }],
    'message1': '%{BKY_CONTROLS_REPEAT_INPUT_DO} %1',
    'args1': [{
      'type': 'input_statement',
      'name': 'DO',
    }],
    'previousStatement': null,
    'nextStatement': null,
    'style': 'loop_blocks',
    'tooltip': '%{BKY_CONTROLS_REPEAT_TOOLTIP}',
    'helpUrl': '%{BKY_CONTROLS_REPEAT_HELPURL}',
  },
  // Block for 'do while/until' loop.
  {
    'type': 'controls_whileUntil',
    'message0': '%1 %2',
    'args0': [
      {
        'type': 'field_dropdown',
        'name': 'MODE',
        'options': [
          ['%{BKY_CONTROLS_WHILEUNTIL_OPERATOR_WHILE}', 'WHILE'],
          ['%{BKY_CONTROLS_WHILEUNTIL_OPERATOR_UNTIL}', 'UNTIL'],
        ],
      },
      {
        'type': 'input_value',
        'name': 'BOOL',
        'check': 'Boolean',
      },
    ],
    'message1': '%{BKY_CONTROLS_REPEAT_INPUT_DO} %1',
    'args1': [{
      'type': 'input_statement',
      'name': 'DO',
    }],
    'previousStatement': null,
    'nextStatement': null,
    'style': 'loop_blocks',
    'helpUrl': '%{BKY_CONTROLS_WHILEUNTIL_HELPURL}',
    'extensions': ['controls_whileUntil_tooltip'],
  },
  // Block for 'for' loop.
  {
    'type': 'controls_for',
    'message0': '%{BKY_CONTROLS_FOR_TITLE}',
    'args0': [
      {
        'type': 'field_variable',
        'name': 'VAR',
        'variable': null,
      },
      {
        'type': 'input_value',
        'name': 'FROM',
        'check': 'Number',
        'align': 'RIGHT',
      },
      {
        'type': 'input_value',
        'name': 'TO',
        'check': 'Number',
        'align': 'RIGHT',
      },
      {
        'type': 'input_value',
        'name': 'BY',
        'check': 'Number',
        'align': 'RIGHT',
      },
    ],
    'message1': '%{BKY_CONTROLS_REPEAT_INPUT_DO} %1',
    'args1': [{
      'type': 'input_statement',
      'name': 'DO',
    }],
    'inputsInline': true,
    'previousStatement': null,
    'nextStatement': null,
    'style': 'loop_blocks',
    'helpUrl': '%{BKY_CONTROLS_FOR_HELPURL}',
    'extensions': [
      'contextMenu_newGetVariableBlock',
      'controls_for_tooltip',
    ],
  },
  // Block for 'for each' loop.
  {
    'type': 'controls_forEach',
    'message0': '%{BKY_CONTROLS_FOREACH_TITLE}',
    'args0': [
      {
        'type': 'field_variable',
        'name': 'VAR',
        'variable': null,
      },
      {
        'type': 'input_value',
        'name': 'LIST',
        'check': 'Array',
      },
    ],
    'message1': '%{BKY_CONTROLS_REPEAT_INPUT_DO} %1',
    'args1': [{
      'type': 'input_statement',
      'name': 'DO',
    }],
    'previousStatement': null,
    'nextStatement': null,
    'style': 'loop_blocks',
    'helpUrl': '%{BKY_CONTROLS_FOREACH_HELPURL}',
    'extensions': [
      'contextMenu_newGetVariableBlock',
      'controls_forEach_tooltip',
    ],
  },
  // Block for flow statements: continue, break.
  {
    'type': 'controls_flow_statements',
    'message0': '%1',
    'args0': [{
      'type': 'field_dropdown',
      'name': 'FLOW',
      'options': [
        ['%{BKY_CONTROLS_FLOW_STATEMENTS_OPERATOR_BREAK}', 'BREAK'],
        ['%{BKY_CONTROLS_FLOW_STATEMENTS_OPERATOR_CONTINUE}', 'CONTINUE'],
      ],
    }],
    'previousStatement': null,
    'style': 'loop_blocks',
    'helpUrl': '%{BKY_CONTROLS_FLOW_STATEMENTS_HELPURL}',
    'suppressPrefixSuffix': true,
    'extensions': [
      'controls_flow_tooltip',
      'controls_flow_in_loop_check',
    ],
  },
]);
exports.blocks = blocks;

/**
 * Tooltips for the 'controls_whileUntil' block, keyed by MODE value.
 * @see {Extensions#buildTooltipForDropdown}
 * @readonly
 */
const WHILE_UNTIL_TOOLTIPS = {
  'WHILE': '%{BKY_CONTROLS_WHILEUNTIL_TOOLTIP_WHILE}',
  'UNTIL': '%{BKY_CONTROLS_WHILEUNTIL_TOOLTIP_UNTIL}',
};

Extensions.register(
    'controls_whileUntil_tooltip',
    Extensions.buildTooltipForDropdown('MODE', WHILE_UNTIL_TOOLTIPS));

/**
 * Tooltips for the 'controls_flow_statements' block, keyed by FLOW value.
 * @see {Extensions#buildTooltipForDropdown}
 * @readonly
 */
const BREAK_CONTINUE_TOOLTIPS = {
  'BREAK': '%{BKY_CONTROLS_FLOW_STATEMENTS_TOOLTIP_BREAK}',
  'CONTINUE': '%{BKY_CONTROLS_FLOW_STATEMENTS_TOOLTIP_CONTINUE}',
};

Extensions.register(
    'controls_flow_tooltip',
    Extensions.buildTooltipForDropdown('FLOW', BREAK_CONTINUE_TOOLTIPS));

/**
 * Mixin to add a context menu item to create a 'variables_get' block.
 * Used by blocks 'controls_for' and 'controls_forEach'.
 * @mixin
 * @augments Block
 * @package
 * @readonly
 */
const CUSTOM_CONTEXT_MENU_CREATE_VARIABLES_GET_MIXIN = {
  /**
   * Add context menu option to create getter block for the loop's variable.
   * (customContextMenu support limited to web BlockSvg.)
   * @param {!Array} options List of menu options to add to.
   * @this {Block}
   */
  customContextMenu: function(options) {
    if (this.isInFlyout) {
      return;
    }
    const variable = this.getField('VAR').getVariable();
    const varName = variable.name;
    if (!this.isCollapsed() && varName !== null) {
      const option = {enabled: true};
      option.text = Msg['VARIABLES_SET_CREATE_GET'].replace('%1', varName);
      const xmlField = Variables.generateVariableFieldDom(variable);
      const xmlBlock = xmlUtils.createElement('block');
      xmlBlock.setAttribute('type', 'variables_get');
      xmlBlock.appendChild(xmlField);
      option.callback = ContextMenu.callbackFactory(this, xmlBlock);
      options.push(option);
    }
  },
};

Extensions.registerMixin(
    'contextMenu_newGetVariableBlock',
    CUSTOM_CONTEXT_MENU_CREATE_VARIABLES_GET_MIXIN);

Extensions.register(
    'controls_for_tooltip',
    Extensions.buildTooltipWithFieldText('%{BKY_CONTROLS_FOR_TOOLTIP}', 'VAR'));

Extensions.register(
    'controls_forEach_tooltip',
    Extensions.buildTooltipWithFieldText(
        '%{BKY_CONTROLS_FOREACH_TOOLTIP}', 'VAR'));

/**
 * List of block types that are loops and thus do not need warnings.
 * To add a new loop type add this to your code:
 *
 * // If using the Blockly npm package and es6 import syntax:
 * import {loopTypes} from 'blockly/blocks';
 * loopTypes.add('custom_loop');
 *
 * // Else if using Closure Compiler and goog.modules:
 * const {loopTypes} = goog.require('Blockly.libraryBlocks.loops');
 * loopTypes.add('custom_loop');
 *
 * // Else if using blockly_compressed + blockss_compressed.js in browser:
 * Blockly.libraryBlocks.loopTypes.add('custom_loop');
 *
 * @type {!Set<string>}
 */
const loopTypes = new Set([
  'controls_repeat',
  'controls_repeat_ext',
  'controls_forEach',
  'controls_for',
  'controls_whileUntil',
]);
exports.loopTypes = loopTypes;

/**
 * This mixin adds a check to make sure the 'controls_flow_statements' block
 * is contained in a loop. Otherwise a warning is added to the block.
 * @mixin
 * @augments Block
 * @public
 * @readonly
 */
const CONTROL_FLOW_IN_LOOP_CHECK_MIXIN = {
  /**
   * Is this block enclosed (at any level) by a loop?
   * @return {Block} The nearest surrounding loop, or null if none.
   * @this {Block}
   */
  getSurroundLoop: function() {
    let block = this;
    do {
      if (loopTypes.has(block.type)) {
        return block;
      }
      block = block.getSurroundParent();
    } while (block);
    return null;
  },

  /**
   * Called whenever anything on the workspace changes.
   * Add warning if this flow block is not nested inside a loop.
   * @param {!AbstractEvent} e Move event.
   * @this {Block}
   */
  onchange: function(e) {
    // Don't change state if:
    //   * It's at the start of a drag.
    //   * It's not a move event.
    if (!this.workspace.isDragging || this.workspace.isDragging() ||
        e.type !== Events.BLOCK_MOVE) {
      return;
    }
    const enabled = this.getSurroundLoop(this);
    this.setWarningText(
        enabled ? null : Msg['CONTROLS_FLOW_STATEMENTS_WARNING']);
    if (!this.isInFlyout) {
      const group = Events.getGroup();
      // Makes it so the move and the disable event get undone together.
      Events.setGroup(e.group);
      this.setEnabled(enabled);
      Events.setGroup(group);
    }
  },
};

Extensions.registerMixin(
    'controls_flow_in_loop_check', CONTROL_FLOW_IN_LOOP_CHECK_MIXIN);

// Register provided blocks.
defineBlocks(blocks);
