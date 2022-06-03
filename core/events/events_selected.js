/** @fileoverview Events fired as a result of element select action. */


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
 * Events fired as a result of element select action.
 * @class
 */

import * as registry from '../registry';

import { UiBase } from './events_ui_base';
import * as eventUtils from './utils';


/**
 * Class for a selected event.
 * @alias Blockly.Events.Selected
 */
export class Selected extends UiBase {
  oldElementId?: string | null;
  newElementId?: string | null;
  override type: string;

  /**
   * @param opt_oldElementId The ID of the previously selected element. Null if
   *     no element last selected. Undefined for a blank event.
   * @param opt_newElementId The ID of the selected element. Null if no element
   *     currently selected (deselect). Undefined for a blank event.
   * @param opt_workspaceId The workspace identifier for this event.
   *    Null if no element previously selected. Undefined for a blank event.
   */
  constructor(
    opt_oldElementId?: string | null, opt_newElementId?: string | null,
    opt_workspaceId?: string) {
    super(opt_workspaceId);

    /** The id of the last selected element. */
    this.oldElementId = opt_oldElementId;

    /** The id of the selected element. */
    this.newElementId = opt_newElementId;

    /** Type of this event. */
    this.type = eventUtils.SELECTED;
  }

  /**
   * Encode the event as JSON.
   * @return JSON representation.
   */
  override toJson(): AnyDuringMigration {
    const json = super.toJson();
    json['oldElementId'] = this.oldElementId;
    json['newElementId'] = this.newElementId;
    return json;
  }

  /**
   * Decode the JSON event.
   * @param json JSON representation.
   */
  override fromJson(json: AnyDuringMigration) {
    super.fromJson(json);
    this.oldElementId = json['oldElementId'];
    this.newElementId = json['newElementId'];
  }
}

registry.register(registry.Type.EVENT, eventUtils.SELECTED, Selected);
