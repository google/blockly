/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Events fired as a result of selecting an item on the toolbox.
 * @author kozbial@google.com (Monica Kozbial)
 */
'use strict';

goog.provide('Blockly.Events.ToolboxSelect');

goog.require('Blockly.Events');
goog.require('Blockly.Events.Ui');
goog.require('Blockly.registry');
goog.require('Blockly.utils.object');

/**
 * Class for a trashcan open event.
 * @param {?string=} opt_oldItem The previously selected toolbox item. Undefined
 *    for a blank event.
 * @param {?string=} opt_newItem The newly selected toolbox item. Undefined for
 *    a blank event.
 * @param {string=} opt_workspaceId The workspace identifier for this event.
 *    Undefined for a blank event.
 * @extends {Blockly.Events.Ui}
 * @constructor
 */
Blockly.Events.ToolboxSelect = function(opt_oldItem, opt_newItem,
    opt_workspaceId) {
  Blockly.Events.ToolboxSelect.superClass_.constructor.call(
      this, opt_workspaceId);

  /**
   * The previously selected toolbox item.
   * @type {?string|undefined}
   */
  this.oldItem = opt_oldItem;

  /**
   * The newly selected toolbox item.
   * @type {?string|undefined}
   */
  this.newItem = opt_newItem;
};
Blockly.utils.object.inherits(Blockly.Events.ToolboxSelect, Blockly.Events.Ui);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.ToolboxSelect.prototype.type = Blockly.Events.TOOLBOX_ITEM_CHANGE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.ToolboxSelect.prototype.toJson = function() {
  var json = Blockly.Events.ToolboxSelect.superClass_.toJson.call(this);
  json['oldItem'] = this.oldItem;
  json['newItem'] = this.newItem;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.ToolboxSelect.prototype.fromJson = function(json) {
  Blockly.Events.ToolboxSelect.superClass_.fromJson.call(this, json);
  this.oldItem = json['oldItem'];
  this.newItem = json['newItem'];
};

Blockly.registry.register(Blockly.registry.Type.EVENT,
    Blockly.Events.TOOLBOX_ITEM_CHANGE, Blockly.Events.ToolboxSelect);
