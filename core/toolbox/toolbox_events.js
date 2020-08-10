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

goog.provide('Blockly.Events.ToolboxChange');

goog.require('Blockly.Events');
goog.require('Blockly.Events.Abstract');
goog.require('Blockly.registry');
goog.require('Blockly.utils.object');


/**
 * Class for a toolbox changed event.
 * Used to notify the developer when a user has clicked on a new toolbox item.
 * @param {string} oldType The type of the previously selected toolbox item.
 * @param {string} oldId The id of the previously selected toolbox item.
 * @param {string} newType The type of the currently selected toolbox item.
 * @param {string} newId The id of the currently selected toolbox item.
 * @param {Blockly.Workspace} workspace The workspace the toolbox is on.
 * @extends {Blockly.Events.Abstract}
 * @constructor
 */
Blockly.Events.ToolboxChange = function(oldType, oldId, newType, newId, workspace) {
  /**
   * The type of the previously selected toolbox item.
   * @type {string}
   */
  this.oldType = oldType;

  /**
   * The id of the previously selected toolbox item.
   * @type {string}
   */
  this.oldValue = oldId;

  /**
   * The type of the currently selected toolbox item.
   * @type {string}
   */
  this.newType = newType;

  /**
   * The id of the currently selected toolbox item.
   * @type {string}
   */
  this.newValue = newId;

  /**
   * The type of the previously selected toolbox item.
   * @type {string}
   */
  this.workspaceId = workspace ? workspace.id : '';
};
Blockly.utils.object.inherits(Blockly.Events.ToolboxChange,
    Blockly.Events.Abstract);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.ToolboxChange.prototype.type = Blockly.Events.TOOLBOX_CHANGE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.ToolboxChange.prototype.toJson = function() {
  return {
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
Blockly.Events.ToolboxChange.prototype.fromJson = function(json) {
  this.oldType = json['oldType'];
  this.oldValue = json['oldValue'];
  this.newType = json['newType'];
  this.newValue = json['newValue'];
  this.workspaceId = json['workspaceId'];
};

Blockly.registry.register(Blockly.registry.Type.EVENT,
    Blockly.Events.TOOLBOX_CHANGE, Blockly.Events.ToolboxChange);
