/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Base class for all types of block events.
 *
 * @class
 */
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Events.BlockBase');

import type {Block} from '../block.js';

import {Abstract as AbstractEvent, AbstractEventJson} from './events_abstract.js';


/**
 * Abstract class for a block event.
 *
 * @alias Blockly.Events.BlockBase
 */
export class BlockBase extends AbstractEvent {
  override isBlank = true;
  blockId?: string;

  /**
   * @param opt_block The block this event corresponds to.
   *     Undefined for a blank event.
   */
  constructor(opt_block?: Block) {
    super();
    this.isBlank = !!opt_block;

    if (!opt_block) return;

    /** The block ID for the block this event pertains to */
    this.blockId = opt_block.id;

    /** The workspace identifier for this event. */
    this.workspaceId = opt_block.workspace.id;
  }

  /**
   * Encode the event as JSON.
   *
   * @returns JSON representation.
   */
  override toJson(): AbstractEventJson {
    const json = super.toJson() as BlockBaseJson;
    if (!this.blockId) {
      throw new Error(
          'The block ID is undefined. Either pass a block to ' +
          'the constructor, or call fromJson');
    }
    json['blockId'] = this.blockId;
    return json;
  }

  /**
   * Decode the JSON event.
   *
   * @param json JSON representation.
   */
  override fromJson(json: BlockBaseJson) {
    super.fromJson(json);
    this.blockId = json['blockId'];
  }
}

export interface BlockBaseJson extends AbstractEventJson {
  blockId: string;
}
