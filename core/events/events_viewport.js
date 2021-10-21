/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Events fired as a result of a viewport change.
 */
'use strict';

/**
 * Events fired as a result of a viewport change.
 * @class
 */
goog.module('Blockly.Events.ViewportChange');

const eventUtils = goog.require('Blockly.Events.utils');
const object = goog.require('Blockly.utils.object');
const registry = goog.require('Blockly.registry');
const {UiBase} = goog.require('Blockly.Events.UiBase');


/**
 * Class for a viewport change event.
 * @param {number=} opt_top Top-edge of the visible portion of the workspace,
 *    relative to the workspace origin. Undefined for a blank event.
 * @param {number=} opt_left Left-edge of the visible portion of the workspace,
 *    relative to the workspace origin. Undefined for a blank event.
 * @param {number=} opt_scale The scale of the workspace. Undefined for a blank
 *    event.
 * @param {string=} opt_workspaceId The workspace identifier for this event.
 *    Undefined for a blank event.
 * @param {number=} opt_oldScale The old scale of the workspace. Undefined for a
 *    blank event.
 * @extends {UiBase}
 * @constructor
 * @alias Blockly.Events.ViewportChange
 */
const ViewportChange = function(
    opt_top, opt_left, opt_scale, opt_workspaceId, opt_oldScale) {
  ViewportChange.superClass_.constructor.call(this, opt_workspaceId);

  /**
   * Top-edge of the visible portion of the workspace, relative to the workspace
   * origin.
   * @type {number|undefined}
   */
  this.viewTop = opt_top;

  /**
   * Left-edge of the visible portion of the workspace, relative to the
   * workspace origin.
   * @type {number|undefined}
   */
  this.viewLeft = opt_left;

  /**
   * The scale of the workspace.
   * @type {number|undefined}
   */
  this.scale = opt_scale;

  /**
   * The old scale of the workspace.
   * @type {number|undefined}
   */
  this.oldScale = opt_oldScale;
};
object.inherits(ViewportChange, UiBase);

/**
 * Type of this event.
 * @type {string}
 */
ViewportChange.prototype.type = eventUtils.VIEWPORT_CHANGE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
ViewportChange.prototype.toJson = function() {
  const json = ViewportChange.superClass_.toJson.call(this);
  json['viewTop'] = this.viewTop;
  json['viewLeft'] = this.viewLeft;
  json['scale'] = this.scale;
  json['oldScale'] = this.oldScale;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
ViewportChange.prototype.fromJson = function(json) {
  ViewportChange.superClass_.fromJson.call(this, json);
  this.viewTop = json['viewTop'];
  this.viewLeft = json['viewLeft'];
  this.scale = json['scale'];
  this.oldScale = json['oldScale'];
};

registry.register(
    registry.Type.EVENT, eventUtils.VIEWPORT_CHANGE, ViewportChange);

exports.ViewportChange = ViewportChange;
