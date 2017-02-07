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
 * @fileoverview Loop blocks for Blockly.
 *
 * This file is scraped to extract a .json file of block definitions. The array
 * passed to defineBlocksWithJsonArray(..) must be strict JSON: double quotes
 * only, no outside references, no functions, no trailing commas, etc. The one
 * exception is end-of-line comments, which the scraper will remove.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Blocks.loops');  // Deprecated
goog.provide('Blockly.Constants.Loops');

goog.require('Blockly.Blocks');


/**
 * Common HSV hue for all blocks in this category.
 * Should be the same as Blockly.Msg.LOOPS_HUE
 * @readonly
 */
Blockly.Constants.Loops.HUE = 120;
/** @deprecated Use Blockly.Constants.Loops.HUE */
Blockly.Blocks.loops.HUE = Blockly.Constants.Loops.HUE;

Blockly.defineBlocksWithJsonArray([  // BEGIN JSON EXTRACT
  // Block for repeat n times (external number).
  {
    "type": "controls_repeat_ext",
    "message0": "%{BKY_CONTROLS_REPEAT_TITLE}",
    "args0": [{
      "type": "input_value",
      "name": "TIMES",
      "check": "Number"
    }],
    "message1": "%{BKY_CONTROLS_REPEAT_INPUT_DO} %1",
    "args1": [{
      "type": "input_statement",
      "name": "DO"
    }],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_LOOPS_HUE}",
    "tooltip": "%{BKY_CONTROLS_REPEAT_TOOLTIP}",
    "helpUrl": "%{BKY_CONTROLS_REPEAT_HELPURL}"
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
      "precision": 1
    }],
    "message1": "%{BKY_CONTROLS_REPEAT_INPUT_DO} %1",
    "args1": [{
      "type": "input_statement",
      "name": "DO"
    }],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_LOOPS_HUE}",
    "tooltip": "%{BKY_CONTROLS_REPEAT_TOOLTIP}",
    "helpUrl": "%{BKY_CONTROLS_REPEAT_HELPURL}"
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
          ["%{BKY_CONTROLS_WHILEUNTIL_OPERATOR_UNTIL}", "UNTIL"]
        ]
      },
      {
        "type": "input_value",
        "name": "BOOL",
        "check": "Boolean"
      }
    ],
    "message1": "%{BKY_CONTROLS_REPEAT_INPUT_DO} %1",
    "args1": [{
      "type": "input_statement",
      "name": "DO"
    }],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_LOOPS_HUE}",
    "helpUrl": "%{BKY_CONTROLS_WHILEUNTIL_HELPURL}",
    "extensions": ["controls_whileUntil_tooltip"]
  }
]);    // END JSON EXTRACT (Do not delete this comment.)

/**
 * Tooltips for the 'controls_whileUntil' block, keyed by MODE value.
 *
 * Messages are not dereferenced here in order to capture possible language
 * changes.
 * @package
 * @readonly
 */
Blockly.Constants.Loops.TOOLTIPS_BY_MODE = {
  'WHILE': '%{BKY_CONTROLS_WHILEUNTIL_TOOLTIP_WHILE}',
  'UNTIL': '%{BKY_CONTROLS_WHILEUNTIL_TOOLTIP_UNTIL}'
};

Blockly.Extensions.register('controls_whileUntil_tooltip',
  Blockly.Extensions.buildTooltipForDropdown(
    'MODE', Blockly.Constants.Loops.TOOLTIPS_BY_MODE));

