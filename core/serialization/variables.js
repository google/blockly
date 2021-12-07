/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Handles serializing variables to plain JavaScript objects, only
 * containing state.
 */
'use strict';

/**
 * Handles serializing variables to plain JavaScript objects, only containing
 * state.
 * @namespace Blockly.serialization.variables
 */
goog.module('Blockly.serialization.variables');

const priorities = goog.require('Blockly.serialization.priorities');
const serializationRegistry = goog.require('Blockly.serialization.registry');
// eslint-disable-next-line no-unused-vars
const {ISerializer} = goog.require('Blockly.serialization.ISerializer');
// eslint-disable-next-line no-unused-vars
const {Workspace} = goog.requireType('Blockly.Workspace');


/**
 * Represents the state of a given variable.
 * @typedef {{
 *   name: string,
 *   id: string,
 *   type: (string|undefined)
 * }}
 * @alias Blockly.serialization.variables.State
 */
let State;
exports.State = State;

/**
 * Serializer for saving and loading variable state.
 * @implements {ISerializer}
 * @alias Blockly.serialization.variables.VariableSerializer
 */
class VariableSerializer {
  /* eslint-disable-next-line require-jsdoc */
  constructor() {
    /**
     * The priority for deserializing variables.
     * @type {number}
     */
    this.priority = priorities.VARIABLES;
  }

  /**
   * Serializes the variables of the given workspace.
   * @param {!Workspace} workspace The workspace to save the variables of.
   * @return {?Array<!State>} The state of the workspace's variables, or null
   *     if there are no variables.
   */
  save(workspace) {
    const variableStates = [];
    for (const variable of workspace.getAllVariables()) {
      const state = {
        'name': variable.name,
        'id': variable.getId(),
      };
      if (variable.type) {
        state['type'] = variable.type;
      }
      variableStates.push(state);
    }
    return variableStates.length ? variableStates : null;
  }

  /**
   * Deserializes the variable defined by the given state into the given
   * workspace.
   * @param {!Array<!State>} state The state of the variables to deserialize.
   * @param {!Workspace} workspace The workspace to deserialize into.
   */
  load(state, workspace) {
    for (const varState of state) {
      workspace.createVariable(
          varState['name'], varState['type'], varState['id']);
    }
  }

  /**
   * Disposes of any variables that exist on the workspace.
   * @param {!Workspace} workspace The workspace to clear the variables of.
   */
  clear(workspace) {
    workspace.getVariableMap().clear();
  }
}

serializationRegistry.register('variables', new VariableSerializer());
