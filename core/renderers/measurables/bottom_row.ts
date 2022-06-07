/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object representing a bottom row on a rendered block.
 * of its subcomponents.
 */

/**
 * Object representing a bottom row on a rendered block.
 * of its subcomponents.
 * @class
 */
goog.module('Blockly.blockRendering.BottomRow');

/* eslint-disable-next-line no-unused-vars */
const {BlockSvg} = goog.requireType('Blockly.BlockSvg');
/* eslint-disable-next-line no-unused-vars */
const {ConstantProvider} = goog.requireType('Blockly.blockRendering.ConstantProvider');
/* eslint-disable-next-line no-unused-vars */
const {NextConnection} = goog.requireType('Blockly.blockRendering.NextConnection');
const {Row} = goog.require('Blockly.blockRendering.Row');
const {Types} = goog.require('Blockly.blockRendering.Types');


/**
 * An object containing information about what elements are in the bottom row of
 * a block as well as spacing information for the bottom row.
 * Elements in a bottom row can consist of corners, spacers and next
 * connections.
 * @extends {Row}
 * @struct
 * @alias Blockly.blockRendering.BottomRow
 */
class BottomRow extends Row {
  /**
   * @param {!ConstantProvider} constants The rendering
   *   constants provider.
   * @package
   */
  constructor(constants) {
    super(constants);
    this.type |= Types.BOTTOM_ROW;

    /**
     * Whether this row has a next connection.
     * @package
     * @type {boolean}
     */
    this.hasNextConnection = false;

    /**
     * The next connection on the row, if any.
     * @package
     * @type {NextConnection}
     */
    this.connection = null;

    /**
     * The amount that the bottom of the block extends below the horizontal
     * edge, e.g. because of a next connection.  Must be non-negative (see
     * #2820).
     * @package
     * @type {number}
     */
    this.descenderHeight = 0;

    /**
     * The Y position of the bottom edge of the block, relative to the origin
     * of the block rendering.
     * @type {number}
     */
    this.baseline = 0;
  }

  /**
   * Returns whether or not the bottom row has a left square corner.
   * @param {!BlockSvg} block The block whose bottom row this represents.
   * @return {boolean} Whether or not the bottom row has a left square corner.
   */
  hasLeftSquareCorner(block) {
    return !!block.outputConnection || !!block.getNextBlock();
  }

  /**
   * Returns whether or not the bottom row has a right square corner.
   * @param {!BlockSvg} _block The block whose bottom row this represents.
   * @return {boolean} Whether or not the bottom row has a right square corner.
   */
  hasRightSquareCorner(_block) {
    return true;
  }

  /**
   * @override
   */
  measure() {
    let height = 0;
    let width = 0;
    let descenderHeight = 0;
    for (let i = 0; i < this.elements.length; i++) {
      const elem = this.elements[i];
      width += elem.width;
      if (!(Types.isSpacer(elem))) {
        // Note: this assumes that next connections have *only* descenderHeight,
        // with no height above the baseline.
        if (Types.isNextConnection(elem)) {
          descenderHeight = Math.max(descenderHeight, elem.height);
        } else {
          height = Math.max(height, elem.height);
        }
      }
    }
    this.width = Math.max(this.minWidth, width);
    this.height = Math.max(this.minHeight, height) + descenderHeight;
    this.descenderHeight = descenderHeight;
    this.widthWithConnectedBlocks = this.width;
  }

  /**
   * @override
   */
  startsWithElemSpacer() {
    return false;
  }

  /**
   * @override
   */
  endsWithElemSpacer() {
    return false;
  }
}

exports.BottomRow = BottomRow;
