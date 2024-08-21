/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Former goog.module ID: Blockly.blockRendering.Types

import type {Measurable} from './base.js';
import type {Row} from './row.js';

/**
 * Types of rendering elements.
 */
class TypesContainer {
  // This class is very non-idiomatic for typescript, so we have to use
  // the Function type to make it happy.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  [index: string]: number | Function;

  NONE = 0; // None
  FIELD = 1 << 0; // Field.
  HAT = 1 << 1; // Hat.
  ICON = 1 << 2; // Icon.
  SPACER = 1 << 3; // Spacer.
  BETWEEN_ROW_SPACER = 1 << 4; // Between Row Spacer.
  IN_ROW_SPACER = 1 << 5; // In Row Spacer.
  EXTERNAL_VALUE_INPUT = 1 << 6; // External Value Input.
  INPUT = 1 << 7; // Input.
  INLINE_INPUT = 1 << 8; // Inline Input.
  STATEMENT_INPUT = 1 << 9; // Statement Input.
  CONNECTION = 1 << 10; // Connection.
  PREVIOUS_CONNECTION = 1 << 11; // Previous Connection.
  NEXT_CONNECTION = 1 << 12; // Next Connection.
  OUTPUT_CONNECTION = 1 << 13; // Output Connection.
  CORNER = 1 << 14; // Corner.
  LEFT_SQUARE_CORNER = 1 << 15; // Square Corner.
  LEFT_ROUND_CORNER = 1 << 16; // Round Corner.
  RIGHT_SQUARE_CORNER = 1 << 17; // Right Square Corner.
  RIGHT_ROUND_CORNER = 1 << 18; // Right Round Corner.
  JAGGED_EDGE = 1 << 19; // Jagged Edge.
  ROW = 1 << 20; // Row.
  TOP_ROW = 1 << 21; // Top Row.
  BOTTOM_ROW = 1 << 22; // Bottom Row.
  INPUT_ROW = 1 << 23; // Input Row.

  /**
   * A Left Corner Union Type.
   */
  LEFT_CORNER = this.LEFT_SQUARE_CORNER | this.LEFT_ROUND_CORNER;

  /**
   * A Right Corner Union Type.
   */
  RIGHT_CORNER = this.RIGHT_SQUARE_CORNER | this.RIGHT_ROUND_CORNER;

  /**
   * Next flag value to use for custom rendering element types.
   * This must be updated to reflect the next enum flag value
   * to use if additional elements are added to
   * `Types`.
   */
  nextTypeValue_ = 1 << 24;

  /**
   * Get the enum flag value of an existing type or register a new type.
   *
   * @param type The name of the type.
   * @returns The enum flag value associated with that type.
   */
  getType(type: string): number {
    if (!Object.prototype.hasOwnProperty.call(this, type)) {
      this[type] = this.nextTypeValue_;
      this.nextTypeValue_ <<= 1;
    }
    return this[type] as number;
  }

  /**
   * Whether a measurable stores information about a field.
   *
   * @param elem The element to check.
   * @returns 1 if the object stores information about a field.
   */
  isField(elem: Measurable): number {
    return elem.type & this.FIELD;
  }

  /**
   * Whether a measurable stores information about a hat.
   *
   * @param elem The element to check.
   * @returns 1 if the object stores information about a hat.
   */
  isHat(elem: Measurable): number {
    return elem.type & this.HAT;
  }

  /**
   * Whether a measurable stores information about an icon.
   *
   * @param elem The element to check.
   * @returns 1 if the object stores information about an icon.
   */
  isIcon(elem: Measurable): number {
    return elem.type & this.ICON;
  }

  /**
   * Whether a measurable stores information about a spacer.
   *
   * @param elem The element to check.
   * @returns 1 if the object stores information about a spacer.
   */
  isSpacer(elem: Measurable | Row): number {
    return elem.type & this.SPACER;
  }

  /**
   * Whether a measurable stores information about an in-row spacer.
   *
   * @param elem The element to check.
   * @returns 1 if the object stores information about an in-row spacer.
   */
  isInRowSpacer(elem: Measurable): number {
    return elem.type & this.IN_ROW_SPACER;
  }

  /**
   * Whether a measurable stores information about an input.
   *
   * @param elem The element to check.
   * @returns 1 if the object stores information about an input.
   */
  isInput(elem: Measurable): number {
    return elem.type & this.INPUT;
  }

  /**
   * Whether a measurable stores information about an external input.
   *
   * @param elem The element to check.
   * @returns 1 if the object stores information about an external input.
   */
  isExternalInput(elem: Measurable): number {
    return elem.type & this.EXTERNAL_VALUE_INPUT;
  }

