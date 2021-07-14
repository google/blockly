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


// TODO: Remove this once lint is fixed.
/* eslint-disable no-use-before-define */

/**
 * Represents the state of a given block.
 * @typedef {{
 *     type: string,
 *     id: string,
 *     x: ?number,
 *     y: ?number,
 *     collapsed: ?boolean,
 *     disabled: ?boolean,
 *     editable: ?boolean,
 *     deletable: ?boolean,
 *     movable: ?boolean,
 *     inline: ?boolean,
 *     data: ?string,
 * }}
 */
// eslint-disable-next-line no-unused-vars
var State;

/**
 * Returns the state of the given block as a plain JavaScript object.
 * @param {!Blockly.Block} block The block to serialize.
 * @param {{justThisBlock: (boolean|undefined), addCoordinates:
 *     (boolean|undefined)}=} param1
 *     justThisBlock: If true, none of the children of the given block are
 *       serialized. False by default.
 *     addCoordinates: If true the coordinates of the block are added to the
 *       serialized state. False by default.
 * @return {?Blockly.serialization.blocks.State} The serialized state of the
 *     block, or null if the block could not be serialied (eg it was an
 *     insertion marker).
 */
function save(block, {addCoordinates = false} = {}) {
  if (block.isInsertionMarker()) {
    return null;
  }

  const state = Object.create(null);
  state['type'] = block.type;
  state['id'] = block.id;

  if (addCoordinates) {
    addCoords(block, state);
  }
  addAttributes(block, state);

  return state;
}

/**
 * Adds attributes to the given state object based on the state of the block.
 * Eg collapsed, disabled, editable, etc.
 * @param {!Blockly.Block} block The block to base the attributes on.
 * @param {!Blockly.serialization.blocks.State} state The state object to append
 *     to.
 */
function addAttributes(block, state) {
  if (block.isCollapsed()) {
    state['collapsed'] = true;
  }
  if (!block.isEnabled()) {
    state['disabled'] = true;
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
}

/**
 * Adds the coordinates of the given block to the given state object.
 * @param {!Blockly.Block} block The block to base the coordinates on
 * @param {!Blockly.serialization.blocks.State} state The state object to append
 *     to
 */
function addCoords(block, state) {
  const workspace = block.workspace;
  const xy = block.getRelativeToSurfaceXY();
  state['x'] = Math.round(workspace.RTL ? workspace.getWidth() - xy.x : xy.x);
  state['y'] = Math.round(xy.y);
}

exports = {save};
