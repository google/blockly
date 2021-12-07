/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.provide('Main');
// Core
// Either require 'Blockly.requires', or just the components you use:
goog.require('Blockly');
goog.require('Blockly.geras.Renderer');
goog.require('Blockly.VerticalFlyout');
// Blocks
goog.require('Blockly.blocks.all');
goog.require('Blockly.blocks.testBlocks');

Main.init = function() {
  Blockly.inject('blocklyDiv', {
    'toolbox': document.getElementById('toolbox')
  });
};
window.addEventListener('load', Main.init);
