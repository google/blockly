/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Events fired as a result of UI actions in Blockly's editor.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Events.Selected');

goog.require('Blockly.Events');
goog.require('Blockly.Events.Ui');
goog.require('Blockly.registry');
goog.require('Blockly.utils.object');

/**
 * Class for a Selected event.
 * @param {?string=} opt_oldElementId The id of the previously selected
 *    element. Null if no element last selected. Undefined for a blank event.
 * @param {?string=} opt_elementId The id of the selected element. Null if no
 *    element currently selected (deselect). Undefined for a blank event.
 * @param {string=} opt_workspaceId The workspace identifier for this event.
 *    NUll if no element previously selected. Undefined for a blank event.
 * @extends {Blockly.Events.Ui}
 * @constructor
 */
Blockly.Events.Selected = function(opt_oldElementId, opt_elementId,
    opt_workspaceId) {
  Blockly.Events.Selected.superClass_.constructor.call(this, opt_workspaceId);

  /**
   * The id of the last selected element.
   * @type {?string|undefined}
   */
  this.oldElementId = opt_oldElementId;

  /**
   * The id of the selected element.
   * @type {?string|undefined}
   */
  this.elementId = opt_elementId;
};
Blockly.utils.object.inherits(Blockly.Events.Selected, Blockly.Events.Ui);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.Selected.prototype.type = Blockly.Events.SELECTED;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.Selected.prototype.toJson = function() {
  var json = Blockly.Events.Selected.superClass_.toJson.call(this);
  json['oldElementId'] = this.oldElementId;
  json['elementId'] = this.elementId;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.Selected.prototype.fromJson = function(json) {
  Blockly.Events.Selected.superClass_.fromJson.call(this, json);
  this.oldElementId = json['oldElementId'];
  this.elementId = json['elementId'];
};

Blockly.registry.register(Blockly.registry.Type.EVENT, Blockly.Events.SELECTED,
    Blockly.Events.Selected);
