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

// eslint-disable-next-line no-unused-vars
const VariableModel = goog.requireType('Blockly.VariableModel');
// eslint-disable-next-line no-unused-vars
const Workspace = goog.requireType('Blockly.Workspace');


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
 */
const load = function(state, workspace) {
  workspace.createVariable(state['name'], state['type'], state['id']);
};
/** @package */
exports.load = load;
