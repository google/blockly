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
const registry = goog.require('Blockly.registry');
const {UiBase} = goog.require('Blockly.Events.UiBase');


/**
 * Class for a theme change event.
 * @extends {UiBase}
 * @alias Blockly.Events.ThemeChange
 */
class ThemeChange extends UiBase {
  /**
   * @param {string=} opt_themeName The theme name. Undefined for a blank event.
   * @param {string=} opt_workspaceId The workspace identifier for this event.
   *    event. Undefined for a blank event.
   */
  constructor(opt_themeName, opt_workspaceId) {
    super(opt_workspaceId);

    /**
     * The theme name.
     * @type {string|undefined}
     */
    this.themeName = opt_themeName;

    /**
     * Type of this event.
     * @type {string}
     */
    this.type = eventUtils.THEME_CHANGE;
  }

  /**
   * Encode the event as JSON.
   * @return {!Object} JSON representation.
   */
  toJson() {
    const json = super.toJson();
    json['themeName'] = this.themeName;
    return json;
  }

  /**
   * Decode the JSON event.
   * @param {!Object} json JSON representation.
   */
  fromJson(json) {
    super.fromJson(json);
    this.themeName = json['themeName'];
  }
}

registry.register(registry.Type.EVENT, eventUtils.THEME_CHANGE, ThemeChange);

exports.ThemeChange = ThemeChange;
