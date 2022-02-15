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
  * @deprecated Remove September 2022.
  */
 const isDebuggerEnabled = function() {
   console.warn('Blockly.blockRendering.isDebuggerEnabled() functionality has been removed. Please see https://www.npmjs.com/package/@blockly/dev-tools for more information on how you can use the debug renderer.');
   return useDebugger;
 };
 exports.isDebuggerEnabled = isDebuggerEnabled;
 
 /**
  * Turn on the blocks debugger.
  * @package
  * @alias Blockly.blockRendering.debug.startDebugger
  */
 const startDebugger = function() {
   console.warn('Blockly.blockRendering.startDebugger() functionality has been removed. Please see https://www.npmjs.com/package/@blockly/dev-tools for more information on how you can use the debug renderer.');
   useDebugger = true;
 };
 exports.startDebugger = startDebugger;
 
 /**
  * Turn off the blocks debugger.
  * @package
  * @alias Blockly.blockRendering.debug.stopDebugger
  */
 const stopDebugger = function() {
   console.warn('Blockly.blockRendering.stopDebugger() functionality has been removed. Please see https://www.npmjs.com/package/@blockly/dev-tools for more information on how you can use the debug renderer.');
   useDebugger = false;
 };
 exports.stopDebugger = stopDebugger;
