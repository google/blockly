/** @fileoverview Base class for all types of block events. */

/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Base class for all types of block events.
 * @class
 */

/* eslint-disable-next-line no-unused-vars */
import { Block } from '../block';

import { Abstract as AbstractEvent } from './events_abstract';


/**
 * Abstract class for a block event.
 * @alias Blockly.Events.BlockBase
 */
export class BlockBase extends AbstractEvent {
  override isBlank: AnyDuringMigration;
  blockId: string;
  override workspaceId: string;

  /**
   * @param opt_block The block this event corresponds to.
   *     Undefined for a blank event.
   */
  constructor(opt_block?: Block) {
    super();
    this.isBlank = typeof opt_block === 'undefined';

    /** The block ID for the block this event pertains to */
    this.blockId = this.isBlank ? '' : opt_block!.id;

    /** The workspace identifier for this event. */
    this.workspaceId = this.isBlank ? '' : opt_block!.workspace?.id ?? '';
  }

  /**
   * Encode the event as JSON.
   * @return JSON representation.
   */
  override toJson(): AnyDuringMigration {
    const json = super.toJson();
    json['blockId'] = this.blockId;
    return json;
  }

  /**
   * Decode the JSON event.
   * @param json JSON representation.
   */
  override fromJson(json: AnyDuringMigration) {
    super.fromJson(json);
    this.blockId = json['blockId'];
  }
}
