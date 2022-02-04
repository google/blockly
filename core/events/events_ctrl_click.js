/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Events fired as a result of UI click with pressed in Blockly's editor.
 */
'use strict';

/**
 * Events fired as a result of UI click with pressed Ctrl in Blockly's editor.
 * @class
 */
goog.module('Blockly.Events.CtrlClick');

const eventUtils = goog.require('Blockly.Events.utils');
const object = goog.require('Blockly.utils.object');
const registry = goog.require('Blockly.registry');
/* eslint-disable-next-line no-unused-vars */
const { Block } = goog.requireType('Blockly.Block');
const { UiBase } = goog.require('Blockly.Events.UiBase');

/**
 * Class for a ctrl+click event.
 * @param {?Block=} opt_block The affected block. Null for ctrl+click events
 *    that do not have an associated block (i.e. workspace click). Undefined
 *    for a blank event.
 * @param {?string=} opt_workspaceId The workspace identifier for this event.
 *    Not used if block is passed. Undefined for a blank event.
 * @param {string=} opt_targetType The type of element targeted by this click
 *    event. Undefined for a blank event.
 * @extends {UiBase}
 * @constructor
 * @alias Blockly.Events.CtrlClick
 */
const CtrlClick = function (opt_block, opt_workspaceId, opt_targetType) {
  const workspaceId = opt_block ? opt_block.workspace.id : opt_workspaceId;
  CtrlClick.superClass_.constructor.call(this, workspaceId);
  this.blockId = opt_block ? opt_block.id : null;

  /**
   * The type of element targeted by this ctrl+click event.
   * @type {string|undefined}
   */
  this.targetType = opt_targetType;
};
object.inherits(CtrlClick, UiBase);

/**
 * Type of this event.
 * @type {string}
 */
CtrlClick.prototype.type = eventUtils.CTRL_CLICK;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
CtrlClick.prototype.toJson = function () {
  const json = CtrlClick.superClass_.toJson.call(this);
  json['targetType'] = this.targetType;
  if (this.blockId) {
    json['blockId'] = this.blockId;
  }
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
CtrlClick.prototype.fromJson = function (json) {
  CtrlClick.superClass_.fromJson.call(this, json);
  this.targetType = json['targetType'];
  this.blockId = json['blockId'];
};

registry.register(registry.Type.EVENT, eventUtils.CTRL_CLICK, CtrlClick);

exports.CtrlClick = CtrlClick;
