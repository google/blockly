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

Blockly.serialization.blocks.save = function(block, options) {
  options = Blockly.serialization.blocks.setupSaveOptions_(options);

  var state = Object.create(null);
  state['type'] = block.type;
  state['id'] = block.id;

  Blockly.serialization.blocks.addAttributes_(block, state);
  if (options.addCoordinates) {
    Blockly.serialization.blocks.addCoordinates_(block, state);
  }

  return state;
};

Blockly.serialization.blocks.setupSaveOptions_ = function(options) {
  options = options || Object.create(null);
  if (options.justThisBlock === undefined) {
    options.justThisBlock = false;
  }
  if (options.addCoordinates === undefined) {
    options.addCoordinates = false;
  }
  return options;
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
};

Blockly.serialization.blocks.addCoordinates_ = function(block, state) {
  var workspace = block.workspace;
  var xy = block.getRelativeToSurfaceXY();
  state['x'] = Math.round(workspace.RTL ? workspace.getWidth() - xy.x : xy.x);
  state['y'] = Math.round(xy.y);
};
