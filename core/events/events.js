/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Events fired as a result of actions in Blockly's editor.
 */
'use strict';

/**
 * Events fired as a result of actions in Blockly's editor.
 * @namespace Blockly.Events
 */
goog.declareModuleId('Blockly.Events');

const deprecation = goog.require('Blockly.utils.deprecation');
const eventUtils = goog.require('Blockly.Events.utils');
const {Abstract: AbstractEvent} = goog.require('Blockly.Events.Abstract');
const {BlockBase} = goog.require('Blockly.Events.BlockBase');
const {BlockChange} = goog.require('Blockly.Events.BlockChange');
const {BlockCreate} = goog.require('Blockly.Events.BlockCreate');
const {BlockDelete} = goog.require('Blockly.Events.BlockDelete');
const {BlockDrag} = goog.require('Blockly.Events.BlockDrag');
const {BlockMove} = goog.require('Blockly.Events.BlockMove');
const {BubbleOpen} = goog.require('Blockly.Events.BubbleOpen');
const {Click} = goog.require('Blockly.Events.Click');
const {CommentBase} = goog.require('Blockly.Events.CommentBase');
const {CommentChange} = goog.require('Blockly.Events.CommentChange');
const {CommentCreate} = goog.require('Blockly.Events.CommentCreate');
const {CommentDelete} = goog.require('Blockly.Events.CommentDelete');
const {CommentMove} = goog.require('Blockly.Events.CommentMove');
const {FinishedLoading} = goog.require('Blockly.Events.FinishedLoading');
const {MarkerMove} = goog.require('Blockly.Events.MarkerMove');
const {Selected} = goog.require('Blockly.Events.Selected');
const {ThemeChange} = goog.require('Blockly.Events.ThemeChange');
const {ToolboxItemSelect} = goog.require('Blockly.Events.ToolboxItemSelect');
const {TrashcanOpen} = goog.require('Blockly.Events.TrashcanOpen');
const {UiBase} = goog.require('Blockly.Events.UiBase');
const {Ui} = goog.require('Blockly.Events.Ui');
const {VarBase} = goog.require('Blockly.Events.VarBase');
const {VarCreate} = goog.require('Blockly.Events.VarCreate');
const {VarDelete} = goog.require('Blockly.Events.VarDelete');
const {VarRename} = goog.require('Blockly.Events.VarRename');
const {ViewportChange} = goog.require('Blockly.Events.ViewportChange');


// Events.
export {AbstractEvent as Abstract};

export {BubbleOpen};
export {BlockBase};
export {BlockChange};
export {BlockCreate};
export {BlockDelete};
export {BlockDrag};
export {BlockMove};
export {Click};
export {CommentBase};
export {CommentChange};
export {CommentCreate};
export {CommentDelete};
export {CommentMove};
export {FinishedLoading};
export {MarkerMove};
export {Selected};
export {ThemeChange};
export {ToolboxItemSelect};
export {TrashcanOpen};
export {Ui};
export {UiBase};
export {VarBase};
export {VarCreate};
export {VarDelete};
export {VarRename};
export {ViewportChange};

// Event types.
export var BLOCK_CHANGE = eventUtils.BLOCK_CHANGE;

export var BLOCK_CREATE = eventUtils.BLOCK_CREATE;
export var BLOCK_DELETE = eventUtils.BLOCK_DELETE;
export var BLOCK_DRAG = eventUtils.BLOCK_DRAG;
export var BLOCK_MOVE = eventUtils.BLOCK_MOVE;
export var BUBBLE_OPEN = eventUtils.BUBBLE_OPEN;
export var BumpEvent = eventUtils.BumpEvent;
export var BUMP_EVENTS = eventUtils.BUMP_EVENTS;
export var CHANGE = eventUtils.CHANGE;
export var CLICK = eventUtils.CLICK;
export var COMMENT_CHANGE = eventUtils.COMMENT_CHANGE;
export var COMMENT_CREATE = eventUtils.COMMENT_CREATE;
export var COMMENT_DELETE = eventUtils.COMMENT_DELETE;
export var COMMENT_MOVE = eventUtils.COMMENT_MOVE;
export var CREATE = eventUtils.CREATE;
export var DELETE = eventUtils.DELETE;
export var FINISHED_LOADING = eventUtils.FINISHED_LOADING;
export var MARKER_MOVE = eventUtils.MARKER_MOVE;
export var MOVE = eventUtils.MOVE;
export var SELECTED = eventUtils.SELECTED;
export var THEME_CHANGE = eventUtils.THEME_CHANGE;
export var TOOLBOX_ITEM_SELECT = eventUtils.TOOLBOX_ITEM_SELECT;
export var TRASHCAN_OPEN = eventUtils.TRASHCAN_OPEN;
export var UI = eventUtils.UI;
export var VAR_CREATE = eventUtils.VAR_CREATE;
export var VAR_DELETE = eventUtils.VAR_DELETE;
export var VAR_RENAME = eventUtils.VAR_RENAME;
export var VIEWPORT_CHANGE = eventUtils.VIEWPORT_CHANGE;

// Event utils.
export var clearPendingUndo = eventUtils.clearPendingUndo;

export var disable = eventUtils.disable;
export var enable = eventUtils.enable;
export var filter = eventUtils.filter;
export var fire = eventUtils.fire;
export var fromJson = eventUtils.fromJson;
export var getDescendantIds = eventUtils.getDescendantIds;
export var get = eventUtils.get;
export var getGroup = eventUtils.getGroup;
export var getRecordUndo = eventUtils.getRecordUndo;
export var isEnabled = eventUtils.isEnabled;
export var setGroup = eventUtils.setGroup;
export var setRecordUndo = eventUtils.setRecordUndo;
export var disableOrphans = eventUtils.disableOrphans;

Object.defineProperties(exports, {
  /**
   * Sets whether the next event should be added to the undo stack.
   * @name Blockly.Evenents.recordUndo
   * @type {boolean}
   * @deprecated Use Blockly.Events.getRecordUndo() and
   *     .setRecordUndo().  (September 2021)
   * @suppress {checkTypes}
   */
  recordUndo: {
    get: function() {
      deprecation.warn(
          'Blockly.Events.recordUndo', 'September 2021', 'September 2022',
          'Blockly.Events.getRecordUndo()');
      return eventUtils.getRecordUndo();
    },
    set: function(record) {
      deprecation.warn(
          'Blockly.Events.recordUndo', 'September 2021', 'September 2022',
          'Blockly.Events.setRecordUndo()');
      eventUtils.setRecordUndo(record);
    },
  },
});
