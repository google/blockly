/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Handles serializing variables to plain JavaScript objects, only
 *     containing state.
 */
'use strict';

goog.module('Blockly.serialization.variables');
goog.module.declareLegacyNamespace();

const Events = goog.require('Blockly.Events');
// eslint-disable-next-line no-unused-vars
const PluginSerializer = goog.requireType('PluginSerializer');
// eslint-disable-next-line no-unused-vars
const VariableModel = goog.requireType('Blockly.VariableModel');
// eslint-disable-next-line no-unused-vars
const Workspace = goog.requireType('Blockly.Workspace');
const priorities = goog.require('Blockly.serialization.priorities');
const registry = goog.require('Blockly.registry');


/**
 * Represents the state of a given variable.
 * @typedef {{
 *   name: string,
 *   id: string,
 *   type: (string|undefined),
 * }}
 */
var State;
exports.State = State;

/**
 * Returns the state of the variable as a plain JavaScript object.
 * @param {!VariableModel} variableModel The variable to serialize.
 * @return {!State} The serialized state of the variable.
 */
const save = function(variableModel) {
  const state = {
    'name': variableModel.name,
    'id': variableModel.getId()
  };
  if (variableModel.type) {
    state['type'] = variableModel.type;
  }
  return state;
};
/** @package */
exports.save = save;

/**
 * Loads the variable represented by the given state into the given workspace.
 * Do not call this directly, use workspace.createVariable instead.
 * @param {!State} state The state of a variable to deserialize into the
 *     workspace.
 * @param {!Workspace} workspace The workspace to add the variable to.
 * @param {{recordUndo: (boolean|undefined)}=} param1
 *     recordUndo: If true, events triggered by this function will be undo-able
 *       by the user. False by default.
 */
const load = function(state, workspace, {recordUndo = false} = {}) {
  const prevRecordUndo = Events.recordUndo;
  Events.recordUndo = recordUndo;
  const existingGroup = Events.getGroup();
  if (!existingGroup) {
    Events.setGroup(true);
  }

  workspace.createVariable(state['name'], state['type'], state['id']);

  Events.setGroup(existingGroup);
  Events.recordUndo = prevRecordUndo;
};
/** @package */
exports.load = load;

/**
 * Plugin serializer for saving and loading variable state.
 * @implements {PluginSerializer}
 */
class VariableSerializer {
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
      variableStates.push(save(variable));
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
      load(varState, workspace, {recordUndo: Events.recordUndo});
    }
  }

  /**
   * Disposes of any variables or potential variables that exist on the
   * workspace.
   * @param {!Workspace} workspace The workspace to clear the variables of.
   */
  clear(workspace) {
    workspace.getVariableMap().clear();
  }
}

registry.register(
    registry.Type.PLUGIN_SERIALIZER, 'variables', new VariableSerializer());
