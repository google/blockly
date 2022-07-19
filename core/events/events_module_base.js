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
 * @fileoverview Abstract class for a module event.
 * @author dev@varwin.com (Varwin Developers)
 */
'use strict';

goog.module('Blockly.Events.ModuleBase');

const {Abstract: AbstractEvent} = goog.require('Blockly.Events.Abstract');

/**
 * Abstract class for a module event.
 * @extends {Events.Abstract}
 */
class ModuleBase extends AbstractEvent {
  /**
   * @param {ModuleModel} module The module this event corresponds to.
   */
  constructor(module) {
    super();

    /**
     * The module id for the module this event pertains to.
     * @type {string}
     */
    this.moduleId = module.getId();
    this.workspaceId = module.workspace.id;
  }

  /**
   * Encode the event as JSON.
   * @return {!Object} JSON representation.
   */
  toJson() {
    const json = super.toJson();
    json['moduleId'] = this.moduleId;
    return json;
  }

  /**
   * Decode the JSON event.
   * @param {!Object} json JSON representation.
   */
  fromJson(json) {
    super.fromJson(json);
    this.moduleId = json['moduleId'];
  }
}

exports.ModuleBase = ModuleBase;
