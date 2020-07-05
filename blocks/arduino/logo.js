/**
 * @license Licensed under the Apache License, Version 2.0 (the "License"):
 *          http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * @fileoverview Blocks use for the Ardublockly logo creation.
 *     These are not mean to used at all.
 *
 * Generator:
 *  var noCode = function(block) { return ''; };
 *  Blockly.Arduino['ardublockly_name_bottom'] = noCode;
 *  Blockly.Arduino['ardublockly_plus_top_large'] = noCode;
 *  Blockly.Arduino['ardublockly_plus_top_small'] = noCode;
 *  Blockly.Arduino['ardublockly_plus_bottom_large'] = noCode;
 *  Blockly.Arduino['ardublockly_plus_bottom_small'] = noCode;
 *  Blockly.Arduino['ardublockly_plus_both_small'] = noCode;
 *  Blockly.Arduino['ardublockly_plus_both_large'] = noCode;
 *  Blockly.Arduino['ardublockly_minus_large'] = noCode;
 *  Blockly.Arduino['ardublockly_minus_small'] = noCode;
 *  
 * Toolbox:
 *  <sep></sep>
 *  <category name="Logo">
 *    <block type="ardublockly_name_top"></block>
 *    <block type="ardublockly_name_bottom"></block>
 *    <block type="ardublockly_plus_top_large"></block>
 *    <block type="ardublockly_plus_top_small"></block>
 *    <block type="ardublockly_plus_bottom_large"></block>
 *    <block type="ardublockly_plus_bottom_small"></block>
 *    <block type="ardublockly_minus_large"></block>
 *    <block type="ardublockly_minus_small"></block>
 *  </category>
 */
'use strict';

goog.provide('Blockly.Blocks.logo');

goog.require('Blockly.Blocks');


Blockly.Blocks.logo.HUE = 180;

/* Ardublockly block */
Blockly.Blocks['ardublockly_name_top'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Ardublockly");
    this.setPreviousStatement(true);
    this.setColour(Blockly.Blocks.logo.HUE);
  }
};

Blockly.Blocks['ardublockly_name_bottom'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Ardublockly");
    this.setNextStatement(true);
    this.setColour(Blockly.Blocks.logo.HUE);
    this.setTooltip('');
  }
};

/* Plus block */
Blockly.Blocks['ardublockly_plus_top_large'] = {
  init: function() {
    this.appendValueInput("NAME")
        .appendField("     +");
    this.setNextStatement(true);
    this.setColour(Blockly.Blocks.logo.HUE);
  }
};

Blockly.Blocks['ardublockly_plus_top_small'] = {
  init: function() {
    this.appendValueInput("NAME")
        .appendField("  +");
    this.setNextStatement(true);
    this.setColour(Blockly.Blocks.logo.HUE);
  }
};

Blockly.Blocks['ardublockly_plus_bottom_large'] = {
  init: function() {
    this.appendValueInput("NAME")
        .appendField("     +");
    this.setPreviousStatement(true);
    this.setColour(Blockly.Blocks.logo.HUE);
  }
};

Blockly.Blocks['ardublockly_plus_bottom_small'] = {
  init: function() {
    this.appendValueInput("NAME")
        .appendField("  +");
    this.setPreviousStatement(true);
    this.setColour(Blockly.Blocks.logo.HUE);
  }
};

Blockly.Blocks['ardublockly_plus_both_small'] = {
  init: function() {
    this.appendValueInput("NAME")
        .appendField("  +");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(Blockly.Blocks.logo.HUE);
  }
};

Blockly.Blocks['ardublockly_plus_both_large'] = {
  init: function() {
    this.appendValueInput("NAME")
        .appendField("     +");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(Blockly.Blocks.logo.HUE);
  }
};

/* Minus block */
Blockly.Blocks['ardublockly_minus_large'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("-     ");
    this.setInputsInline(false);
    this.setOutput(true);
    this.setColour(Blockly.Blocks.logo.HUE);
  }
};

Blockly.Blocks['ardublockly_minus_small'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("-  ");
    this.setInputsInline(false);
    this.setOutput(true);
    this.setColour(Blockly.Blocks.logo.HUE);
  }
};
