/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
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
 * @fileoverview Abstract class for events fired as a result of actions in
 *     Blockly's editor.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Events.Abstract');

goog.require('Blockly.Events');
goog.require('goog.array');
goog.require('goog.math.Coordinate');

/**
 * Abstract class for an event.
 * @param {Blockly.Block|Blockly.VariableModel} elem The block or variable.
 * @constructor
 */
Blockly.Events.Abstract = function(elem) {
  /**
   * The block id for the block this event pertains to, if appropriate for the
   * event type.
   * @type {string|undefined}
   */
  this.blockId = undefined;

  /**
   * The variable id for the variable this event pertains to. Only set in
   * VarCreate, VarDelete, and VarRename events.
   * @type {string|undefined}
   */
  this.varId = undefined;

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
  this.group = undefined;

  /**
   * Sets whether the event should be added to the undo stack.
   * @type {boolean}
   */
  this.recordUndo = undefined;

  if (elem instanceof Blockly.Block) {
    this.blockId = elem.id;
    this.workspaceId = elem.workspace.id;
  } else if (elem instanceof Blockly.VariableModel) {
    this.workspaceId = elem.workspace.id;
    this.varId = elem.getId();
  }
  this.group = Blockly.Events.group_;
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
  if (this.blockId) {
    json['blockId'] = this.blockId;
  }
  if (this.varId) {
    json['varId'] = this.varId;
  }
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
  this.blockId = json['blockId'];
  this.varId = json['varId'];
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
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
Blockly.Events.Abstract.prototype.run = function(
    /* eslint-disable no-unused-vars */ forward
    /* eslint-enable no-unused-vars */) {
  // Defined by subclasses.
};

/**
 * Get workspace the event belongs to.
 * @return {Blockly.Workspace} The workspace the event belongs to.
 * @throws {Error} if workspace is null.
 * @protected
 */
Blockly.Events.Abstract.prototype.getEventWorkspace_ = function() {
  var workspace = Blockly.Workspace.getById(this.workspaceId);
  if (!workspace) {
    throw Error('Workspace is null. Event must have been generated from real' +
      ' Blockly events.');
  }
  return workspace;
};
