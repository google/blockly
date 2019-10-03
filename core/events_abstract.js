/**
 * @license
 * Copyright 2018 Google LLC
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
 * @fileoverview Abstract class for events fired as a result of actions in
 *     Blockly's editor.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Events.Abstract');

goog.require('Blockly.Events');


/**
 * Abstract class for an event.
 * @constructor
 */
Blockly.Events.Abstract = function() {
  /**
   * The workspace identifier for this event.
   * @type {string|undefined}
   */
  this.workspaceId = undefined;

  /**
   * The event group id for the group this event belongs to. Groups define
   * events that should be treated as an single action from the user's
   * perspective, and should be undone together.
   * @type {string}
   */
  this.group = Blockly.Events.getGroup();

  /**
   * Sets whether the event should be added to the undo stack.
   * @type {boolean}
   */
  this.recordUndo = Blockly.Events.recordUndo;
};

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.Abstract.prototype.toJson = function() {
  var json = {
    'type': this.type
  };
  if (this.group) {
    json['group'] = this.group;
  }
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.Abstract.prototype.fromJson = function(json) {
  this.group = json['group'];
};

/**
 * Does this event record any change of state?
 * @return {boolean} True if null, false if something changed.
 */
Blockly.Events.Abstract.prototype.isNull = function() {
  return false;
};

/**
 * Run an event.
 * @param {boolean} _forward True if run forward, false if run backward (undo).
 */
Blockly.Events.Abstract.prototype.run = function(_forward) {
  // Defined by subclasses.
};

/**
 * Get workspace the event belongs to.
 * @return {!Blockly.Workspace} The workspace the event belongs to.
 * @throws {Error} if workspace is null.
 * @protected
 */
Blockly.Events.Abstract.prototype.getEventWorkspace_ = function() {
  if (this.workspaceId) {
    var workspace = Blockly.Workspace.getById(this.workspaceId);
  }
  if (!workspace) {
    throw Error('Workspace is null. Event must have been generated from real' +
        ' Blockly events.');
  }
  return workspace;
};
