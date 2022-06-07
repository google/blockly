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
 * Number of characters to truncate a collapsed block to.
 * @alias Blockly.internalConstants.COLLAPSE_CHARS
 */
const COLLAPSE_CHARS = 30;
exports.COLLAPSE_CHARS = COLLAPSE_CHARS;

/**
 * When dragging a block out of a stack, split the stack in two (true), or drag
 * out the block healing the stack (false).
 * @alias Blockly.internalConstants.DRAG_STACK
 */
const DRAG_STACK = true;
exports.DRAG_STACK = DRAG_STACK;

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
