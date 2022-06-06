/** @fileoverview Events fired as a block drag. */

/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Events fired as a block drag.
 * @class
 */

/* eslint-disable-next-line no-unused-vars */
import { Block } from '../block';
import * as registry from '../registry';

import { UiBase } from './events_ui_base';
import * as eventUtils from './utils';


/**
 * Class for a block drag event.
 * @alias Blockly.Events.BlockDrag
 */
export class BlockDrag extends UiBase {
  blockId: AnyDuringMigration;
  isStart?: boolean;
  blocks?: Block[];
  override type: string;

  /**
   * @param opt_block The top block in the stack that is being dragged.
   *     Undefined for a blank event.
   * @param opt_isStart Whether this is the start of a block drag.
   *    Undefined for a blank event.
   * @param opt_blocks The blocks affected by this drag. Undefined for a blank
   *     event.
   */
  constructor(opt_block?: Block, opt_isStart?: boolean, opt_blocks?: Block[]) {
    const workspaceId = opt_block ? opt_block.workspace?.id : undefined;
    super(workspaceId);
    this.blockId = opt_block ? opt_block.id : null;

    /** Whether this is the start of a block drag. */
    this.isStart = opt_isStart;

    /** The blocks affected by this drag event. */
    this.blocks = opt_blocks;

    /** Type of this event. */
    this.type = eventUtils.BLOCK_DRAG;
  }

  /**
   * Encode the event as JSON.
   * @return JSON representation.
   */
  override toJson(): AnyDuringMigration {
    const json = super.toJson();
    json['isStart'] = this.isStart;
    json['blockId'] = this.blockId;
    json['blocks'] = this.blocks;
    return json;
  }

  /**
   * Decode the JSON event.
   * @param json JSON representation.
   */
  override fromJson(json: AnyDuringMigration) {
    super.fromJson(json);
    this.isStart = json['isStart'];
    this.blockId = json['blockId'];
    this.blocks = json['blocks'];
  }
}

registry.register(registry.Type.EVENT, eventUtils.BLOCK_DRAG, BlockDrag);
