/** @fileoverview The interface for an object that a style can be added to. */


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
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */



/**
 * The interface for an object that a style can be added to.
 * @namespace Blockly.IStyleable
 */


/**
 * Interface for an object that a style can be added to.
 * @alias Blockly.IStyleable
 */
export interface IStyleable {
  /**
   * Adds a style on the toolbox. Usually used to change the cursor.
   * @param style The name of the class to add.
   */
  addStyle: AnyDuringMigration;

  /**
   * Removes a style from the toolbox. Usually used to change the cursor.
   * @param style The name of the class to remove.
   */
  removeStyle: AnyDuringMigration;
}
