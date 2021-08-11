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
 
const Events = goog.require('Blockly.Events');
// eslint-disable-next-line no-unused-vars
const Workspace = goog.require('Blockly.Workspace');
const blocks = goog.require('Blockly.serialization.blocks');
const dom = goog.require('Blockly.utils.dom');
const variables = goog.require('Blockly.serialization.variables');
 

/**
 * Returns the state of the workspace as a plain JavaScript object.
 * @param {!Workspace} workspace The workspace to serialize.
 * @return {!Object<string, *>} The serialized state of the workspace.
 */
const save = function(workspace) {
  const state = Object.create(null);

  // TODO: Switch this to use plugin serialization system (once it is built).
  const variableStates = [];
  const vars = workspace.getAllVariables();
  for (let i = 0; i < vars.length; i++) {
    variableStates.push(variables.save(vars[i]));
  }
  if (variableStates.length) {
    state['variables'] = variableStates;
  }

  const blockStates = [];
  for (let block of workspace.getTopBlocks(false)) {
    const blockState =
      blocks.save(block, {addCoordinates: true});
    if (blockState) {
      blockStates.push(blockState);
    }
  }
  if (blockStates.length) {
    // This is an object to support adding language version later.
    state['blocks'] = {
      'blocks': blockStates
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
 * @param {{recordUndo: (boolean|undefined)}=} param1
 *     recordUndo: If true, events triggered by this function will be undo-able
 *       by the user. False by default.
 */
const load = function(state, workspace, {recordUndo = false} = {}) {
  // TODO: Switch this to use plugin serialization system (once it is built).
  // TODO: Add something for clearing the state before deserializing.

  const prevRecordUndo = Events.getRecordUndo();
  Events.setRecordUndo(recordUndo);
  const existingGroup = Events.getGroup();
  if (!existingGroup) {
    Events.setGroup(true);
  }

  dom.startTextWidthCache();
  if (workspace.setResizesEnabled) {
    workspace.setResizesEnabled(false);
  }

  if (state['variables']) {
    const variableStates = state['variables'];
    for (let i = 0; i < variableStates.length; i++) {
      variables.load(variableStates[i], workspace, {recordUndo});
    }
  }

  if (state['blocks']) {
    const blockStates = state['blocks']['blocks'];
    for (let i = 0; i < blockStates.length; i++) {
      blocks.load(blockStates[i], workspace, {recordUndo});
    }
  }

  if (workspace.setResizesEnabled) {
    workspace.setResizesEnabled(true);
  }
  dom.stopTextWidthCache();

  Events.fire(new (Events.get(Events.FINISHED_LOADING))(workspace));

  Events.setGroup(existingGroup);
  Events.setRecordUndo(prevRecordUndo);
};
exports.load = load;
