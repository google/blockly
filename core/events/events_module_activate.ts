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
 * @file Module activate event.
 * @author dev@varwin.com (Varwin Developers)
 */
// Former goog.module ID: Blockly.Events.ModuleActivate

import * as eventUtils from '../events/utils.js';
import * as registry from '../registry.js';
import {ModuleBase, ModuleBaseJson} from './events_module_base.js';
import {ModuleModel} from '../module_model.js';

/**
 * Class for a module activation event.
 */
export class ModuleActivate extends ModuleBase {
  previousActiveId: string | null = null;
  type: string = '';

  constructor(module: ModuleModel, previousActiveModule: ModuleModel) {
    super(module);

    if (!module) {
      return; // Blank event to be populated by fromJson.
    }

    this.type = eventUtils.MODULE_ACTIVATE;

    this.previousActiveId = previousActiveModule
      ? previousActiveModule.getId()
      : null;
  }

  /**
   * Encode the event as JSON.
   *
   * @returns {!object} JSON representation.
   */
  override toJson() {
    const json = super.toJson();
    // @ts-ignore:next-line
    json['previousActiveId'] = this.previousActiveId;

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
    const newEvent = super.fromJson(
      json,
      module,
      event ?? new ModuleBase(module),
    ) as ModuleActivate;
    // @ts-ignore:next-line
    newEvent.previousActiveId = json['previousActiveId'];
    return newEvent;
  }

  /**
   * Run a module activation event.
   *
   * @param {boolean} forward True if run forward, false if run backward (undo).
   */
  run(forward: boolean) {
    const moduleManager = this.getEventWorkspace_().getModuleManager();

    if (forward) {
      // @ts-ignore:next-line
      moduleManager.activateModule(moduleManager.getModuleById(this.moduleId)!);
    } else if (this.previousActiveId) {
      moduleManager.activateModule(
        // @ts-ignore:next-line
        moduleManager.getModuleById(this.previousActiveId)!,
      );
    }
  }
}

registry.register(
  registry.Type.EVENT,
  eventUtils.MODULE_ACTIVATE,
  ModuleActivate,
);
