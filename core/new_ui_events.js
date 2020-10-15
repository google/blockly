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
 * Type of this event.
 * @type {string}
 */
Blockly.Events.NewUi.prototype.type = Blockly.Events.UI;

