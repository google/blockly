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
const dom = goog.require('Blockly.utils.dom');
const registry = goog.require('Blockly.registry');
 

/**
 * Returns the state of the workspace as a plain JavaScript object.
 * @param {!Workspace} workspace The workspace to serialize.
 * @return {!Object<string, *>} The serialized state of the workspace.
 */
const save = function(workspace) {
  const state = Object.create(null);
  const serializerMap = registry.getAllItems(registry.Type.SERIALIZER, true);
  for (const key in serializerMap) {
    const save = serializerMap[key].save(workspace);
    if (save) {
      state[key] = save;
    }
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
  const serializerMap = registry.getAllItems(registry.Type.SERIALIZER, true);
  if (!serializerMap) {
    return;
  }

  const deserializers = Object.entries(serializerMap)
      .sort(([, {priority: priorityA}], [, {priority: priorityB}]) =>
        priorityB - priorityA);

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
  
  // We want to trigger clearing in reverse priority order so plugins don't end
  // up missing dependencies.
  for (const [, deserializer] of deserializers.reverse()) {
    deserializer.clear(workspace);
  }

  // reverse() is destructive, so we have to re-reverse to correct the order.
  for (let [name, deserializer] of deserializers.reverse()) {
    name = /** @type {string} */ (name);
    const pluginState = state[name];
    if (pluginState) {
      deserializer.load(state[name], workspace);
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
