/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Loop blocks for Blockly.
 */
'use strict';

goog.provide('Blockly.blocks.loops');
goog.provide('Blockly.Constants.Loops');

goog.require('Blockly');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldLabel');
goog.require('Blockly.FieldNumber');
goog.require('Blockly.FieldVariable');
goog.require('Blockly.Warning');


/**
 * Unused constant for the common HSV hue for all blocks in this category.
 * @deprecated Use Blockly.Msg['LOOPS_HUE']. (2018 April 5)
 */
Blockly.Constants.Loops.HUE = 120;

Blockly.defineBlocksWithJsonArray([
  // Block for repeat n times (external number).
  {
    "type": "controls_repeat_ext",
    "message0": "%{BKY_CONTROLS_REPEAT_TITLE}",
    "args0": [{
      "type": "input_value",
      "name": "TIMES",
      "check": "Number",
    }],
    "message1": "%{BKY_CONTROLS_REPEAT_INPUT_DO} %1",
    "args1": [{
      "type": "input_statement",
      "name": "DO",
    }],
    "previousStatement": null,
    "nextStatement": null,
    "style": "loop_blocks",
    "tooltip": "%{BKY_CONTROLS_REPEAT_TOOLTIP}",
    "helpUrl": "%{BKY_CONTROLS_REPEAT_HELPURL}",
  },
  // Block for repeat n times (internal number).
  // The 'controls_repeat_ext' block is preferred as it is more flexible.
  {
    "type": "controls_repeat",
    "message0": "%{BKY_CONTROLS_REPEAT_TITLE}",
    "args0": [{
      "type": "field_number",
      "name": "TIMES",
      "value": 10,
      "min": 0,
      "precision": 1,
    }],
    "message1": "%{BKY_CONTROLS_REPEAT_INPUT_DO} %1",
    "args1": [{
      "type": "input_statement",
      "name": "DO",
    }],
    "previousStatement": null,
    "nextStatement": null,
    "style": "loop_blocks",
    "tooltip": "%{BKY_CONTROLS_REPEAT_TOOLTIP}",
    "helpUrl": "%{BKY_CONTROLS_REPEAT_HELPURL}",
  },
  // Block for 'do while/until' loop.
  {
    "type": "controls_whileUntil",
    "message0": "%1 %2",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "MODE",
        "options": [
          ["%{BKY_CONTROLS_WHILEUNTIL_OPERATOR_WHILE}", "WHILE"],
          ["%{BKY_CONTROLS_WHILEUNTIL_OPERATOR_UNTIL}", "UNTIL"],
        ],
      },
      {
        "type": "input_value",
        "name": "BOOL",
        "check": "Boolean",
      },
    ],
    "message1": "%{BKY_CONTROLS_REPEAT_INPUT_DO} %1",
    "args1": [{
      "type": "input_statement",
      "name": "DO",
    }],
    "previousStatement": null,
    "nextStatement": null,
    "style": "loop_blocks",
    "helpUrl": "%{BKY_CONTROLS_WHILEUNTIL_HELPURL}",
    "extensions": ["controls_whileUntil_tooltip"],
  },
  // Block for 'for' loop.
  {
    "type": "controls_for",
    "message0": "%{BKY_CONTROLS_FOR_TITLE}",
    "args0": [
      {
        "type": "field_variable",
        "name": "VAR",
        "variable": null,
      },
      {
        "type": "input_value",
        "name": "FROM",
        "check": "Number",
        "align": "RIGHT",
      },
      {
        "type": "input_value",
        "name": "TO",
        "check": "Number",
        "align": "RIGHT",
      },
      {
        "type": "input_value",
        "name": "BY",
        "check": "Number",
        "align": "RIGHT",
      },
    ],
    "message1": "%{BKY_CONTROLS_REPEAT_INPUT_DO} %1",
    "args1": [{
      "type": "input_statement",
      "name": "DO",
    }],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "style": "loop_blocks",
    "helpUrl": "%{BKY_CONTROLS_FOR_HELPURL}",
    "extensions": [
      "contextMenu_newGetVariableBlock",
      "controls_for_tooltip",
    ],
  },
  // Block for 'for each' loop.
  {
    "type": "controls_forEach",
    "message0": "%{BKY_CONTROLS_FOREACH_TITLE}",
    "args0": [
      {
        "type": "field_variable",
        "name": "VAR",
        "variable": null,
      },
      {
        "type": "input_value",
        "name": "LIST",
        "check": "Array",
      },
    ],
    "message1": "%{BKY_CONTROLS_REPEAT_INPUT_DO} %1",
    "args1": [{
      "type": "input_statement",
      "name": "DO",
    }],
    "previousStatement": null,
    "nextStatement": null,
    "style": "loop_blocks",
    "helpUrl": "%{BKY_CONTROLS_FOREACH_HELPURL}",
    "extensions": [
      "contextMenu_newGetVariableBlock",
      "controls_forEach_tooltip",
    ],
  },
  // Block for flow statements: continue, break.
  {
    "type": "controls_flow_statements",
    "message0": "%1",
    "args0": [{
      "type": "field_dropdown",
      "name": "FLOW",
      "options": [
        ["%{BKY_CONTROLS_FLOW_STATEMENTS_OPERATOR_BREAK}", "BREAK"],
        ["%{BKY_CONTROLS_FLOW_STATEMENTS_OPERATOR_CONTINUE}", "CONTINUE"],
      ],
    }],
    "previousStatement": null,
    "style": "loop_blocks",
    "helpUrl": "%{BKY_CONTROLS_FLOW_STATEMENTS_HELPURL}",
    "suppressPrefixSuffix": true,
    "extensions": [
      "controls_flow_tooltip",
      "controls_flow_in_loop_check",
    ],
  },
]);

