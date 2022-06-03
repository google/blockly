/** @fileoverview An enum for the possible types of connections. */


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
 * An enum for the possible types of connections.
 * @namespace Blockly.ConnectionType
 */


/**
 * Enum for the type of a connection or input.
 * @alias Blockly.ConnectionType
 */
export enum ConnectionType {
  // A right-facing value input.  E.g. 'set item to' or 'return'.
  INPUT_VALUE = 1,
  // A left-facing value output.  E.g. 'random fraction'.
  OUTPUT_VALUE,
  // A down-facing block stack.  E.g. 'if-do' or 'else'.
  NEXT_STATEMENT,
  // An up-facing block stack.  E.g. 'break out of loop'.
  PREVIOUS_STATEMENT
}
