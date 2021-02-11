/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Events fired as a result of bubble open.
 * @author kozbial@google.com (Monica Kozbial)
 */
'use strict';

goog.provide('Blockly.Events.BubbleOpen');

goog.require('Blockly.Events');
goog.require('Blockly.Events.UiBase');
goog.require('Blockly.registry');
goog.require('Blockly.utils.object');

goog.requireType('Blockly.BlockSvg');


/**
 * Class for a bubble open event.
 * @param {Blockly.BlockSvg} opt_block The associated block. Undefined for a
 *    blank event.
 * @param {boolean=} opt_isOpen Whether the bubble is opening (false if
 *    closing). Undefined for a blank event.
 * @param {string=} opt_bubbleType The type of bubble. One of 'mutator', 'comment'
 *    or 'warning'. Undefined for a blank event.
 * @extends {Blockly.Events.UiBase}
 * @constructor
 */
Blockly.Events.BubbleOpen = function(opt_block, opt_isOpen, opt_bubbleType) {
  var workspaceId = opt_block ? opt_block.workspace.id : undefined;
  Blockly.Events.BubbleOpen.superClass_.constructor.call(this, workspaceId);
  this.blockId = opt_block ? opt_block.id : null;

  /**
   * Whether the bubble is opening (false if closing).
   * @type {boolean|undefined}
   */
  this.isOpen = opt_isOpen;

  /**
   * The type of bubble. One of 'mutator', 'comment', or 'warning'.
   * @type {string|undefined}
   */
  this.bubbleType = opt_bubbleType;
};
Blockly.utils.object.inherits(Blockly.Events.BubbleOpen, Blockly.Events.UiBase);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.BubbleOpen.prototype.type = Blockly.Events.BUBBLE_OPEN;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.BubbleOpen.prototype.toJson = function() {
  var json = Blockly.Events.BubbleOpen.superClass_.toJson.call(this);
  json['isOpen'] = this.isOpen;
  json['bubbleType'] = this.bubbleType;
  json['blockId'] = this.blockId;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.BubbleOpen.prototype.fromJson = function(json) {
  Blockly.Events.BubbleOpen.superClass_.fromJson.call(this, json);
  this.isOpen = json['isOpen'];
  this.bubbleType = json['bubbleType'];
  this.blockId = json['blockId'];
};

Blockly.registry.register(Blockly.registry.Type.EVENT,
    Blockly.Events.BUBBLE_OPEN, Blockly.Events.BubbleOpen);
