/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Events fired as a result of a viewport change.
 * @author kozbial@google.com (Monica Kozbial)
 */
'use strict';

goog.provide('Blockly.Events.ViewportChange');

goog.require('Blockly.Events');
goog.require('Blockly.Events.UiBase');
goog.require('Blockly.registry');
goog.require('Blockly.utils.object');


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
 * @extends {Blockly.Events.UiBase}
 * @constructor
 */
Blockly.Events.ViewportChange = function(opt_top, opt_left, opt_scale,
    opt_workspaceId, opt_oldScale) {
  Blockly.Events.ViewportChange.superClass_.constructor.call(this, opt_workspaceId);

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
Blockly.utils.object.inherits(Blockly.Events.ViewportChange,
    Blockly.Events.UiBase);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.ViewportChange.prototype.type = Blockly.Events.VIEWPORT_CHANGE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.ViewportChange.prototype.toJson = function() {
  var json = Blockly.Events.ViewportChange.superClass_.toJson.call(this);
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
Blockly.Events.ViewportChange.prototype.fromJson = function(json) {
  Blockly.Events.ViewportChange.superClass_.fromJson.call(this, json);
  this.viewTop = json['viewTop'];
  this.viewLeft = json['viewLeft'];
  this.scale = json['scale'];
  this.oldScale = json['oldScale'];
};

Blockly.registry.register(Blockly.registry.Type.EVENT,
    Blockly.Events.VIEWPORT_CHANGE, Blockly.Events.ViewportChange);
