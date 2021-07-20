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

// TODO: Is there any way to not export these? I would rather keep this out of
//     the public API if possible.

/**
 * Represents the state of a given variable.
 * @typedef {{
 *   name: string,
 *   id: string,
 *   type: ?string,
 * }}
 */
// eslint-disable-next-line no-unused-vars
var State;

/**
 * Returns the state of the variable as a plain JavaScript object.
 * @param {!Blockly.variableModel} variableModel The variable to serialize.
 * @return {!Blockly.serialization.variables.State} The serialized state of the
 *     variable.
 */
const save = function(variableModel) {
  const state = Object.create(null);
  state['name'] = variableModel.name;
  state['id'] = variableModel.getId();
  if (variableModel.type) {
    state['type'] = variableModel.type;
  }
  return state;
};

/**
 * Loads the variable represented by the given state into the given workspace.
 * @param {!Blockly.serializatio.variables.State} state The state of a variable
 *     to deserialize into he workspace.
 * @param {!Blockly.Workspace} workspace The workspace to add the variable to.
 */
const load = function(state, workspace) {
  workspace.createVariable(state['name'], state['type'], state['id']);
};

exports = {save, load};
