/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Events fired as a result of trashcan flyout open and close.
 */
'use strict';

/**
 * Events fired as a result of trashcan flyout open and close.
 * @class
 */
goog.module('Blockly.Events.TrashcanOpen');

const eventUtils = goog.require('Blockly.Events.utils');
const registry = goog.require('Blockly.registry');
const {UiBase} = goog.require('Blockly.Events.UiBase');


/**
 * Class for a trashcan open event.
 * @extends {UiBase}
 * @alias Blockly.Events.TrashcanOpen
 */
class TrashcanOpen extends UiBase {
  /**
   * @param {boolean=} opt_isOpen Whether the trashcan flyout is opening (false
   *     if opening). Undefined for a blank event.
   * @param {string=} opt_workspaceId The workspace identifier for this event.
   *    Undefined for a blank event.
   */
  constructor(opt_isOpen, opt_workspaceId) {
    super(opt_workspaceId);

    /**
     * Whether the trashcan flyout is opening (false if closing).
     * @type {boolean|undefined}
     */
    this.isOpen = opt_isOpen;

    /**
     * Type of this event.
     * @type {string}
     */
    this.type = eventUtils.TRASHCAN_OPEN;
  }

  /**
   * Encode the event as JSON.
   * @return {!Object} JSON representation.
   */
  toJson() {
    const json = super.toJson();
    json['isOpen'] = this.isOpen;
    return json;
  }

  /**
   * Decode the JSON event.
   * @param {!Object} json JSON representation.
   */
  fromJson(json) {
    super.fromJson(json);
    this.isOpen = json['isOpen'];
  }
}

registry.register(registry.Type.EVENT, eventUtils.TRASHCAN_OPEN, TrashcanOpen);

exports.TrashcanOpen = TrashcanOpen;
