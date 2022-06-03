/**
 * @fileoverview Module that provides constants for use inside Blockly. Do not
 * use these constants outside of the core library.
 */


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
 * Module that provides constants for use inside Blockly. Do not
 * use these constants outside of the core library.
 * @namespace Blockly.internalConstants
 */

import { ConnectionType } from './connection_type';


/**
 * Number of characters to truncate a collapsed block to.
 * @alias Blockly.internalConstants.COLLAPSE_CHARS
 */
export const COLLAPSE_CHARS = 30;

/**
 * When dragging a block out of a stack, split the stack in two (true), or drag
 * out the block healing the stack (false).
 * @alias Blockly.internalConstants.DRAG_STACK
 */
export const DRAG_STACK = true;

/**
 * Lookup table for determining the opposite type of a connection.
 * @alias Blockly.internalConstants.OPPOSITE_TYPE
 */
export const OPPOSITE_TYPE: number[] = [];
OPPOSITE_TYPE[ConnectionType.INPUT_VALUE] = ConnectionType.OUTPUT_VALUE;
OPPOSITE_TYPE[ConnectionType.OUTPUT_VALUE] = ConnectionType.INPUT_VALUE;
OPPOSITE_TYPE[ConnectionType.NEXT_STATEMENT] =
  ConnectionType.PREVIOUS_STATEMENT;
OPPOSITE_TYPE[ConnectionType.PREVIOUS_STATEMENT] =
  ConnectionType.NEXT_STATEMENT;

/**
 * String for use in the dropdown created in field_variable.
 * This string indicates that this option in the dropdown is 'Rename
 * variable...' and if selected, should trigger the prompt to rename a variable.
 * @alias Blockly.internalConstants.RENAME_VARIABLE_ID
 */
export const RENAME_VARIABLE_ID = 'RENAME_VARIABLE_ID';

/**
 * String for use in the dropdown created in field_variable.
 * This string indicates that this option in the dropdown is 'Delete the "%1"
 * variable' and if selected, should trigger the prompt to delete a variable.
 * @alias Blockly.internalConstants.DELETE_VARIABLE_ID
 */
export const DELETE_VARIABLE_ID = 'DELETE_VARIABLE_ID';
