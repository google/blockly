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

import * as deprecation from '../utils/deprecation.js';
import * as eventUtils from './utils.js';
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
import {FinishedLoading} from './workspace_events.js';
import {MarkerMove} from './events_marker_move.js';
import {Selected} from './events_selected.js';
import {ThemeChange} from './events_theme_change.js';
import {ToolboxItemSelect} from './events_toolbox_item_select.js';
import {TrashcanOpen} from './events_trashcan_open.js';
import {UiBase} from './events_ui_base.js';
import {Ui} from './events_ui.js';
import {VarBase} from './events_var_base.js';
import {VarCreate} from './events_var_create.js';
import {VarDelete} from './events_var_delete.js';
import {VarRename} from './events_var_rename.js';
import {ViewportChange} from './events_viewport.js';


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
