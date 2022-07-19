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

const {Abstract: AbstractEvent} = goog.require('Blockly.Events.Abstract');
const eventUtils = goog.require('Blockly.Events.utils');
const registry = goog.require('Blockly.registry');


/**
 * Class for a flyout hdie event.
 * @alias Blockly.Events.FlyoutHide
 */
class FlyoutHide extends AbstractEvent {
  /**
   * @param {!workspaceId} workspaceId workspaceId
   * @param {opt_isButtonClose} opt_isButtonClose isButtonClose
   *     event.
   */
  constructor(workspaceId, opt_isButtonClose) {
    super();
    this.isButtonClose = typeof opt_isButtonClose === 'undefined' ? false : opt_isButtonClose;

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
    this.type = eventUtils.FLYOUT_HIDE;
  }

  /**
   * Encode the event as JSON.
   * @return {!Object} JSON representation.
   */
  toJson() {
    const json = super.toJson();
    json['isButtonClose'] = this.isButtonClose;
    return json;
  }

  /**
   * Decode the JSON event.
   * @param {!Object} json JSON representation.
   */
  fromJson(json) {
    super.fromJson(json);
    this.isButtonClose = json['isButtonClose'];
  }
}

registry.register(registry.Type.EVENT, eventUtils.FLYOUT_HIDE, FlyoutHide);

exports.FlyoutHide = FlyoutHide;
