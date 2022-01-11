/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Module that provides constants for use inside Blockly. Do not
 * use these constants outside of the core library.
 * @package
 */
'use strict';

/**
 * Module that provides constants for use inside Blockly. Do not
 * use these constants outside of the core library.
 * @namespace Blockly.internalConstants
 */
goog.module('Blockly.internalConstants');

const {ConnectionType} = goog.require('Blockly.ConnectionType');


/**
 * The multiplier for scroll wheel deltas using the line delta mode.
 * @type {number}
 * @alias Blockly.internalConstants.LINE_MODE_MULTIPLIER
 */
const LINE_MODE_MULTIPLIER = 40;
exports.LINE_MODE_MULTIPLIER = LINE_MODE_MULTIPLIER;

/**
 * The multiplier for scroll wheel deltas using the page delta mode.
 * @type {number}
 * @alias Blockly.internalConstants.PAGE_MODE_MULTIPLIER
 */
const PAGE_MODE_MULTIPLIER = 125;
exports.PAGE_MODE_MULTIPLIER = PAGE_MODE_MULTIPLIER;

/**
 * Number of pixels the mouse must move before a drag starts.
 * @alias Blockly.internalConstants.DRAG_RADIUS
 */
const DRAG_RADIUS = 5;
exports.DRAG_RADIUS = DRAG_RADIUS;

/**
 * Number of pixels the mouse must move before a drag/scroll starts from the
 * flyout.  Because the drag-intention is determined when this is reached, it is
 * larger than DRAG_RADIUS so that the drag-direction is clearer.
 * @alias Blockly.internalConstants.FLYOUT_DRAG_RADIUS
 */
const FLYOUT_DRAG_RADIUS = 10;
exports.FLYOUT_DRAG_RADIUS = FLYOUT_DRAG_RADIUS;

/**
 * Maximum misalignment between connections for them to snap together.
 * @alias Blockly.internalConstants.SNAP_RADIUS
 */
const SNAP_RADIUS = 28;
exports.SNAP_RADIUS = SNAP_RADIUS;

/**
 * Maximum misalignment between connections for them to snap together,
 * when a connection is already highlighted.
 * @alias Blockly.internalConstants.CONNECTING_SNAP_RADIUS
 */
const CONNECTING_SNAP_RADIUS = SNAP_RADIUS;
exports.CONNECTING_SNAP_RADIUS = CONNECTING_SNAP_RADIUS;

/**
 * How much to prefer staying connected to the current connection over moving to
 * a new connection.  The current previewed connection is considered to be this
 * much closer to the matching connection on the block than it actually is.
 * @alias Blockly.internalConstants.CURRENT_CONNECTION_PREFERENCE
 */
const CURRENT_CONNECTION_PREFERENCE = 8;
exports.CURRENT_CONNECTION_PREFERENCE = CURRENT_CONNECTION_PREFERENCE;

/**
 * Delay in ms between trigger and bumping unconnected block out of alignment.
 * @alias Blockly.internalConstants.BUMP_DELAY
 */
const BUMP_DELAY = 250;
exports.BUMP_DELAY = BUMP_DELAY;

/**
 * Maximum randomness in workspace units for bumping a block.
 * @alias Blockly.internalConstants.BUMP_RANDOMNESS
 */
const BUMP_RANDOMNESS = 10;
exports.BUMP_RANDOMNESS = BUMP_RANDOMNESS;

/**
 * Number of characters to truncate a collapsed block to.
 * @alias Blockly.internalConstants.COLLAPSE_CHARS
 */
const COLLAPSE_CHARS = 30;
exports.COLLAPSE_CHARS = COLLAPSE_CHARS;

/**
 * Length in ms for a touch to become a long press.
 * @alias Blockly.internalConstants.LONGPRESS
 */
const LONGPRESS = 750;
exports.LONGPRESS = LONGPRESS;

/**
 * Prevent a sound from playing if another sound preceded it within this many
 * milliseconds.
 * @alias Blockly.internalConstants.SOUND_LIMIT
 */
const SOUND_LIMIT = 100;
exports.SOUND_LIMIT = SOUND_LIMIT;

/**
 * When dragging a block out of a stack, split the stack in two (true), or drag
 * out the block healing the stack (false).
 * @alias Blockly.internalConstants.DRAG_STACK
 */
const DRAG_STACK = true;
exports.DRAG_STACK = DRAG_STACK;

/**
 * Sprited icons and images.
 * @alias Blockly.internalConstants.SPRITE
 */
const SPRITE = {
  width: 96,
  height: 124,
  url: 'sprites.png',
};
exports.SPRITE = SPRITE;

/**
 * ENUM for no drag operation.
 * @const
 * @alias Blockly.internalConstants.DRAG_NONE
 */
const DRAG_NONE = 0;
exports.DRAG_NONE = DRAG_NONE;

/**
 * ENUM for inside the sticky DRAG_RADIUS.
 * @const
 * @alias Blockly.internalConstants.DRAG_STICKY
 */
const DRAG_STICKY = 1;
exports.DRAG_STICKY = DRAG_STICKY;

/**
 * ENUM for inside the non-sticky DRAG_RADIUS, for differentiating between
 * clicks and drags.
 * @const
 * @alias Blockly.internalConstants.DRAG_BEGIN
 */
const DRAG_BEGIN = 1;
exports.DRAG_BEGIN = DRAG_BEGIN;

/**
 * ENUM for freely draggable (outside the DRAG_RADIUS, if one applies).
 * @const
 * @alias Blockly.internalConstants.DRAG_FREE
 */
const DRAG_FREE = 2;
exports.DRAG_FREE = DRAG_FREE;

/**
 * Lookup table for determining the opposite type of a connection.
 * @const
 * @alias Blockly.internalConstants.OPPOSITE_TYPE
 */
const OPPOSITE_TYPE = [];
OPPOSITE_TYPE[ConnectionType.INPUT_VALUE] = ConnectionType.OUTPUT_VALUE;
OPPOSITE_TYPE[ConnectionType.OUTPUT_VALUE] = ConnectionType.INPUT_VALUE;
OPPOSITE_TYPE[ConnectionType.NEXT_STATEMENT] =
    ConnectionType.PREVIOUS_STATEMENT;
OPPOSITE_TYPE[ConnectionType.PREVIOUS_STATEMENT] =
    ConnectionType.NEXT_STATEMENT;

exports.OPPOSITE_TYPE = OPPOSITE_TYPE;

/**
 * String for use in the dropdown created in field_variable.
 * This string indicates that this option in the dropdown is 'Rename
 * variable...' and if selected, should trigger the prompt to rename a variable.
 * @const {string}
 * @alias Blockly.internalConstants.RENAME_VARIABLE_ID
 */
const RENAME_VARIABLE_ID = 'RENAME_VARIABLE_ID';
exports.RENAME_VARIABLE_ID = RENAME_VARIABLE_ID;

/**
 * String for use in the dropdown created in field_variable.
 * This string indicates that this option in the dropdown is 'Delete the "%1"
 * variable' and if selected, should trigger the prompt to delete a variable.
 * @const {string}
 * @alias Blockly.internalConstants.DELETE_VARIABLE_ID
 */
const DELETE_VARIABLE_ID = 'DELETE_VARIABLE_ID';
exports.DELETE_VARIABLE_ID = DELETE_VARIABLE_ID;
