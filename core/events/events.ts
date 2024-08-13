/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Former goog.module ID: Blockly.Events

import * as eventUtils from './utils.js';

// Events.
export {Abstract, AbstractEventJson} from './events_abstract.js';
export {BlockBase, BlockBaseJson} from './events_block_base.js';
export {BlockChange, BlockChangeJson} from './events_block_change.js';
export {BlockCreate, BlockCreateJson} from './events_block_create.js';
export {BlockDelete, BlockDeleteJson} from './events_block_delete.js';
export {BlockDrag, BlockDragJson} from './events_block_drag.js';
export {
  BlockFieldIntermediateChange,
  BlockFieldIntermediateChangeJson,
} from './events_block_field_intermediate_change.js';
export {BlockMove, BlockMoveJson} from './events_block_move.js';
export {BubbleOpen, BubbleOpenJson, BubbleType} from './events_bubble_open.js';
export {Click, ClickJson, ClickTarget} from './events_click.js';
export {CommentBase, CommentBaseJson} from './events_comment_base.js';
export {CommentChange, CommentChangeJson} from './events_comment_change.js';
export {
  CommentCollapse,
  CommentCollapseJson,
} from './events_comment_collapse.js';
export {CommentCreate, CommentCreateJson} from './events_comment_create.js';
export {CommentDelete} from './events_comment_delete.js';
export {CommentDrag, CommentDragJson} from './events_comment_drag.js';
export {CommentMove, CommentMoveJson} from './events_comment_move.js';
export {CommentResize, CommentResizeJson} from './events_comment_resize.js';
export {MarkerMove, MarkerMoveJson} from './events_marker_move.js';
export {Selected, SelectedJson} from './events_selected.js';
export {ThemeChange, ThemeChangeJson} from './events_theme_change.js';
export {
  ToolboxItemSelect,
  ToolboxItemSelectJson,
} from './events_toolbox_item_select.js';
export {TrashcanOpen, TrashcanOpenJson} from './events_trashcan_open.js';
export {UiBase} from './events_ui_base.js';
export {VarBase, VarBaseJson} from './events_var_base.js';
export {VarCreate, VarCreateJson} from './events_var_create.js';
export {VarDelete, VarDeleteJson} from './events_var_delete.js';
export {VarRename, VarRenameJson} from './events_var_rename.js';
export {ViewportChange, ViewportChangeJson} from './events_viewport.js';
export {FinishedLoading} from './workspace_events.js';

export type {BumpEvent} from './utils.js';

// Event types.
export const BLOCK_CHANGE = eventUtils.BLOCK_CHANGE;
export const BLOCK_CREATE = eventUtils.BLOCK_CREATE;
export const BLOCK_DELETE = eventUtils.BLOCK_DELETE;
export const BLOCK_DRAG = eventUtils.BLOCK_DRAG;
export const BLOCK_MOVE = eventUtils.BLOCK_MOVE;
export const BLOCK_FIELD_INTERMEDIATE_CHANGE =
  eventUtils.BLOCK_FIELD_INTERMEDIATE_CHANGE;
export const BUBBLE_OPEN = eventUtils.BUBBLE_OPEN;
export const BUMP_EVENTS = eventUtils.BUMP_EVENTS;
export const CHANGE = eventUtils.CHANGE;
export const CLICK = eventUtils.CLICK;
export const COMMENT_CHANGE = eventUtils.COMMENT_CHANGE;
export const COMMENT_CREATE = eventUtils.COMMENT_CREATE;
export const COMMENT_DELETE = eventUtils.COMMENT_DELETE;
export const COMMENT_MOVE = eventUtils.COMMENT_MOVE;
export const COMMENT_RESIZE = eventUtils.COMMENT_RESIZE;
export const COMMENT_DRAG = eventUtils.COMMENT_DRAG;
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
export {
  clearPendingUndo,
  disable,
  disableOrphans,
  enable,
  filter,
  fire,
  fromJson,
  get,
  getDescendantIds,
  getGroup,
  getRecordUndo,
  isEnabled,
  setGroup,
  setRecordUndo,
} from './utils.js';
