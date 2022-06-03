/** @fileoverview Events fired as a result of a theme update. */


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
 * Events fired as a result of a theme update.
 * @class
 */

import * as registry from '../registry';

import { UiBase } from './events_ui_base';
import * as eventUtils from './utils';


/**
 * Class for a theme change event.
 * @alias Blockly.Events.ThemeChange
 */
export class ThemeChange extends UiBase {
  themeName?: string;
  override type: string;

  /**
   * @param opt_themeName The theme name. Undefined for a blank event.
   * @param opt_workspaceId The workspace identifier for this event.
   *    event. Undefined for a blank event.
   */
  constructor(opt_themeName?: string, opt_workspaceId?: string) {
    super(opt_workspaceId);

    /** The theme name. */
    this.themeName = opt_themeName;

    /** Type of this event. */
    this.type = eventUtils.THEME_CHANGE;
  }

  /**
   * Encode the event as JSON.
   * @return JSON representation.
   */
  override toJson(): AnyDuringMigration {
    const json = super.toJson();
    json['themeName'] = this.themeName;
    return json;
  }

  /**
   * Decode the JSON event.
   * @param json JSON representation.
   */
  override fromJson(json: AnyDuringMigration) {
    super.fromJson(json);
    this.themeName = json['themeName'];
  }
}

registry.register(registry.Type.EVENT, eventUtils.THEME_CHANGE, ThemeChange);
