/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Events fired as a result of hide flyout
 */
'use strict';

/**
 * Events fired as a result of hide flyout
 * @class
 */
goog.module('Blockly.Events.FlyoutHide');

const Abstract = goog.require('Blockly.Events.Abstract');
const eventUtils = goog.require('Blockly.Events.utils');
const object = goog.require('Blockly.utils.object');
const registry = goog.require('Blockly.registry');


/**
 * Class for a flyout hdie event.
 * @constructor
 * @alias Blockly.Events.FlyoutHide
 */
const FlyoutHide = function(workspaceId, opt_isButtonClose) {
  FlyoutHide.superClass_.constructor.call(this);

  this.isButtonClose = typeof opt_isButtonClose === 'undefined' ? false : opt_isButtonClose;

  /**
   * The workspace identifier for this event.
   * @type {string}
   */
  this.workspaceId = workspaceId;

  this.recordUndo = false;
};
object.inherits(FlyoutHide, Abstract);

/**
 * Type of this event.
 * @type {string}
 */
FlyoutHide.prototype.type = eventUtils.FLYOUT_HIDE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
FlyoutHide.prototype.toJson = function() {
  const json = FlyoutHide.superClass_.toJson.call(this);
  json['isButtonClose'] = this.isButtonClose;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
FlyoutHide.prototype.fromJson = function(json) {
  FlyoutHide.superClass_.fromJson.call(this, json);
  this.isButtonClose = json['isButtonClose'];
};

registry.register(registry.Type.EVENT, eventUtils.FLYOUT_HIDE, FlyoutHide);

exports.FlyoutHide = FlyoutHide;
