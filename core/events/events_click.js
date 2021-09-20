/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Events fired as a result of UI click in Blockly's editor.
 * @author kozbial@google.com (Monica Kozbial)
 */
'use strict';

goog.module('Blockly.Events.Click');

/* eslint-disable-next-line no-unused-vars */
const Block = goog.requireType('Blockly.Block');
const Events = goog.require('Blockly.Events');
const UiBase = goog.require('Blockly.Events.UiBase');
const object = goog.require('Blockly.utils.object');
const registry = goog.require('Blockly.registry');

/**
 * Class for a click event.
 * @param {?Block=} opt_block The affected block. Null for click events
 *    that do not have an associated block (i.e. workspace click). Undefined
 *    for a blank event.
 * @param {?string=} opt_workspaceId The workspace identifier for this event.
 *    Not used if block is passed. Undefined for a blank event.
 * @param {string=} opt_targetType The type of element targeted by this click
 *    event. Undefined for a blank event.
 * @extends {UiBase}
 * @constructor
 */
const Click = function(opt_block, opt_workspaceId, opt_targetType) {
  const workspaceId = opt_block ? opt_block.workspace.id : opt_workspaceId;
  Click.superClass_.constructor.call(this, workspaceId);
  this.blockId = opt_block ? opt_block.id : null;

  /**
   * The type of element targeted by this click event.
   * @type {string|undefined}
   */
  this.targetType = opt_targetType;
};
object.inherits(Click, UiBase);

/**
 * Type of this event.
 * @type {string}
 */
Click.prototype.type = Events.CLICK;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Click.prototype.toJson = function() {
  const json = Click.superClass_.toJson.call(this);
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
Click.prototype.fromJson = function(json) {
  Click.superClass_.fromJson.call(this, json);
  this.targetType = json['targetType'];
  this.blockId = json['blockId'];
};

registry.register(registry.Type.EVENT, Events.CLICK, Click);

exports = Click;
