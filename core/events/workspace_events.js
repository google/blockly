/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class for a finished loading workspace event.
 * @author BeksOmega
 */
'use strict';

goog.provide('Blockly.Events.FinishedLoading');

goog.require('Blockly.Events');
goog.require('Blockly.Events.Abstract');
goog.require('Blockly.registry');
goog.require('Blockly.utils.object');

goog.requireType('Blockly.Workspace');


/**
 * Class for a finished loading event.
 * Used to notify the developer when the workspace has finished loading (i.e
 * domToWorkspace).
 * Finished loading events do not record undo or redo.
 * @param {!Blockly.Workspace=} opt_workspace The workspace that has finished
 *    loading.  Undefined for a blank event.
 * @extends {Blockly.Events.Abstract}
 * @constructor
 */
Blockly.Events.FinishedLoading = function(opt_workspace) {

  /**
   * Whether or not the event is blank (to be populated by fromJson).
   * @type {boolean}
   */
  this.isBlank = typeof opt_workspace == 'undefined';

  /**
   * The workspace identifier for this event.
   * @type {string}
   */
  this.workspaceId = opt_workspace ? opt_workspace.id : '';

  /**
   * The event group ID for the group this event belongs to. Groups define
   * events that should be treated as an single action from the user's
   * perspective, and should be undone together.
   * @type {string}
   */
  this.group = Blockly.Events.getGroup();

  // Workspace events do not undo or redo.
  this.recordUndo = false;
};
Blockly.utils.object.inherits(Blockly.Events.FinishedLoading,
    Blockly.Events.Abstract);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.FinishedLoading.prototype.type = Blockly.Events.FINISHED_LOADING;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.FinishedLoading.prototype.toJson = function() {
  var json = {
    'type': this.type,
  };
  if (this.group) {
    json['group'] = this.group;
  }
  if (this.workspaceId) {
    json['workspaceId'] = this.workspaceId;
  }
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.FinishedLoading.prototype.fromJson = function(json) {
  this.isBlank = false;
  this.workspaceId = json['workspaceId'];
  this.group = json['group'];
};

Blockly.registry.register(Blockly.registry.Type.EVENT,
    Blockly.Events.FINISHED_LOADING, Blockly.Events.FinishedLoading);
