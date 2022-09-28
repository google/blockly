/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Contains top-level functions for serializing workspaces to
 * plain JavaScript objects.
 */
'use strict';

/**
 * Contains top-level functions for serializing workspaces to plain JavaScript
 * objects.
 * @namespace Blockly.serialization.workspaces
 */
goog.module('Blockly.serialization.workspaces');

const dom = goog.require('Blockly.utils.dom');
const eventUtils = goog.require('Blockly.Events.utils');
const registry = goog.require('Blockly.registry');
// eslint-disable-next-line no-unused-vars
const {Workspace} = goog.require('Blockly.Workspace');
const {WorkspaceSvg} = goog.require('Blockly.WorkspaceSvg');


/**
 * Returns the state of the workspace as a plain JavaScript object.
 * @param {!Workspace} workspace The workspace to serialize.
 * @return {!Object<string, *>} The serialized state of the workspace.
 * @alias Blockly.serialization.workspaces.save
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
 * @alias Blockly.serialization.workspaces.load
 */
const load = function(state, workspace, {recordUndo = false} = {}) {
  const serializerMap = registry.getAllItems(registry.Type.SERIALIZER, true);
  if (!serializerMap) {
    return;
  }

  const deserializers = Object.entries(serializerMap)
                            .sort((a, b) => b[1].priority - a[1].priority);

  const prevRecordUndo = eventUtils.getRecordUndo();
  eventUtils.setRecordUndo(recordUndo);
  const existingGroup = eventUtils.getGroup();
  if (!existingGroup) {
    eventUtils.setGroup(true);
  }

  dom.startTextWidthCache();
  if (workspace instanceof WorkspaceSvg) {
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

  if (workspace instanceof WorkspaceSvg) {
    workspace.setResizesEnabled(true);
  }
  dom.stopTextWidthCache();

  eventUtils.fire(new (eventUtils.get(eventUtils.FINISHED_LOADING))(workspace));

  eventUtils.setGroup(existingGroup);
  eventUtils.setRecordUndo(prevRecordUndo);
};
exports.load = load;
