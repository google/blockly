/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Events fired as a result of actions in Blockly's editor.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * Events fired as a result of actions in Blockly's editor.
 * @namespace Blockly.Events
 */
goog.module('Blockly.Events');

const Abstract = goog.require('Blockly.Events.Abstract');
/* eslint-disable-next-line no-unused-vars */
const BlockBase = goog.require('Blockly.Events.BlockBase');
const BlockChange = goog.require('Blockly.Events.BlockChange');
const BlockCreate = goog.require('Blockly.Events.BlockCreate');
const BlockDelete = goog.require('Blockly.Events.BlockDelete');
const BlockDrag = goog.require('Blockly.Events.BlockDrag');
const BlockMove = goog.require('Blockly.Events.BlockMove');
const Click = goog.require('Blockly.Events.Click');
const CommentBase = goog.require('Blockly.Events.CommentBase');
const CommentChange = goog.require('Blockly.Events.CommentChange');
const CommentCreate = goog.require('Blockly.Events.CommentCreate');
const CommentDelete = goog.require('Blockly.Events.CommentDelete');
const CommentMove = goog.require('Blockly.Events.CommentMove');
const FinishedLoading = goog.require('Blockly.Events.FinishedLoading');
const MarkerMove = goog.require('Blockly.Events.MarkerMove');
const Selected = goog.require('Blockly.Events.Selected');
const ThemeChange = goog.require('Blockly.Events.ThemeChange');
const ToolboxItemSelect = goog.require('Blockly.Events.ToolboxItemSelect');
const TrashcanOpen = goog.require('Blockly.Events.TrashcanOpen');
const Ui = goog.require('Blockly.Events.Ui');
const UiBase = goog.require('Blockly.Events.UiBase');
const VarBase = goog.require('Blockly.Events.VarBase');
const VarCreate = goog.require('Blockly.Events.VarCreate');
const VarDelete = goog.require('Blockly.Events.VarDelete');
const VarRename = goog.require('Blockly.Events.VarRename');
const ViewportChange = goog.require('Blockly.Events.ViewportChange');
// TODO: Figure out a better name.
const helpers = goog.require('Blockly.Events.helpers');

exports.Abstract = Abstract;
// TODO: is this suppose to be public?
exports.BlockBase = BlockBase;
exports.BlockChange = BlockChange;
exports.BlockCreate = BlockCreate;
exports.BlockDelete = BlockDelete;
exports.BlockDrag = BlockDrag;
exports.BlockMove = BlockMove;
exports.Click = Click;
// TODO: Is this suppose to be public?
exports.CommentBase = CommentBase;
exports.CommentChange = CommentChange;
exports.CommentCreate = CommentCreate;
exports.CommentDelete = CommentDelete;
exports.CommentMove = CommentMove;
exports.FinishedLoading = FinishedLoading;
exports.MarkerMove = MarkerMove;
exports.Selected = Selected;
exports.ThemeChange = ThemeChange;
exports.ToolboxItemSelect = ToolboxItemSelect;
exports.TrashcanOpen = TrashcanOpen;
exports.Ui = Ui;
exports.UiBase = UiBase;
exports.VarBase = VarBase;
exports.VarCreate = VarCreate;
exports.VarDelete = VarDelete;
exports.VarRename = VarRename;
exports.ViewportChange = ViewportChange;

// Export all the public helpers.
exports.clearPendingUndo = helpers.clearPendingUndo;
// TODO: What should I do about this private nonsense? What should I be exporting?
exports.disabled = helpers.disabled_;
exports.disable = helpers.disable;
exports.enable = helpers.enable;
exports.filter = helpers.filter;
exports.fire = helpers.fire;
// TODO: What should I do about this private nonsense?
exports.fireNow = helpers.fireNow_;
exports.fromJson = helpers.fromJson;
exports.getDescendantIds = helpers.getDescendantIds;
exports.get = helpers.get;
exports.getGroup = helpers.getGroup;
exports.getRecordUndo = helpers.getRecordUndo;
exports.isEnabled = helpers.isEnabled;
// TODO: Same, what to do about this?
exports.recordUndo = helpers.recordUndo;
exports.setGroup = helpers.setGroup;
exports.setRecordUndo = helpers.setRecordUndo;

//
exports.CREATE = helpers.CREATE;
exports.BLOCK_CREATE = helpers.BLOCK_CREATE;
exports.DELETE = helpers.DELETE;
exports.BLOCK_DELETE = helpers.BLOCK_DELETE;
exports.CHANGE = helpers.CHANGE;
exports.BLOCK_CHANGE = helpers.BLOCK_CHANGE;
exports.MOVE = helpers.MOVE;
exports.BLOCK_MOVE = helpers.BLOCK_MOVE;
exports.VAR_CREATE = helpers.VAR_CREATE;
exports.VAR_DELETE = helpers.VAR_DELETE;
exports.VAR_RENAME = helpers.VAR_RENAME;
exports.UI = helpers.UI;
exports.BLOCK_DRAG = helpers.BLOCK_DRAG;
exports.SELECTED = helpers.SELECTED;
exports.CLICK = helpers.CLICK;
exports.MARKER_MOVE = helpers.MARKER_MOVE;
exports.BUBBLE_OPEN = helpers.BUBBLE_OPEN;
exports.TRASHCAN_OPEN = helpers.TRASHCAN_OPEN;
exports.TOOLBOX_ITEM_SELECT = helpers.TOOLBOX_ITEM_SELECT;
exports.THEME_CHANGE = helpers.THEME_CHANGE;
exports.VIEWPORT_CHANGE = helpers.VIEWPORT_CHANGE;
exports.COMMENT_CREATE = helpers.COMMENT_CREATE;
exports.COMMENT_DELETE = helpers.COMMENT_DELETE;
exports.COMMENT_CHANGE = helpers.COMMENT_CHANGE;
exports.COMMENT_MOVE = helpers.COMMENT_MOVE;
exports.FINISHED_LOADING = helpers.FINISHED_LOADING;
exports.BumpEvent = helpers.BumpEvent;
exports.BUMP_EVENTS = helpers.BUMP_EVENTS;
exports.FIRE_QUEUE_ = helpers.FIRE_QUEUE_;
