/** @fileoverview Events fired as a result of bubble open. */


/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Events fired as a result of bubble open.
 * @class
 */

/* eslint-disable-next-line no-unused-vars */
import { BlockSvg } from '../block_svg';
import * as registry from '../registry';

import { UiBase } from './events_ui_base';
import * as eventUtils from './utils';


/**
 * Class for a bubble open event.
 * @alias Blockly.Events.BubbleOpen
 */
export class BubbleOpen extends UiBase {
  blockId: string | null;
  isOpen?: boolean;
  bubbleType?: string;
  override type: string;

  /**
   * @param opt_block The associated block. Undefined for a blank event.
   * @param opt_isOpen Whether the bubble is opening (false if closing).
   *     Undefined for a blank event.
   * @param opt_bubbleType The type of bubble. One of 'mutator', 'comment' or
   *     'warning'. Undefined for a blank event.
   */
  constructor(
    opt_block: BlockSvg, opt_isOpen?: boolean, opt_bubbleType?: string) {
    const workspaceId = opt_block ? opt_block.workspace.id : undefined;
    super(workspaceId);
    this.blockId = opt_block ? opt_block.id : null;

    /** Whether the bubble is opening (false if closing). */
    this.isOpen = opt_isOpen;

    /** The type of bubble. One of 'mutator', 'comment', or 'warning'. */
    this.bubbleType = opt_bubbleType;

    /** Type of this event. */
    this.type = eventUtils.BUBBLE_OPEN;
  }

  /**
   * Encode the event as JSON.
   * @return JSON representation.
   */
  override toJson(): AnyDuringMigration {
    const json = super.toJson();
    json['isOpen'] = this.isOpen;
    json['bubbleType'] = this.bubbleType;
    json['blockId'] = this.blockId;
    return json;
  }

  /**
   * Decode the JSON event.
   * @param json JSON representation.
   */
  override fromJson(json: AnyDuringMigration) {
    super.fromJson(json);
    this.isOpen = json['isOpen'];
    this.bubbleType = json['bubbleType'];
    this.blockId = json['blockId'];
  }
}

registry.register(registry.Type.EVENT, eventUtils.BUBBLE_OPEN, BubbleOpen);
