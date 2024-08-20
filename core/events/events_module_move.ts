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
 * @file Module move event.
 * @author dev@varwin.com (Varwin Developers)
 */
// Former goog.module ID: Blockly.Events.ModuleMove

import * as eventUtils from '../events/utils.js';
import * as registry from '../registry.js';
import {ModuleBase, ModuleBaseJson} from './events_module_base.js';
import {ModuleModel} from '../module_model.js';

/**
 * Class for a module move event.
 */
export class ModuleMove extends ModuleBase {
  newOrder: number = 0;
  previousOrder: number = 0;

  constructor(module: ModuleModel, newOrder: number, previousOrder: number) {
    if (!module) {
      return; // Blank event to be populated by fromJson.
    }

    super(module);
    this.newOrder = newOrder;
    this.previousOrder = previousOrder;
    this.type = eventUtils.MODULE_MOVE;
  }

  /**
   * Encode the event as JSON.
   *
   * @returns {!object} JSON representation.
   */
  override toJson() {
    // @ts-ignore:next-line
    const json = super.toJson();
    // @ts-ignore:next-line
    json['newOrder'] = this.newOrder;
    // @ts-ignore:next-line
    json['previousOrder'] = this.previousOrder;
    return json;
  }

  /**
   * Decode the JSON event.
   *
   * @param {!object} json JSON representation.
   * @param module
   */
  static fromJson(json: ModuleBaseJson, module: any, event?: any) {
    const newEvent = super.fromJson(
      json,
      module,
      event ?? new ModuleBase(module),
    ) as ModuleMove;
    // @ts-ignore:next-line
    newEvent.newOrder = json['newOrder'];
    // @ts-ignore:next-line
    newEvent.previousOrder = json['previousOrder'];
    return newEvent;
  }

  /**
   * Run a module move event.
   *
   * @param {boolean} forward True if run forward, false if run backward (undo).
   */
  run(forward: boolean) {
    const moduleManager = this.getEventWorkspace_().getModuleManager();
    const module = moduleManager.getModuleById(this.moduleId!);
    if (!module) {
      return;
    }
    if (forward) {
      moduleManager.moveModule(module, this.newOrder);
    } else {
      moduleManager.moveModule(module, this.previousOrder);
    }
  }
}

registry.register(registry.Type.EVENT, eventUtils.MODULE_MOVE, ModuleMove);
