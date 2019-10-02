/**
 * @license
 * Copyright 2016 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Blockly constants.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.constants');

/**
 * The multiplier for scroll wheel deltas using the line delta mode.
 * @type {number}
 */
Blockly.LINE_MODE_MULTIPLIER = 40;

/**
 * The multiplier for scroll wheel deltas using the page delta mode.
 * @type {number}
 */
Blockly.PAGE_MODE_MULTIPLIER = 125;

/**
 * Number of pixels the mouse must move before a drag starts.
 */
Blockly.DRAG_RADIUS = 5;

/**
 * Number of pixels the mouse must move before a drag/scroll starts from the
 * flyout.  Because the drag-intention is determined when this is reached, it is
 * larger than Blockly.DRAG_RADIUS so that the drag-direction is clearer.
 */
Blockly.FLYOUT_DRAG_RADIUS = 10;

/**
 * Maximum misalignment between connections for them to snap together.
 */
Blockly.SNAP_RADIUS = 28;

/**
 * Maximum misalignment between connections for them to snap together,
 * when a connection is already highlighted.
 */
Blockly.CONNECTING_SNAP_RADIUS = Blockly.SNAP_RADIUS;

/**
 * How much to prefer staying connected to the current connection over moving to
 * a new connection.  The current previewed connection is considered to be this
 * much closer to the matching connection on the block than it actually is.
 */
Blockly.CURRENT_CONNECTION_PREFERENCE = 8;

/**
 * The main colour of insertion markers, in hex.  The block is rendered a
 * transparent grey by changing the fill opacity in CSS.
 */
Blockly.INSERTION_MARKER_COLOUR = '#000000';

/**
 * Delay in ms between trigger and bumping unconnected block out of alignment.
 */
Blockly.BUMP_DELAY = 250;

/**
 * Maximum randomness in workspace units for bumping a block.
 */
Blockly.BUMP_RANDOMNESS = 10;

/**
 * Number of characters to truncate a collapsed block to.
 */
Blockly.COLLAPSE_CHARS = 30;

/**
 * Length in ms for a touch to become a long press.
 */
Blockly.LONGPRESS = 750;

/**
 * Prevent a sound from playing if another sound preceded it within this many
 * milliseconds.
 */
Blockly.SOUND_LIMIT = 100;

/**
 * When dragging a block out of a stack, split the stack in two (true), or drag
 * out the block healing the stack (false).
 */
Blockly.DRAG_STACK = true;

/**
 * The richness of block colours, regardless of the hue.
 * Must be in the range of 0 (inclusive) to 1 (exclusive).
 */
Blockly.HSV_SATURATION = 0.45;

/**
 * The intensity of block colours, regardless of the hue.
 * Must be in the range of 0 (inclusive) to 1 (exclusive).
 */
Blockly.HSV_VALUE = 0.65;

/**
 * Sprited icons and images.
 */
Blockly.SPRITE = {
  width: 96,
  height: 124,
  url: 'sprites.png'
};

// Constants below this point are not intended to be changed.

/**
 * ENUM for a right-facing value input.  E.g. 'set item to' or 'return'.
 * @const
 */
Blockly.INPUT_VALUE = 1;

/**
 * ENUM for a left-facing value output.  E.g. 'random fraction'.
 * @const
 */
Blockly.OUTPUT_VALUE = 2;

/**
 * ENUM for a down-facing block stack.  E.g. 'if-do' or 'else'.
 * @const
 */
Blockly.NEXT_STATEMENT = 3;

/**
 * ENUM for an up-facing block stack.  E.g. 'break out of loop'.
 * @const
 */
Blockly.PREVIOUS_STATEMENT = 4;

/**
 * ENUM for an dummy input.  Used to add field(s) with no input.
 * @const
 */
Blockly.DUMMY_INPUT = 5;

/**
 * ENUM for left alignment.
 * @const
 */
Blockly.ALIGN_LEFT = -1;

/**
 * ENUM for centre alignment.
 * @const
 */
