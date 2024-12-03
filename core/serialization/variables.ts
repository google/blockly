/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Former goog.module ID: Blockly.serialization.variables

import type {ISerializer} from '../interfaces/i_serializer.js';
import type {Workspace} from '../workspace.js';
import * as priorities from './priorities.js';
import * as serializationRegistry from './registry.js';

/**
 * Represents the state of a given variable.
 */
export interface State {
  name: string;
  id: string;
  type: string | undefined;
}

/**
 * Serializer for saving and loading variable state.
 */
export class VariableSerializer implements ISerializer {
  priority: number;

  constructor() {
    /** The priority for deserializing variables. */
    this.priority = priorities.VARIABLES;
  }

  /**
   * Serializes the variables of the given workspace.
   *
   * @param workspace The workspace to save the variables of.
   * @returns The state of the workspace's variables, or null if there are no
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
    return (
      variableStates.length ? variableStates : null
    ) as AnyDuringMigration;
  }

  /**
   * Deserializes the variable defined by the given state into the given
   * workspace.
   *
   * @param state The state of the variables to deserialize.
   * @param workspace The workspace to deserialize into.
   */
  load(state: State[], workspace: Workspace) {
    for (const varState of state) {
      workspace.createVariable(
        varState['name'],
        varState['type'],
        varState['id'],
      );
    }
  }

  /**
   * Disposes of any variables that exist on the workspace.
   *
   * @param workspace The workspace to clear the variables of.
   */
  clear(workspace: Workspace) {
    workspace.getVariableMap().clear();
  }
}

serializationRegistry.register('variables', new VariableSerializer());
