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
 * @fileoverview Module rename event.
 * @author dev@varwin.com (Varwin Developers)
 */
'use strict';

goog.module('Blockly.Events.ModuleRename');

const Abstract = goog.require('Blockly.Events.Abstract');
const object = goog.require('Blockly.utils.object');
const eventUtils = goog.require('Blockly.Events.utils');
const registry = goog.require('Blockly.registry');
const {ModuleBase} = goog.require('Blockly.Events.ModuleBase');

/**
 * Class for a module rename event.
 * @param {Blockly.ModuleModel} module The renamed module.
 *     Null for a blank event.
 * @param {string} previousName The previous name the module.
 * @extends {Blockly.Events.ModuleBase}
 * @constructor
 */
const ModuleRename = function(module, previousName) {
  if (!module) {
    return;  // Blank event to be populated by fromJson.
  }
  ModuleRename.superClass_.constructor.call(this, module);
  this.oldName = previousName;
  this.newName = module.name;
};
object.inherits(ModuleRename, ModuleBase);

/**
 * Type of this event.
 * @type {string}
 */
ModuleRename.prototype.type = eventUtils.MODULE_RENAME;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
ModuleRename.prototype.toJson = function() {
  const json = ModuleRename.superClass_.toJson.call(this);
  json['oldName'] = this.oldName;
  json['newName'] = this.newName;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
ModuleRename.prototype.fromJson = function(json) {
  ModuleRename.superClass_.fromJson.call(this, json);
  this.oldName = json['oldName'];
  this.newName = json['newName'];
};

/**
 * Run a module rename event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
ModuleRename.prototype.run = function(forward) {
  const moduleManager = this.getEventWorkspace_().getModuleManager();
  const module = moduleManager.getModuleById(this.moduleId);
  if (forward) {
    moduleManager.renameModule(module, this.newName);
  } else {
    moduleManager.renameModule(module, this.oldName);
  }
};

registry.register(
  registry.Type.EVENT, eventUtils.MODULE_RENAME, ModuleRename);

exports.ModuleRename = ModuleRename;