/**
 * Tooltips for the 'controls_whileUntil' block, keyed by MODE value.
 * @see {Blockly.Extensions#buildTooltipForDropdown}
 * @package
 * @readonly
 */
Blockly.Constants.Loops.WHILE_UNTIL_TOOLTIPS = {
  'WHILE': '%{BKY_CONTROLS_WHILEUNTIL_TOOLTIP_WHILE}',
  'UNTIL': '%{BKY_CONTROLS_WHILEUNTIL_TOOLTIP_UNTIL}',
};

Blockly.Extensions.register('controls_whileUntil_tooltip',
    Blockly.Extensions.buildTooltipForDropdown(
        'MODE', Blockly.Constants.Loops.WHILE_UNTIL_TOOLTIPS));

/**
 * Tooltips for the 'controls_flow_statements' block, keyed by FLOW value.
 * @see {Blockly.Extensions#buildTooltipForDropdown}
 * @package
 * @readonly
 */
Blockly.Constants.Loops.BREAK_CONTINUE_TOOLTIPS = {
  'BREAK': '%{BKY_CONTROLS_FLOW_STATEMENTS_TOOLTIP_BREAK}',
  'CONTINUE': '%{BKY_CONTROLS_FLOW_STATEMENTS_TOOLTIP_CONTINUE}',
};

Blockly.Extensions.register('controls_flow_tooltip',
    Blockly.Extensions.buildTooltipForDropdown(
        'FLOW', Blockly.Constants.Loops.BREAK_CONTINUE_TOOLTIPS));

/**
 * Mixin to add a context menu item to create a 'variables_get' block.
 * Used by blocks 'controls_for' and 'controls_forEach'.
 * @mixin
 * @augments Blockly.Block
 * @package
 * @readonly
 */