Blockly.ALIGN_CENTRE = 0;

/**
 * ENUM for right alignment.
 * @const
 */
Blockly.ALIGN_RIGHT = 1;

/**
 * ENUM for no drag operation.
 * @const
 */
Blockly.DRAG_NONE = 0;

/**
 * ENUM for inside the sticky DRAG_RADIUS.
 * @const
 */
Blockly.DRAG_STICKY = 1;

/**
 * ENUM for inside the non-sticky DRAG_RADIUS, for differentiating between
 * clicks and drags.
 * @const
 */
Blockly.DRAG_BEGIN = 1;

/**
 * ENUM for freely draggable (outside the DRAG_RADIUS, if one applies).
 * @const
 */
Blockly.DRAG_FREE = 2;

/**
 * Lookup table for determining the opposite type of a connection.
 * @const
 */
Blockly.OPPOSITE_TYPE = [];
Blockly.OPPOSITE_TYPE[Blockly.INPUT_VALUE] = Blockly.OUTPUT_VALUE;
Blockly.OPPOSITE_TYPE[Blockly.OUTPUT_VALUE] = Blockly.INPUT_VALUE;
Blockly.OPPOSITE_TYPE[Blockly.NEXT_STATEMENT] = Blockly.PREVIOUS_STATEMENT;
Blockly.OPPOSITE_TYPE[Blockly.PREVIOUS_STATEMENT] = Blockly.NEXT_STATEMENT;


/**
 * ENUM for toolbox and flyout at top of screen.
 * @const
 */
Blockly.TOOLBOX_AT_TOP = 0;

/**
 * ENUM for toolbox and flyout at bottom of screen.
 * @const
 */
Blockly.TOOLBOX_AT_BOTTOM = 1;

/**
 * ENUM for toolbox and flyout at left of screen.
 * @const
 */
Blockly.TOOLBOX_AT_LEFT = 2;

/**
 * ENUM for toolbox and flyout at right of screen.
 * @const
 */
Blockly.TOOLBOX_AT_RIGHT = 3;

/**
 * ENUM representing that an event is not in any delete areas.
 * Null for backwards compatibility reasons.
 * @const
 */
Blockly.DELETE_AREA_NONE = null;

/**
 * ENUM representing that an event is in the delete area of the trash can.
 * @const
 */
Blockly.DELETE_AREA_TRASH = 1;

/**
 * ENUM representing that an event is in the delete area of the toolbox or
 * flyout.
 * @const
 */
Blockly.DELETE_AREA_TOOLBOX = 2;

/**
 * String for use in the "custom" attribute of a category in toolbox XML.
 * This string indicates that the category should be dynamically populated with
 * variable blocks.
 * @const {string}
 */
Blockly.VARIABLE_CATEGORY_NAME = 'VARIABLE';
/**
 * String for use in the "custom" attribute of a category in toolbox XML.
 * This string indicates that the category should be dynamically populated with
 * variable blocks.
 * @const {string}
 */
Blockly.VARIABLE_DYNAMIC_CATEGORY_NAME = 'VARIABLE_DYNAMIC';

/**
 * String for use in the "custom" attribute of a category in toolbox XML.
 * This string indicates that the category should be dynamically populated with
 * procedure blocks.
 * @const {string}
 */
Blockly.PROCEDURE_CATEGORY_NAME = 'PROCEDURE';

/**
 * String for use in the dropdown created in field_variable.
 * This string indicates that this option in the dropdown is 'Rename
 * variable...' and if selected, should trigger the prompt to rename a variable.
 * @const {string}
 */
Blockly.RENAME_VARIABLE_ID = 'RENAME_VARIABLE_ID';

/**
 * String for use in the dropdown created in field_variable.
 * This string indicates that this option in the dropdown is 'Delete the "%1"
 * variable' and if selected, should trigger the prompt to delete a variable.
 * @const {string}
 */
Blockly.DELETE_VARIABLE_ID = 'DELETE_VARIABLE_ID';
