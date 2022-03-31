/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.module('Main');

// Core
// Either require 'Blockly.requires', or just the components you use:
/* eslint-disable-next-line no-unused-vars */
const {BlocklyOptions} = goog.requireType('Blockly.BlocklyOptions');
const {inject} = goog.require('Blockly.inject');
/** @suppress {extraRequire} */
goog.require('Blockly.geras.Renderer');
/** @suppress {extraRequire} */
goog.require('Blockly.VerticalFlyout');
// Blocks
/** @suppress {extraRequire} */
goog.require('Blockly.libraryBlocks.logic');
/** @suppress {extraRequire} */
goog.require('Blockly.libraryBlocks.loops');
/** @suppress {extraRequire} */
goog.require('Blockly.libraryBlocks.math');
/** @suppress {extraRequire} */
goog.require('Blockly.libraryBlocks.texts');
/** @suppress {extraRequire} */
goog.require('Blockly.libraryBlocks.testBlocks');


function init() {
  inject('blocklyDiv', /** @type {BlocklyOptions} */ ({
           'toolbox': document.getElementById('toolbox')
         }));
};
window.addEventListener('load', init);
