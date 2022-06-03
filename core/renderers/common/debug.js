/** @fileoverview Block rendering debugging functionality. */


/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Block rendering debugging functionality.
 * @namespace Blockly.blockRendering.debug
 */

import * as deprecation from 'google3/third_party/javascript/blockly/core/utils/deprecation';


/** Whether or not the debugger is turned on. */
let useDebugger = false;
/**
 * Returns whether the debugger is turned on.
 * @return Whether the debugger is turned on.
 * @alias Blockly.blockRendering.debug.isDebuggerEnabled
 */
export function isDebuggerEnabled(): boolean {
  return useDebugger;
}

/**
 * Turn on the blocks debugger.
 * @alias Blockly.blockRendering.debug.startDebugger
 * @deprecated March 2022. Use the rendering debugger in @blockly/dev-tools.
 * See https://www.npmjs.com/package/@blockly/dev-tools for more information.
 */
export function startDebugger() {
  deprecation.warn(
    'Blockly.blockRendering.debug.startDebugger()', 'February 2022',
    'September 2022',
    'the debug renderer in @blockly/dev-tools (See https://www.npmjs.com/package/@blockly/dev-tools.)');
  useDebugger = true;
}

/**
 * Turn off the blocks debugger.
 * @alias Blockly.blockRendering.debug.stopDebugger
 * @deprecated March 2022. Use the rendering debugger in @blockly/dev-tools.
 * See https://www.npmjs.com/package/@blockly/dev-tools for more information.
 */
export function stopDebugger() {
  deprecation.warn(
    'Blockly.blockRendering.debug.stopDebugger()', 'February 2022',
    'September 2022',
    'the debug renderer in @blockly/dev-tools (See https://www.npmjs.com/package/@blockly/dev-tools.)');
  useDebugger = false;
}
