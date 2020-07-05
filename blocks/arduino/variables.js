/**
 * @license Licensed under the Apache License, Version 2.0 (the "License"):
 *          http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * @fileoverview Block for the Arduino map functionality.
 *     The Arduino built in functions syntax can be found at:
 *     http://arduino.cc/en/Reference/HomePage
 *
 * TODO: This block can be improved to set the new range properly.
 */
'use strict';

goog.require('Blockly.Blocks');
goog.require('Blockly.Types');


/** Common HSV hue for all blocks in this category. */
Blockly.Blocks.variables.HUE = 330;

Blockly.Blocks['variables_set_type'] = {
  /**
   * Block for variable casting.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl('http://arduino.cc/en/Reference/HomePage');
    this.setColour(Blockly.Blocks.variables.HUE);
    this.appendValueInput('VARIABLE_SETTYPE_INPUT');
    this.appendDummyInput()
        .appendField(Blockly.Msg.ARD_VAR_AS)
        .appendField(new Blockly.FieldDropdown(
                         Blockly.Types.getValidTypeArray()),
                     'VARIABLE_SETTYPE_TYPE');
    this.setInputsInline(true);
    this.setOutput(true);
    this.setTooltip(Blockly.Msg.ARD_VAR_AS_TIP);
  },
  /**
   * Assigns a type to the block based on the selected type to cast.
   * @return {!string} Blockly type for this block configuration.
   * @this Blockly.Block
   */
  getBlockType: function() {
    var blocklyTypeKey = this.getFieldValue('VARIABLE_SETTYPE_TYPE');
    return Blockly.Types[blocklyTypeKey];
  }
};
