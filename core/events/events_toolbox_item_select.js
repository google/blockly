/**
 * @fileoverview Events fired as a result of selecting an item on the toolbox.
 */


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
 * Events fired as a result of selecting an item on the toolbox.
 * @class
 */

import * as registry from '../registry';

import { UiBase } from './events_ui_base';
import * as eventUtils from './utils';


/**
 * Class for a toolbox item select event.
 * @alias Blockly.Events.ToolboxItemSelect
 */
export class ToolboxItemSelect extends UiBase {
  oldItem?: string | null;
  newItem?: string | null;
  override type: string;

  /**
   * @param opt_oldItem The previously selected toolbox item.
   *     Undefined for a blank event.
   * @param opt_newItem The newly selected toolbox item. Undefined for a blank
   *     event.
   * @param opt_workspaceId The workspace identifier for this event.
   *    Undefined for a blank event.
   */
  constructor(
    opt_oldItem?: string | null, opt_newItem?: string | null,
    opt_workspaceId?: string) {
    super(opt_workspaceId);

    /** The previously selected toolbox item. */
    this.oldItem = opt_oldItem;

    /** The newly selected toolbox item. */
    this.newItem = opt_newItem;

    /** Type of this event. */
    this.type = eventUtils.TOOLBOX_ITEM_SELECT;
  }

  /**
   * Encode the event as JSON.
   * @return JSON representation.
   */
  override toJson(): AnyDuringMigration {
    const json = super.toJson();
    json['oldItem'] = this.oldItem;
    json['newItem'] = this.newItem;
    return json;
  }

  /**
   * Decode the JSON event.
   * @param json JSON representation.
   */
  override fromJson(json: AnyDuringMigration) {
    super.fromJson(json);
    this.oldItem = json['oldItem'];
    this.newItem = json['newItem'];
  }
}

registry.register(
  registry.Type.EVENT, eventUtils.TOOLBOX_ITEM_SELECT, ToolboxItemSelect);
