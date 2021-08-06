/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Contains top-level functions for serializing workspaces to
 *     plain JavaScript objects.
 */
'use strict';

goog.module('Blockly.serialization.workspaces');
goog.module.declareLegacyNamespace();
 
// eslint-disable-next-line no-unused-vars
const Workspace = goog.require('Blockly.Workspace');
const blocks = goog.require('Blockly.serialization.blocks');
const variables = goog.require('Blockly.serialization.variables');
 

/**
 * Returns the state of the workspace as a plain JavaScript object.
 * @param {!Workspace} workspace The workspace to serialize.
 * @return {!Object<string, *>} The serialized state of the workspace.
 */
const save = function(workspace) {
  const state = Object.create(null);

  // TODO: Switch this to use plugin serialization system (once it is built).
  const variableState = [];
  const vars = workspace.getAllVariables();
  for (let i = 0; i < vars.length; i++) {
    variableState.push(variables.save(vars[i]));
  }
  if (variableState.length) {
    state['variables'] = variableState;
  }

  const blockState = [];
  for (let block of workspace.getTopBlocks(false)) {
    blockState.push(
        blocks.save(block, {addCoordinates: true}));
  }
  if (blockState.length) {
    // This is an object to support adding language version later.
    state['blocks'] = {
      'blocks': blockState
    };
  }

  return state;
};
exports.save = save;
 
/**
 * Loads the variable represented by the given state into the given workspace.
 * @param {!Object<string, *>} state The state of the workspace to deserialize
 *     into the workspace.
 * @param {!Workspace} workspace The workspace to add the new state to.
 */
const load = function(state, workspace) {
  // TODO: Switch this to use plugin serialization system (once it is built).
  // TODO: Add something for clearing the state before deserializing.

  if (state['variables']) {
    const variableStates = state['variables'];
    for (let i = 0; i < variableStates.length; i++) {
      variables.load(variableStates[i], workspace);
    }
  }

  if (state['blocks']) {
    const blockStates = state['blocks']['blocks'];
    for (let i = 0; i < blockStates.length; i++) {
      blocks.load(blockStates[i], workspace);
    }
  }
};
exports.load = load;
