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

goog.provide('Blockly.Events.TrashcanOpen');

goog.require('Blockly.Events');
goog.require('Blockly.Events.UiBase');
goog.require('Blockly.registry');
goog.require('Blockly.utils.object');


/**
 * Class for a trashcan open event.
 * @param {boolean=} opt_isOpen Whether the trashcan flyout is opening (false if
 *    opening). Undefined for a blank event.
 * @param {string=} opt_workspaceId The workspace identifier for this event.
 *    Undefined for a blank event.
 * @extends {Blockly.Events.UiBase}
 * @constructor
 */
Blockly.Events.TrashcanOpen = function(opt_isOpen, opt_workspaceId) {
  Blockly.Events.TrashcanOpen.superClass_.constructor.call(this, opt_workspaceId);

  /**
   * Whether the trashcan flyout is opening (false if closing).
   * @type {boolean|undefined}
   */
  this.isOpen = opt_isOpen;
};
Blockly.utils.object.inherits(Blockly.Events.TrashcanOpen, Blockly.Events.UiBase);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.TrashcanOpen.prototype.type = Blockly.Events.TRASHCAN_OPEN;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.TrashcanOpen.prototype.toJson = function() {
  var json = Blockly.Events.TrashcanOpen.superClass_.toJson.call(this);
  json['isOpen'] = this.isOpen;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.TrashcanOpen.prototype.fromJson = function(json) {
  Blockly.Events.TrashcanOpen.superClass_.fromJson.call(this, json);
  this.isOpen = json['isOpen'];
};

Blockly.registry.register(Blockly.registry.Type.EVENT,
    Blockly.Events.TRASHCAN_OPEN, Blockly.Events.TrashcanOpen);
