/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Events fired as a result of zooming flyout
 */
 'use strict';

/**
  * Events fired as a result of zooming flyout
  * @class
  */
goog.module('Blockly.Events.FlyoutZoom');
 
const {Abstract: AbstractEvent} = goog.require('Blockly.Events.Abstract');
const eventUtils = goog.require('Blockly.Events.utils');
const registry = goog.require('Blockly.registry');
 
 
/**
  * Class for a flyout zoom event.
  * @alias Blockly.Events.FlyoutZoom
  */
class FlyoutZoom extends AbstractEvent {
  /**
   * @param {!number} workspaceId flyout workspace id
   * @param {number} scale of flyout workspace
   */
  constructor(workspaceId, scale) {
    super();

    /**
      * The workspace identifier for this event.
      * @type {string}
    */
    this.workspaceId = workspaceId;
    this.scale = scale;
    this.recordUndo = false;

    /**
      * Type of this event.
      * @type {string}
    */
    this.type = eventUtils.FLYOUT_ZOOM;
  }

  /**
    * Encode the event as JSON.
    * @return {!Object} JSON representation.
  */
  toJson() {
    return {};
  }
  
  /**
    * Decode the JSON event.
    * @param {!Object} json JSON representation.
  */
  fromJson() {}
}
 
registry.register(registry.Type.EVENT, eventUtils.FLYOUT_ZOOM, FlyoutZoom);
 
exports.FlyoutZoom = FlyoutZoom;
 
