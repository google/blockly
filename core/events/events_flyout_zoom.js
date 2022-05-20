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
 
const Abstract = goog.require('Blockly.Events.Abstract');
const eventUtils = goog.require('Blockly.Events.utils');
const object = goog.require('Blockly.utils.object');
const registry = goog.require('Blockly.registry');
 
 
/**
  * Class for a flyout zoom event.
  * @constructor
  * @alias Blockly.Events.FlyoutZoom
  * @param {!number} workspaceId flyout workspace id
  * @param {number} scale of flyout workspace
  */
const FlyoutZoom = function(workspaceId, scale) {
  FlyoutZoom.superClass_.constructor.call(this);
  /**
    * The workspace identifier for this event.
    * @type {string}
  */
  this.workspaceId = workspaceId;
  this.scale = scale;
  this.recordUndo = false;
};
object.inherits(FlyoutZoom, Abstract);
 
/**
  * Type of this event.
  * @type {string}
*/
FlyoutZoom.prototype.type = eventUtils.FLYOUT_ZOOM;
 
/**
  * Encode the event as JSON.
  * @return {!Object} JSON representation.
*/
FlyoutZoom.prototype.toJson = function() {
  return {};
};
 
/**
  * Decode the JSON event.
  * @param {!Object} json JSON representation.
*/
FlyoutZoom.prototype.fromJson = function(json) {};
 
registry.register(registry.Type.EVENT, eventUtils.FLYOUT_ZOOM, FlyoutZoom);
 
exports.FlyoutZoom = FlyoutZoom;
 
