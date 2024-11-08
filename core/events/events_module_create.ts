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
 * @file Module create event.
 * @author dev@varwin.com (Varwin Developers)
 */
// Former goog.module ID: Blockly.Events.ModuleCreate

import * as eventUtils from '../events/utils.js';
import * as registry from '../registry.js';
import {ModuleBase, ModuleBaseJson} from './events_module_base.js';
import {ModuleModel} from '../module_model.js';

/**
 * Class for a module creation event.
 */
export class ModuleCreate extends ModuleBase {
  moduleName: string = '';
  scrollX: number = 0;
  scrollY: number = 0;
  scale: number = 1;

  constructor(module: ModuleModel) {
    if (!module) {
      return; // Blank event to be populated by fromJson.
    }

    super(module);

    this.moduleName = module.name;
    this.scrollX = module.scrollX;
    this.scrollY = module.scrollY;
    this.scale = module.scale;

    this.type = eventUtils.MODULE_CREATE;
  }

  /**
   * Encode the event as JSON.
   *
   * @returns {!object} JSON representation.
   */
  override toJson() {
    const json = super.toJson();
    // @ts-ignore:next-line
    json['moduleName'] = this.moduleName;
    // @ts-ignore:next-line
    json['scrollX'] = this.scrollX;
    // @ts-ignore:next-line
    json['scrollY'] = this.scrollY;
    // @ts-ignore:next-line
    json['scale'] = this.scale;
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
    ) as ModuleCreate;
    // @ts-ignore:next-line
    newEvent.moduleName = json['moduleName'];
    // @ts-ignore:next-line
    newEvent.scrollX = json['scrollX'];
    // @ts-ignore:next-line
    newEvent.scrollY = json['scrollY'];
    // @ts-ignore:next-line
    newEvent.scale = json['scale'];
    return newEvent;
  }

  /**
   * Run a module creation event.
   *
   * @param {boolean} forward True if run forward, false if run backward (undo).
   */
  run(forward: boolean) {
    const moduleManager = this.getEventWorkspace_().getModuleManager();
    if (forward) {
      moduleManager.createModule(
        this.moduleName,
        this.moduleId,
        this.scrollX,
        this.scrollY,
        this.scale,
      );
    } else {
      const module = moduleManager.getModuleById(this.moduleId!);
      if (module) {
        moduleManager.deleteModule(module);
      }
    }
  }
}

registry.register(registry.Type.EVENT, eventUtils.MODULE_CREATE, ModuleCreate);
