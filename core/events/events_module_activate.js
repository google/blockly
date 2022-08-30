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
 * @fileoverview Module activate event.
 * @author dev@varwin.com (Varwin Developers)
 */
'use strict';

goog.module('Blockly.Events.ModuleActivate');

const Abstract = goog.require('Blockly.Events.Abstract');
const object = goog.require('Blockly.utils.object');
const eventUtils = goog.require('Blockly.Events.utils');
const registry = goog.require('Blockly.registry');
const {ModuleBase} = goog.require('Blockly.Events.ModuleBase');
const {ModuleDelete} = goog.require('Blockly.Events.ModuleDelete');

/**
 * Class for a module activation event.
 * @param {ModuleModel} module The activated module.
 * @param {ModuleModel} previousActiveModule The previous activated module.
 * @extends {ModuleBase}
 * @constructor
 */
const ModuleActivate = function(module, previousActiveModule) {
  if (!module) {
    return;  // Blank event to be populated by fromJson.
  }
  
  ModuleActivate.superClass_.constructor.call(this, module);
  this.previousActiveId = previousActiveModule ? previousActiveModule.getId() : null;
};
object.inherits(ModuleActivate, ModuleBase);

/**
 * Type of this event.
 * @type {string}
 */
ModuleActivate.prototype.type = eventUtils.MODULE_ACTIVATE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
ModuleActivate.prototype.toJson = function() {
  const json = ModuleActivate.superClass_.toJson.call(this);
  json['previousActiveId'] = this.previousActiveId;
  
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
ModuleActivate.prototype.fromJson = function(json) {
  ModuleDelete.superClass_.fromJson.call(this, json);
  this.previousActiveId = json['previousActiveId'];
};

/**
 * Run a module activation event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
ModuleActivate.prototype.run = function(forward) {
  const moduleManager = this.getEventWorkspace_().getModuleManager();
  
  if (forward) {
    moduleManager.activateModule(moduleManager.getModuleById(this.moduleId));
  } else if (this.previousActiveId) {
    moduleManager.activateModule(moduleManager.getModuleById(this.previousActiveId));
  }
};

registry.register(
  registry.Type.EVENT, eventUtils.MODULE_ACTIVATE, ModuleActivate);

exports.ModuleActivate = ModuleActivate;
