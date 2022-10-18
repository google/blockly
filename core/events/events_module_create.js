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
 * @fileoverview Module create event.
 * @author dev@varwin.com (Varwin Developers)
 */
'use strict';

goog.module('Blockly.Events.ModuleCreate');

const Abstract = goog.require('Blockly.Events.Abstract');
const object = goog.require('Blockly.utils.object');
const eventUtils = goog.require('Blockly.Events.utils');
const registry = goog.require('Blockly.registry');
const {ModuleBase} = goog.require('Blockly.Events.ModuleBase');


/**
 * Class for a module creation event.
 * @param {ModuleModel} module The created module.
 *     Null for a blank event.
 * @extends {ModuleBase}
 * @constructor
 */
const ModuleCreate = function(module) {
  if (!module) {
    return;  // Blank event to be populated by fromJson.
  }
  ModuleCreate.superClass_.constructor.call(this, module);
  this.moduleName = module.name;
};
object.inherits(ModuleCreate, ModuleBase);

/**
 * Type of this event.
 * @type {string}
 */
ModuleCreate.prototype.type = eventUtils.MODULE_CREATE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
ModuleCreate.prototype.toJson = function() {
  const json = ModuleCreate.superClass_.toJson.call(this);
  json['moduleName'] = this.moduleName;
  json['scrollX'] = this.scrollX;
  json['scrollY'] = this.scrollY;
  json['scale'] = this.scale;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
ModuleCreate.prototype.fromJson = function(json) {
  ModuleCreate.superClass_.fromJson.call(this, json);
  this.moduleName = json['moduleName'];
  this.scrollX = json['scrollX'];
  this.scrollY = json['scrollY'];
  this.scale = json['scale'];
};

/**
 * Run a module creation event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
ModuleCreate.prototype.run = function(forward) {
  const moduleManager = this.getEventWorkspace_().getModuleManager();
  if (forward) {
    moduleManager.createModule(this.moduleName, this.moduleId, this.scrollX, this.scrollY, this.scale);
  } else {
    moduleManager.deleteModule(moduleManager.getModuleById(this.moduleId));
  }
};

registry.register(
  registry.Type.EVENT, eventUtils.MODULE_CREATE, ModuleCreate);

exports.ModuleCreate = ModuleCreate;
