/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Measurable types.
 * @author samelh@google.com (Sam El-Husseini)
 */

'use strict';

goog.provide('Blockly.blockRendering.Types');


/**
 * Types of rendering elements.
 * @enum {number}
 */
Blockly.blockRendering.Types = {
  NONE: 0,                      // None
  FIELD: 1 << 0,                // Field.
  HAT: 1 << 1,                  // Hat.
  ICON: 1 << 2,                 // Icon.
  SPACER: 1 << 3,               // Spacer.
  BETWEEN_ROW_SPACER: 1 << 4,   // Between Row Spacer.
  IN_ROW_SPACER: 1 << 5,        // In Row Spacer.
  EXTERNAL_VALUE_INPUT: 1 << 6, // External Value Input.
  INPUT: 1 << 7,                // Input.
  INLINE_INPUT: 1 << 8,         // Inline Input.
  STATEMENT_INPUT: 1 << 9,      // Statement Input.
  CONNECTION: 1 << 10,          // Connection.
  PREVIOUS_CONNECTION: 1 << 11, // Previous Connection.
  NEXT_CONNECTION: 1 << 12,     // Next Connection.
  OUTPUT_CONNECTION: 1 << 13,   // Output Connection.
  CORNER: 1 << 14,              // Corner.
  LEFT_SQUARE_CORNER: 1 << 15,  // Square Corner.
  LEFT_ROUND_CORNER: 1 << 16,   // Round Corner.
  RIGHT_SQUARE_CORNER: 1 << 17, // Right Square Corner.
  RIGHT_ROUND_CORNER: 1 << 18,  // Right Round Corner.
  JAGGED_EDGE: 1 << 19,         // Jagged Edge.
  ROW: 1 << 20,                 // Row.
  TOP_ROW: 1 << 21,             // Top Row.
  BOTTOM_ROW: 1 << 22,          // Bottom Row.
  INPUT_ROW: 1 << 23            // Input Row.
};

/**
 * A Left Corner Union Type.
 * @type {number}
 * @const
 * @package
 */
Blockly.blockRendering.Types.LEFT_CORNER =
    Blockly.blockRendering.Types.LEFT_SQUARE_CORNER |
    Blockly.blockRendering.Types.LEFT_ROUND_CORNER;

/**
 * A Right Corner Union Type.
 * @type {number}
 * @const
 * @package
 */
Blockly.blockRendering.Types.RIGHT_CORNER =
    Blockly.blockRendering.Types.RIGHT_SQUARE_CORNER |
    Blockly.blockRendering.Types.RIGHT_ROUND_CORNER;

/**
 * Next flag value to use for custom rendering element types.
 * This must be updated to reflect the next enum flag value
 * to use if additional elements are added to
 * `Blockly.blockRendering.Types`.
 * @type {number}
 * @private
 */
Blockly.blockRendering.Types.nextTypeValue_ = 1 << 24;

/**
 * Get the enum flag value of an existing type or register a new type.
 * @param {!string} type The name of the type.
 * @return {!number} The enum flag value associated with that type.
 * @package
 */
Blockly.blockRendering.Types.getType = function(type) {
  if (!Blockly.blockRendering.Types.hasOwnProperty(type)) {
    Blockly.blockRendering.Types[type] =
      Blockly.blockRendering.Types.nextTypeValue_;
    Blockly.blockRendering.Types.nextTypeValue_ <<= 1;
  }
  return Blockly.blockRendering.Types[type];
};

/**
 * Whether a measurable stores information about a field.
 * @param {!Blockly.blockRendering.Measurable} elem The element to check.
 * @return {number} 1 if the object stores information about a field.
 * @package
 */
Blockly.blockRendering.Types.isField = function(elem) {
  return elem.type & Blockly.blockRendering.Types.FIELD;
};

/**
 * Whether a measurable stores information about a hat.
 * @param {!Blockly.blockRendering.Measurable} elem The element to check.
 * @return {number} 1 if the object stores information about a hat.
 * @package
 */
Blockly.blockRendering.Types.isHat = function(elem) {
  return elem.type & Blockly.blockRendering.Types.HAT;
};

