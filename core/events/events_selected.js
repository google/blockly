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
const registry = goog.require('Blockly.registry');
const {UiBase} = goog.require('Blockly.Events.UiBase');


/**
 * Class for a selected event.
 * @extends {UiBase}
 * @alias Blockly.Events.Selected
 */
class Selected extends UiBase {
  /**
   * @param {?string=} opt_oldElementId The ID of the previously selected
   *    element. Null if no element last selected. Undefined for a blank event.
   * @param {?string=} opt_newElementId The ID of the selected element. Null if
   *     no element currently selected (deselect). Undefined for a blank event.
   * @param {string=} opt_workspaceId The workspace identifier for this event.
   *    Null if no element previously selected. Undefined for a blank event.
   */
  constructor(opt_oldElementId, opt_newElementId, opt_workspaceId) {
    super(opt_workspaceId);

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

    /**
     * Type of this event.
     * @type {string}
     */
    this.type = eventUtils.SELECTED;
  }

  /**
   * Encode the event as JSON.
   * @return {!Object} JSON representation.
   */
  toJson() {
    const json = super.toJson();
    json['oldElementId'] = this.oldElementId;
    json['newElementId'] = this.newElementId;
    return json;
  }

  /**
   * Decode the JSON event.
   * @param {!Object} json JSON representation.
   */
  fromJson(json) {
    super.fromJson(json);
    this.oldElementId = json['oldElementId'];
    this.newElementId = json['newElementId'];
  }
}

registry.register(registry.Type.EVENT, eventUtils.SELECTED, Selected);

exports.Selected = Selected;
