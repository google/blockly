/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Measurable types.
 */

'use strict';

/**
 * Measurable types.
 * @namespace Blockly.blockRendering.Types
 */
goog.module('Blockly.blockRendering.Types');

/* eslint-disable-next-line no-unused-vars */
const {Measurable} = goog.requireType('Blockly.blockRendering.Measurable');
/* eslint-disable-next-line no-unused-vars */
const {Row} = goog.requireType('Blockly.blockRendering.Row');


/**
 * Types of rendering elements.
 * @enum {number}
 * @alias Blockly.blockRendering.Types
 */
const Types = {
  NONE: 0,                       // None
  FIELD: 1 << 0,                 // Field.
  HAT: 1 << 1,                   // Hat.
  ICON: 1 << 2,                  // Icon.
  SPACER: 1 << 3,                // Spacer.
  BETWEEN_ROW_SPACER: 1 << 4,    // Between Row Spacer.
  IN_ROW_SPACER: 1 << 5,         // In Row Spacer.
  EXTERNAL_VALUE_INPUT: 1 << 6,  // External Value Input.
  INPUT: 1 << 7,                 // Input.
  INLINE_INPUT: 1 << 8,          // Inline Input.
  STATEMENT_INPUT: 1 << 9,       // Statement Input.
  CONNECTION: 1 << 10,           // Connection.
  PREVIOUS_CONNECTION: 1 << 11,  // Previous Connection.
  NEXT_CONNECTION: 1 << 12,      // Next Connection.
  OUTPUT_CONNECTION: 1 << 13,    // Output Connection.
  CORNER: 1 << 14,               // Corner.
  LEFT_SQUARE_CORNER: 1 << 15,   // Square Corner.
  LEFT_ROUND_CORNER: 1 << 16,    // Round Corner.
  RIGHT_SQUARE_CORNER: 1 << 17,  // Right Square Corner.
  RIGHT_ROUND_CORNER: 1 << 18,   // Right Round Corner.
  JAGGED_EDGE: 1 << 19,          // Jagged Edge.
  ROW: 1 << 20,                  // Row.
  TOP_ROW: 1 << 21,              // Top Row.
  BOTTOM_ROW: 1 << 22,           // Bottom Row.
  INPUT_ROW: 1 << 23,            // Input Row.
};

/**
 * A Left Corner Union Type.
 * @type {number}
 * @const
 * @package
 */
Types.LEFT_CORNER = Types.LEFT_SQUARE_CORNER | Types.LEFT_ROUND_CORNER;

/**
 * A Right Corner Union Type.
 * @type {number}
 * @const
 * @package
 */
Types.RIGHT_CORNER = Types.RIGHT_SQUARE_CORNER | Types.RIGHT_ROUND_CORNER;

/**
 * Next flag value to use for custom rendering element types.
 * This must be updated to reflect the next enum flag value
 * to use if additional elements are added to
 * `Types`.
 * @type {number}
 * @private
 */
Types.nextTypeValue_ = 1 << 24;

/**
 * Get the enum flag value of an existing type or register a new type.
 * @param {!string} type The name of the type.
 * @return {!number} The enum flag value associated with that type.
 * @package
 */
Types.getType = function(type) {
  if (!Object.prototype.hasOwnProperty.call(Types, type)) {
    Types[type] = Types.nextTypeValue_;
    Types.nextTypeValue_ <<= 1;
  }
  return Types[type];
};

/**
 * Whether a measurable stores information about a field.
 * @param {!Measurable} elem The element to check.
 * @return {number} 1 if the object stores information about a field.
 * @package
 */
Types.isField = function(elem) {
  return elem.type & Types.FIELD;
};

/**
 * Whether a measurable stores information about a hat.
 * @param {!Measurable} elem The element to check.
 * @return {number} 1 if the object stores information about a hat.
 * @package
 */
Types.isHat = function(elem) {
  return elem.type & Types.HAT;
};

/**
 * Whether a measurable stores information about an icon.
 * @param {!Measurable} elem The element to check.
 * @return {number} 1 if the object stores information about an icon.
 * @package
 */
Types.isIcon = function(elem) {
  return elem.type & Types.ICON;
};

/**
 * Whether a measurable stores information about a spacer.
 * @param {!Measurable|!Row} elem
 *     The element to check.
 * @return {number} 1 if the object stores information about a spacer.
 * @package
 */
Types.isSpacer = function(elem) {
  return elem.type & Types.SPACER;
};

/**
 * Whether a measurable stores information about an in-row spacer.
 * @param {!Measurable} elem The element to check.
 * @return {number} 1 if the object stores information about an
 *   in-row spacer.
 * @package
 */
Types.isInRowSpacer = function(elem) {
  return elem.type & Types.IN_ROW_SPACER;
};

/**
 * Whether a measurable stores information about an input.
 * @param {!Measurable} elem The element to check.
 * @return {number} 1 if the object stores information about an input.
 * @package
 */
Types.isInput = function(elem) {
  return elem.type & Types.INPUT;
};

/**
 * Whether a measurable stores information about an external input.
 * @param {!Measurable} elem The element to check.
 * @return {number} 1 if the object stores information about an
 *   external input.
 * @package
 */
