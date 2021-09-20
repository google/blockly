/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Events fired as a result of trashcan flyout open and close.
 * @author kozbial@google.com (Monica Kozbial)
 */
'use strict';

goog.module('Blockly.Events.TrashcanOpen');

const Events = goog.require('Blockly.Events');
const UiBase = goog.require('Blockly.Events.UiBase');
const object = goog.require('Blockly.utils.object');
const registry = goog.require('Blockly.registry');


/**
 * Class for a trashcan open event.
 * @param {boolean=} opt_isOpen Whether the trashcan flyout is opening (false if
 *    opening). Undefined for a blank event.
 * @param {string=} opt_workspaceId The workspace identifier for this event.
 *    Undefined for a blank event.
 * @extends {UiBase}
 * @constructor
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
TrashcanOpen.prototype.type = Events.TRASHCAN_OPEN;

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

registry.register(registry.Type.EVENT, Events.TRASHCAN_OPEN, TrashcanOpen);

exports = TrashcanOpen;
