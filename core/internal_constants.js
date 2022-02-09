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
goog.declareModuleId('Blockly.internalConstants');

const {ConnectionType} = goog.require('Blockly.ConnectionType');


/**
 * Number of pixels the mouse must move before a drag starts.
 * @alias Blockly.internalConstants.DRAG_RADIUS
 */
const DRAG_RADIUS = 5;
export {DRAG_RADIUS};

/**
 * Number of pixels the mouse must move before a drag/scroll starts from the
 * flyout.  Because the drag-intention is determined when this is reached, it is
 * larger than DRAG_RADIUS so that the drag-direction is clearer.
 * @alias Blockly.internalConstants.FLYOUT_DRAG_RADIUS
 */
const FLYOUT_DRAG_RADIUS = 10;
export {FLYOUT_DRAG_RADIUS};

/**
 * Maximum misalignment between connections for them to snap together.
 * @alias Blockly.internalConstants.SNAP_RADIUS
 */
const SNAP_RADIUS = 28;
export {SNAP_RADIUS};

/**
 * Maximum misalignment between connections for them to snap together,
 * when a connection is already highlighted.
 * @alias Blockly.internalConstants.CONNECTING_SNAP_RADIUS
 */
const CONNECTING_SNAP_RADIUS = SNAP_RADIUS;
export {CONNECTING_SNAP_RADIUS};

/**
 * How much to prefer staying connected to the current connection over moving to
 * a new connection.  The current previewed connection is considered to be this
 * much closer to the matching connection on the block than it actually is.
 * @alias Blockly.internalConstants.CURRENT_CONNECTION_PREFERENCE
 */
const CURRENT_CONNECTION_PREFERENCE = 8;
export {CURRENT_CONNECTION_PREFERENCE};

/**
 * Delay in ms between trigger and bumping unconnected block out of alignment.
 * @alias Blockly.internalConstants.BUMP_DELAY
 */
const BUMP_DELAY = 250;
export {BUMP_DELAY};

/**
 * Number of characters to truncate a collapsed block to.
 * @alias Blockly.internalConstants.COLLAPSE_CHARS
 */
const COLLAPSE_CHARS = 30;
export {COLLAPSE_CHARS};

/**
 * When dragging a block out of a stack, split the stack in two (true), or drag
 * out the block healing the stack (false).
 * @alias Blockly.internalConstants.DRAG_STACK
 */
const DRAG_STACK = true;
export {DRAG_STACK};

/**
 * Sprited icons and images.
 * @alias Blockly.internalConstants.SPRITE
 */
const SPRITE = {
  width: 96,
  height: 124,
  url: 'sprites.png',
};
export {SPRITE};

/**
 * ENUM for no drag operation.
 * @const
 * @alias Blockly.internalConstants.DRAG_NONE
 */
const DRAG_NONE = 0;
export {DRAG_NONE};

/**
 * ENUM for inside the sticky DRAG_RADIUS.
 * @const
 * @alias Blockly.internalConstants.DRAG_STICKY
 */
const DRAG_STICKY = 1;
export {DRAG_STICKY};

/**
 * ENUM for inside the non-sticky DRAG_RADIUS, for differentiating between
 * clicks and drags.
 * @const
 * @alias Blockly.internalConstants.DRAG_BEGIN
 */
const DRAG_BEGIN = 1;
export {DRAG_BEGIN};

/**
 * ENUM for freely draggable (outside the DRAG_RADIUS, if one applies).
 * @const
 * @alias Blockly.internalConstants.DRAG_FREE
 */
const DRAG_FREE = 2;
export {DRAG_FREE};

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

export {OPPOSITE_TYPE};

/**
 * String for use in the dropdown created in field_variable.
 * This string indicates that this option in the dropdown is 'Rename
 * variable...' and if selected, should trigger the prompt to rename a variable.
 * @const {string}
 * @alias Blockly.internalConstants.RENAME_VARIABLE_ID
 */
const RENAME_VARIABLE_ID = 'RENAME_VARIABLE_ID';
export {RENAME_VARIABLE_ID};

/**
 * String for use in the dropdown created in field_variable.
 * This string indicates that this option in the dropdown is 'Delete the "%1"
 * variable' and if selected, should trigger the prompt to delete a variable.
 * @const {string}
 * @alias Blockly.internalConstants.DELETE_VARIABLE_ID
 */
const DELETE_VARIABLE_ID = 'DELETE_VARIABLE_ID';
export {DELETE_VARIABLE_ID};
