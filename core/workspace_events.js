/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2019 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Class for a finished loading workspace event.
 * @author BeksOmega
 */
'use strict';

goog.provide('Blockly.Events.FinishedLoading');

goog.require('Blockly.Events');
goog.require('Blockly.Events.Abstract');

/**
 * Class for a finished loading event.
 * Used to notify the developer when the workspace has finished loading (i.e
 * domToWorkspace).
 * Finished loading events do not record undo or redo.
 * @param {!Blockly.Workspace} workspace The workspace that has finished
 *    loading.
 * @constructor
 */
Blockly.Events.FinishedLoading = function(workspace) {
  /**
   * The workspace identifier for this event.
   * @type {string}
   */
  this.workspaceId = workspace.id;

  /**
   * The event group id for the group this event belongs to. Groups define
   * events that should be treated as an single action from the user's
   * perspective, and should be undone together.
   * @type {string}
   */
  this.group = Blockly.Events.group_;

  // Workspace events do not undo or redo.
  this.recordUndo = false;
};
goog.inherits(Blockly.Events.FinishedLoading, Blockly.Events.Abstract);

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
  this.workspaceId = json['workspaceId'];
  this.group = json['group'];
};
