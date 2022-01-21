/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Events fired as a result of showing flyout
 */
'use strict';

/**
 * Events fired as a result of showing flyout
 * @class
 */
goog.module('Blockly.Events.FlyoutShow');

const Abstract = goog.require('Blockly.Events.Abstract');
const eventUtils = goog.require('Blockly.Events.utils');
const object = goog.require('Blockly.utils.object');
const registry = goog.require('Blockly.registry');


/**
 * Class for a flyout show event.
 * @constructor
 * @alias Blockly.Events.FlyoutShow
 */
const FlyoutShow = function(workspaceId) {
  FlyoutShow.superClass_.constructor.call(this);

  /**
   * The workspace identifier for this event.
   * @type {string}
   */
  this.workspaceId = workspaceId

  this.recordUndo = false
};
object.inherits(FlyoutShow, Abstract);

/**
 * Type of this event.
 * @type {string}
 */
FlyoutShow.prototype.type = eventUtils.FLYOUT_SHOW;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
FlyoutShow.prototype.toJson = function() {
  return {}
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
FlyoutShow.prototype.fromJson = function(json) {};

registry.register(registry.Type.EVENT, eventUtils.FLYOUT_SHOW, FlyoutShow);

exports.FlyoutShow = FlyoutShow;
