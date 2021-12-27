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
 * @fileoverview Module move event.
 * @author dev@varwin.com (Varwin Developers)
 */
'use strict';

goog.module('Blockly.Events.ModuleMove');

const Abstract = goog.require('Blockly.Events.Abstract');
const object = goog.require('Blockly.utils.object');
const eventUtils = goog.require('Blockly.Events.utils')
const registry = goog.require('Blockly.registry');
const {ModuleBase} = goog.require('Blockly.Events.ModuleBase')

/**
 * Class for a module move event.
 * @param {ModuleModel} module The moved module.
 *     Null for a blank event.
 * @param {int} newOrder The new module order.
 * @param {int} previousOrder The previous module order.
 * @extends {ModuleBase}
 * @constructor
 */
const ModuleMove = function(module, newOrder, previousOrder) {
  if (!module) {
    return;  // Blank event to be populated by fromJson.
  }
  ModuleMove.superClass_.constructor.call(this, module);
  this.newOrder = newOrder;
  this.previousOrder = previousOrder;
};
object.inherits(ModuleMove, ModuleBase);

/**
 * Type of this event.
 * @type {string}
 */
ModuleMove.prototype.type = eventUtils.MODULE_MOVE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
ModuleMove.prototype.toJson = function() {
  var json = ModuleMove.superClass_.toJson.call(this);
  json['newOrder'] = this.newOrder;
  json['previousOrder'] = this.previousOrder;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
ModuleMove.prototype.fromJson = function(json) {
  ModuleMove.superClass_.fromJson.call(this, json);
  this.newOrder = json['newOrder'];
  this.previousOrder = json['previousOrder'];
};

/**
 * Run a module move event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
ModuleMove.prototype.run = function(forward) {
  var moduleManager = this.getEventWorkspace_().getModuleManager();
  var module = moduleManager.getModuleById(this.moduleId);
  if (forward) {
    moduleManager.moveModule(module, this.newOrder);
  } else {
    moduleManager.moveModule(module, this.previousOrder);
  }
};

registry.register(
  registry.Type.EVENT, eventUtils.MODULE_MOVE, ModuleMove);

exports.ModuleMove = ModuleMove
