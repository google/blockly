/**
 * @fileoverview Custom langugage blocks for Blockly.
 * @author jstn@cs.washington.edu (Justin Huang)
 */
'use strict';

goog.provide('Blockly.Blocks.custom');

goog.require('Blockly.Blocks');

Blockly.Blocks['custom_controls_repeat_forever'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("repeat forever");
    this.appendStatementInput("DO")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip('Repeats the code forever, unless there is a break or return statement inside.');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['controls_flow_statements'].LOOP_TYPES.push('custom_controls_repeat_forever');
