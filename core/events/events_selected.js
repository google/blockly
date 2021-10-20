/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Events fired as a result of element select action.
 */
'use strict';

/**
 * Events fired as a result of element select action.
 * @class
 */
goog.module('Blockly.Events.Selected');

const eventUtils = goog.require('Blockly.Events.utils');
const object = goog.require('Blockly.utils.object');
const registry = goog.require('Blockly.registry');
const {UiBase} = goog.require('Blockly.Events.UiBase');


/**
 * Class for a selected event.
 * @param {?string=} opt_oldElementId The ID of the previously selected
 *    element. Null if no element last selected. Undefined for a blank event.
 * @param {?string=} opt_newElementId The ID of the selected element. Null if no
 *    element currently selected (deselect). Undefined for a blank event.
 * @param {string=} opt_workspaceId The workspace identifier for this event.
 *    Null if no element previously selected. Undefined for a blank event.
 * @extends {UiBase}
 * @constructor
 * @alias Blockly.Events.Selected
 */
const Selected = function(opt_oldElementId, opt_newElementId, opt_workspaceId) {
  Selected.superClass_.constructor.call(this, opt_workspaceId);

  /**
   * The id of the last selected element.
   * @type {?string|undefined}
   */
  this.oldElementId = opt_oldElementId;

  /**
   * The id of the selected element.
   * @type {?string|undefined}
   */
  this.newElementId = opt_newElementId;
};
object.inherits(Selected, UiBase);

/**
 * Type of this event.
 * @type {string}
 */
Selected.prototype.type = eventUtils.SELECTED;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Selected.prototype.toJson = function() {
  const json = Selected.superClass_.toJson.call(this);
  json['oldElementId'] = this.oldElementId;
  json['newElementId'] = this.newElementId;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Selected.prototype.fromJson = function(json) {
  Selected.superClass_.fromJson.call(this, json);
  this.oldElementId = json['oldElementId'];
  this.newElementId = json['newElementId'];
};

registry.register(registry.Type.EVENT, eventUtils.SELECTED, Selected);

exports.Selected = Selected;
