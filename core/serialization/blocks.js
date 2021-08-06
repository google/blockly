/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Handles serializing blocks to plain JavaScript objects only
 *     containing state.
 */
'use strict';

goog.module('Blockly.serialization.blocks');
goog.module.declareLegacyNamespace();

// eslint-disable-next-line no-unused-vars
const Block = goog.requireType('Blockly.Block');
// eslint-disable-next-line no-unused-vars
const Connection = goog.requireType('Blockly.Connection');
const Xml = goog.require('Blockly.Xml');
const inputTypes = goog.require('Blockly.inputTypes');


// TODO: Remove this once lint is fixed.
/* eslint-disable no-use-before-define */

/**
 * Represents the state of a connection.
 * @typedef {{
 *   shadow: (!State|undefined),
 *   block: (!State|undefined)
 * }}
 */
var ConnectionState;
exports.ConnectionState = ConnectionState;

/**
 * Represents the state of a given block.
 * @typedef {{
 *     type: string,
 *     id: string,
 *     x: (number|undefined),
 *     y: (number|undefined),
 *     collapsed: (boolean|undefined),
 *     disabled: (boolean|undefined),
 *     editable: (boolean|undefined),
 *     deletable: (boolean|undefined),
 *     movable: (boolean|undefined),
 *     inline: (boolean|undefined),
 *     data: (string|undefined),
 *     extra-state: *,
 *     fields: (!Object<string, *>|undefined),
 *     inputs: (!Object<string, !ConnectionState>|undefined),
 *     next: (!ConnectionState|undefined)
 * }}
 */
var State;
exports.State = State;

/**
 * Returns the state of the given block as a plain JavaScript object.
 * @param {!Block} block The block to serialize.
 * @param {{addCoordinates: (boolean|undefined), addInputBlocks:
 *     (boolean|undefined), addNextBlocks: (boolean|undefined)}=} param1
 *     addCoordinates: If true, the coordinates of the block are added to the
 *       serialized state. False by default.
 *     addinputBlocks: If true, children of the block which are connected to
 *       inputs will be serialized. True by default.
 *     addNextBlocks: If true, children of the block which are connected to the
 *       block's next connection (if it exists) will be serialized.
 *       True by default.
 * @return {?State} The serialized state of the
 *     block, or null if the block could not be serialied (eg it was an
 *     insertion marker).
 */
const save = function(
    block,
    {
      addCoordinates = false,
      addInputBlocks = true,
      addNextBlocks = true
    } = {}
) {
  if (block.isInsertionMarker()) {
    return null;
  }

  const state = {
    'type': block.type,
    'id': block.id
  };

  if (addCoordinates) {
    saveCoords(block, state);
  }
  saveAttributes(block, state);
  saveExtraState(block, state);
  saveFields(block, state);
  if (addInputBlocks) {
    saveInputBlocks(block, state);
  }
  if (addNextBlocks) {
    saveNextBlocks(block, state);
  }

  return state;
};
exports.save = save;

/**
 * Adds attributes to the given state object based on the state of the block.
 * Eg collapsed, disabled, editable, etc.
 * @param {!Block} block The block to base the attributes on.
 * @param {!State} state The state object to append to.
 */
const saveAttributes = function(block, state) {
  if (block.isCollapsed()) {
    state['collapsed'] = true;
  }
  if (!block.isEnabled()) {
    state['enabled'] = false;
  }
  if (!block.isEditable()) {
    state['editable'] = false;
  }
  if (!block.isDeletable() && !block.isShadow()) {
    state['deletable'] = false;
  }
  if (!block.isMovable() && !block.isShadow()) {
    state['movable'] = false;
  }

  if (block.inputsInline !== undefined &&
      block.inputsInline !== block.inputsInlineDefault) {
    state['inline'] = block.inputsInline;
  }

  // Data is a nullable string, so we don't need to worry about falsy values.
  if (block.data) {
    state['data'] = block.data;
  }
};

/**
 * Adds the coordinates of the given block to the given state object.
 * @param {!Block} block The block to base the coordinates on
 * @param {!State} state The state object to append to
 */
const saveCoords = function(block, state) {
  const workspace = block.workspace;
  const xy = block.getRelativeToSurfaceXY();
  state['x'] = Math.round(workspace.RTL ? workspace.getWidth() - xy.x : xy.x);
  state['y'] = Math.round(xy.y);
};

/**
 * Adds any extra state the block may provide to the given state object.
 * @param {!Block} block The block to serialize the extra state of.
 * @param {!State} state The state object to append to.
 */
const saveExtraState = function(block, state) {
  if (block.saveExtraState) {
    const extraState = block.saveExtraState();
    if (extraState !== null) {
      state['extraState'] = extraState;
    }
  }
};

/**
 * Adds the state of all of the fields on the block to the given state object.
 * @param {!Block} block The block to serialize the field state of.
 * @param {!State} state The state object to append to.
 */
const saveFields = function(block, state) {
  let hasFieldState = false;
  let fields = Object.create(null);
  for (let i = 0; i < block.inputList.length; i++) {
    const input = block.inputList[i];
    for (let j = 0; j < input.fieldRow.length; j++) {
      const field = input.fieldRow[j];
      if (field.isSerializable()) {
        hasFieldState = true;
        fields[field.name] = field.saveState();
      }
    }
  }
  if (hasFieldState) {
    state['fields'] = fields;
  }
};

/**
 * Adds the state of all of the child blocks of the given block (which are
 * connected to inputs) to the given state object.
 * @param {!Block} block The block to serialize the input blocks of.
 * @param {!State} state The state object to append to.
 */
const saveInputBlocks = function(block, state) {
  const inputs = Object.create(null);
  for (let i = 0; i < block.inputList.length; i++) {
    const input = block.inputList[i];
    if (input.type === inputTypes.DUMMY) {
      continue;
    }
    const connectionState =
        saveConnection(/** @type {!Connection} */ (input.connection));
    if (connectionState) {
      inputs[input.name] = connectionState;
    }
  }

  if (Object.keys(inputs).length) {
    state['inputs'] = inputs;
  }
};

/**
 * Adds the state of all of the next blocks of the given block to the given
 * state object.
 * @param {!Block} block The block to serialize the next blocks of.
 * @param {!State} state The state object to append to.
 */
const saveNextBlocks = function(block, state) {
  if (!block.nextConnection) {
    return;
  }
  const connectionState = saveConnection(block.nextConnection);
  if (connectionState) {
    state['next'] = connectionState;
  }
};

/**
 * Returns the state of the given connection (ie the state of any connected
 * shadow or real blocks).
 * @param {!Connection} connection The connection to serialize the connected
 *     blocks of.
 * @return {?ConnectionState} An object containing the state of any connected
 *     shadow block, or any connected real block.
 */
const saveConnection = function(connection) {
  const shadow = connection.getShadowDom();
  const child = connection.targetBlock();
  if (!shadow && !child) {
    return null;
  }
  var state = Object.create(null);
  if (shadow) {
    state['shadow'] = Xml.domToText(shadow)
        .replace('xmlns="https://developers.google.com/blockly/xml"', '');
  }
  if (child) {
    state['block'] = save(child);
  }
  return state;
};
