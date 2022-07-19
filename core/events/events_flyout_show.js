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

const {Abstract: AbstractEvent} = goog.require('Blockly.Events.Abstract');
const eventUtils = goog.require('Blockly.Events.utils');
const registry = goog.require('Blockly.registry');


/**
 * Class for a flyout show event.
 * @alias Blockly.Events.FlyoutShow
 */
class FlyoutShow extends AbstractEvent {
  /**
   * @param {!workspaceId} workspaceId workspaceId
   */
  constructor(workspaceId) {
    super();

    /**
     * The workspace identifier for this event.
     * @type {string}
     */
    this.workspaceId = workspaceId;

    this.recordUndo = false;

    /**
     * Type of this event.
     * @type {string}
     */
    this.type = eventUtils.FLYOUT_SHOW;
  }

  /**
   * Encode the event as JSON.
   * @return {!Object} JSON representation.
   */
  toJson() {
    return {};
  }

  /**
   * Decode the JSON event.
   * @param {!Object} json JSON representation.
   */
  fromJson() {}
}

registry.register(registry.Type.EVENT, eventUtils.FLYOUT_SHOW, FlyoutShow);

exports.FlyoutShow = FlyoutShow;
