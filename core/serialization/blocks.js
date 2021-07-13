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

goog.provide('Blockly.serialization.blocks');

Blockly.serialization.blocks.save =
    function(block, {justThisBlock = false, addCoordinates = false} = {}) {
      const state = Object.create(null);
      state['type'] = block.type;
      state['id'] = block.id;
    
      Blockly.serialization.blocks.addAttributes_(block, state);
      if (addCoordinates) {
        Blockly.serialization.blocks.addCoordinates_(block, state);
      }
    
      return state;
    };

Blockly.serialization.blocks.addAttributes_ = function(block, state) {
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

Blockly.serialization.blocks.addCoordinates_ = function(block, state) {
  const workspace = block.workspace;
  const xy = block.getRelativeToSurfaceXY();
  state['x'] = Math.round(workspace.RTL ? workspace.getWidth() - xy.x : xy.x);
  state['y'] = Math.round(xy.y);
};
