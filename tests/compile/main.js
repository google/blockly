/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.module('Main');

// Core
// Either require 'Blockly.requires', or just the components you use:
/* eslint-disable-next-line no-unused-vars */
// TODO: I think we need to make sure these get exported?
// const {BlocklyOptions} = goog.requireType('Blockly.BlocklyOptions');
const {inject} = goog.require('Blockly.inject');
const {getMainWorkspace} = goog.require('Blockly.common');
const {Msg} = goog.require('Blockly.Msg');
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
goog.require('testBlocks');


function init() {
  Object.assign(Msg, window['Blockly']['Msg']);
  inject('blocklyDiv', /** @type {BlocklyOptions} */ ({
           'toolbox': document.getElementById('toolbox')
         }));
}
window.addEventListener('load', init);


// Called externally from our test driver to see if Blockly loaded more or less
// correctly.  This is not a comprehensive test, but it will catch catastrophic
// fails (by far the most common cases).
window['healthCheck'] = function() {
  // Just check that we have a reasonable number of blocks in the flyout.
  // Expecting 8 blocks, but leave a wide margin.
  try {
    const blockCount =
        getMainWorkspace().getFlyout().getWorkspace().getTopBlocks().length;
    return (blockCount > 5 && blockCount < 100);
  } catch (_e) {
    return false;
  }
};