Types.isExternalInput = function(elem) {
  return elem.type & Types.EXTERNAL_VALUE_INPUT;
};

/**
 * Whether a measurable stores information about an inline input.
 * @param {!Measurable} elem The element to check.
 * @return {number} 1 if the object stores information about an
 *   inline input.
 * @package
 */
Types.isInlineInput = function(elem) {
  return elem.type & Types.INLINE_INPUT;
};

/**
 * Whether a measurable stores information about a statement input.
 * @param {!Measurable} elem The element to check.
 * @return {number} 1 if the object stores information about a
 *   statement input.
 * @package
 */
Types.isStatementInput = function(elem) {
  return elem.type & Types.STATEMENT_INPUT;
};

/**
 * Whether a measurable stores information about a previous connection.
 * @param {!Measurable} elem The element to check.
 * @return {number} 1 if the object stores information about a
 *   previous connection.
 * @package
 */
Types.isPreviousConnection = function(elem) {
  return elem.type & Types.PREVIOUS_CONNECTION;
};

/**
 * Whether a measurable stores information about a next connection.
 * @param {!Measurable} elem The element to check.
 * @return {number} 1 if the object stores information about a
 *   next connection.
 * @package
 */
Types.isNextConnection = function(elem) {
  return elem.type & Types.NEXT_CONNECTION;
};

/**
 * Whether a measurable stores information about a previous or next connection.
 * @param {!Measurable} elem The element to check.
 * @return {number} 1 if the object stores information about a previous or
 *   next connection.
 * @package
 */
Types.isPreviousOrNextConnection = function(elem) {
  return elem.type & (Types.PREVIOUS_CONNECTION | Types.NEXT_CONNECTION);
};

/**
 * Whether a measurable stores information about a left round corner.
 * @param {!Measurable} elem The element to check.
 * @return {number} 1 if the object stores information about a
 *   left round corner.
 * @package
 */
Types.isLeftRoundedCorner = function(elem) {
  return elem.type & Types.LEFT_ROUND_CORNER;
};

/**
 * Whether a measurable stores information about a right round corner.
 * @param {!Measurable} elem The element to check.
 * @return {number} 1 if the object stores information about a
 *   right round corner.
 * @package
 */
Types.isRightRoundedCorner = function(elem) {
  return elem.type & Types.RIGHT_ROUND_CORNER;
};

/**
 * Whether a measurable stores information about a left square corner.
 * @param {!Measurable} elem The element to check.
 * @return {number} 1 if the object stores information about a
 *   left square corner.
 * @package
 */
Types.isLeftSquareCorner = function(elem) {
  return elem.type & Types.LEFT_SQUARE_CORNER;
};

/**
 * Whether a measurable stores information about a right square corner.
 * @param {!Measurable} elem The element to check.
 * @return {number} 1 if the object stores information about a
 *   right square corner.
 * @package
 */
Types.isRightSquareCorner = function(elem) {
  return elem.type & Types.RIGHT_SQUARE_CORNER;
};

/**
 * Whether a measurable stores information about a corner.
 * @param {!Measurable} elem The element to check.
 * @return {number} 1 if the object stores information about a
 *   corner.
 * @package
 */
Types.isCorner = function(elem) {
  return elem.type & Types.CORNER;
};

/**
 * Whether a measurable stores information about a jagged edge.
 * @param {!Measurable} elem The element to check.
 * @return {number} 1 if the object stores information about a jagged edge.
 * @package
 */
Types.isJaggedEdge = function(elem) {
  return elem.type & Types.JAGGED_EDGE;
};

/**
 * Whether a measurable stores information about a row.
 * @param {!Row} row The row to check.
 * @return {number} 1 if the object stores information about a row.
 * @package
 */
Types.isRow = function(row) {
  return row.type & Types.ROW;
};

/**
 * Whether a measurable stores information about a between-row spacer.
 * @param {!Row} row The row to check.
 * @return {number} 1 if the object stores information about a
 *   between-row spacer.
 * @package
 */
Types.isBetweenRowSpacer = function(row) {
  return row.type & Types.BETWEEN_ROW_SPACER;
};

/**
 * Whether a measurable stores information about a top row.
 * @param {!Row} row The row to check.
 * @return {number} 1 if the object stores information about a top row.
 * @package
 */
Types.isTopRow = function(row) {
  return row.type & Types.TOP_ROW;
};

/**
 * Whether a measurable stores information about a bottom row.
 * @param {!Row} row The row to check.
 * @return {number} 1 if the object stores information about a bottom row.
 * @package
 */
Types.isBottomRow = function(row) {
  return row.type & Types.BOTTOM_ROW;
};

/**
 * Whether a measurable stores information about a top or bottom row.
 * @param {!Row} row The row to check.
 * @return {number} 1 if the object stores information about a top or
 *   bottom row.
 * @package
 */
Types.isTopOrBottomRow = function(row) {
  return row.type & (Types.TOP_ROW | Types.BOTTOM_ROW);
};

/**
 * Whether a measurable stores information about an input row.
 * @param {!Row} row The row to check.
 * @return {number} 1 if the object stores information about an input row.
 * @package
 */
Types.isInputRow = function(row) {
  return row.type & Types.INPUT_ROW;
};

exports.Types = Types;
