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
 * @fileoverview Class for event of move block to a module.
 * @author dev@varwin.com (Varwin Developers)
 */
'use strict';

goog.module('Blockly.Events.MoveBlockToModule');

const Abstract = goog.require('Blockly.Events.Abstract');
const object = goog.require('Blockly.utils.object');
const eventUtils = goog.require('Blockly.Events.utils')
const registry = goog.require('Blockly.registry');
const {ModuleBase} = goog.require('Blockly.Events.ModuleBase')

/**
 * Class for a move block to module event.
 * @param {Blockly.Block} block The moved block.
 *     Null for a blank event.
 * @param {String} newModuleId The new module id.
 * @param {String} previousModuleId The previous module id.
 * @extends {Blockly.Events.ModuleBase}
 * @constructor
 */
const MoveBlockToModule = function(block, newModuleId, previousModuleId) {
  if (!block) {
    return;  // Blank event to be populated by fromJson.
  }
  MoveBlockToModule.superClass_.constructor.call(this);

  this.workspaceId = block.workspace.id;
  this.blockId = block.id
  this.newModuleId = newModuleId;
  this.previousModuleId = previousModuleId;
};
object.inherits(MoveBlockToModule, Abstract);


/**
 * Type of this event.
 * @type {string}
 */
MoveBlockToModule.prototype.type = eventUtils.MOVE_BLOCK_TO_MODULE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
MoveBlockToModule.prototype.toJson = function() {
  var json = MoveBlockToModule.superClass_.toJson.call(this);
  json['blockId'] = this.blockId;
  json['newModuleId'] = this.newModuleId;
  json['previousModuleId'] = this.previousModuleId;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
MoveBlockToModule.prototype.fromJson = function(json) {
  MoveBlockToModule.superClass_.fromJson.call(this, json);
  this.blockId = json['blockId'];
  this.newModuleId = json['newModuleId'];
  this.previousModuleId = json['previousModuleId'];
};

/**
 * Run a module move event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
MoveBlockToModule.prototype.run = function(forward) {
  const moduleManager = this.getEventWorkspace_().getModuleManager();
  const newModule = moduleManager.getModuleById(this.newModuleId);
  const previousModule = moduleManager.getModuleById(this.previousModuleId);
  const block = this.getEventWorkspace_().getBlockById(this.blockId)

  if (forward) {
    moduleManager.moveBlockToModule(block, newModule);
  } else {
    moduleManager.moveBlockToModule(block, previousModule);
  }
};

registry.register(
  registry.Type.EVENT, eventUtils.MOVE_BLOCK_TO_MODULE, MoveBlockToModule);

exports.MoveBlockToModule = MoveBlockToModule
