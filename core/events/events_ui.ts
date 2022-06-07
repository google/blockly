/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview (Deprecated) Events fired as a result of UI actions in
 * Blockly's editor.
 */
'use strict';

/**
 * (Deprecated) Events fired as a result of UI actions in
 * Blockly's editor.
 * @class
 */
goog.module('Blockly.Events.Ui');

const eventUtils = goog.require('Blockly.Events.utils');
const registry = goog.require('Blockly.registry');
/* eslint-disable-next-line no-unused-vars */
const {Block} = goog.requireType('Blockly.Block');
const {UiBase} = goog.require('Blockly.Events.UiBase');


/**
 * Class for a UI event.
 * @extends {UiBase}
 * @deprecated December 2020. Instead use a more specific UI event.
 * @alias Blockly.Events.Ui
 */
class Ui extends UiBase {
  /**
   * @param {?Block=} opt_block The affected block.  Null for UI events
   *     that do not have an associated block.  Undefined for a blank event.
   * @param {string=} opt_element One of 'selected', 'comment', 'mutatorOpen',
   *     etc.
   * @param {*=} opt_oldValue Previous value of element.
   * @param {*=} opt_newValue New value of element.
   */
  constructor(opt_block, opt_element, opt_oldValue, opt_newValue) {
    const workspaceId = opt_block ? opt_block.workspace.id : undefined;
    super(workspaceId);

    this.blockId = opt_block ? opt_block.id : null;
    this.element = typeof opt_element === 'undefined' ? '' : opt_element;
    this.oldValue = typeof opt_oldValue === 'undefined' ? '' : opt_oldValue;
    this.newValue = typeof opt_newValue === 'undefined' ? '' : opt_newValue;

    /**
     * Type of this event.
     * @type {string}
     */
    this.type = eventUtils.UI;
  }

  /**
   * Encode the event as JSON.
   * @return {!Object} JSON representation.
   */
  toJson() {
    const json = super.toJson();
    json['element'] = this.element;
    if (this.newValue !== undefined) {
      json['newValue'] = this.newValue;
    }
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
    this.element = json['element'];
    this.newValue = json['newValue'];
    this.blockId = json['blockId'];
  }
}

registry.register(registry.Type.EVENT, eventUtils.UI, Ui);

exports.Ui = Ui;
