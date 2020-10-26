/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Events fired as a result of a zoom control click.
 * @author kozbial@google.com (Monica Kozbial)
 */
'use strict';

goog.provide('Blockly.Events.Zoom');

goog.require('Blockly.Events');
goog.require('Blockly.Events.UiBase');
goog.require('Blockly.registry');
goog.require('Blockly.utils.object');

/**
 * Class for a zoom control click event.
 * @param {number=} opt_oldScale The old scale value.
 * @param {number=} opt_scale The current scale value.
 * @param {string=} opt_workspaceId The workspace identifier for this event.
 * @extends {Blockly.Events.UiBase}
 * @constructor
 */
Blockly.Events.Zoom = function(opt_oldScale, opt_scale, opt_workspaceId) {
  Blockly.Events.Zoom.superClass_.constructor.call(this, opt_workspaceId);

  /**
   * The old scale.
   * @type {number|undefined}
   */
  this.oldScale = opt_oldScale;

  /**
   * The old scale.
   * @type {number|undefined}
   */
  this.scale = opt_scale;
};
Blockly.utils.object.inherits(Blockly.Events.Zoom, Blockly.Events.UiBase);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.Zoom.prototype.type = Blockly.Events.ZOOM;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.Zoom.prototype.toJson = function() {
  var json = Blockly.Events.Zoom.superClass_.toJson.call(this);
  json['oldScale'] = this.oldScale;
  json['scale'] = this.scale;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.Zoom.prototype.fromJson = function(json) {
  Blockly.Events.Zoom.superClass_.fromJson.call(this, json);
  this.oldScale = json['oldScale'];
  this.scale = json['scale'];
};

Blockly.registry.register(Blockly.registry.Type.EVENT, Blockly.Events.ZOOM,
    Blockly.Events.Zoom);
