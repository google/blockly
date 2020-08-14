/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class for a toolbox change event.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */
'use strict';

goog.provide('Blockly.Events.ToolboxItemChange');

goog.require('Blockly.Events');
goog.require('Blockly.Events.Abstract');
goog.require('Blockly.registry');
goog.require('Blockly.utils.object');


/**
 * Class for a toolbox changed event.
 * Used to notify the developer when a user has clicked on a new toolbox item.
 * @param {!Blockly.IToolbox=} opt_toolbox The toolbox this event occurred on.
 * @param {?string=} opt_oldType The type of the previously selected toolbox item.
 * @param {?string=} opt_oldId The id of the previously selected toolbox item.
 * @param {?string=} opt_newType The type of the currently selected toolbox item.
 * @param {?string=} opt_newId The id of the currently selected toolbox item.
 * @param {!Blockly.Workspace=} opt_workspace The workspace the toolbox is on.
 * @extends {Blockly.Events.Abstract}
 * @constructor
 */
Blockly.Events.ToolboxItemChange = function(opt_toolbox, opt_oldType, opt_oldId,
    opt_newType, opt_newId, opt_workspace) {
  this.isBlank = typeof opt_oldId == 'undefined';

  /**
   * The toolbox this event occurred on.
   * @type {?Blockly.IToolbox}
   */
  this.toolbox = typeof opt_toolbox == 'undefined' ? null : opt_toolbox;
  /**
   * The type of the previously selected toolbox item.
   * @type {?string}
   */
  this.oldType = typeof opt_oldType == 'undefined' ? '' : opt_oldType;

  /**
   * The id of the previously selected toolbox item.
   * @type {?string}
   */
  this.oldValue = typeof opt_oldId == 'undefined' ? '' : opt_oldId;

  /**
   * The type of the currently selected toolbox item.
   * @type {?string}
   */
  this.newType = typeof opt_newType == 'undefined' ? '' : opt_newType;
  /**
   * The id of the currently selected toolbox item.
   * @type {?string}
   */
  this.newValue = typeof opt_newId == 'undefined' ? '' : opt_newId;

  /**
   * The workspace identifier for this event.
   * @type {string}
   */
  this.workspaceId = opt_workspace ? opt_workspace.id : '';
};
Blockly.utils.object.inherits(Blockly.Events.ToolboxItemChange,
    Blockly.Events.Abstract);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.ToolboxItemChange.prototype.type = Blockly.Events.TOOLBOX_ITEM_CHANGE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.ToolboxItemChange.prototype.toJson = function() {
  return {
    'toolbox': this.toolbox,
    'oldType': this.oldType,
    'oldValue': this.oldValue,
    'newType': this.newType,
    'newValue': this.newValue,
    'workspaceId': this.workspaceId
  };
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.ToolboxItemChange.prototype.fromJson = function(json) {
  this.toolbox = json['toolbox'];
  this.oldType = json['oldType'];
  this.oldValue = json['oldValue'];
  this.newType = json['newType'];
  this.newValue = json['newValue'];
  this.workspaceId = json['workspaceId'];
};

Blockly.registry.register(Blockly.registry.Type.EVENT,
    Blockly.Events.TOOLBOX_ITEM_CHANGE, Blockly.Events.ToolboxItemChange);
