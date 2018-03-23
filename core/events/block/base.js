/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
 * https://developers.google.com/blockly/
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
 * @fileoverview Base class for block events.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.Events.BlockBase');

goog.require('Blockly.Events');
goog.require('Blockly.Events.Abstract');

/**
 * Abstract class for a block event.
 * @param {Blockly.Block} block The block this event corresponds to.
 * @extends {Blockly.Events.Abstract}
 * @constructor
 */
Blockly.Events.BlockBase = function(block) {
  Blockly.Events.BlockBase.superClass_.constructor.call(this);

  /**
   * The block id for the block this event pertains to
   * @type {string}
   */
  this.blockId = block.id;
  this.workspaceId = block.workspace.id;
};
goog.inherits(Blockly.Events.BlockBase, Blockly.Events.Abstract);

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.BlockBase.prototype.toJson = function() {
  var json = Blockly.Events.BlockBase.superClass_.toJson.call(this);
  json['blockId'] = this.blockId;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.BlockBase.prototype.fromJson = function(json) {
  Blockly.Events.BlockBase.superClass_.toJson.call(this);
  this.blockId = json['blockId'];
};
