/** @fileoverview Events fired as a result of trashcan flyout open and close. */


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
 * Events fired as a result of trashcan flyout open and close.
 * @class
 */

import * as registry from '../registry';

import { UiBase } from './events_ui_base';
import * as eventUtils from './utils';


/**
 * Class for a trashcan open event.
 * @alias Blockly.Events.TrashcanOpen
 */
export class TrashcanOpen extends UiBase {
  isOpen?: boolean;
  override type: string;

  /**
   * @param opt_isOpen Whether the trashcan flyout is opening (false if
   *     opening). Undefined for a blank event.
   * @param opt_workspaceId The workspace identifier for this event.
   *    Undefined for a blank event.
   */
  constructor(opt_isOpen?: boolean, opt_workspaceId?: string) {
    super(opt_workspaceId);

    /** Whether the trashcan flyout is opening (false if closing). */
    this.isOpen = opt_isOpen;

    /** Type of this event. */
    this.type = eventUtils.TRASHCAN_OPEN;
  }

  /**
   * Encode the event as JSON.
   * @return JSON representation.
   */
  override toJson(): AnyDuringMigration {
    const json = super.toJson();
    json['isOpen'] = this.isOpen;
    return json;
  }

  /**
   * Decode the JSON event.
   * @param json JSON representation.
   */
  override fromJson(json: AnyDuringMigration) {
    super.fromJson(json);
    this.isOpen = json['isOpen'];
  }
}

registry.register(registry.Type.EVENT, eventUtils.TRASHCAN_OPEN, TrashcanOpen);
