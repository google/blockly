/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Events fired as a result of actions in Blockly's editor.
 *
 * @namespace Blockly.Events
 */
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Events');


import {Abstract as AbstractEvent} from './events_abstract.js';
import {BlockBase} from './events_block_base.js';
import {BlockChange} from './events_block_change.js';
import {BlockCreate} from './events_block_create.js';
import {BlockDelete} from './events_block_delete.js';
import {BlockDrag} from './events_block_drag.js';
import {BlockMove} from './events_block_move.js';
import {BubbleOpen} from './events_bubble_open.js';
import {Click} from './events_click.js';
import {CommentBase} from './events_comment_base.js';
import {CommentChange} from './events_comment_change.js';
import {CommentCreate} from './events_comment_create.js';
import {CommentDelete} from './events_comment_delete.js';
import {CommentMove} from './events_comment_move.js';
import {MarkerMove} from './events_marker_move.js';
import {Selected} from './events_selected.js';
import {ThemeChange} from './events_theme_change.js';
import {ToolboxItemSelect} from './events_toolbox_item_select.js';
import {TrashcanOpen} from './events_trashcan_open.js';
import {Ui} from './events_ui.js';
import {UiBase} from './events_ui_base.js';
import {VarBase} from './events_var_base.js';
import {VarCreate} from './events_var_create.js';
import {VarDelete} from './events_var_delete.js';
import {VarRename} from './events_var_rename.js';
import {ViewportChange} from './events_viewport.js';
import * as eventUtils from './utils.js';
import {FinishedLoading} from './workspace_events.js';


// Events.
export const Abstract = AbstractEvent;
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
export const BLOCK_CHANGE = eventUtils.BLOCK_CHANGE;
export const BLOCK_CREATE = eventUtils.BLOCK_CREATE;
export const BLOCK_DELETE = eventUtils.BLOCK_DELETE;
export const BLOCK_DRAG = eventUtils.BLOCK_DRAG;
export const BLOCK_MOVE = eventUtils.BLOCK_MOVE;
export const BUBBLE_OPEN = eventUtils.BUBBLE_OPEN;
export type BumpEvent = eventUtils.BumpEvent;
export const BUMP_EVENTS = eventUtils.BUMP_EVENTS;
export const CHANGE = eventUtils.CHANGE;
export const CLICK = eventUtils.CLICK;
export const COMMENT_CHANGE = eventUtils.COMMENT_CHANGE;
export const COMMENT_CREATE = eventUtils.COMMENT_CREATE;
export const COMMENT_DELETE = eventUtils.COMMENT_DELETE;
export const COMMENT_MOVE = eventUtils.COMMENT_MOVE;
export const CREATE = eventUtils.CREATE;
export const DELETE = eventUtils.DELETE;
export const FINISHED_LOADING = eventUtils.FINISHED_LOADING;
export const MARKER_MOVE = eventUtils.MARKER_MOVE;
export const MOVE = eventUtils.MOVE;
export const SELECTED = eventUtils.SELECTED;
export const THEME_CHANGE = eventUtils.THEME_CHANGE;
export const TOOLBOX_ITEM_SELECT = eventUtils.TOOLBOX_ITEM_SELECT;
export const TRASHCAN_OPEN = eventUtils.TRASHCAN_OPEN;
export const UI = eventUtils.UI;
export const VAR_CREATE = eventUtils.VAR_CREATE;
export const VAR_DELETE = eventUtils.VAR_DELETE;
export const VAR_RENAME = eventUtils.VAR_RENAME;
export const VIEWPORT_CHANGE = eventUtils.VIEWPORT_CHANGE;

// Event utils.
export const clearPendingUndo = eventUtils.clearPendingUndo;
export const disable = eventUtils.disable;
export const enable = eventUtils.enable;
export const filter = eventUtils.filter;
export const fire = eventUtils.fire;
export const fromJson = eventUtils.fromJson;
export const getDescendantIds = eventUtils.getDescendantIds;
export const get = eventUtils.get;
export const getGroup = eventUtils.getGroup;
export const getRecordUndo = eventUtils.getRecordUndo;
export const isEnabled = eventUtils.isEnabled;
export const setGroup = eventUtils.setGroup;
export const setRecordUndo = eventUtils.setRecordUndo;
export const disableOrphans = eventUtils.disableOrphans;
