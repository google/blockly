/**
 * @fileoverview Main file (entry point) for the advanced compilation demo.
 */
'use strict';

goog.provide('Demo');

// messages (in some language)
goog.require('Blockly.Msg.en');
// core
goog.require('Blockly');
// blocks
goog.require('Blockly.Constants.Colour');
goog.require('Blockly.Constants.Lists');
goog.require('Blockly.Constants.Logic');
goog.require('Blockly.Constants.Loops');
goog.require('Blockly.Constants.Math');
goog.require('Blockly.Blocks.procedures');
goog.require('Blockly.Constants.Text');
goog.require('Blockly.Constants.Variables');


Demo.init = function() {
  Blockly.inject('blocklyDiv', {
    'media': '../../media/',
    'toolbox': document.getElementById('toolbox')
  });
}

window.addEventListener('load', Demo.init);

