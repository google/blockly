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

const Abstract = goog.require('Blockly.Events.Abstract');
const object = goog.require('Blockly.utils.object');
const eventUtils = goog.require('Blockly.Events.utils')

/**
 * Abstract class for a module event.
 * @param {ModuleModel} module The module this event corresponds
 *     to.
 * @extends {Events.Abstract}
 * @constructor
 */
const ModuleBase = function(module) {
  ModuleBase.superClass_.constructor.call(this);

  /**
   * The module id for the module this event pertains to.
   * @type {string}
   */
  this.moduleId = module.getId();
  this.workspaceId = module.workspace.id;
};

object.inherits(ModuleBase, Abstract);

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
ModuleBase.prototype.toJson = function() {
  var json = ModuleBase.superClass_.toJson.call(this);
  json['moduleId'] = this.moduleId;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
ModuleBase.prototype.fromJson = function(json) {
  ModuleBase.superClass_.toJson.call(this);
  this.moduleId = json['moduleId'];
};

exports.ModuleBase = ModuleBase
