/**
 * @license
 * Copyright 2018 Google LLC
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
 * @file Abstract class for a module event.
 * @author dev@varwin.com (Varwin Developers)
 */
// Former goog.module ID: Blockly.Events.ModuleBase

import {
  Abstract as AbstractEvent,
  AbstractEventJson,
} from './events_abstract.js';
import {ModuleModel} from '../module_model.js';

/**
 * Abstract class for a module event.
 *
 * @augments {Abstract}
 */
export class ModuleBase extends AbstractEvent {
  override isBlank = true;

  moduleId?: string = undefined;
  workspaceId?: string = undefined;

  /**
   * @param {ModuleModel} module The module this event corresponds to.
   */
  constructor(module: ModuleModel) {
    super();

    /**
     * The module id for the module this event pertains to.
     *
     * @type {string}
     */
    this.moduleId = module.getId();
    this.workspaceId = module.workspace.id;
  }

  /**
   * Encode the event as JSON.
   *
   * @returns {!object} JSON representation.
   */
  override toJson() {
    const json = super.toJson() as ModuleBaseJson;
    json['moduleId'] = this.moduleId || '';
    return json;
  }

  /**
   * Decode the JSON event.
   *
   * @param {!object} json JSON representation.
   * @param module
   * @param event
   */
  static fromJson(json: ModuleBaseJson, module: any, event?: any) {
    return super.fromJson(
      json,
      module,
      event ?? new ModuleBase(module),
    ) as ModuleBase;
  }
}

export interface ModuleBaseJson extends AbstractEventJson {
  moduleId: string;
}
