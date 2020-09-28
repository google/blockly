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

goog.provide('Blockly.Events.Ui');

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
 * @param {?Blockly.Block=} opt_block The affected block.  Null for UI events
 *     that do not have an associated block.  Undefined for a blank event.
 * @param {string=} opt_element One of 'selected', 'comment', 'mutatorOpen',
 *     etc.
 * @param {*=} opt_oldValue Previous value of element.
 * @param {*=} opt_newValue New value of element.
 * @extends {Blockly.Events.Abstract}
 * @constructor
 */
Blockly.Events.Ui = function(opt_block, opt_element, opt_oldValue,
    opt_newValue) {
  Blockly.Events.Ui.superClass_.constructor.call(this);
  this.isBlank = typeof opt_block == 'undefined';

  this.blockId = opt_block ? opt_block.id : null;
  this.workspaceId = opt_block ? opt_block.workspace.id : undefined;
  this.element = typeof opt_element == 'undefined' ? '' : opt_element;
  this.oldValue = typeof opt_oldValue == 'undefined' ? '' : opt_oldValue;
  this.newValue = typeof opt_newValue == 'undefined' ? '' : opt_newValue;
  // UI events do not undo or redo.
  this.recordUndo = false;
};
Blockly.utils.object.inherits(Blockly.Events.Ui, Blockly.Events.Abstract);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.Ui.prototype.type = Blockly.Events.UI;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.Ui.prototype.toJson = function() {
  var json = Blockly.Events.Ui.superClass_.toJson.call(this);
  json['element'] = this.element;
  if (this.newValue !== undefined) {
    json['newValue'] = this.newValue;
  }
  if (this.blockId) {
    json['blockId'] = this.blockId;
  }
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.Ui.prototype.fromJson = function(json) {
  Blockly.Events.Ui.superClass_.fromJson.call(this, json);
  this.element = json['element'];
  this.newValue = json['newValue'];
  this.blockId = json['blockId'];
};

Blockly.registry.register(Blockly.registry.Type.EVENT, Blockly.Events.UI,
    Blockly.Events.Ui);
