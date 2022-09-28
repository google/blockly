/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Base class for all types of block events.
 */
'use strict';

/**
 * Base class for all types of block events.
 * @class
 */
goog.module('Blockly.Events.BlockBase');

const {Abstract: AbstractEvent} = goog.require('Blockly.Events.Abstract');
/* eslint-disable-next-line no-unused-vars */
const {Block} = goog.requireType('Blockly.Block');


/**
 * Abstract class for a block event.
 * @extends {AbstractEvent}
 * @alias Blockly.Events.BlockBase
 */
class BlockBase extends AbstractEvent {
  /**
   * @param {!Block=} opt_block The block this event corresponds to.
   *     Undefined for a blank event.
   */
  constructor(opt_block) {
    super();
    this.isBlank = typeof opt_block === 'undefined';

    /**
     * The block ID for the block this event pertains to
     * @type {string}
     */
    this.blockId = this.isBlank ? '' : opt_block.id;

    /**
     * The workspace identifier for this event.
     * @type {string}
     */
    this.workspaceId = this.isBlank ? '' : opt_block.workspace.id;
  }

  /**
   * Encode the event as JSON.
   * @return {!Object} JSON representation.
   */
  toJson() {
    const json = super.toJson();
    json['blockId'] = this.blockId;
    return json;
  }

  /**
   * Decode the JSON event.
   * @param {!Object} json JSON representation.
   */
  fromJson(json) {
    super.fromJson(json);
    this.blockId = json['blockId'];
  }
}

exports.BlockBase = BlockBase;
