/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Events fired as a result of a theme update.
 */
'use strict';

/**
 * Events fired as a result of a theme update.
 * @class
 */
goog.module('Blockly.Events.ThemeChange');

const eventUtils = goog.require('Blockly.Events.utils');
const object = goog.require('Blockly.utils.object');
const registry = goog.require('Blockly.registry');
const {UiBase} = goog.require('Blockly.Events.UiBase');


/**
 * Class for a theme change event.
 * @param {string=} opt_themeName The theme name. Undefined for a blank event.
 * @param {string=} opt_workspaceId The workspace identifier for this event.
 *    event. Undefined for a blank event.
 * @extends {UiBase}
 * @constructor
 * @alias Blockly.Events.ThemeChange
 */
const ThemeChange = function(opt_themeName, opt_workspaceId) {
  ThemeChange.superClass_.constructor.call(this, opt_workspaceId);

  /**
   * The theme name.
   * @type {string|undefined}
   */
  this.themeName = opt_themeName;
};
object.inherits(ThemeChange, UiBase);

/**
 * Type of this event.
 * @type {string}
 */
ThemeChange.prototype.type = eventUtils.THEME_CHANGE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
ThemeChange.prototype.toJson = function() {
  const json = ThemeChange.superClass_.toJson.call(this);
  json['themeName'] = this.themeName;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
ThemeChange.prototype.fromJson = function(json) {
  ThemeChange.superClass_.fromJson.call(this, json);
  this.themeName = json['themeName'];
};

registry.register(registry.Type.EVENT, eventUtils.THEME_CHANGE, ThemeChange);

exports.ThemeChange = ThemeChange;
