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

goog.provide('Blockly.Blocks.map');

goog.require('Blockly.Blocks');
goog.require('Blockly.Types');


/** Common HSV hue for all blocks in this category. */
Blockly.Blocks.map.HUE = 230;

Blockly.Blocks['base_map'] = {
  /**
   * Block for creating a the map function.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl('http://arduino.cc/en/Reference/map');
    this.setColour(Blockly.Blocks.map.HUE);
    this.appendValueInput('NUM')
        .appendField(Blockly.Msg.ARD_MAP)
        .setCheck(Blockly.Types.NUMBER.checkList);
    this.appendValueInput('DMAX')
        .appendField(Blockly.Msg.ARD_MAP_VAL)
        .setCheck(Blockly.Types.NUMBER.checkList);
    this.appendDummyInput()
        .appendField(']');
    this.setInputsInline(true);
    this.setOutput(true);
    this.setTooltip(Blockly.Msg.ARD_MAP_TIP);
  },
  /** @return {string} The type of return value for the block, an integer. */
  getBlockType: function() {
    return Blockly.Types.NUMBER;
  }
};