  /**
   * Whether a measurable stores information about an inline input.
   *
   * @param elem The element to check.
   * @returns 1 if the object stores information about an inline input.
   */
  isInlineInput(elem: Measurable): number {
    return elem.type & this.INLINE_INPUT;
  }

  /**
   * Whether a measurable stores information about a statement input.
   *
   * @param elem The element to check.
   * @returns 1 if the object stores information about a statement input.
   */
  isStatementInput(elem: Measurable): number {
    return elem.type & this.STATEMENT_INPUT;
  }

  /**
   * Whether a measurable stores information about a previous connection.
   *
   * @param elem The element to check.
   * @returns 1 if the object stores information about a previous connection.
   */
  isPreviousConnection(elem: Measurable): number {
    return elem.type & this.PREVIOUS_CONNECTION;
  }

  /**
   * Whether a measurable stores information about a next connection.
   *
   * @param elem The element to check.
   * @returns 1 if the object stores information about a next connection.
   */
  isNextConnection(elem: Measurable): number {
    return elem.type & this.NEXT_CONNECTION;
  }

  /**
   * Whether a measurable stores information about a previous or next
   * connection.
   *
   * @param elem The element to check.
   * @returns 1 if the object stores information about a previous or next
   *     connection.
   */
  isPreviousOrNextConnection(elem: Measurable): number {
    return elem.type & (this.PREVIOUS_CONNECTION | this.NEXT_CONNECTION);
  }

  /**
   * Whether a measurable stores information about a left round corner.
   *
   * @param elem The element to check.
   * @returns 1 if the object stores information about a left round corner.
   */
  isLeftRoundedCorner(elem: Measurable): number {
    return elem.type & this.LEFT_ROUND_CORNER;
  }

  /**
   * Whether a measurable stores information about a right round corner.
   *
   * @param elem The element to check.
   * @returns 1 if the object stores information about a right round corner.
   */
  isRightRoundedCorner(elem: Measurable): number {
    return elem.type & this.RIGHT_ROUND_CORNER;
  }

  /**
   * Whether a measurable stores information about a left square corner.
   *
   * @param elem The element to check.
   * @returns 1 if the object stores information about a left square corner.
   */
  isLeftSquareCorner(elem: Measurable): number {
    return elem.type & this.LEFT_SQUARE_CORNER;
  }

  /**
   * Whether a measurable stores information about a right square corner.
   *
   * @param elem The element to check.
   * @returns 1 if the object stores information about a right square corner.
   */
  isRightSquareCorner(elem: Measurable): number {
    return elem.type & this.RIGHT_SQUARE_CORNER;
  }

  /**
   * Whether a measurable stores information about a corner.
   *
   * @param elem The element to check.
   * @returns 1 if the object stores information about a corner.
   */
  isCorner(elem: Measurable): number {
    return elem.type & this.CORNER;
  }

  /**
   * Whether a measurable stores information about a jagged edge.
   *
   * @param elem The element to check.
   * @returns 1 if the object stores information about a jagged edge.
   */
  isJaggedEdge(elem: Measurable): number {
    return elem.type & this.JAGGED_EDGE;
  }

  /**
   * Whether a measurable stores information about a row.
   *
   * @param row The row to check.
   * @returns 1 if the object stores information about a row.
   */
  isRow(row: Row): number {
    return row.type & this.ROW;
  }

  /**
   * Whether a measurable stores information about a between-row spacer.
   *
   * @param row The row to check.
   * @returns 1 if the object stores information about a between-row spacer.
   */
  isBetweenRowSpacer(row: Row): number {
    return row.type & this.BETWEEN_ROW_SPACER;
  }

  /**
   * Whether a measurable stores information about a top row.
   *
   * @param row The row to check.
   * @returns 1 if the object stores information about a top row.
   */
  isTopRow(row: Row): number {
    return row.type & this.TOP_ROW;
  }

  /**
   * Whether a measurable stores information about a bottom row.
   *
   * @param row The row to check.
   * @returns 1 if the object stores information about a bottom row.
   */
  isBottomRow(row: Row): number {
    return row.type & this.BOTTOM_ROW;
  }

  /**
   * Whether a measurable stores information about a top or bottom row.
   *
   * @param row The row to check.
   * @returns 1 if the object stores information about a top or bottom row.
   */
  isTopOrBottomRow(row: Row): number {
    return row.type & (this.TOP_ROW | this.BOTTOM_ROW);
  }

  /**
   * Whether a measurable stores information about an input row.
   *
   * @param row The row to check.
   * @returns 1 if the object stores information about an input row.
   */
  isInputRow(row: Row): number {
    return row.type & this.INPUT_ROW;
  }
}

export const Types = new TypesContainer();
