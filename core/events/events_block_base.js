/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Base class for all types of block events.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.module('Blockly.Events.BlockBase');
goog.module.declareLegacyNamespace();

goog.require('Blockly.Events.Abstract');
goog.require('Blockly.utils.object');

goog.requireType('Blockly.Block');


/**
 * Abstract class for a block event.
 * @param {!Blockly.Block=} opt_block The block this event corresponds to.
 *     Undefined for a blank event.
 * @extends {Blockly.Events.Abstract}
 * @constructor
 */
const BlockBase = function(opt_block) {
  BlockBase.superClass_.constructor.call(this);
  this.isBlank = typeof opt_block == 'undefined';

  /**
   * The block ID for the block this event pertains to
   * @type {string}
   */
  this.blockId = this.isBlank ? '' : opt_block.id;

  /**
   * The workspace identifier for this event.
   * @type {string}
   */
  this.workspaceId = this.isBlank ? '' : opt_block.workspace.id;
};
Blockly.utils.object.inherits(BlockBase,
    Blockly.Events.Abstract);

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
BlockBase.prototype.toJson = function() {
  const json = BlockBase.superClass_.toJson.call(this);
  json['blockId'] = this.blockId;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
BlockBase.prototype.fromJson = function(json) {
  BlockBase.superClass_.fromJson.call(this, json);
  this.blockId = json['blockId'];
};

exports = BlockBase;
