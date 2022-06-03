/** @fileoverview An enum for the possible types of inputs. */


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
 * An enum for the possible types of inputs.
 * @namespace Blockly.inputTypes
 */

import { ConnectionType } from './connection_type';


/**
 * Enum for the type of a connection or input.
 * @alias Blockly.inputTypes
 */
export enum inputTypes {
  // A right-facing value input.  E.g. 'set item to' or 'return'.
  VALUE = ConnectionType.INPUT_VALUE,
  // A down-facing block stack.  E.g. 'if-do' or 'else'.
  STATEMENT = ConnectionType.NEXT_STATEMENT,
  // A dummy input.  Used to add field(s) with no input.
  DUMMY = 5
}
