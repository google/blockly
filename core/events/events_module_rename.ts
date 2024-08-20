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
 * @file Module rename event.
 * @author dev@varwin.com (Varwin Developers)
 */
// Former goog.module ID: Blockly.Events.ModuleRename

import * as eventUtils from '../events/utils.js';
import * as registry from '../registry.js';
import {ModuleBase, ModuleBaseJson} from './events_module_base.js';
import {ModuleModel} from '../module_model.js';

/**
 * Class for a module rename event.
 */
export class ModuleRename extends ModuleBase {
  oldName: string = '';
  newName: string = '';

  constructor(module: ModuleModel, previousName: string) {
    if (!module) {
      return; // Blank event to be populated by fromJson.
    }

    super(module);

    this.oldName = previousName;
    this.newName = module.name;
    this.type = eventUtils.MODULE_RENAME;
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
    json['oldName'] = this.oldName;
    // @ts-ignore:next-line
    json['newName'] = this.newName;
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
    ) as ModuleRename;
    // @ts-ignore:next-line
    newEvent.oldName = json['oldName'];
    // @ts-ignore:next-line
    newEvent.newName = json['newName'];
    return newEvent;
  }

  /**
   * Run a module rename event.
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
      moduleManager.renameModule(module, this.newName);
    } else {
      moduleManager.renameModule(module, this.oldName);
    }
  }
}

registry.register(registry.Type.EVENT, eventUtils.MODULE_RENAME, ModuleRename);
