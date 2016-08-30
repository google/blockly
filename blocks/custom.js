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
    this.setColour(120);
    this.setTooltip('Repeats the code forever, unless there is a break or return statement inside.');
    this.setHelpUrl('');
  }
};
