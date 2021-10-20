/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Abstract class for events fired as a result of actions in
 * Blockly's editor.
 */
'use strict';

/**
 * Abstract class for events fired as a result of actions in
 * Blockly's editor.
 * @class
 */
goog.module('Blockly.Events.Abstract');

const eventUtils = goog.require('Blockly.Events.utils');
/* eslint-disable-next-line no-unused-vars */
const {Workspace} = goog.requireType('Blockly.Workspace');


/**
 * Abstract class for an event.
 * @constructor
 * @alias Blockly.Events.Abstract
 */
const Abstract = function() {
  /**
   * Whether or not the event is blank (to be populated by fromJson).
   * @type {?boolean}
   */
  this.isBlank = null;

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
  this.group = eventUtils.getGroup();

  /**
   * Sets whether the event should be added to the undo stack.
   * @type {boolean}
   */
  this.recordUndo = eventUtils.getRecordUndo();
};

/**
 * Whether or not the event is a UI event.
 * @type {boolean}
 */
Abstract.prototype.isUiEvent = false;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Abstract.prototype.toJson = function() {
  const json = {'type': this.type};
  if (this.group) {
    json['group'] = this.group;
  }
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Abstract.prototype.fromJson = function(json) {
  this.isBlank = false;
  this.group = json['group'];
};

/**
 * Does this event record any change of state?
 * @return {boolean} True if null, false if something changed.
 */
Abstract.prototype.isNull = function() {
  return false;
};

/**
 * Run an event.
 * @param {boolean} _forward True if run forward, false if run backward (undo).
 */
Abstract.prototype.run = function(_forward) {
  // Defined by subclasses.
};

/**
 * Get workspace the event belongs to.
 * @return {!Workspace} The workspace the event belongs to.
 * @throws {Error} if workspace is null.
 * @protected
 */
Abstract.prototype.getEventWorkspace_ = function() {
  let workspace;
  if (this.workspaceId) {
    const {Workspace} = goog.module.get('Blockly.Workspace');
    workspace = Workspace.getById(this.workspaceId);
  }
  if (!workspace) {
    throw Error(
        'Workspace is null. Event must have been generated from real' +
        ' Blockly events.');
  }
  return workspace;
};

exports = Abstract;
