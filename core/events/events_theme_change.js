/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Events fired as a result of a theme update.
 * @author kozbial@google.com (Monica Kozbial)
 */
'use strict';

goog.provide('Blockly.Events.ThemeChange');

goog.require('Blockly.Events');
goog.require('Blockly.Events.UiBase');
goog.require('Blockly.registry');
goog.require('Blockly.utils.object');


/**
 * Class for a theme change event.
 * @param {string=} opt_themeName The theme name. Undefined for a blank event.
 * @param {string=} opt_workspaceId The workspace identifier for this event.
 *    event. Undefined for a blank event.
 * @extends {Blockly.Events.UiBase}
 * @constructor
 */
Blockly.Events.ThemeChange = function(opt_themeName, opt_workspaceId) {
  Blockly.Events.ThemeChange.superClass_.constructor.call(this, opt_workspaceId);

  /**
   * The theme name.
   * @type {string|undefined}
   */
  this.themeName = opt_themeName;
};
Blockly.utils.object.inherits(Blockly.Events.ThemeChange, Blockly.Events.UiBase);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.ThemeChange.prototype.type = Blockly.Events.THEME_CHANGE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.ThemeChange.prototype.toJson = function() {
  var json = Blockly.Events.ThemeChange.superClass_.toJson.call(this);
  json['themeName'] = this.themeName;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.ThemeChange.prototype.fromJson = function(json) {
  Blockly.Events.ThemeChange.superClass_.fromJson.call(this, json);
  this.themeName = json['themeName'];
};

Blockly.registry.register(Blockly.registry.Type.EVENT,
    Blockly.Events.THEME_CHANGE, Blockly.Events.ThemeChange);
