/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class for a finished loading workspace event.
 */
'use strict';

/**
 * Class for a finished loading workspace event.
 * @class
 */
goog.module('Blockly.Events.FinishedLoading');

const eventUtils = goog.require('Blockly.Events.utils');
const registry = goog.require('Blockly.registry');
const {Abstract: AbstractEvent} = goog.require('Blockly.Events.Abstract');
/* eslint-disable-next-line no-unused-vars */
const {Workspace} = goog.requireType('Blockly.Workspace');


/**
 * Class for a finished loading event.
 * Used to notify the developer when the workspace has finished loading (i.e
 * domToWorkspace).
 * Finished loading events do not record undo or redo.
 * @extends {AbstractEvent}
 * @alias Blockly.Events.FinishedLoading
 */
class FinishedLoading extends AbstractEvent {
  /**
   * @param {!Workspace=} opt_workspace The workspace that has finished
   *    loading.  Undefined for a blank event.
   */
  constructor(opt_workspace) {
    super();
    /**
     * Whether or not the event is blank (to be populated by fromJson).
     * @type {boolean}
     */
    this.isBlank = typeof opt_workspace === 'undefined';

    /**
     * The workspace identifier for this event.
     * @type {string}
     */
    this.workspaceId = opt_workspace ? opt_workspace.id : '';

    // Workspace events do not undo or redo.
    this.recordUndo = false;

    /**
     * Type of this event.
     * @type {string}
     */
    this.type = eventUtils.FINISHED_LOADING;
  }

  /**
   * Encode the event as JSON.
   * @return {!Object} JSON representation.
   */
  toJson() {
    const json = {
      'type': this.type,
    };
    if (this.group) {
      json['group'] = this.group;
    }
    if (this.workspaceId) {
      json['workspaceId'] = this.workspaceId;
    }
    return json;
  }

  /**
   * Decode the JSON event.
   * @param {!Object} json JSON representation.
   */
  fromJson(json) {
    this.isBlank = false;
    this.workspaceId = json['workspaceId'];
    this.group = json['group'];
  }
}

registry.register(
    registry.Type.EVENT, eventUtils.FINISHED_LOADING, FinishedLoading);

exports.FinishedLoading = FinishedLoading;
