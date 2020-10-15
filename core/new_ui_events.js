/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Events fired as a result of UI actions in Blockly's editor.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Events.NewUi');
goog.provide('Blockly.Events.Click');

goog.require('Blockly.Events');
goog.require('Blockly.Events.Abstract');
goog.require('Blockly.registry');
goog.require('Blockly.utils.object');


/**
 * Class for a UI event.
 * UI events are events that don't need to be sent over the wire for multi-user
 * editing to work (e.g. scrolling the workspace, zooming, opening toolbox
 * categories).
 * UI events do not undo or redo.
 * @param {*=} opt_workspaceId The workspace identifier for this event.
 * @extends {Blockly.Events.Abstract}
 * @constructor
 */
Blockly.Events.NewUi = function(opt_workspaceId) {
  Blockly.Events.NewUi.superClass_.constructor.call(this);
  this.isBlank = typeof opt_workspaceId == 'undefined';
  this.workspaceId = opt_workspaceId;
  // UI events do not undo or redo.
  this.recordUndo = false;
};
Blockly.utils.object.inherits(Blockly.Events.NewUi, Blockly.Events.Abstract);

/**
 * Whether or not the event is a UI event.
 * @type {boolean}
 */
Blockly.Events.NewUi.prototype.IS_UI_EVENT = true;

/**
 * Class for a Click event.
 * @param {?Blockly.Block=} opt_block The affected block.  Null for UI events
 *     that do not have an associated block.  Undefined for a blank event.
 * @param {*=} opt_workspaceId The workspace identifier for this event.
 * @extends {Blockly.Events.NewUi}
 * @constructor
 */
Blockly.Events.Click = function(opt_block, opt_workspaceId) {
  var workspaceId = opt_block ? opt_block.workspace.id : opt_workspaceId;
  Blockly.Events.Click.superClass_.constructor.call(this, workspaceId);
  this.blockId = opt_block ? opt_block.id : null;
};
Blockly.utils.object.inherits(Blockly.Events.Click, Blockly.Events.NewUi);

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
  if (this.blockId) {
    json['blockId'] = this.blockId;
  }
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.Click.prototype.fromJson = function(json) {
  Blockly.Events.Click.superClass_.fromJson.call(this, json);
  this.blockId = json['blockId'];
};

Blockly.registry.register(Blockly.registry.Type.EVENT, Blockly.Events.CLICK,
    Blockly.Events.Click);
