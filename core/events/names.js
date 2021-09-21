/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview TODO
 */
'use strict';

goog.module('Blockly.Events.types');


/**
 * Name of event that creates a block. Will be deprecated for BLOCK_CREATE.
 * @const
 */
const CREATE = 'create';
exports.CREATE = CREATE;

/**
 * Name of event that creates a block.
 * @const
 */
const BLOCK_CREATE = CREATE;
exports.BLOCK_CREATE = BLOCK_CREATE;

/**
 * Name of event that deletes a block. Will be deprecated for BLOCK_DELETE.
 * @const
 */
const DELETE = 'delete';
exports.DELETE = DELETE;

/**
 * Name of event that deletes a block.
 * @const
 */
const BLOCK_DELETE = DELETE;
exports.BLOCK_DELETE = BLOCK_DELETE;

/**
 * Name of event that changes a block. Will be deprecated for BLOCK_CHANGE.
 * @const
 */
const CHANGE = 'change';
exports.CHANGE = CHANGE;

/**
 * Name of event that changes a block.
 * @const
 */
const BLOCK_CHANGE = CHANGE;
exports.BLOCK_CHANGE = BLOCK_CHANGE;

/**
 * Name of event that moves a block. Will be deprecated for BLOCK_MOVE.
 * @const
 */
const MOVE = 'move';
exports.MOVE = MOVE;

/**
 * Name of event that moves a block.
 * @const
 */
const BLOCK_MOVE = MOVE;
exports.BLOCK_MOVE = BLOCK_MOVE;

/**
 * Name of event that creates a variable.
 * @const
 */
const VAR_CREATE = 'var_create';
exports.VAR_CREATE = VAR_CREATE;

/**
 * Name of event that deletes a variable.
 * @const
 */
const VAR_DELETE = 'var_delete';
exports.VAR_DELETE = VAR_DELETE;

/**
 * Name of event that renames a variable.
 * @const
 */
const VAR_RENAME = 'var_rename';
exports.VAR_RENAME = VAR_RENAME;

/**
 * Name of generic event that records a UI change.
 * @const
 */
const UI = 'ui';
exports.UI = UI;

/**
 * Name of event that record a block drags a block.
 * @const
 */
const BLOCK_DRAG = 'drag';
exports.BLOCK_DRAG = BLOCK_DRAG;

/**
 * Name of event that records a change in selected element.
 * @const
 */
const SELECTED = 'selected';
exports.SELECTED = SELECTED;

/**
 * Name of event that records a click.
 * @const
 */
const CLICK = 'click';
exports.CLICK = CLICK;

/**
 * Name of event that records a marker move.
 * @const
 */
const MARKER_MOVE = 'marker_move';
exports.MARKER_MOVE = MARKER_MOVE;

/**
 * Name of event that records a bubble open.
 * @const
 */
const BUBBLE_OPEN = 'bubble_open';
exports.BUBBLE_OPEN = BUBBLE_OPEN;

/**
 * Name of event that records a trashcan open.
 * @const
 */
const TRASHCAN_OPEN = 'trashcan_open';
exports.TRASHCAN_OPEN = TRASHCAN_OPEN;

/**
 * Name of event that records a toolbox item select.
 * @const
 */
const TOOLBOX_ITEM_SELECT = 'toolbox_item_select';
exports.TOOLBOX_ITEM_SELECT = TOOLBOX_ITEM_SELECT;

/**
 * Name of event that records a theme change.
 * @const
 */
const THEME_CHANGE = 'theme_change';
exports.THEME_CHANGE = THEME_CHANGE;

/**
 * Name of event that records a viewport change.
 * @const
 */
const VIEWPORT_CHANGE = 'viewport_change';
exports.VIEWPORT_CHANGE = VIEWPORT_CHANGE;

/**
 * Name of event that creates a comment.
 * @const
 */
const COMMENT_CREATE = 'comment_create';
exports.COMMENT_CREATE = COMMENT_CREATE;

/**
 * Name of event that deletes a comment.
 * @const
 */
const COMMENT_DELETE = 'comment_delete';
exports.COMMENT_DELETE = COMMENT_DELETE;

/**
 * Name of event that changes a comment.
 * @const
 */
const COMMENT_CHANGE = 'comment_change';
exports.COMMENT_CHANGE = COMMENT_CHANGE;

/**
 * Name of event that moves a comment.
 * @const
 */
const COMMENT_MOVE = 'comment_move';
exports.COMMENT_MOVE = COMMENT_MOVE;

/**
 * Name of event that records a workspace load.
 */
const FINISHED_LOADING = 'finished_loading';
exports.FINISHED_LOADING = FINISHED_LOADING;

/**
 * List of events that cause objects to be bumped back into the visible
 * portion of the workspace.
 *
 * Not to be confused with bumping so that disconnected connections do not
 * appear connected.
 * @const
 */
const BUMP_EVENTS = [BLOCK_CREATE, BLOCK_MOVE, COMMENT_CREATE, COMMENT_MOVE];
exports.BUMP_EVENTS = BUMP_EVENTS;
