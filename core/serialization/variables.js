/**
 * @fileoverview Handles serializing variables to plain JavaScript objects, only
 * containing state.
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
 * Handles serializing variables to plain JavaScript objects, only containing
 * state.
 * @namespace Blockly.serialization.variables
 */

// eslint-disable-next-line no-unused-vars
import { ISerializer } from '../interfaces/i_serializer';
// eslint-disable-next-line no-unused-vars
import { Workspace } from '../workspace';

import * as priorities from './priorities';
import * as serializationRegistry from './registry';


/**
 * Represents the state of a given variable.
 * @alias Blockly.serialization.variables.State
 */
export interface State {
  name: string;
  id: string;
  type: string | undefined;
}

/**
 * Serializer for saving and loading variable state.
 * @alias Blockly.serialization.variables.VariableSerializer
 */
class VariableSerializer implements ISerializer {
  priority: number;

  /* eslint-disable-next-line require-jsdoc */
  constructor() {
    /** The priority for deserializing variables. */
    this.priority = priorities.VARIABLES;
  }

  /**
   * Serializes the variables of the given workspace.
   * @param workspace The workspace to save the variables of.
   * @return The state of the workspace's variables, or null if there are no
   *     variables.
   */
  save(workspace: Workspace): State[] | null {
    const variableStates = [];
    for (const variable of workspace.getAllVariables()) {
      const state = {
        'name': variable.name,
        'id': variable.getId(),
      };
      if (variable.type) {
        (state as AnyDuringMigration)['type'] = variable.type;
      }
      variableStates.push(state);
    }
    // AnyDuringMigration because:  Type '{ name: string; id: string; }[] |
    // null' is not assignable to type 'State[] | null'.
    return (variableStates.length ? variableStates : null) as
      AnyDuringMigration;
  }

  /**
   * Deserializes the variable defined by the given state into the given
   * workspace.
   * @param state The state of the variables to deserialize.
   * @param workspace The workspace to deserialize into.
   */
  load(state: State[], workspace: Workspace) {
    for (const varState of state) {
      workspace.createVariable(
        varState['name'], varState['type'], varState['id']);
    }
  }

  /**
   * Disposes of any variables that exist on the workspace.
   * @param workspace The workspace to clear the variables of.
   */
  clear(workspace: Workspace) {
    workspace.getVariableMap().clear();
  }
}

serializationRegistry.register('variables', new VariableSerializer());
