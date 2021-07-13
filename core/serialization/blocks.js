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

const save =
    function(block, {justThisBlock = false, addCoordinates = false} = {}) {
      const state = Object.create(null);
      state['type'] = block.type;
      state['id'] = block.id;
    
      addAttributes(block, state);
      if (addCoordinates) {
        addCoordinates(block, state);
      }
    
      return state;
    };

const addAttributes = function(block, state) {
  if (block.isCollapsed()){
    state['collapsed'] = true;
  }
  if (!block.isEnabled()){
    state['disabled'] = true;
  }
  if (!block.isEditable()){
    state['editable'] = false;
  }
  if (!block.isDeletable() && !block.isShadow()){
    state['deletable'] = false;
  }
  if (!block.isMovable() && !block.isShadow()){
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

addCoordinates = function(block, state) {
  const workspace = block.workspace;
  const xy = block.getRelativeToSurfaceXY();
  state['x'] = Math.round(workspace.RTL ? workspace.getWidth() - xy.x : xy.x);
  state['y'] = Math.round(xy.y);
};

exports = {
  save
}