/**
 * Whether a measurable stores information about an icon.
 * @param {!Blockly.blockRendering.Measurable} elem The element to check.
 * @return {number} 1 if the object stores information about an icon.
 * @package
 */
Blockly.blockRendering.Types.isIcon = function(elem) {
  return elem.type & Blockly.blockRendering.Types.ICON;
};

/**
 * Whether a measurable stores information about a spacer.
 * @param {!Blockly.blockRendering.Measurable|!Blockly.blockRendering.Row} elem
 *     The element to check.
 * @return {number} 1 if the object stores information about a spacer.
 * @package
 */
Blockly.blockRendering.Types.isSpacer = function(elem) {
  return elem.type & Blockly.blockRendering.Types.SPACER;
};

/**
 * Whether a measurable stores information about an in-row spacer.
 * @param {!Blockly.blockRendering.Measurable} elem The element to check.
 * @return {number} 1 if the object stores information about an
 *   in-row spacer.
 * @package
 */
Blockly.blockRendering.Types.isInRowSpacer = function(elem) {
  return elem.type & Blockly.blockRendering.Types.IN_ROW_SPACER;
};

/**
 * Whether a measurable stores information about an input.
 * @param {!Blockly.blockRendering.Measurable} elem The element to check.
 * @return {number} 1 if the object stores information about an input.
 * @package
 */
Blockly.blockRendering.Types.isInput = function(elem) {
  return elem.type & Blockly.blockRendering.Types.INPUT;
};

/**
 * Whether a measurable stores information about an external input.
 * @param {!Blockly.blockRendering.Measurable} elem The element to check.
 * @return {number} 1 if the object stores information about an
 *   external input.
 * @package
 */
Blockly.blockRendering.Types.isExternalInput = function(elem) {
  return elem.type & Blockly.blockRendering.Types.EXTERNAL_VALUE_INPUT;
};

/**
 * Whether a measurable stores information about an inline input.
 * @param {!Blockly.blockRendering.Measurable} elem The element to check.
 * @return {number} 1 if the object stores information about an
 *   inline input.
 * @package
 */
Blockly.blockRendering.Types.isInlineInput = function(elem) {
  return elem.type & Blockly.blockRendering.Types.INLINE_INPUT;
};

/**
 * Whether a measurable stores information about a statement input.
 * @param {!Blockly.blockRendering.Measurable} elem The element to check.
 * @return {number} 1 if the object stores information about a
 *   statement input.
 * @package
 */
Blockly.blockRendering.Types.isStatementInput = function(elem) {
  return elem.type & Blockly.blockRendering.Types.STATEMENT_INPUT;
};

/**
 * Whether a measurable stores information about a previous connection.
 * @param {!Blockly.blockRendering.Measurable} elem The element to check.
 * @return {number} 1 if the object stores information about a
 *   previous connection.
 * @package
 */
Blockly.blockRendering.Types.isPreviousConnection = function(elem) {
  return elem.type & Blockly.blockRendering.Types.PREVIOUS_CONNECTION;
};

/**
 * Whether a measurable stores information about a next connection.
 * @param {!Blockly.blockRendering.Measurable} elem The element to check.
 * @return {number} 1 if the object stores information about a
 *   next connection.
 * @package
 */
Blockly.blockRendering.Types.isNextConnection = function(elem) {
  return elem.type & Blockly.blockRendering.Types.NEXT_CONNECTION;
};

/**
 * Whether a measurable stores information about a previous or next connection.
 * @param {!Blockly.blockRendering.Measurable} elem The element to check.
 * @return {number} 1 if the object stores information about a previous or
 *   next connection.
 * @package
 */
Blockly.blockRendering.Types.isPreviousOrNextConnection = function(elem) {
  return elem.type & (Blockly.blockRendering.Types.PREVIOUS_CONNECTION |
      Blockly.blockRendering.Types.NEXT_CONNECTION);
};

/**
 * Whether a measurable stores information about a left round corner.
 * @param {!Blockly.blockRendering.Measurable} elem The element to check.
 * @return {number} 1 if the object stores information about a
 *   left round corner.
 * @package
 */
Blockly.blockRendering.Types.isLeftRoundedCorner = function(elem) {
  return elem.type & Blockly.blockRendering.Types.LEFT_ROUND_CORNER;
};

