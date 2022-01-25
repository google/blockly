/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blockly constants.
 */
'use strict';

/**
 * Blockly constants.
 * @namespace Blockly.constants
 */
goog.module('Blockly.constants');


/**
 * Number of pixels the mouse must move before a drag starts.
 * @alias Blockly.constants.DRAG_RADIUS
 */
 const DRAG_RADIUS = 5;
 exports.DRAG_RADIUS = DRAG_RADIUS;

 /**
  * Number of pixels the mouse must move before a drag/scroll starts from the
  * flyout.  Because the drag-intention is determined when this is reached, it is
  * larger than DRAG_RADIUS so that the drag-direction is clearer.
  * @alias Blockly.constants.FLYOUT_DRAG_RADIUS
  */
 const FLYOUT_DRAG_RADIUS = 10;
 exports.FLYOUT_DRAG_RADIUS = FLYOUT_DRAG_RADIUS;

 /**
  * Maximum misalignment between connections for them to snap together.
  * @alias Blockly.constants.SNAP_RADIUS
  */
 const SNAP_RADIUS = 28;
 exports.SNAP_RADIUS = SNAP_RADIUS;

 /**
  * Maximum misalignment between connections for them to snap together,
  * when a connection is already highlighted.
  * @alias Blockly.constants.CONNECTING_SNAP_RADIUS
  */
 const CONNECTING_SNAP_RADIUS = SNAP_RADIUS;
 exports.CONNECTING_SNAP_RADIUS = CONNECTING_SNAP_RADIUS;

 /**
  * How much to prefer staying connected to the current connection over moving to
  * a new connection.  The current previewed connection is considered to be this
  * much closer to the matching connection on the block than it actually is.
  * @alias Blockly.constants.CURRENT_CONNECTION_PREFERENCE
  */
 const CURRENT_CONNECTION_PREFERENCE = 8;
 exports.CURRENT_CONNECTION_PREFERENCE = CURRENT_CONNECTION_PREFERENCE;

 /**
 * Delay in ms between trigger and bumping unconnected block out of alignment.
 * @alias Blockly.constants.BUMP_DELAY
 */
const BUMP_DELAY = 250;
exports.BUMP_DELAY = BUMP_DELAY;

/**
 * The language-neutral ID given to the collapsed input.
 * @const {string}
 * @alias Blockly.constants.COLLAPSED_INPUT_NAME
 */
const COLLAPSED_INPUT_NAME = '_TEMP_COLLAPSED_INPUT';
exports.COLLAPSED_INPUT_NAME = COLLAPSED_INPUT_NAME;

/**
 * The language-neutral ID given to the collapsed field.
 * @const {string}
 * @alias Blockly.constants.COLLAPSED_FIELD_NAME
 */
const COLLAPSED_FIELD_NAME = '_TEMP_COLLAPSED_FIELD';
exports.COLLAPSED_FIELD_NAME = COLLAPSED_FIELD_NAME;