Blockly.Constants.Loops.CUSTOM_CONTEXT_MENU_CREATE_VARIABLES_GET_MIXIN = {
  /**
   * Add context menu option to create getter block for the loop's variable.
   * (customContextMenu support limited to web BlockSvg.)
   * @param {!Array} options List of menu options to add to.
   * @this {Blockly.Block}
   */
  customContextMenu: function(options) {
    if (this.isInFlyout) {
      return;
    }
    const variable = this.getField('VAR').getVariable();
    const varName = variable.name;
    if (!this.isCollapsed() && varName !== null) {
      const option = {enabled: true};
      option.text =
          Blockly.Msg['VARIABLES_SET_CREATE_GET'].replace('%1', varName);
      const xmlField = Blockly.Variables.generateVariableFieldDom(variable);
      const xmlBlock = Blockly.utils.xml.createElement('block');
      xmlBlock.setAttribute('type', 'variables_get');
      xmlBlock.appendChild(xmlField);
      option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
      options.push(option);
    }
  },
};

Blockly.Extensions.registerMixin('contextMenu_newGetVariableBlock',
    Blockly.Constants.Loops.CUSTOM_CONTEXT_MENU_CREATE_VARIABLES_GET_MIXIN);

Blockly.Extensions.register('controls_for_tooltip',
    Blockly.Extensions.buildTooltipWithFieldText(
        '%{BKY_CONTROLS_FOR_TOOLTIP}', 'VAR'));

Blockly.Extensions.register('controls_forEach_tooltip',
    Blockly.Extensions.buildTooltipWithFieldText(
        '%{BKY_CONTROLS_FOREACH_TOOLTIP}', 'VAR'));

/**
 * This mixin adds a check to make sure the 'controls_flow_statements' block
 * is contained in a loop. Otherwise a warning is added to the block.
 * @mixin
 * @augments Blockly.Block
 * @package
 * @readonly
 */
Blockly.Constants.Loops.CONTROL_FLOW_IN_LOOP_CHECK_MIXIN = {
  /**
   * List of block types that are loops and thus do not need warnings.
   * To add a new loop type add this to your code:
   * Blockly.Constants.Loops.CONTROL_FLOW_IN_LOOP_CHECK_MIXIN.LOOP_TYPES.push('custom_loop');
   */
  LOOP_TYPES: [
    'controls_repeat',
    'controls_repeat_ext',
    'controls_forEach',
    'controls_for',
    'controls_whileUntil',
  ],

  /**
   * Is the given block enclosed (at any level) by a loop?
   * @param {!Blockly.Block} block Current block.
   * @return {Blockly.Block} The nearest surrounding loop, or null if none.
   */
  getSurroundLoop: function(block) {
    // Is the block nested in a loop?
    do {
      if (Blockly.Constants.Loops.CONTROL_FLOW_IN_LOOP_CHECK_MIXIN.LOOP_TYPES
          .indexOf(block.type) !== -1) {
        return block;
      }
      block = block.getSurroundParent();
    } while (block);
    return null;
  },

  /**
   * Called whenever anything on the workspace changes.
   * Add warning if this flow block is not nested inside a loop.
   * @param {!Blockly.Events.Abstract} e Change event.
   * @this {Blockly.Block}
   */
  onchange: function(e) {
    // Don't change state if:
    //   * It's at the start of a drag.
    //   * It's not a move event.
    if (!this.workspace.isDragging || this.workspace.isDragging() ||
        e.type !== Blockly.Events.BLOCK_MOVE) {
      return;
    }
    const enabled = Blockly.Constants.Loops.CONTROL_FLOW_IN_LOOP_CHECK_MIXIN
        .getSurroundLoop(this);
    this.setWarningText(enabled ? null :
        Blockly.Msg['CONTROLS_FLOW_STATEMENTS_WARNING']);
    if (!this.isInFlyout) {
      const group = Blockly.Events.getGroup();
      // Makes it so the move and the disable event get undone together.
      Blockly.Events.setGroup(e.group);
      this.setEnabled(enabled);
      Blockly.Events.setGroup(group);
    }
  },
};

Blockly.Extensions.registerMixin('controls_flow_in_loop_check',
    Blockly.Constants.Loops.CONTROL_FLOW_IN_LOOP_CHECK_MIXIN);
