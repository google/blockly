/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Events fired as a result of selecting an item on the toolbox.
 */
'use strict';

/**
 * Events fired as a result of selecting an item on the toolbox.
 * @class
 */
goog.module('Blockly.Events.ToolboxItemSelect');

const eventUtils = goog.require('Blockly.Events.utils');
const registry = goog.require('Blockly.registry');
const {UiBase} = goog.require('Blockly.Events.UiBase');


/**
 * Class for a toolbox item select event.
 * @extends {UiBase}
 * @alias Blockly.Events.ToolboxItemSelect
 */
class ToolboxItemSelect extends UiBase {
  /**
   * @param {?string=} opt_oldItem The previously selected toolbox item.
   *     Undefined for a blank event.
   * @param {?string=} opt_newItem The newly selected toolbox item. Undefined
   *     for a blank event.
   * @param {string=} opt_workspaceId The workspace identifier for this event.
   *    Undefined for a blank event.
   */
  constructor(opt_oldItem, opt_newItem, opt_workspaceId) {
    super(opt_workspaceId);

    /**
     * The previously selected toolbox item.
     * @type {?string|undefined}
     */
    this.oldItem = opt_oldItem;

    /**
     * The newly selected toolbox item.
     * @type {?string|undefined}
     */
    this.newItem = opt_newItem;

    /**
     * Type of this event.
     * @type {string}
     */
    this.type = eventUtils.TOOLBOX_ITEM_SELECT;
  }

  /**
   * Encode the event as JSON.
   * @return {!Object} JSON representation.
   */
  toJson() {
    const json = super.toJson();
    json['oldItem'] = this.oldItem;
    json['newItem'] = this.newItem;
    return json;
  }

  /**
   * Decode the JSON event.
   * @param {!Object} json JSON representation.
   */
  fromJson(json) {
    super.fromJson(json);
    this.oldItem = json['oldItem'];
    this.newItem = json['newItem'];
  }
}

registry.register(
    registry.Type.EVENT, eventUtils.TOOLBOX_ITEM_SELECT, ToolboxItemSelect);

exports.ToolboxItemSelect = ToolboxItemSelect;
