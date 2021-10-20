/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Events fired as a result of trashcan flyout open and close.
 */
'use strict';

/**
 * Events fired as a result of trashcan flyout open and close.
 * @class
 */
goog.module('Blockly.Events.TrashcanOpen');

const eventUtils = goog.require('Blockly.Events.utils');
const object = goog.require('Blockly.utils.object');
const registry = goog.require('Blockly.registry');
const {UiBase} = goog.require('Blockly.Events.UiBase');


/**
 * Class for a trashcan open event.
 * @param {boolean=} opt_isOpen Whether the trashcan flyout is opening (false if
 *    opening). Undefined for a blank event.
 * @param {string=} opt_workspaceId The workspace identifier for this event.
 *    Undefined for a blank event.
 * @extends {UiBase}
 * @constructor
 * @alias Blockly.Events.TrashcanOpen
 */
const TrashcanOpen = function(opt_isOpen, opt_workspaceId) {
  TrashcanOpen.superClass_.constructor.call(this, opt_workspaceId);

  /**
   * Whether the trashcan flyout is opening (false if closing).
   * @type {boolean|undefined}
   */
  this.isOpen = opt_isOpen;
};
object.inherits(TrashcanOpen, UiBase);

/**
 * Type of this event.
 * @type {string}
 */
TrashcanOpen.prototype.type = eventUtils.TRASHCAN_OPEN;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
TrashcanOpen.prototype.toJson = function() {
  const json = TrashcanOpen.superClass_.toJson.call(this);
  json['isOpen'] = this.isOpen;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
TrashcanOpen.prototype.fromJson = function(json) {
  TrashcanOpen.superClass_.fromJson.call(this, json);
  this.isOpen = json['isOpen'];
};

registry.register(registry.Type.EVENT, eventUtils.TRASHCAN_OPEN, TrashcanOpen);

exports.TrashcanOpen = TrashcanOpen;
