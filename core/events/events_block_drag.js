/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Events fired as a block drag.
 */
'use strict';

/**
 * Events fired as a block drag.
 * @class
 */
goog.module('Blockly.Events.BlockDrag');

const eventUtils = goog.require('Blockly.Events.utils');
const registry = goog.require('Blockly.registry');
/* eslint-disable-next-line no-unused-vars */
const {Block} = goog.requireType('Blockly.Block');
const {UiBase} = goog.require('Blockly.Events.UiBase');


/**
 * Class for a block drag event.
 * @extends {UiBase}
 * @alias Blockly.Events.BlockDrag
 */
class BlockDrag extends UiBase {
  /**
   * @param {!Block=} opt_block The top block in the stack that is being
   *    dragged. Undefined for a blank event.
   * @param {boolean=} opt_isStart Whether this is the start of a block drag.
   *    Undefined for a blank event.
   * @param {!Array<!Block>=} opt_blocks The blocks affected by this
   *    drag. Undefined for a blank event.
   */
  constructor(opt_block, opt_isStart, opt_blocks) {
    const workspaceId = opt_block ? opt_block.workspace.id : undefined;
    super(workspaceId);
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

    /**
     * Type of this event.
     * @type {string}
     */
    this.type = eventUtils.BLOCK_DRAG;
  }

  /**
   * Encode the event as JSON.
   * @return {!Object} JSON representation.
   */
  toJson() {
    const json = super.toJson();
    json['isStart'] = this.isStart;
    json['blockId'] = this.blockId;
    json['blocks'] = this.blocks;
    return json;
  }

  /**
   * Decode the JSON event.
   * @param {!Object} json JSON representation.
   */
  fromJson(json) {
    super.fromJson(json);
    this.isStart = json['isStart'];
    this.blockId = json['blockId'];
    this.blocks = json['blocks'];
  }
}

registry.register(registry.Type.EVENT, eventUtils.BLOCK_DRAG, BlockDrag);

exports.BlockDrag = BlockDrag;
