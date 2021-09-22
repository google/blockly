/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Events fired as a block drag.
 * @author kozbial@google.com (Monica Kozbial)
 */
'use strict';

goog.module('Blockly.Events.BlockDrag');
goog.module.declareLegacyNamespace();

const Events = goog.require('Blockly.Events');
const UiBase = goog.require('Blockly.Events.UiBase');
const object = goog.require('Blockly.utils.object');
const registry = goog.require('Blockly.registry');
/* eslint-disable-next-line no-unused-vars */
const {Block} = goog.requireType('Blockly.Block');


/**
 * Class for a block drag event.
 * @param {!Block=} opt_block The top block in the stack that is being
 *    dragged. Undefined for a blank event.
 * @param {boolean=} opt_isStart Whether this is the start of a block drag.
 *    Undefined for a blank event.
 * @param {!Array<!Block>=} opt_blocks The blocks affected by this
 *    drag. Undefined for a blank event.
 * @extends {UiBase}
 * @constructor
 */
const BlockDrag = function(opt_block, opt_isStart, opt_blocks) {
  const workspaceId = opt_block ? opt_block.workspace.id : undefined;
  BlockDrag.superClass_.constructor.call(this, workspaceId);
  this.blockId = opt_block ? opt_block.id : null;

  /**
   * Whether this is the start of a block drag.
   * @type {boolean|undefined}
   */
  this.isStart = opt_isStart;

  /**
   * The blocks affected by this drag event.
   * @type {!Array<!Block>|undefined}
   */
  this.blocks = opt_blocks;
};
object.inherits(BlockDrag, UiBase);

/**
 * Type of this event.
 * @type {string}
 */
BlockDrag.prototype.type = Events.BLOCK_DRAG;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
BlockDrag.prototype.toJson = function() {
  const json = BlockDrag.superClass_.toJson.call(this);
  json['isStart'] = this.isStart;
  json['blockId'] = this.blockId;
  json['blocks'] = this.blocks;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
BlockDrag.prototype.fromJson = function(json) {
  BlockDrag.superClass_.fromJson.call(this, json);
  this.isStart = json['isStart'];
  this.blockId = json['blockId'];
  this.blocks = json['blocks'];
};

registry.register(registry.Type.EVENT, Events.BLOCK_DRAG, BlockDrag);

exports = BlockDrag;
