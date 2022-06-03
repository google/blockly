/** @fileoverview Events fired as a result of UI click in Blockly's editor. */


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
 * Events fired as a result of UI click in Blockly's editor.
 * @class
 */

/* eslint-disable-next-line no-unused-vars */
import { Block } from '../block';
import * as registry from '../registry';

import { UiBase } from './events_ui_base';
import * as eventUtils from './utils';


/**
 * Class for a click event.
 * @alias Blockly.Events.Click
 */
export class Click extends UiBase {
  blockId: AnyDuringMigration;
  targetType?: string;
  override type: string;

  /**
   * @param opt_block The affected block. Null for click events that do not have
   *     an associated block (i.e. workspace click). Undefined for a blank
   *     event.
   * @param opt_workspaceId The workspace identifier for this event.
   *    Not used if block is passed. Undefined for a blank event.
   * @param opt_targetType The type of element targeted by this click event.
   *     Undefined for a blank event.
   */
  constructor(
    opt_block?: Block | null, opt_workspaceId?: string | null,
    opt_targetType?: string) {
    let workspaceId = opt_block ? opt_block.workspace.id : opt_workspaceId;
    if (workspaceId === null) {
      workspaceId = undefined;
    }
    super(workspaceId);
    this.blockId = opt_block ? opt_block.id : null;

    /** The type of element targeted by this click event. */
    this.targetType = opt_targetType;

    /** Type of this event. */
    this.type = eventUtils.CLICK;
  }

  /**
   * Encode the event as JSON.
   * @return JSON representation.
   */
  override toJson(): AnyDuringMigration {
    const json = super.toJson();
    json['targetType'] = this.targetType;
    if (this.blockId) {
      json['blockId'] = this.blockId;
    }
    return json;
  }

  /**
   * Decode the JSON event.
   * @param json JSON representation.
   */
  override fromJson(json: AnyDuringMigration) {
    super.fromJson(json);
    this.targetType = json['targetType'];
    this.blockId = json['blockId'];
  }
}

registry.register(registry.Type.EVENT, eventUtils.CLICK, Click);
