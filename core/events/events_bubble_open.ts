/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Events fired as a result of bubble open.
 *
 * @class
 */
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Events.BubbleOpen');

import type {AbstractEventJson} from './events_abstract.js';
import type {BlockSvg} from '../block_svg.js';
import * as registry from '../registry.js';
import {UiBase} from './events_ui_base.js';
import * as eventUtils from './utils.js';


/**
 * Class for a bubble open event.
 *
 * @alias Blockly.Events.BubbleOpen
 */
export class BubbleOpen extends UiBase {
  blockId?: string;
  isOpen?: boolean;
  bubbleType?: BubbleType;
  override type = eventUtils.BUBBLE_OPEN;

  /**
   * @param opt_block The associated block. Undefined for a blank event.
   * @param opt_isOpen Whether the bubble is opening (false if closing).
   *     Undefined for a blank event.
   * @param opt_bubbleType The type of bubble. One of 'mutator', 'comment' or
   *     'warning'. Undefined for a blank event.
   */
  constructor(
      opt_block?: BlockSvg, opt_isOpen?: boolean, opt_bubbleType?: BubbleType) {
    const workspaceId = opt_block ? opt_block.workspace.id : undefined;
    super(workspaceId);
    if (!opt_block) return;

    this.blockId = opt_block.id;

    /** Whether the bubble is opening (false if closing). */
    this.isOpen = opt_isOpen;

    /** The type of bubble. One of 'mutator', 'comment', or 'warning'. */
    this.bubbleType = opt_bubbleType;
  }

  /**
   * Encode the event as JSON.
   *
   * @returns JSON representation.
   */
  override toJson(): BubbleOpenJson {
    const json = super.toJson() as BubbleOpenJson;
    if (this.isOpen === undefined) {
      throw new Error(
          'Whether this event is for opening the bubble is ' +
          'undefined. Either pass the value to the constructor, or call ' +
          'fromJson');
    }
    if (!this.bubbleType) {
      throw new Error(
          'The type of bubble is undefined. Either pass the ' +
          'value to the constructor, or call ' +
          'fromJson');
    }
    json['isOpen'] = this.isOpen;
    json['bubbleType'] = this.bubbleType;
    json['blockId'] = this.blockId || '';
    return json;
  }

  /**
   * Decode the JSON event.
   *
   * @param json JSON representation.
   */
  override fromJson(json: BubbleOpenJson) {
    super.fromJson(json);
    this.isOpen = json['isOpen'];
    this.bubbleType = json['bubbleType'];
    this.blockId = json['blockId'];
  }
}

export enum BubbleType {
  MUTATOR = 'mutator',
  COMMENT = 'comment',
  WARNING = 'warning',
}

export interface BubbleOpenJson extends AbstractEventJson {
  isOpen: boolean;
  bubbleType: BubbleType;
  blockId: string;
}

registry.register(registry.Type.EVENT, eventUtils.BUBBLE_OPEN, BubbleOpen);
