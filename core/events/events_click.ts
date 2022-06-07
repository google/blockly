/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Events fired as a result of UI click in Blockly's editor.
 */
'use strict';

/**
 * Events fired as a result of UI click in Blockly's editor.
 * @class
 */
goog.module('Blockly.Events.Click');

const eventUtils = goog.require('Blockly.Events.utils');
const registry = goog.require('Blockly.registry');
/* eslint-disable-next-line no-unused-vars */
const {Block} = goog.requireType('Blockly.Block');
const {UiBase} = goog.require('Blockly.Events.UiBase');


/**
 * Class for a click event.
 * @extends {UiBase}
 * @alias Blockly.Events.Click
 */
class Click extends UiBase {
  /**
   * @param {?Block=} opt_block The affected block. Null for click events
   *    that do not have an associated block (i.e. workspace click). Undefined
   *    for a blank event.
   * @param {?string=} opt_workspaceId The workspace identifier for this event.
   *    Not used if block is passed. Undefined for a blank event.
   * @param {string=} opt_targetType The type of element targeted by this click
   *    event. Undefined for a blank event.
   */
  constructor(opt_block, opt_workspaceId, opt_targetType) {
    let workspaceId = opt_block ? opt_block.workspace.id : opt_workspaceId;
    if (workspaceId === null) {
      workspaceId = undefined;
    }
    super(workspaceId);
    this.blockId = opt_block ? opt_block.id : null;

    /**
     * The type of element targeted by this click event.
     * @type {string|undefined}
     */
    this.targetType = opt_targetType;

    /**
     * Type of this event.
     * @type {string}
     */
    this.type = eventUtils.CLICK;
  }

  /**
   * Encode the event as JSON.
   * @return {!Object} JSON representation.
   */
  toJson() {
    const json = super.toJson();
    json['targetType'] = this.targetType;
    if (this.blockId) {
      json['blockId'] = this.blockId;
    }
    return json;
  }

  /**
   * Decode the JSON event.
   * @param {!Object} json JSON representation.
   */
  fromJson(json) {
    super.fromJson(json);
    this.targetType = json['targetType'];
    this.blockId = json['blockId'];
  }
}

registry.register(registry.Type.EVENT, eventUtils.CLICK, Click);

exports.Click = Click;
