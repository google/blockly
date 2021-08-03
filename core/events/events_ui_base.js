/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Base class for events fired as a result of UI actions in
 * Blockly's editor.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Events.UiBase');

goog.require('Blockly.Events');
goog.require('Blockly.Events.Abstract');
goog.require('Blockly.utils.object');

goog.requireType('Blockly.Block');


/**
 * Base class for a UI event.
 * UI events are events that don't need to be sent over the wire for multi-user
 * editing to work (e.g. scrolling the workspace, zooming, opening toolbox
 * categories).
 * UI events do not undo or redo.
 * @param {string=} opt_workspaceId The workspace identifier for this event.
 *    Undefined for a blank event.
 * @extends {Blockly.Events.Abstract}
 * @constructor
 */
Blockly.Events.UiBase = function(opt_workspaceId) {
  Blockly.Events.UiBase.superClass_.constructor.call(this);

  /**
   * Whether or not the event is blank (to be populated by fromJson).
   * @type {boolean}
   */
  this.isBlank = typeof opt_workspaceId == 'undefined';

  /**
   * The workspace identifier for this event.
   * @type {string}
   */
  this.workspaceId = opt_workspaceId ? opt_workspaceId : '';

  // UI events do not undo or redo.
  this.recordUndo = false;
};
Blockly.utils.object.inherits(Blockly.Events.UiBase, Blockly.Events.Abstract);

/**
 * Whether or not the event is a UI event.
 * @type {boolean}
 */
Blockly.Events.UiBase.prototype.isUiEvent = true;
