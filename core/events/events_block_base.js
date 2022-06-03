/** @fileoverview Base class for all types of block events. */


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
