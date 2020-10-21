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

goog.provide('Blockly.Events.Click');

goog.require('Blockly.Events');
goog.require('Blockly.Events.Ui');
goog.require('Blockly.registry');
goog.require('Blockly.utils.object');

/**
 * Class for a click event.
 * @param {?Blockly.Block=} opt_block The affected block. Null for click events
 *     that do not have an associated block (i.e. workspace click). Undefined
 *     for a blank event.
 * @param {string=} opt_workspaceId The workspace identifier for this event.
 * @param {string=} opt_targetType The type of element targeted by this click
 *    event.
 * @extends {Blockly.Events.Ui}
 * @constructor
 */
Blockly.Events.Click = function(opt_block, opt_workspaceId, opt_targetType) {
  var workspaceId = opt_block ? opt_block.workspace.id : opt_workspaceId;
  Blockly.Events.Click.superClass_.constructor.call(this, workspaceId);
  this.blockId = opt_block ? opt_block.id : null;

  if (!opt_targetType && !this.isBlank) {
    opt_targetType = opt_block ? 'block' : 'workspace';
  }

  /**
   * The type of element targeted by this click event.
   * @type {string|undefined}
   */
  this.targetType = opt_targetType;
};
Blockly.utils.object.inherits(Blockly.Events.Click, Blockly.Events.Ui);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.Click.prototype.type = Blockly.Events.CLICK;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.Click.prototype.toJson = function() {
  var json = Blockly.Events.Click.superClass_.toJson.call(this);
  json['targetType'] = this.targetType;
  if (this.blockId) {
    json['blockId'] = this.blockId;
  }
  return json;
};

Blockly.registry.register(Blockly.registry.Type.EVENT, Blockly.Events.CLICK,
    Blockly.Events.Click);
