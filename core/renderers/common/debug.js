/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Block rendering debugging functionality.
 */
'use strict';

/**
 * Block rendering debugging functionality.
 * @namespace Blockly.blockRendering.debug
 */
goog.module('Blockly.blockRendering.debug');

const deprecation = goog.require('Blockly.utils.deprecation');


/**
 * Whether or not the debugger is turned on.
 * @type {boolean}
 */
let useDebugger = false;
/**
 * Returns whether the debugger is turned on.
 * @return {boolean} Whether the debugger is turned on.
 * @alias Blockly.blockRendering.debug.isDebuggerEnabled
 * @package
 */
const isDebuggerEnabled = function() {
  return useDebugger;
};
exports.isDebuggerEnabled = isDebuggerEnabled;

/**
 * Turn on the blocks debugger.
 * @package
 * @alias Blockly.blockRendering.debug.startDebugger
 * @deprecated March 2022. Use the rendering debugger in @blockly/dev-tools.
 * See https://www.npmjs.com/package/@blockly/dev-tools for more information.
 */
const startDebugger = function() {
  deprecation.warn(
      'Blockly.blockRendering.debug.startDebugger()', 'February 2022',
      'September 2022',
      'the debug renderer in @blockly/dev-tools (See https://www.npmjs.com/package/@blockly/dev-tools.)');
  useDebugger = true;
};
exports.startDebugger = startDebugger;

/**
 * Turn off the blocks debugger.
 * @package
 * @alias Blockly.blockRendering.debug.stopDebugger
 * @deprecated March 2022. Use the rendering debugger in @blockly/dev-tools.
 * See https://www.npmjs.com/package/@blockly/dev-tools for more information.
 */
const stopDebugger = function() {
  deprecation.warn(
      'Blockly.blockRendering.debug.stopDebugger()', 'February 2022',
      'September 2022',
      'the debug renderer in @blockly/dev-tools (See https://www.npmjs.com/package/@blockly/dev-tools.)');
  useDebugger = false;
};
exports.stopDebugger = stopDebugger;
