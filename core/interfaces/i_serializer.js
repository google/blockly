/**
 * @fileoverview The record type for an object containing functions for
 * serializing part of the workspace.
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
 * The record type for an object containing functions for
 *     serializing part of the workspace.
 * @namespace Blockly.serialization.ISerializer
 */

// eslint-disable-next-line no-unused-vars
import { Workspace } from '../workspace';


/**
 * Serializes and deserializes a plugin or system.
 * @alias Blockly.serialization.ISerializer.ISerializer
 */
export interface ISerializer {
  /**
   * A priority value used to determine the order of deserializing state.
   * More positive priorities are deserialized before less positive
   * priorities. Eg if you have priorities (0, -10, 10, 100) the order of
   * deserialiation will be (100, 10, 0, -10).
   * If two serializers have the same priority, they are deserialized in an
   * arbitrary order relative to each other.
   */
  priority: number;

  /* eslint-disable no-unused-vars, valid-jsdoc */

  /**
   * Saves the state of the plugin or system.
   * @param workspace The workspace the system to serialize is associated with.
   * @return A JS object containing the system's state, or null if there is no
   *     state to record.
   */
  save(workspace: Workspace): AnyDuringMigration;
  /* eslint-enable valid-jsdoc */

  /**
   * Loads the state of the plugin or system.
   * @param state The state of the system to deserialize. This will always be
   *     non-null.
   * @param workspace The workspace the system to deserialize is associated
   *     with.
   */
  load(state: AnyDuringMigration, workspace: Workspace): void;

  /**
   * Clears the state of the plugin or system.
   * @param workspace The workspace the system to clear the state of is
   *     associated with.
   */
  clear(workspace: Workspace): void;
}
/* eslint-enable no-unused-vars */