Blockly.Blocks['controls_for'] = {
  /**
   * Block for 'for' loop.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.CONTROLS_FOR_TITLE,
      "args0": [
        {
          "type": "field_variable",
          "name": "VAR",
          "variable": null
        },
        {
          "type": "input_value",
          "name": "FROM",
          "check": "Number",
          "align": "RIGHT"
        },
        {
          "type": "input_value",
          "name": "TO",
          "check": "Number",
          "align": "RIGHT"
        },
        {
          "type": "input_value",
          "name": "BY",
          "check": "Number",
          "align": "RIGHT"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Blocks.loops.HUE,
      "helpUrl": Blockly.Msg.CONTROLS_FOR_HELPURL
    });
    this.appendStatementInput('DO')
        .appendField(Blockly.Msg.CONTROLS_FOR_INPUT_DO);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      return Blockly.Msg.CONTROLS_FOR_TOOLTIP.replace('%1',
          thisBlock.getFieldValue('VAR'));
    });
  },
  /**
   * Add menu option to create getter block for loop variable.
   * @param {!Array} options List of menu options to add to.
   * @this Blockly.Block
   */
  customContextMenu: function(options) {
    if (!this.isCollapsed()) {
      var option = {enabled: true};
      var name = this.getFieldValue('VAR');
      option.text = Blockly.Msg.VARIABLES_SET_CREATE_GET.replace('%1', name);
      var xmlField = goog.dom.createDom('field', null, name);
      xmlField.setAttribute('name', 'VAR');
      var xmlBlock = goog.dom.createDom('block', null, xmlField);
      xmlBlock.setAttribute('type', 'variables_get');
      option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
      options.push(option);
    }
  }
};

Blockly.Blocks['controls_forEach'] = {
  /**
   * Block for 'for each' loop.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.CONTROLS_FOREACH_TITLE,
      "args0": [
        {
          "type": "field_variable",
          "name": "VAR",
          "variable": null
        },
        {
          "type": "input_value",
          "name": "LIST",
          "check": "Array"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Blocks.loops.HUE,
      "helpUrl": Blockly.Msg.CONTROLS_FOREACH_HELPURL
    });
    this.appendStatementInput('DO')
        .appendField(Blockly.Msg.CONTROLS_FOREACH_INPUT_DO);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      return Blockly.Msg.CONTROLS_FOREACH_TOOLTIP.replace('%1',
          thisBlock.getFieldValue('VAR'));
    });
  },
  customContextMenu: Blockly.Blocks['controls_for'].customContextMenu
};

Blockly.Blocks['controls_flow_statements'] = {
  /**
   * Block for flow statements: continue, break.
   * @this Blockly.Block
   */
  init: function() {
    var OPERATORS =
        [[Blockly.Msg.CONTROLS_FLOW_STATEMENTS_OPERATOR_BREAK, 'BREAK'],
         [Blockly.Msg.CONTROLS_FLOW_STATEMENTS_OPERATOR_CONTINUE, 'CONTINUE']];
    this.setHelpUrl(Blockly.Msg.CONTROLS_FLOW_STATEMENTS_HELPURL);
    this.setColour(Blockly.Blocks.loops.HUE);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(OPERATORS), 'FLOW');
    this.setPreviousStatement(true);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      var op = thisBlock.getFieldValue('FLOW');
      var TOOLTIPS = {
        'BREAK': Blockly.Msg.CONTROLS_FLOW_STATEMENTS_TOOLTIP_BREAK,
        'CONTINUE': Blockly.Msg.CONTROLS_FLOW_STATEMENTS_TOOLTIP_CONTINUE
      };
      return TOOLTIPS[op];
    });
  },
  /**
   * Called whenever anything on the workspace changes.
   * Add warning if this flow block is not nested inside a loop.
   * @param {!Blockly.Events.Abstract} e Change event.
   * @this Blockly.Block
   */
  onchange: function(/* e */) {
    if (!this.workspace.isDragging || this.workspace.isDragging()) {
      return;  // Don't change state at the start of a drag.
    }
    var legal = false;
    // Is the block nested in a loop?
    var block = this;
    do {
      if (this.LOOP_TYPES.indexOf(block.type) != -1) {
        legal = true;
        break;
      }
      block = block.getSurroundParent();
    } while (block);
    if (legal) {
      this.setWarningText(null);
      if (!this.isInFlyout) {
        this.setDisabled(false);
      }
    } else {
      this.setWarningText(Blockly.Msg.CONTROLS_FLOW_STATEMENTS_WARNING);
      if (!this.isInFlyout && !this.getInheritedDisabled()) {
        this.setDisabled(true);
      }
    }
  },
  /**
   * List of block types that are loops and thus do not need warnings.
   * To add a new loop type add this to your code:
   * Blockly.Blocks['controls_flow_statements'].LOOP_TYPES.push('custom_loop');
   */
  LOOP_TYPES: ['controls_repeat', 'controls_repeat_ext', 'controls_forEach',
      'controls_for', 'controls_whileUntil']
};
