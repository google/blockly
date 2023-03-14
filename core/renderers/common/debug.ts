/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as goog from '../../../closure/goog/goog.js';
goog.declareModuleId('Blockly.blockRendering.debug');

import * as deprecation from '../../utils/deprecation.js';


/** Whether or not the debugger is turned on. */
let useDebugger = false;
/**
 * Returns whether the debugger is turned on.
 *
 * @returns Whether the debugger is turned on.
 * @internal
 */
export function isDebuggerEnabled(): boolean {
  return useDebugger;
}

/**
 * Turn on the blocks debugger.
 *
 * @deprecated March 2022. Use the rendering debugger in @blockly/dev-tools.
 * See https://www.npmjs.com/package/@blockly/dev-tools for more information.
 * @internal
 */
export function startDebugger() {
  deprecation.warn(
      'Blockly.blockRendering.debug.startDebugger()', 'version 8', 'version 10',
      'the debug renderer in @blockly/dev-tools (See https://www.npmjs.com/package/@blockly/dev-tools.)');
  useDebugger = true;
}

/**
 * Turn off the blocks debugger.
 *
 * @deprecated March 2022. Use the rendering debugger in @blockly/dev-tools.
 * See https://www.npmjs.com/package/@blockly/dev-tools for more information.
 * @internal
 */
export function stopDebugger() {
  deprecation.warn(
      'Blockly.blockRendering.debug.stopDebugger()', 'version 8', 'version 10',
      'the debug renderer in @blockly/dev-tools (See https://www.npmjs.com/package/@blockly/dev-tools.)');
  useDebugger = false;
}
