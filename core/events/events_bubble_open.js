/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Events fired as a result of bubble open.
 */
'use strict';

/**
 * Events fired as a result of bubble open.
 * @class
 */
goog.module('Blockly.Events.BubbleOpen');

const eventUtils = goog.require('Blockly.Events.utils');
const object = goog.require('Blockly.utils.object');
const registry = goog.require('Blockly.registry');
/* eslint-disable-next-line no-unused-vars */
const {BlockSvg} = goog.requireType('Blockly.BlockSvg');
const {UiBase} = goog.require('Blockly.Events.UiBase');


/**
 * Class for a bubble open event.
 * @param {BlockSvg} opt_block The associated block. Undefined for a
 *    blank event.
 * @param {boolean=} opt_isOpen Whether the bubble is opening (false if
 *    closing). Undefined for a blank event.
 * @param {string=} opt_bubbleType The type of bubble. One of 'mutator',
 *     'comment'
 *    or 'warning'. Undefined for a blank event.
 * @extends {UiBase}
 * @constructor
 * @alias Blockly.Events.BubbleOpen
 */
const BubbleOpen = function(opt_block, opt_isOpen, opt_bubbleType) {
  const workspaceId = opt_block ? opt_block.workspace.id : undefined;
  BubbleOpen.superClass_.constructor.call(this, workspaceId);
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
object.inherits(BubbleOpen, UiBase);

/**
 * Type of this event.
 * @type {string}
 */
BubbleOpen.prototype.type = eventUtils.BUBBLE_OPEN;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
BubbleOpen.prototype.toJson = function() {
  const json = BubbleOpen.superClass_.toJson.call(this);
  json['isOpen'] = this.isOpen;
  json['bubbleType'] = this.bubbleType;
  json['blockId'] = this.blockId;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
BubbleOpen.prototype.fromJson = function(json) {
  BubbleOpen.superClass_.fromJson.call(this, json);
  this.isOpen = json['isOpen'];
  this.bubbleType = json['bubbleType'];
  this.blockId = json['blockId'];
};

registry.register(registry.Type.EVENT, eventUtils.BUBBLE_OPEN, BubbleOpen);

exports.BubbleOpen = BubbleOpen;
