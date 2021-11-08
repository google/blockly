/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Base class for events fired as a result of UI actions in
 * Blockly's editor.
 */
'use strict';

/**
 * Base class for events fired as a result of UI actions in
 * Blockly's editor.
 * @class
 */
goog.module('Blockly.Events.UiBase');

const Abstract = goog.require('Blockly.Events.Abstract');
const object = goog.require('Blockly.utils.object');


/**
 * Base class for a UI event.
 * UI events are events that don't need to be sent over the wire for multi-user
 * editing to work (e.g. scrolling the workspace, zooming, opening toolbox
 * categories).
 * UI events do not undo or redo.
 * @param {string=} opt_workspaceId The workspace identifier for this event.
 *    Undefined for a blank event.
 * @extends {Abstract}
 * @constructor
 * @alias Blockly.Events.UiBase
 */
const UiBase = function(opt_workspaceId) {
  UiBase.superClass_.constructor.call(this);

  /**
   * Whether or not the event is blank (to be populated by fromJson).
   * @type {boolean}
   */
  this.isBlank = typeof opt_workspaceId === 'undefined';

  /**
   * The workspace identifier for this event.
   * @type {string}
   */
  this.workspaceId = opt_workspaceId ? opt_workspaceId : '';

  // UI events do not undo or redo.
  this.recordUndo = false;
};
object.inherits(UiBase, Abstract);

/**
 * Whether or not the event is a UI event.
 * @type {boolean}
 */
UiBase.prototype.isUiEvent = true;

exports.UiBase = UiBase;
