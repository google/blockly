/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Events fired as a result of UI actions in Blockly's editor.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Events.Drag');

goog.require('Blockly.Events');
goog.require('Blockly.Events.Ui');
goog.require('Blockly.registry');
goog.require('Blockly.utils.object');

/**
 * Class for a click event.
 * @param {!Blockly.Block=} opt_block The top block in the stack that is being
 *    dragged. Undefined for a blank event.
 * @param {boolean=} opt_isStart Whether this is the start of a block drag.
 * @param {!Array.<!Blockly.Block>=} opt_blocks The blocks affected by this
 *    drag. Undefined for a blank event.
 * @extends {Blockly.Events.Ui}
 * @constructor
 */
Blockly.Events.Drag = function(opt_block, opt_isStart, opt_blocks) {
  var workspaceId = opt_block ? opt_block.workspace.id : undefined;
  Blockly.Events.Drag.superClass_.constructor.call(this, workspaceId);
  this.blockId = opt_block ? opt_block.id : null;

  /**
   * Whether this is the start of a block drag. Undefined for blank event
   * @type {boolean|undefined}
   */
  this.isStart = opt_isStart;

  /**
   * The blocks affected by this drag event. Undefined for blank event
   * @type {!Array.<!Blockly.Block>|undefined}
   */
  this.blocks = opt_blocks;
};
Blockly.utils.object.inherits(Blockly.Events.Drag, Blockly.Events.Ui);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.Drag.prototype.type = Blockly.Events.BLOCK_DRAG;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.Drag.prototype.toJson = function() {
  var json = Blockly.Events.Drag.superClass_.toJson.call(this);
  json['blockId'] = this.blockId;
  json['blocks'] = this.blocks;
  json['isStart'] = this.isStart;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.Drag.prototype.fromJson = function(json) {
  Blockly.Events.Drag.superClass_.fromJson.call(this, json);
  this.blockId = json['blockId'];
  this.blocks = json['blocks'];
  this.isStart = json['isStart'];
};

Blockly.registry.register(Blockly.registry.Type.EVENT,
    Blockly.Events.BLOCK_DRAG, Blockly.Events.Drag);
