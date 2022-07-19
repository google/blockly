/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class for a loading error workspace event.
 */
 'use strict';

 /**
  * Class for a loading workspace error event.
  * @class
  */
 goog.module('Blockly.Events.LoadingError');
 
 const {Abstract: AbstractEvent} = goog.require('Blockly.Events.Abstract');
 const eventUtils = goog.require('Blockly.Events.utils');
 const registry = goog.require('Blockly.registry');
 /* eslint-disable-next-line no-unused-vars */
 const {Workspace} = goog.requireType('Blockly.Workspace');
 
 /**
  * Class for a loading error event.
  * Used to notify the developer when the workspace has loading error (i.e
  * domToWorkspace).
  * Loading error events do not record undo or redo.
  * @extends {Abstract}
  * @alias Blockly.Events.LoadingError
  */
class LoadingError extends AbstractEvent {
  /**
   * @param {!Workspace=} workspace The workspace that has error
   *    loading.  Undefined for a blank event.
   * @param {String} errorMessage The workspace that has error
   *    loading.  Undefined for a blank event.
   * @param {Object} params The workspace that has error
   *    loading.  Undefined for a blank event.
   */
  constructor(workspace, errorMessage) {
    super();
    /**
      * Whether or not the event is blank (to be populated by fromJson).
      * @type {boolean}
      */
    this.isBlank = typeof workspace === 'undefined';
  
    /**
      * The workspace identifier for this event.
      * @type {string}
      */
    this.workspaceId = workspace ? workspace.id : '';
  
    this.errorMessage = `${Blockly.Msg["LOADING_ERROR"]}. ${errorMessage}`;
    /**
      * The event group ID for the group this event belongs to. Groups define
      * events that should be treated as an single action from the user's
      * perspective, and should be undone together.
      * @type {string}
      */
    this.group = eventUtils.getGroup();
  
    // Workspace events do not undo or redo.
    this.recordUndo = false;

    /**
      * Type of this event.
      * @type {string}
      */
    this.type = eventUtils.LOADING_ERROR;
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
    registry.Type.EVENT, eventUtils.LOADING_ERROR, LoadingError);

exports.LoadingError = LoadingError;
 
