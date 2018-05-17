goog.provide('Main');
// Messages (in some language)
goog.require('Blockly.Msg.en');
// Core
goog.require('Blockly');
// Blocks
goog.require('Blockly.Constants.Logic');
goog.require('Blockly.Constants.Loops');
goog.require('Blockly.Constants.Math');
goog.require('Blockly.Constants.Text');
goog.require('Blockly.Constants.Lists');
goog.require('Blockly.Constants.Colour');
goog.require('Blockly.Constants.Variables');
goog.require('Blockly.Constants.VariablesDynamic');
goog.require('Blockly.Blocks.procedures');

Main.init = function() {
  Blockly.inject('blocklyDiv', {
    'toolbox': document.getElementById('toolbox')
  });
};
window.addEventListener('load', Main.init);