/**
 * Whether a measurable stores information about a right round corner.
 * @param {!Blockly.blockRendering.Measurable} elem The element to check.
 * @return {number} 1 if the object stores information about a
 *   right round corner.
 * @package
 */
Blockly.blockRendering.Types.isRightRoundedCorner = function(elem) {
  return elem.type & Blockly.blockRendering.Types.RIGHT_ROUND_CORNER;
};

/**
 * Whether a measurable stores information about a left square corner.
 * @param {!Blockly.blockRendering.Measurable} elem The element to check.
 * @return {number} 1 if the object stores information about a
 *   left square corner.
 * @package
 */
Blockly.blockRendering.Types.isLeftSquareCorner = function(elem) {
  return elem.type & Blockly.blockRendering.Types.LEFT_SQUARE_CORNER;
};

/**
 * Whether a measurable stores information about a right square corner.
 * @param {!Blockly.blockRendering.Measurable} elem The element to check.
 * @return {number} 1 if the object stores information about a
 *   right square corner.
 * @package
 */
Blockly.blockRendering.Types.isRightSquareCorner = function(elem) {
  return elem.type & Blockly.blockRendering.Types.RIGHT_SQUARE_CORNER;
};

/**
 * Whether a measurable stores information about a corner.
 * @param {!Blockly.blockRendering.Measurable} elem The element to check.
 * @return {number} 1 if the object stores information about a
 *   corner.
 * @package
 */
Blockly.blockRendering.Types.isCorner = function(elem) {
  return elem.type & Blockly.blockRendering.Types.CORNER;
};

/**
 * Whether a measurable stores information about a jagged edge.
 * @param {!Blockly.blockRendering.Measurable} elem The element to check.
 * @return {number} 1 if the object stores information about a jagged edge.
 * @package
 */
Blockly.blockRendering.Types.isJaggedEdge = function(elem) {
  return elem.type & Blockly.blockRendering.Types.JAGGED_EDGE;
};

/**
 * Whether a measurable stores information about a row.
 * @param {!Blockly.blockRendering.Row} row The row to check.
 * @return {number} 1 if the object stores information about a row.
 * @package
 */
Blockly.blockRendering.Types.isRow = function(row) {
  return row.type & Blockly.blockRendering.Types.ROW;
};

/**
 * Whether a measurable stores information about a between-row spacer.
 * @param {!Blockly.blockRendering.Row} row The row to check.
 * @return {number} 1 if the object stores information about a
 *   between-row spacer.
 * @package
 */
Blockly.blockRendering.Types.isBetweenRowSpacer = function(row) {
  return row.type & Blockly.blockRendering.Types.BETWEEN_ROW_SPACER;
};

/**
 * Whether a measurable stores information about a top row.
 * @param {!Blockly.blockRendering.Row} row The row to check.
 * @return {number} 1 if the object stores information about a top row.
 * @package
 */
Blockly.blockRendering.Types.isTopRow = function(row) {
  return row.type & Blockly.blockRendering.Types.TOP_ROW;
};

/**
 * Whether a measurable stores information about a bottom row.
 * @param {!Blockly.blockRendering.Row} row The row to check.
 * @return {number} 1 if the object stores information about a bottom row.
 * @package
 */
Blockly.blockRendering.Types.isBottomRow = function(row) {
  return row.type & Blockly.blockRendering.Types.BOTTOM_ROW;
};

/**
 * Whether a measurable stores information about a top or bottom row.
 * @param {!Blockly.blockRendering.Row} row The row to check.
 * @return {number} 1 if the object stores information about a top or
 *   bottom row.
 * @package
 */
Blockly.blockRendering.Types.isTopOrBottomRow = function(row) {
  return row.type & (Blockly.blockRendering.Types.TOP_ROW |
      Blockly.blockRendering.Types.BOTTOM_ROW);
};

/**
 * Whether a measurable stores information about an input row.
 * @param {!Blockly.blockRendering.Row} row The row to check.
 * @return {number} 1 if the object stores information about an input row.
 * @package
 */
Blockly.blockRendering.Types.isInputRow = function(row) {
  return row.type & Blockly.blockRendering.Types.INPUT_ROW;
};
