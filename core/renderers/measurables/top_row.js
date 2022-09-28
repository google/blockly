/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object representing a top row on a rendered block.
 */

/**
 * Object representing a top row on a rendered block.
 * @class
 */
goog.module('Blockly.blockRendering.TopRow');

/* eslint-disable-next-line no-unused-vars */
const {BlockSvg} = goog.requireType('Blockly.BlockSvg');
/* eslint-disable-next-line no-unused-vars */
const {ConstantProvider} = goog.requireType('Blockly.blockRendering.ConstantProvider');
const {Hat} = goog.require('Blockly.blockRendering.Hat');
/* eslint-disable-next-line no-unused-vars */
const {PreviousConnection} = goog.requireType('Blockly.blockRendering.PreviousConnection');
const {Row} = goog.require('Blockly.blockRendering.Row');
const {Types} = goog.require('Blockly.blockRendering.Types');


/**
 * An object containing information about what elements are in the top row of a
 * block as well as sizing information for the top row.
 * Elements in a top row can consist of corners, hats, spacers, and previous
 * connections.
 * After this constructor is called, the row will contain all non-spacer
 * elements it needs.
 * @extends {Row}
 * @struct
 * @alias Blockly.blockRendering.TopRow
 */
class TopRow extends Row {
  /**
   * @param {!ConstantProvider} constants The rendering
   *   constants provider.
   * @package
   */
  constructor(constants) {
    super(constants);

    this.type |= Types.TOP_ROW;

    /**
     * The starting point for drawing the row, in the y direction.
     * This allows us to draw hats and similar shapes that don't start at the
     * origin. Must be non-negative (see #2820).
     * @package
     * @type {number}
     */
    this.capline = 0;

    /**
     * How much the row extends up above its capline.
     * @type {number}
     */
    this.ascenderHeight = 0;

    /**
     * Whether the block has a previous connection.
     * @package
     * @type {boolean}
     */
    this.hasPreviousConnection = false;

    /**
     * The previous connection on the block, if any.
     * @type {PreviousConnection}
     */
    this.connection = null;
  }

  /**
   * Returns whether or not the top row has a left square corner.
   * @param {!BlockSvg} block The block whose top row this represents.
   * @return {boolean} Whether or not the top row has a left square corner.
   */
  hasLeftSquareCorner(block) {
    const hasHat =
        (block.hat ? block.hat === 'cap' : this.constants_.ADD_START_HATS) &&
        !block.outputConnection && !block.previousConnection;
    const prevBlock = block.getPreviousBlock();

    return !!block.outputConnection || hasHat ||
        (prevBlock ? prevBlock.getNextBlock() === block : false);
  }

  /**
   * Returns whether or not the top row has a right square corner.
   * @param {!BlockSvg} _block The block whose top row this represents.
   * @return {boolean} Whether or not the top row has a right square corner.
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
    let ascenderHeight = 0;
    for (let i = 0; i < this.elements.length; i++) {
      const elem = this.elements[i];
      width += elem.width;
      if (!(Types.isSpacer(elem))) {
        if (Types.isHat(elem) && elem instanceof Hat) {
          ascenderHeight = Math.max(ascenderHeight, elem.ascenderHeight);
        } else {
          height = Math.max(height, elem.height);
        }
      }
    }
    this.width = Math.max(this.minWidth, width);
    this.height = Math.max(this.minHeight, height) + ascenderHeight;
    this.ascenderHeight = ascenderHeight;
    this.capline = this.ascenderHeight;
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

exports.TopRow = TopRow;
